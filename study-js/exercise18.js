let numbers = [4, 8, 15, 16, 23, 42];
// imperative
let total = 0;
for (let number of numbers){
    if (number % 2 === 1){
        let cubed = number ** 3;
        total += cubed;
    }
}
console.log(`Total sum is ${total}.`)
// declarative programming -> functional programming
let total2 = numbers.filter(number => number % 2 === 1)
                    .map(number => number ** 3)
                    .reduce((sum, number) => sum + number, 0);
console.log(`Total sum is ${total2}.`)
