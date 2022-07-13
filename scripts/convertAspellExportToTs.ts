import fs from "fs";

function loadWord() {
    const data = fs.readFileSync('words.txt', {encoding: 'utf8'})
    const lines = data.split('\n')
    return lines.flatMap(line => line.split(' '))
}

const words = loadWord()

console.log(words)

fs.writeFileSync('words.ts', `
export const words = [
${words.map(word => `'${word}'`).join(',\n')}
]
`, {encoding: 'utf8'})
