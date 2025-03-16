import { readFileSync, writeFileSync } from 'fs';
import { exec } from 'child_process';

// generowanie wariantów aspellem:
// aspell -d pl dump master | aspell -l pl expand > odm.txt

// lista frekwencyjna
// https://web.archive.org/web/20091116122442/http://www.open-dictionaries.com/slownikfrleks.pdf
// http://nlp.pwr.wroc.pl/narzedzia-i-zasoby/zasoby/lista-frekwencyjna
//
// (inne do sprawdzenia w przyszłości: https://zasobynauki.pl/zasoby/listy-frekwencyjne-z-korpusow-tekstu,18459/)

function loadAllWords(filename: string) {
    const data = readFileSync(filename, { encoding: 'utf8' });
    const lines = data.split('\r\n');
    return lines;
}

function loadWordFrequencies(filename: string) {
    const data = readFileSync(filename, { encoding: 'utf8' });
    const lines = data.split('\n');
    return lines.map(line => {
        const [word, frequency] = line.split('=');
        return {
            word,
            frequency: parseInt(frequency)
        };
    });
}

function loadOdm() {
    const data = readFileSync('odm.txt', { encoding: 'utf8' });
    const lines = data.split('\r\n');
    return lines.map(line => {
        const words = line.split(', ');
        const root = words[0];
        const derived = words.slice(1);
        return { root, derived };
    });
}

function expandWords(words: string[]): Promise<string[]> {
    return new Promise((resolve, reject) => {
        // Join words with newlines to pass as stdin
        const input = words.join('\n');

        // Execute aspell command // | aspell -l pl expand
        const child = exec('aspell -l pl expand', { maxBuffer: 100 * 1024 * 1024 }, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }

            if (stderr) {
                reject(new Error(stderr));
                return;
            }

            // Split output by newlines and filter out empty lines
            const expandedWords = stdout.split('\n').filter(line => line.trim() !== '');
            resolve(expandedWords);
        });

        // Write input to stdin and close it
        child.stdin?.write(input);
        child.stdin?.end();
    });
}

function loadAspellDump(filename: string) {
    const data = readFileSync(filename, { encoding: 'utf8' });
    const lines = data.split('\n');
    return lines.map(line => {
        const [word] = line.split('/');
        return { word, line };
    });
}

const aspellDump = loadAspellDump('aspell_dump.txt');

const allWords = loadAllWords('slowa.txt');

console.log(allWords.slice(-100));

const wordFrequencyPairs = loadWordFrequencies('words_freq.txt');

console.log(wordFrequencyPairs[0]);

const wordFreqMap = {};
wordFrequencyPairs.forEach(({ word, frequency }) => { wordFreqMap[word] = frequency; });

const gameWordFrequencies = wordFrequencyPairs
    .filter(({ word }) => wordFreqMap[word] !== undefined);

console.log(gameWordFrequencies[0]);

const topGameWordFrequencies = gameWordFrequencies
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5000);

console.log(topGameWordFrequencies.slice(-100));

const topGameWords = topGameWordFrequencies.map(({ word }) => word);
const topGameWordsSet = {};
topGameWords.forEach(word => { topGameWordsSet[word] = true; });

const topGameWordsWithAffixFlags = aspellDump
    .filter(({ word }) => topGameWordsSet[word])
    .map(({ line }) => line);

console.log(topGameWordsWithAffixFlags.slice(-100));

expandWords(topGameWordsWithAffixFlags)
    .then(expandedWords => {
        console.log('tutko:');
        console.log(expandedWords.slice(-100));

        const mostFrequentWordsWithDerivatives = expandedWords
            .flatMap(line => line.split(' '))
            .filter(word => word.length >= 4 && word.length <= 8)
            .filter(word => !word.endsWith('yż'))
            .filter(word => !word.endsWith('że'))
            .filter(word => !word.startsWith('nie'));
        console.log(mostFrequentWordsWithDerivatives.slice(-100));

        writeFileSync('most_frequent_with_derivatives.txt', mostFrequentWordsWithDerivatives.join('\n'), { encoding: 'utf8' });

        writeFileSync('words.ts', `
export const words = [
${mostFrequentWordsWithDerivatives.map(s => `'${s}'`).join(',')}
];

export const allWords = [
${allWords
                .filter(word => word.length >= 4 && word.length <= 8)
                .map(s => `'${s}'`)
                .join(',')}
];
`);
    });



// // const aspellDump = loadAspellDump();
// const odm = loadOdm();

// // filter aspell dump by frequency
// console.log(wordFrequencyPairs);
// console.log(odm);

// const NUMBER_OF_MOST_COMMON_WORDS = 3000;

// const mostFrequentWords = wordFrequencyPairs
//     .filter(({ word }) => word.length >= 4 && word.length <= 8)
//     .sort((a, b) => b.frequency - a.frequency)
//     .slice(0, NUMBER_OF_MOST_COMMON_WORDS)
//     .map(({ word }) => word)
//     .reverse();

// const commonWords = mostFrequentWords.filter(word => odm.some(aspell => aspell.root === word));

// console.log('most frequent words: ' + mostFrequentWords.length);
// console.log('common words: ' + commonWords.length);

// // const mostFrequentWordsWithDerivatives = aspellDump
// //     .filter(({ word }) => commonWords.indexOf(word) > -1)
// //     .map(({ line }) => line);

// const mostFrequentWordsWithDerivatives = odm
//     .filter(({ root }) => commonWords.indexOf(root) > -1)
//     .flatMap(({ root, derived }) => [root, ...derived])
//     .filter(word => word.length >= 4 && word.length <= 8);

// fs.writeFileSync('most_frequent_with_derivatives.txt', mostFrequentWordsWithDerivatives.join('\n'), { encoding: 'utf8' });
// fs.writeFileSync('words.ts', `
// export const words = [
// ${mostFrequentWordsWithDerivatives.map(s => `'${s}'`).join(',\n')}
// ];

// export const allWords = [
// ${odm.flatMap(({ root, derived }) => [root, ...derived])
//     .filter(word => word.length >= 4 && word.length <= 8)
//     .filter(s => s.indexOf(' ') === -1)
//     .filter(s => s.indexOf('.') === -1)
//     .filter(s => s.indexOf('-') === -1)
//     .filter(s => s.indexOf('\'') === -1)
//     .map(s => `'${s}'`)
//     .join(',\n')}
// ];
// `);
