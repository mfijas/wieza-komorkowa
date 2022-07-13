import {randomizeWords} from "./wordRandomizer";
import {fillMatrix} from "./strings";

export function generatePuzzle(width: number, height: number) {
    // const start = performance.now()
    let randomizedWords = randomizeWords(width * height)
    // console.log(randomizedWords)
    const allMatrices = fillMatrix(width, height, randomizedWords)
    // const duration = performance.now() - start
    // console.log(`duration: ${duration}ms`)
    const {resolvedMatrix, solutionMatrix} = allMatrices[0]

    // console.log(resolvedMatrix)
    // console.log(solutionMatrix)
    // console.log(randomizedWords)

    return {matrix: resolvedMatrix, solution: solutionMatrix}
}
