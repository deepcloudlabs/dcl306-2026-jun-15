import WebSocket from "ws";

const wssUrlBinance: string = "wss://stream.binance.com:9443/ws/btcusdt@trade";
const webSocket: WebSocket = new WebSocket(wssUrlBinance);

type Trade = {
    symbol: string;
    quantity: number;
    price: number;
    volume: number;
    timestamp: Date;
    eventId: number;
    sequence: number;
}

const trades : Trade[] = [];

webSocket.on("open", function () {
    console.log("Connected to binance.");
    setInterval(function () {
        let total_volume = trades.map(a_trade => a_trade.volume)
            .map(v => Number(v))
            .reduce((a, b) => a + b, 0);
        let average_volume = total_volume / trades.length;
        console.log(`Total volume: ${total_volume}, Average volume: ${average_volume}`);
        trades.splice(0);

    }, 30_000);
})

webSocket.on("message", function (raw: string) {
    let payload = JSON.parse(raw);
    let trade = {
        symbol: payload.s,
        quantity: Number(payload.q),
        price: Number(payload.p),
        volume: Number(payload.p) * Number(payload.q),
        eventId: payload.E,
        sequence: payload.t,
        timestamp: new Date(payload.T)
    };
    trades.push(trade);
})
