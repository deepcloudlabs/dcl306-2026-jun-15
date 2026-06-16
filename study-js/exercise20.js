function* filter(arr, predicate) {
    for (let value of arr) {
        if (predicate(value)) {
            console.log(`yielding in filter: ${value}`);
            yield value;
        }
    }
}

function* map(arr, map_fun) {
    for (let value of arr) {
        console.log(`yielding in map: ${value}`);
        yield map_fun(value);
    }
}

function reduce(arr, reducer, initial_value) {
    let result = initial_value;
    for (let value of arr) {
        console.log(`reducing: ${result} + ${value}`);
        result = reducer(result, value);
    }
    return result;
}

let numbers = [4, 8, 15, 16, 23, 42];
let result = reduce(map(filter(numbers, n => n % 2 === 1),n => n ** 3),(sum,n)=>sum+n,0);
console.log(result);