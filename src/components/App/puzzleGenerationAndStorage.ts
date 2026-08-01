import {
    puzzleInLocalStorage,
    readPuzzleFromLocalStorage,
    readTileStateFromLocalStorage,
    storePuzzleInLocalStorage,
    storeTileStateInLocalStorage
} from './localStorage';
import { generatePuzzle } from '../../puzzle/GeneratePuzzle';
import { emptyTileState, TileState } from './tileState';
import { difference, uniq } from 'lodash-es';

const NUMBER_OF_WORD_COLOURS = 18;

function getAllWordNumbers() {
    return [...Array(NUMBER_OF_WORD_COLOURS + 1).keys()].slice(1);
}

function getUnusedWordNumbers(tileState: TileState[][]) {
    return difference(
        getAllWordNumbers(),
        uniq(tileState.flatMap(row =>
                row.filter(tile => tile !== 'selected' && tile !== 'unselected')
            )
        )
    );
}

export interface PuzzleState {
    matrix: string[][];
    solution: number[][];
    tileState: TileState[][];
    availableWordNumbers: number[];
}

export function readPuzzleStateFromLocalStorage(): PuzzleState | undefined {
    if (puzzleInLocalStorage()) {
        const { matrix, solution } = readPuzzleFromLocalStorage();
        const tileState = readTileStateFromLocalStorage();
        const availableWordNumbers = getUnusedWordNumbers(tileState);
        return { matrix, solution, tileState, availableWordNumbers };
    } else {
        return undefined;
    }
}

// Deliberately free of storage side effects, so it is safe to call from a
// `useState` initializer — which StrictMode invokes twice in development.
// `storePuzzleState` is what persists, driven by the state itself.
export function generatePuzzleState(width: number, height: number): PuzzleState {
    const { matrix, solution } = generatePuzzle(width, height);
    return {
        matrix,
        solution,
        tileState: emptyTileState(width, height),
        availableWordNumbers: getAllWordNumbers()
    };
}

export function storePuzzleState({ matrix, solution, tileState }: PuzzleState) {
    storePuzzleInLocalStorage(matrix, solution);
    storeTileStateInLocalStorage(tileState);
}
