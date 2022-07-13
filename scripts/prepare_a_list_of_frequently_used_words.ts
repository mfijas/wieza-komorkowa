import * as fs from "fs";

// generowanie wariantów aspellem:
// aspell -d pl dump master | aspell -l pl expand > my.dict

// lista frekwencyjna
// https://web.archive.org/web/20091116122442/http://www.open-dictionaries.com/slownikfrleks.pdf
// http://nlp.pwr.wroc.pl/narzedzia-i-zasoby/zasoby/lista-frekwencyjna


function loadWordFrequencies() {
    const data = fs.readFileSync('words_freq.txt', {encoding: 'utf8'})
    const lines = data.split('\n')
    return lines.map(line => {
        const [word, frequency] = line.split('=')
        return {
            word,
            frequency: parseInt(frequency)
        }
    })
}

function loadAspellDump() {
    const data = fs.readFileSync('aspell_dump.txt', {encoding: 'utf8'})
    const lines = data.split('\n')
    return lines.map(line => {
        const [word] = line.split('/')
        return {word, line}
    })
}

const wordFrequencyPairs = loadWordFrequencies()

const aspellDump = loadAspellDump()

// filter aspell dump by frequency
console.log(wordFrequencyPairs)
console.log(aspellDump)

const NUMBER_OF_MOST_COMMON_WORDS = 3000;

const mostFrequentWords = wordFrequencyPairs
    .filter(({word}) => word.length >= 4 && word.length <= 8)
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, NUMBER_OF_MOST_COMMON_WORDS)
    .map(({word}) => word)
    .reverse()

const commonWords = mostFrequentWords.filter(word => aspellDump.some(aspell => aspell.word === word))

console.log('most frequent words: ' + mostFrequentWords.length)
console.log('common words: ' + commonWords.length)

const mostFrequentAspellDump = aspellDump
    .filter(({word}) => commonWords.indexOf(word) > -1)
    .map(({line}) => line)

fs.writeFileSync('aspell_most_frequent_dump.ts', mostFrequentAspellDump.join('\n'), {encoding: 'utf8'})
