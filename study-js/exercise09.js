function fun(x, y, z) {
    x = x | 1;
    y = y | 3;
    z = z | 9;
    return x + y * z;
}

const gun = function (x=1, y=3, z=9) {
    return x + y * z;
}

console.log(gun());
console.log(gun(3));
console.log(gun(3, 5));
console.log(gun(3, 5, 8));
console.log(gun(3, 5, 8, 34));