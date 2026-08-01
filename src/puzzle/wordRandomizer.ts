import { random, floor, memoize } from 'lodash-es';
import { words } from './words';

const MIN_WORD_LEN = 4;
const MAX_WORD_LEN = 8;

// The most words randomizeWordLengths can produce, which is when every draw
// comes out at MIN_WORD_LEN. Its loop stops once the remainder is down to
// MAX_WORD_LEN * 2, so the loop runs the smallest number of times satisfying
//     totalLength - count * MIN_WORD_LEN <= MAX_WORD_LEN * 2
// which solves directly for count. The lower bound of 1 is the do-while always
// running once; the + 2 is the penultimate and final lengths it then appends.
export function worstCaseWordCount(totalLength: number) {
    const drawnWords = Math.ceil((totalLength - MAX_WORD_LEN * 2) / MIN_WORD_LEN);
    return Math.max(1, drawnWords) + 2;
}

export function randomizeWordLengths(totalLength: number) {
    const lengths: number[] = [];
    let lengthSoFar = 0;
    do {
        const len = random(MIN_WORD_LEN, MAX_WORD_LEN);
        lengthSoFar += len;
        lengths.push(len);
    } while (totalLength - lengthSoFar > MAX_WORD_LEN * 2);
    const penultimateLen = floor((totalLength - lengthSoFar) / 2);
    lengths.push(penultimateLen);
    lengthSoFar += penultimateLen;
    lengths.push(totalLength - lengthSoFar);
    return lengths;
}

const getWordsOfGivenLength = memoize((length: number) => {
    return words.filter(w => w.length === length);
});

function randomizeWord(length: number) {
    const wordsOfGivenLength = getWordsOfGivenLength(length);
    return wordsOfGivenLength[random(wordsOfGivenLength.length - 1)];
}

export function randomizeWords(totalLength: number) {
    const lengths = randomizeWordLengths(totalLength);
    return lengths.map(length => randomizeWord(length));
}
