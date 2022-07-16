import { checkIfSelectionIsContiguous, getNumberOfSelectedTiles } from '../../puzzle/matrixFunctions';
import { words } from '../../puzzle/words';
import { TileState } from '../App/tileState';
import './Status.scss';

interface StatusParams {
    matrix: string[][];
    tileState: TileState[][];
    markWord: () => void;
}

export function extractSelectedWord(matrix: string[][], tileStates: TileState[][]) {
    return tileStates.flatMap((row, y) =>
        row.map((tile, x) =>
            tile === 'selected' ? matrix[y][x] : '')).join('');
}

export function Status({ matrix, tileState, markWord }: StatusParams) {
    const selectedWord = extractSelectedWord(matrix, tileState);
    const isProperWord = (selectedWord: string) => words.indexOf(selectedWord) !== -1;

    function onClick() {
        if (isProperWord(selectedWord)) {
            markWord();
        }
    }

    let message: string;
    let disabled: boolean;
    if (getNumberOfSelectedTiles(tileState) === 0) {
        message = 'Zaznacz słowo';
        disabled = true;
    } else if (checkIfSelectionIsContiguous(tileState)) {
        if (selectedWord.length < 4) {
            message = 'Za krótkie: ' + selectedWord.toUpperCase();
            disabled = true;
        } else if (selectedWord.length > 8) {
            message = 'Za długie słowo!';
            disabled = true;
        } else {
            if (isProperWord(selectedWord)) {
                message = 'Dodaj słowo: ' + selectedWord.toUpperCase();
                disabled = false;
            } else {
                message = 'To nie słowo: ' + selectedWord.toUpperCase();
                disabled = true;
            }
        }
    } else {
        message = 'Obszar musi być ciągły';
        disabled = true;
    }

    const margin = 1;
    return (
        <div className='status'>
            <button onClick={() => onClick()} style={{ width: '100%', height: '2em' }} disabled={disabled}>
                <svg viewBox='0 0 100 14'>
                    <rect
                        x={margin}
                        y={margin}
                        width={100 - 2 * margin}
                        height={14 - 2 * margin}
                        rx={margin}
                        ry={margin}
                    />
                    <text x='50%' y='50%'>{message}</text>
                </svg>
            </button>
        </div>
    );
}
