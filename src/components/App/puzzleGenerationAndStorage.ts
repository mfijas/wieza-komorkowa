import {
    puzzleInLocalStorage,
    readPuzzleFromLocalStorage,
    readTileStateFromLocalStorage,
    storePuzzleInLocalStorage,
    storeTileStateInLocalStorage
} from './localStorage';
import { generatePuzzle } from '../../puzzle/GeneratePuzzle';
import { emptyTileState, TileState } from './tileState';
import _ from 'lodash';

const NUMBER_OF_WORD_COLOURS = 21;

function getAllWordNumbers() {
    return [...Array(NUMBER_OF_WORD_COLOURS).keys()].slice(1);
}

function getUnusedWordNumbers(tileState: TileState[][]) {
    return _.difference(
        getAllWordNumbers(),
        _.uniq(tileState.flatMap(row =>
                row.filter(tile => tile !== 'selected' && tile !== 'unselected')
            )
        )
    ) as number[];
}

export function readPuzzleStateFromLocalStorage() {
    if (puzzleInLocalStorage()) {
        const { matrix, solution } = readPuzzleFromLocalStorage();
        const tileState = readTileStateFromLocalStorage();
        const availableWordNumbers = getUnusedWordNumbers(tileState);
        return { matrix, solution, tileState, availableWordNumbers };
    } else {
        return undefined;
    }
}

export function generatePuzzleStateAndStoreInLocalStorage(width: number, height: number) {
    const { matrix, solution } = generatePuzzle(width, height);
    storePuzzleInLocalStorage(matrix, solution);

    const tileState = emptyTileState(width, height);
    storeTileStateInLocalStorage(tileState);

    const availableWordNumbers = getAllWordNumbers();

    return { matrix, solution, tileState, availableWordNumbers };
}
