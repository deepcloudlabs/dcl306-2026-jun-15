import fetch from "node-fetch";

console.log("Application is just started!")
fetch("https://api.binance.com/api/v3/ticker/price")
    .then(res => res.json())
    .then(tickers => {
            console.log(tickers.length);
            tickers.forEach(ticker => {
                console.log(ticker)
            });
        }
    )
    .finally(() => console.log("Application is done!"))
