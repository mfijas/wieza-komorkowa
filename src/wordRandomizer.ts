import _, { floor } from 'lodash';
import { words } from './words';

const MIN_WORD_LEN = 4;
const MAX_WORD_LEN = 8;

export function randomizeWordLengths(totalLength: number) {
    const lengths: number[] = [];
    let lengthSoFar = 0;
    do {
        const len = _.random(MIN_WORD_LEN, MAX_WORD_LEN);
        lengthSoFar += len;
        lengths.push(len);
    } while (totalLength - lengthSoFar > MAX_WORD_LEN * 2);
    const penultimateLen = floor((totalLength - lengthSoFar) / 2);
    lengths.push(penultimateLen);
    lengthSoFar += penultimateLen;
    lengths.push(totalLength - lengthSoFar);
    return lengths;
}

export function randomizeWord(length: number) {
    const wordsOfGivenLength = words.filter(w => w.length === length);
    return wordsOfGivenLength[_.random(wordsOfGivenLength.length - 1)];
}

export function randomizeWords(totalLength: number) {
    const lengths = randomizeWordLengths(totalLength);
    return lengths.map(length => randomizeWord(length));
}
