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

// Returns undefined for anything unusable, so the caller generates a fresh
// puzzle. The two storage keys are written separately and can therefore go out
// of step — a puzzle with a missing or corrupt tile state used to throw
// `SyntaxError: Unexpected end of JSON input`, and this now runs during render,
// where a throw takes the whole app down rather than one effect.
export function readPuzzleStateFromLocalStorage(): PuzzleState | undefined {
    if (!puzzleInLocalStorage()) {
        return undefined;
    }
    try {
        const { matrix, solution } = readPuzzleFromLocalStorage();
        const tileState = readTileStateFromLocalStorage();
        const availableWordNumbers = getUnusedWordNumbers(tileState);
        return { matrix, solution, tileState, availableWordNumbers };
    } catch {
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
