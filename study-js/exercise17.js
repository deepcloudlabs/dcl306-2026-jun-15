import WebSocket from "ws";
import dotenv from "dotenv";

dotenv.config();

class RollingStats {
    constructor(maxSize) {
        this.maxSize = maxSize;
        this.values = [];
    }

    push(value) {
        this.values.push(value);

        if (this.values.length > this.maxSize) {
            this.values.shift();
        }
    }

    size() {
        return this.values.length;
    }

    mean() {
        if (this.values.length === 0) return 0;

        return (
            this.values.reduce((sum, value) => sum + value, 0) /
            this.values.length
        );
    }

    std() {
        if (this.values.length < 2) return 0;

        const mean = this.mean();

        const variance =
            this.values.reduce(
                (sum, value) => sum + Math.pow(value - mean, 2),
                0
            ) /
            (this.values.length - 1);

        return Math.sqrt(variance);
    }

    zScore(value) {
        const std = this.std();

        if (std === 0) return 0;

        return Math.abs((value - this.mean()) / std);
    }
}

class TradeAnomalyDetector {
    constructor(windowSize, zThreshold, minPriceMoveBps = 0.5) {
        this.zThreshold = zThreshold;
        this.minPriceMoveBps = minPriceMoveBps;

        this.quantityStats = new RollingStats(windowSize);
        this.notionalStats = new RollingStats(windowSize);
        this.priceMoveBpsStats = new RollingStats(windowSize);

        this.lastPrice = undefined;
    }

    detect(trade) {
        const reasons = [];

        const priceMoveBps = this.calculatePriceMoveBps(trade.price);

        const hasEnoughHistory =
            this.quantityStats.size() >= 30 &&
            this.notionalStats.size() >= 30 &&
            this.priceMoveBpsStats.size() >= 30;

        let score = 0;

        if (hasEnoughHistory) {
            const quantityScore = this.quantityStats.zScore(trade.quantity);
            const notionalScore = this.notionalStats.zScore(trade.notional);
            const priceMoveScore = this.priceMoveBpsStats.zScore(priceMoveBps);

            score = Math.max(quantityScore, notionalScore, priceMoveScore);

            if (quantityScore >= this.zThreshold) {
                reasons.push(`quantity_z=${quantityScore.toFixed(2)}`);
            }

            if (notionalScore >= this.zThreshold) {
                reasons.push(`notional_z=${notionalScore.toFixed(2)}`);
            }

            /*
              Price anomaly is now based on price movement, not raw price.

              Additional guard:
              Even if the z-score is high, we only report a price anomaly
              when the absolute movement is economically meaningful.
            */
            if (
                priceMoveScore >= this.zThreshold &&
                priceMoveBps >= this.minPriceMoveBps
            ) {
                reasons.push(
                    `price_move_bps=${priceMoveBps.toFixed(4)}`
                );
                reasons.push(
                    `price_move_z=${priceMoveScore.toFixed(2)}`
                );
            }
        }

        this.quantityStats.push(trade.quantity);
        this.notionalStats.push(trade.notional);
        this.priceMoveBpsStats.push(priceMoveBps);

        this.lastPrice = trade.price;

        return {
            isAnomaly: reasons.length > 0,
            score,
            reasons,
            priceMoveBps
        };
    }

    calculatePriceMoveBps(currentPrice) {
        if (!this.lastPrice) return 0;

        /*
          Basis points:

          1 basis point = 0.01%

          Example:
          10 bps = 0.10%
          100 bps = 1.00%

          We use logarithmic return because it is standard in financial
          time-series analysis and behaves better for relative price movement.
        */
        return Math.abs(Math.log(currentPrice / this.lastPrice)) * 10000;
    }
}

class BinanceTradeStream {
    constructor(symbol, detector) {
        this.symbol = symbol;
        this.detector = detector;
        this.ws = undefined;
        this.reconnectDelayMs = 1000;
    }

    connect() {
        const streamName = `${this.symbol.toLowerCase()}@trade`;
        const url = `wss://stream.binance.com:9443/ws/${streamName}`;

        console.log(`Connecting to ${url}`);

        this.ws = new WebSocket(url);

        this.ws.on("open", () => {
            console.log("WebSocket connected.");
            this.reconnectDelayMs = 1000;
        });

        this.ws.on("message", (raw) => {
            try {
                const event = JSON.parse(raw.toString());
                const trade = this.mapTrade(event);
                const result = this.detector.detect(trade);

                if (result.isAnomaly) {
                    console.warn(
                        JSON.stringify(
                            {
                                type: "ANOMALY",
                                symbol: trade.symbol,
                                tradeId: trade.tradeId,
                                price: trade.price,
                                quantity: trade.quantity,
                                notional: Number(trade.notional.toFixed(2)),
                                priceMoveBps: Number(result.priceMoveBps.toFixed(4)),
                                score: Number(result.score.toFixed(2)),
                                reasons: result.reasons,
                                time: new Date(trade.timestamp).toISOString()
                            },
                            null,
                            2
                        )
                    );
                } else {
                    console.log(
                        `[${trade.symbol}] price=${trade.price} qty=${trade.quantity} notional=${trade.notional.toFixed(
                            2
                        )} priceMoveBps=${result.priceMoveBps.toFixed(4)}`
                    );
                }
            } catch (error) {
                console.error("Failed to process message:", error);
            }
        });

        this.ws.on("close", () => {
            console.warn("WebSocket closed. Reconnecting...");
            this.scheduleReconnect();
        });

        this.ws.on("error", (error) => {
            console.error("WebSocket error:", error.message);

            if (this.ws) {
                this.ws.close();
            }
        });
    }

    close() {
        if (this.ws) {
            this.ws.close();
        }
    }

    scheduleReconnect() {
        setTimeout(() => this.connect(), this.reconnectDelayMs);

        this.reconnectDelayMs = Math.min(
            this.reconnectDelayMs * 2,
            30000
        );
    }

    mapTrade(event) {
        const price = Number(event.p);
        const quantity = Number(event.q);

        if (!Number.isFinite(price) || !Number.isFinite(quantity)) {
            throw new Error(`Invalid trade payload: ${JSON.stringify(event)}`);
        }

        return {
            tradeId: event.t,
            symbol: event.s,
            price,
            quantity,
            notional: price * quantity,
            timestamp: event.T,
            isBuyerMaker: event.m
        };
    }
}

const symbol = process.env.SYMBOL ?? "btcusdt";

const windowSize = Number(process.env.WINDOW_SIZE ?? 10_000);
const zThreshold = Number(process.env.Z_THRESHOLD ?? 5);

/*
  Minimum economically meaningful price movement.

  0.5 bps = 0.005%
  For BTC around 66,600 USDT, this is roughly 3.33 USDT.

  This prevents tiny price changes such as 0.01 USDT from being treated
  as market anomalies.
*/
const minPriceMoveBps = Number(process.env.MIN_PRICE_MOVE_BPS ?? 0.5);

const detector = new TradeAnomalyDetector(
    windowSize,
    zThreshold,
    minPriceMoveBps
);

const stream = new BinanceTradeStream(symbol, detector);

stream.connect();

process.on("SIGINT", () => {
    console.log("Shutting down...");
    stream.close();
    process.exit(0);
});