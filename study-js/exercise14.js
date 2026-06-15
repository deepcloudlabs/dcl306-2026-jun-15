async function fun(x, y) {
    if (Math.random() > 0.9) {
        throw new Error("Ooopps!")
    } else {
        return x ** 2 + y ** 2;
    }
}
async function app(){
    console.log("before fun() call!");
    result = await fun(2, 5)
    console.log("after fun() call!");
    console.log(result);
}

app().then(()=>{
    console.log("application is done!");
})
