import { randomizeWords } from './wordRandomizer';
import { fillMatrix } from './puzzleGeneration';

export function generatePuzzle(width: number, height: number) {
    // const start = performance.now()
    const randomizedWords = randomizeWords(width * height);
    // console.log(randomizedWords)
    const { resolvedMatrix, solutionMatrix } = fillMatrix(width, height, randomizedWords);
    // const duration = performance.now() - start
    // console.log(`duration: ${duration}ms`)

    // console.log(resolvedMatrix)
    // console.log(solutionMatrix)
    // console.log(randomizedWords)

    return { matrix: resolvedMatrix, solution: solutionMatrix };
}
