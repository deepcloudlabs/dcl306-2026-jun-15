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
    return tickers;
}

app().then(tickers=>{console.log(tickers)})