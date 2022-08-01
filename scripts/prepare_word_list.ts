import * as fs from 'fs';

// generowanie wariantów aspellem:
// aspell -d pl dump master | aspell -l pl expand > my.dict

// lista frekwencyjna
// https://web.archive.org/web/20091116122442/http://www.open-dictionaries.com/slownikfrleks.pdf
// http://nlp.pwr.wroc.pl/narzedzia-i-zasoby/zasoby/lista-frekwencyjna

const data = fs.readFileSync('words_freq.txt', { encoding: 'utf8' });
const lines = data.split('\n');
const wordPairs = lines.map(line => {
    const [word, frequency] = line.split('=');
    return {
        word,
        frequency: parseInt(frequency)
    };
});

const sorted = wordPairs
    .filter(({ word }) => word.length >= 4 && word.length <= 8)
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 3000)
    .reverse();

console.log(sorted);

fs.writeFile('words.ts', `
export const words = [
${sorted.map(({ word }) => `'${word}'`).join(',\n')}
]
`, () => console.log('już'));

