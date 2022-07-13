import _ from "lodash";
import {resolveMatrix} from "./resolveMatrix";

declare global {
    interface String {
        replaceAt(index: number, replacement: string): string
    }
}

String.prototype.replaceAt = function (index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}


export function fillMatrix(width: number, height: number, words: string[]): { resolvedMatrix: string[][]; solutionMatrix: string[][] }[] {

    const emptyMatrix: string = '_'.repeat(height * width)

    function findFirstEmptyCell(matrix: string) {
        const index = matrix.indexOf('_')
        if (index === -1) {
            throw new Error("no empty cells!")
        }

        const y = Math.floor(index / width)
        const x = index % width
        return [x, y]
    }

    function countEmptyCells(matrix: string) {
        return matrix.split('').filter(c => c === '_').length
    }


    function toMatrix(matrix: string): string[][] {
        return _.chunk(matrix.split(''), width)
    }

    function setAt(matrix: string, x: number, y: number, value: string) {
        return matrix.replaceAt(y * width + x, value)
    }

    function getAt(matrix: string, x: number, y: number) {
        return matrix.at(y * width + x)
    }

    function unique(matrices: string[]) {
        return [...new Set(matrices)]
    }

    let solutionFound = false

    function fillMatrix_(matrix: string, wordLengths: number[], wordNumber: number = 0): string[] {
        if (solutionFound) {
            return []
        }
        if (wordLengths.length === 0) {
            solutionFound = true
            return [matrix]
        }
        // const emptyCellCount = countEmptyCells(matrix)
        // if (emptyCellCount < wordLen) {
        //     solutionFound = true
        //     return [matrix]
        // }

        const [x, y] = findFirstEmptyCell(matrix)

        function fillWord(matrix: string, [x, y]: number[], cellsLeft: number, options: number[][] = []): string[] {
            const newMatrix = setAt(matrix, x, y, wordNumber.toString(30))

            if (cellsLeft === 1) {
                return [newMatrix]
            }

            const newOptions = options.slice()
            newOptions.push(
                [x, y - 1],
                [x - 1, y],
                [x + 1, y],
                [x, y + 1]
            )
            const filteredOptions =
                _.shuffle(newOptions
                    .filter(([x, y]) => x >= 0 && y >= 0 && x < width && y < height && getAt(newMatrix, x, y) === '_')
                )

            return filteredOptions.flatMap(([x, y]) =>
                fillWord(newMatrix, [x, y], cellsLeft - 1, filteredOptions))
        }


        const wordLen = wordLengths[0]
        const newWordLengths = _.tail(wordLengths)
        const matrices = unique(fillWord(matrix, [x, y], wordLen))

        return matrices.flatMap(matrix => fillMatrix_(matrix, newWordLengths, wordNumber + 1))
    }

    const matrices = fillMatrix_(emptyMatrix, words.map(w => w.length)).map(
        m => ({solutionMatrix: m, resolvedMatrix: resolveMatrix(m, words)})
    )

    return matrices.map(({solutionMatrix, resolvedMatrix}) => ({
        solutionMatrix: toMatrix(solutionMatrix),
        resolvedMatrix: toMatrix(resolvedMatrix)
    }))
}
