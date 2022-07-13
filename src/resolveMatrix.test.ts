import {resolveMatrix} from "./resolveMatrix";

test('should replace numbers with words', () => {
    // given
    const matrix = `
    00112
    30112
    33444
    `.replaceAll(/\s/g, '')
    const words = [
        'abc',
        'defg',
        'hi',
        'jkl',
        'mno'
    ]

    // when
    const resolvedMatrix = resolveMatrix(matrix, words)

    // then
    expect(resolvedMatrix).toBe("abdehjcfgiklmno")
})

test('should not fail for 10th word', () => {
    // given
    const matrix = `
    01234
    56789
    aaaaa
    `.replaceAll(/\s/g, '')
    const words = [
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
        'g',
        'h',
        'i',
        'j',
        '01234'
    ]

    // when
    const resolvedMatrix = resolveMatrix(matrix, words)

    // then
    expect(resolvedMatrix).toBe("abcdefghij01234")

})
