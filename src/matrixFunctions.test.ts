import {
    checkIfSelectionIsContiguous,
    count,
    extractSelectedWord,
    findIndex,
    Point,
    unique
} from "./matrixFunctions";

test('should extract word from matrix selection', () => {
    // given
    const tileStates = [
        ['', 'selected', '', 'selected'],
        ['', 'selected', '', 'selected'],
        ['', 'selected', 'selected', 'selected'],
        ['selected', 'selected', '', ''],
    ]
    const matrix = [
        ['A', 'B', 'C', 'D'],
        ['E', 'F', 'G', 'H'],
        ['I', 'J', 'K', 'L'],
        ['M', 'N', 'O', 'P'],
    ]

    // when
    const word = extractSelectedWord(matrix, tileStates)

    // then
    const expectedWord = 'BDFHJKLMN'
    expect(word).toEqual(expectedWord)
})

test('should find index of first occurrence of an item', () => {
    // given
    const matrix = [
        ['1', '2', '3'],
        ['4', '5', '5'],
        ['5', '5', '9']
    ]

    // when
    const p = findIndex(matrix, '5')

    // then
    expect(p).toEqual([1, 1])
})

test('should count occurrences of an item', () => {
    // given
    const matrix = [
        ['1', '2', '3'],
        ['4', '5', '5'],
        ['5', '5', '9']
    ]

    // when
    const fiveCount = count(matrix, '5')

    // then
    expect(fiveCount).toEqual(4)
})

test('should confirm that the region is continuous', () => {
    // given
    const tileStates = [
        ['', 'selected', '', 'selected'],
        ['', 'selected', '', 'selected'],
        ['', 'selected', 'selected', 'selected'],
        ['selected', 'selected', '', ''],
    ]

    // when
    const isContinuous = checkIfSelectionIsContiguous(tileStates)

    // then
    expect(isContinuous).toBeTruthy()
})

test('should confirm that the region is continuous (duplicate bug)', () => {
    // given
    const tileStates = [
        ['', '', '', ''],
        ['', 'selected', 'selected', ''],
        ['', 'selected', 'selected', ''],
        ['', '', '', ''],
    ]

    // when
    const isContinuous = checkIfSelectionIsContiguous(tileStates)

    // then
    expect(isContinuous).toBeTruthy()
})

test('should confirm that the region is not continuous', () => {
    // given
    const tileStates = [
        ['', 'selected', '', 'selected'],
        ['', 'selected', '', 'selected'],
        ['', 'selected', 'selected', 'selected'],
        ['selected', '', '', ''],
    ]

    // when
    const isContinuous = checkIfSelectionIsContiguous(tileStates)

    // then
    expect(isContinuous).toBeFalsy()
})

test('unique() should return a unique list of Points', () => {
    // given
    const points = [
        [1, 1],
        [1, 2],
        [1, 2],
        [1, 2],
        [2, 1],
        [2, 1]
    ] as Point[]

    // when
    const uniquePoints = unique(points)

    // then
    expect(uniquePoints).toEqual([
        [1, 1],
        [1, 2],
        [2, 1]
    ])
})
