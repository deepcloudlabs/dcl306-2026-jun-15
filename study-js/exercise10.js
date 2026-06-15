function gun(x, y, z) {
    if (arguments.length !== 3)
        throw Error("you must provide exactly 3 arguments!");
    return x + y * z;
}

console.log(gun(1,1,1));
console.log(gun(3,1,1));
console.log(gun(3, 5,1));
console.log(gun(3, 5, 8));
console.log(gun(3, 5, 8));