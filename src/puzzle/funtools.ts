export function set<T>(array: Array<Array<T>>, i: number, j: number, newValue: T) {
    return [
        ...array.slice(0, i),
        array[i].map((value, index) => index !== j ? value : newValue),
        ...array.slice(i + 1)
    ];
}
