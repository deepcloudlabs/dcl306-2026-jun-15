async function fun(x, y) {
    if (Math.random() > 0.9) {
        throw new Error("Ooopps!")
    } else {
        return x ** 2 + y ** 2;
    }
}

console.log("before fun() call!");
fun(2, 5)
    .then(result => {
        console.log(`received the result: ${result}`);
    })
    .catch(error => {
        console.error(error)
    });
console.log("after fun() call!");
for (let i = 0; i < 100; i++) {
    console.log(i);
}