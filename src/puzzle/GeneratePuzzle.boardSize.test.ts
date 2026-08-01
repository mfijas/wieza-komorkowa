import { generatePuzzle } from './GeneratePuzzle';
import { MAX_WORDS } from './cellEncoding';
import { worstCaseWordCount } from './wordRandomizer';

test('should reject a board that could need more words than a cell can encode', () => {
    // 12x12 = 144 cells, worst case 34 words against 32 encodable numbers.
    expect(worstCaseWordCount(12 * 12)).toBeGreaterThan(MAX_WORDS);

    expect(() => generatePuzzle(12, 12)).toThrow(/board/i);
});

test('should name the offending size and the cap in the error', () => {
    expect(() => generatePuzzle(12, 12)).toThrow(/12x12/);
    expect(() => generatePuzzle(12, 12)).toThrow(new RegExp(String(MAX_WORDS)));
});

test('should accept the production board', () => {
    expect(() => generatePuzzle(7, 12)).not.toThrow();
});
