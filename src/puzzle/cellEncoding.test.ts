import { CELL_BASE, MAX_WORDS, charToNumber, numberToChar } from './cellEncoding';

test('should round-trip every encodable word number', () => {
    for (let wordNumber = 0; wordNumber < MAX_WORDS; wordNumber++) {
        expect(charToNumber(numberToChar(wordNumber))).toBe(wordNumber);
    }
});

test('should encode every word number as a single character', () => {
    // Matrix cells hold one character each, so a two-character encoding would
    // silently corrupt the matrix rather than throw.
    for (let wordNumber = 0; wordNumber < MAX_WORDS; wordNumber++) {
        expect(numberToChar(wordNumber)).toHaveLength(1);
    }
});

test('should not fit one more word than MAX_WORDS', () => {
    // Guards the constant itself: MAX_WORDS is the largest count that still
    // encodes to single characters.
    expect(numberToChar(MAX_WORDS).length).toBeGreaterThan(1);
});

test('should derive MAX_WORDS from the cell base', () => {
    expect(MAX_WORDS).toBe(CELL_BASE);
});
