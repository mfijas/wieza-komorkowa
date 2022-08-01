import * as fs from 'fs';

// generowanie wariantów aspellem:
// aspell -d pl dump master | aspell -l pl expand > my.dict

// lista frekwencyjna
// https://web.archive.org/web/20091116122442/http://www.open-dictionaries.com/slownikfrleks.pdf
// http://nlp.pwr.wroc.pl/narzedzia-i-zasoby/zasoby/lista-frekwencyjna

function loadWordFrequencies() {
    const data = fs.readFileSync('words_freq.txt', { encoding: 'utf8' });
    const lines = data.split('\n');
    return lines.map(line => {
        const [word, frequency] = line.split('=');
        return {
            word,
            frequency: parseInt(frequency)
        };
    });
}

function loadAspellDump() {
    const data = fs.readFileSync('aspell_dump.txt', { encoding: 'utf8' });
    const lines = data.split('\n');
    return lines.map(line => {
        const [word] = line.split('/');
        return { word, line };
    });
}

function loadOdm() {
    const data = fs.readFileSync('odm.txt', { encoding: 'utf8' });
    const lines = data.split('\r\n');
    return lines.map(line => {
        const words = line.split(', ');
        const root = words[0];
        const derived = words.slice(1);
        return { root, derived };
    });
}

const wordFrequencyPairs = loadWordFrequencies();

// const aspellDump = loadAspellDump();
const odm = loadOdm();

// filter aspell dump by frequency
console.log(wordFrequencyPairs);
console.log(odm);

const NUMBER_OF_MOST_COMMON_WORDS = 3000;

const mostFrequentWords = wordFrequencyPairs
    .filter(({ word }) => word.length >= 4 && word.length <= 8)
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, NUMBER_OF_MOST_COMMON_WORDS)
    .map(({ word }) => word)
    .reverse();

const commonWords = mostFrequentWords.filter(word => odm.some(aspell => aspell.root === word));

console.log('most frequent words: ' + mostFrequentWords.length);
console.log('common words: ' + commonWords.length);

// const mostFrequentWordsWithDerivatives = aspellDump
//     .filter(({ word }) => commonWords.indexOf(word) > -1)
//     .map(({ line }) => line);

const mostFrequentWordsWithDerivatives = odm
    .filter(({ root }) => commonWords.indexOf(root) > -1)
    .flatMap(({ root, derived }) => [root, ...derived])
    .filter(word => word.length >= 4 && word.length <= 8);

fs.writeFileSync('most_frequent_with_derivatives.txt', mostFrequentWordsWithDerivatives.join('\n'), { encoding: 'utf8' });
fs.writeFileSync('words.ts', `
export const words = [
${mostFrequentWordsWithDerivatives.map(s => `'${s}'`).join(',\n')}
];

export const allWords = [
${odm.flatMap(({ root, derived }) => [root, ...derived])
    .filter(word => word.length >= 4 && word.length <= 8)
    .filter(s => s.indexOf(' ') === -1)
    .filter(s => s.indexOf('.') === -1)
    .filter(s => s.indexOf('-') === -1)
    .filter(s => s.indexOf('\'') === -1)
    .map(s => `'${s}'`)
    .join(',\n')}
];
`);
