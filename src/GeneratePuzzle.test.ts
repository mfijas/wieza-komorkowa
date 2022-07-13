import {generatePuzzle} from "./GeneratePuzzle";


test('should generate a random puzzle', () => {
    // when
    const puzzle = generatePuzzle(10, 10)

    // then
    console.log(puzzle)
})
