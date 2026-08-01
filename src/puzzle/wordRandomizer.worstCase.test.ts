import { randomizeWordLengths, worstCaseWordCount } from './wordRandomizer';

test('should never be exceeded by an actual randomized word list', () => {
    // The safety property the board-size check relies on. Sampled rather than
    // proven: an all-minimum draw is far too rare to observe (~1e-20 at 128
    // cells), so this asserts the bound holds, not that it is reached.
    for (const totalLength of [40, 84, 100, 128, 136]) {
        for (let i = 0; i < 500; i++) {
            expect(randomizeWordLengths(totalLength).length)
                .toBeLessThanOrEqual(worstCaseWordCount(totalLength));
        }
    }
});

test('should count the two trailing entries randomizeWordLengths always appends', () => {
    // randomizeWordLengths pushes a penultimate and a final length after its
    // loop, so even a single-word board reports three.
    expect(worstCaseWordCount(4)).toBe(3);
});

test('should grow one word per additional MIN_WORD_LEN cells', () => {
    // Pinned values, hand-derived from the loop shape.
    expect(worstCaseWordCount(84)).toBe(19);
    expect(worstCaseWordCount(136)).toBe(32);
    expect(worstCaseWordCount(137)).toBe(33);
});
