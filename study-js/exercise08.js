function fun(x, y, z) {
    console.log(x, y, z);
    return x + y * z;
}

const gun = function (x, y, z) {
    return x + y * z;
}

console.log(gun());
console.log(gun(3));
console.log(gun(3, 5));
console.log(gun(3, 5, 8));
console.log(gun(3, 5, 8, 34));