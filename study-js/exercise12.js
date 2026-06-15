function fun(x, y) {
    return new Promise((resolve, reject) => {
        if (Math.random() > 0.9) {
            setTimeout(() => {
                reject(new Error("Ooopps!"));
            }, 1_000);
        } else {
            setTimeout(() => {
                resolve(x ** 2 + y ** 2);
            }, 5_000);
        }
    });
}

console.log("before fun() call!");
fun(2, 5)
.then( result => {
    console.log(`received the result: ${result}`);
})
.catch(error => {
    console.error(error)
});
console.log("after fun() call!");
for (let i = 0; i < 100; i++) {
    console.log(i);
}