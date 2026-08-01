import { randomizeWords, worstCaseWordCount } from './wordRandomizer';
import { fillMatrix } from './puzzleGeneration';
import { MAX_WORDS } from './cellEncoding';

export function generatePuzzle(width: number, height: number) {
    // Word lengths are random, so check the worst case rather than the drawn
    // one: a board either always works or always fails, never intermittently.
    const worstCase = worstCaseWordCount(width * height);
    if (worstCase > MAX_WORDS) {
        throw new Error(
            `board ${width}x${height} may need up to ${worstCase} words, ` +
            `but a matrix cell can only encode ${MAX_WORDS}`
        );
    }

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
