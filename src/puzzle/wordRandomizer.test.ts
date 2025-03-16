import { randomizeWordLengths, randomizeWords } from './wordRandomizer';
import { sum } from 'lodash-es';

test('randomized numbers should sum up to desired sum', () => {
    // given
    const totalLength = 100;

    // when
    const lengths = randomizeWordLengths(totalLength);

    // then
    expect(sum(lengths)).toBe(totalLength);
});

test('randomized word lengths should sum up to total length', () => {
    // given
    const totalLength = 100;

    // when
    const words = randomizeWords(totalLength);

    // then
    expect(sum(words.map(w => w.length))).toBe(totalLength);
});
