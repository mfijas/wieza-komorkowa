import _ from 'lodash';
import { resolveMatrix } from './resolveMatrix';

function replaceAt(s: string, index: number, replacement: string) {
    return s.substring(0, index) + replacement + s.substring(index + replacement.length);
}

function indexToCoords(width: number, index: number) {
    const y = Math.floor(index / width);
    const x = index % width;
    return [x, y];
}

function coordsToIndex(width: number, x: number, y: number) {
    return y * width + x;
}

function numberToChar(n: number) {
    return n.toString(32);
}

function charToNumber(c: string) {
    return parseInt(c, 32);
}

export function fillMatrix(width: number, height: number, words: string[]): { resolvedMatrix: string[][]; solutionMatrix: number[][] } {

    const emptyMatrix: string = '_'.repeat(height * width);

    function findFirstEmptyCell(matrix: string) {
        const index = matrix.indexOf('_');
        if (index === -1) {
            throw new Error('no empty cells!');
        }
        return indexToCoords(width, index);
    }

    function toMatrix(matrix: string): string[][] {
        return _.chunk(matrix.split(''), width);
    }

    function setAt(matrix: string, x: number, y: number, value: string) {
        return replaceAt(matrix, coordsToIndex(width, x, y), value);
    }

    function getAt(matrix: string, x: number, y: number) {
        return matrix.at(coordsToIndex(width, x, y));
    }

    function unique(matrices: string[]) {
        return [...new Set(matrices)];
    }

    let solutionFound = false;

    function fillMatrix_(matrix: string, wordLengths: number[], currentWordNumber: number = 0): string[] {
        if (solutionFound) {
            return [];
        }
        if (wordLengths.length === 0) {
            solutionFound = true;
            return [matrix];
        }

        function fillWord(matrix: string, [x, y]: number[], cellsToFill: number, options: number[][] = []): string[] {
            function coordsWithinBounds(x: number, y: number) {
                return x >= 0 && y >= 0 && x < width && y < height;
            }

            function cellIsEmpty(x: number, y: number) {
                return getAt(newMatrix, x, y) === '_';
            }

            const newMatrix = setAt(matrix, x, y, numberToChar(currentWordNumber));

            if (cellsToFill === 1) {
                return [newMatrix];
            }

            // check if redundant solutions are caused by duplicate options
            const newOptions = options.slice();
            newOptions.push(
                [x, y - 1],
                [x - 1, y],
                [x + 1, y],
                [x, y + 1]
            );

            const filteredOptions =
                _.shuffle(newOptions
                    .filter(([x, y]) => coordsWithinBounds(x, y) && cellIsEmpty(x, y))
                );

            return filteredOptions.flatMap(([x, y]) =>
                fillWord(newMatrix, [x, y], cellsToFill - 1, filteredOptions));
        }

        const [x, y] = findFirstEmptyCell(matrix);

        const currentWordLength = wordLengths[0];
        const remainingWordLengths = _.tail(wordLengths);
        const matrices = unique(fillWord(matrix, [x, y], currentWordLength));

        return matrices.flatMap(matrix => fillMatrix_(matrix, remainingWordLengths, currentWordNumber + 1));
    }

    const { resolvedMatrix, solutionMatrix } = fillMatrix_(emptyMatrix, words.map(w => w.length)).map(
        m => ({ solutionMatrix: m, resolvedMatrix: resolveMatrix(m, words) })
    )[0];

    return {
        solutionMatrix: toMatrix(solutionMatrix).map(row => row.map(c => charToNumber(c))),
        resolvedMatrix: toMatrix(resolvedMatrix)
    };
}
