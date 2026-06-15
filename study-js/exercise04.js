numbers = [0, 4, 8, 15, 16, 23, 42];
numbers[10] = 10;
// external loop #1
for (let i = 0; i < numbers.length; i++) {
    let value = numbers[i];
    // console.log(typeof value)
    if (value !== undefined) {
        console.log(`${i}: ${value}`);
    }
}
// external loop #2
for (let i in numbers) {
    let value = numbers[i];
    console.log(`${i}: ${value}`);
}
// external loop #3
for (let value of numbers) {
    if (value !== undefined) {
        console.log(`${value}`);
    }
}
// internal loop #4
numbers.forEach((value,i) => {
    console.log(`${i}: ${value}`);
})