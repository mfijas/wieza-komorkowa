export function resolveMatrix(matrix: string, words: string[]) {

    const wordsTemp = words.slice();

    const { newMatrix } = matrix.split('').reduce(({ newMatrix, words }, currentCell) => {
        const wordNumber = parseInt(currentCell, 30);
        const currentWord = words[wordNumber];
        const letter = currentWord[0];
        words[wordNumber] = currentWord.slice(1); // naaastyyy, mutating the array
        return { newMatrix: newMatrix + letter, words };
    }, { newMatrix: '', words: wordsTemp });

    return newMatrix;
}
