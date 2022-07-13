import _ from "lodash";

const WIDTH = 8
const HEIGHT = 5

const emptyMatrix: string[][] = new Array(HEIGHT).fill(0).map(() => new Array(WIDTH).fill('_'));

// const word = words[_.random(words.length)]
// console.log(word)

function clone(matrix: string[][]) {
    return matrix.map(a => a.slice())
}

function findFirstEmptyCell(matrix: string[][]) {
    const y = matrix.findIndex(row => row.findIndex(cell => cell === '_') !== -1)
    const x = matrix[y].findIndex(cell => cell === '_')
    return [x, y]
}

function countEmptyCells(matrix: string[][]) {
    return _.sum(matrix.map(row => row.filter(cell => cell === '_').length))
}

function fillMatrix_(matrix: string[][], wordLen: number, wordNumber: number = 0): string[][][] {
    const emptyCellCount = countEmptyCells(matrix)
    // console.log(`empty cell count: ${emptyCellCount}`)
    if (emptyCellCount < wordLen) {
        return [matrix]
    }

    const [x, y] = findFirstEmptyCell(matrix)

    function fillWord(matrix: string[][], [x, y]: number[], cellsLeft: number): string[][][] {
        const newMatrix = clone(matrix)

        newMatrix[y][x] = wordNumber.toString()

        if (cellsLeft === 1) {
            return [newMatrix]
        }

        const options = _.shuffle([
            [x, y - 1],
            [x - 1, y],
            [x + 1, y],
            [x, y + 1]
        ].filter(([x, y]) => x >= 0 && y >= 0 && x < WIDTH && y < HEIGHT && newMatrix[y][x] === '_'))

        return options.flatMap(([x, y]) => fillWord(newMatrix, [x, y], cellsLeft - 1))
    }

    const matrices: string[][][] = fillWord(matrix, [x, y], wordLen)

    return matrices.flatMap(matrix => fillMatrix_(matrix, wordLen, wordNumber + 1))
}

export function fillMatrix(wordLen: number): string[][][] {
    return fillMatrix_(emptyMatrix, wordLen)
}

