const PUZZLE_KEY = 'puzzle';
const SOLUTION_KEY = 'solution';

function getPuzzleJson() {
    return localStorage.getItem(PUZZLE_KEY);
}

export function puzzleInLocalStorage() {
    return getPuzzleJson() !== null
}

export function readPuzzleFromLocalStorage() {
    const puzzleJson = getPuzzleJson()
    if (puzzleJson) {
        const [resolvedMatrix, solutionMatrix] = JSON.parse(puzzleJson) as string[][][]
        return [resolvedMatrix, solutionMatrix]
    } else {
        throw Error('Puzzle expected in local storage!')
    }
}

export function storePuzzleInLocalStorage(puzzle: string[][][]) {
    localStorage.setItem(PUZZLE_KEY, JSON.stringify(puzzle))
}

export function storeTileStateInLocalStorage(tileState: string[][]) {
    localStorage.setItem(SOLUTION_KEY, JSON.stringify(tileState))
}

export function readTileStateFromLocalStorage() {
    let item = localStorage.getItem(SOLUTION_KEY) || ''
    return JSON.parse(item) as string[][]
}
