function* odds(numbers) {
    console.log("odds()...")
    for (let number of numbers) {
        if (number % 2 === 1) {
            yield number;
        }
    }
}

let result = odds([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
let x = result.next();
/*
for (let number of odds([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])) {
    console.log(number);
}
 */