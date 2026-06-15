numbers = [4, 8, 15, 16, 23, 42];
console.log(numbers.length);
numbers[100] = 549;
console.log(numbers.length);
numbers[-1] = 3615;
console.log(numbers.length);
console.log(numbers[-1]);
console.log(numbers["-1"]);
numbers["elma"] = 1001;
console.log(numbers.length);
console.log(numbers["elma"]);
console.log(numbers)
