import { TileState } from './tileState';

const PUZZLE_KEY = 'puzzle';
const SOLUTION_KEY = 'solution';

function getPuzzleJson() {
    return localStorage.getItem(PUZZLE_KEY);
}

export function puzzleInLocalStorage() {
    return getPuzzleJson() !== null;
}

export function readPuzzleFromLocalStorage() {
    const puzzleJson = getPuzzleJson();
    if (puzzleJson) {
        const [matrix, solution] = JSON.parse(puzzleJson) as [string[][], number[][]];
        return { matrix, solution };
    } else {
        throw Error('Puzzle expected in local storage!');
    }
}

export function storePuzzleInLocalStorage(matrix: string[][], solution: number[][]) {
    localStorage.setItem(PUZZLE_KEY, JSON.stringify([matrix, solution]));
}

export function storeTileStateInLocalStorage(tileState: TileState[][]) {
    localStorage.setItem(SOLUTION_KEY, JSON.stringify(tileState));
}

export function readTileStateFromLocalStorage() {
    const item = localStorage.getItem(SOLUTION_KEY) || '';
    return JSON.parse(item) as TileState[][];
}
