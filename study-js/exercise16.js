/*
One JS thread
One event loop
Many concurrent socket operations managed by OS + libuv polling

JavaScript main thread
    |
    | calls fetch(...)
    v
Node.js / undici / HTTP client layer
    |
    | opens socket / writes HTTP request
    v
Operating system networking stack
    |
    | waits for response asynchronously
    v
Event loop is notified when socket is readable
    |
    v
JavaScript callback / Promise continuation runs on main thread
 */
import fetch from "node-fetch";
function get_ticker(symbol){
    return new Promise((resolve)=>{
        fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)
        .then(res => res.json())
        .then(ticker=>{
            console.log(`received ticker for ${symbol}`);
            resolve(ticker);
        });
    })
}

async function app(){
    let tickers =  await Promise.all([
        get_ticker("BTCUSDT"),
        get_ticker("ETHBTC"),
        get_ticker("GENIUSTRY")]
    );
    //tickers.sort((t1,t2)=>t1.symbol.localeCompare(t2.symbol));
    return tickers;
}

app().then(tickers=>{console.log(tickers)})