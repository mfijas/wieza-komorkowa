import {useEffect, useState} from 'react'
import './App.scss'
import _ from 'lodash'
import {set} from './funtools'
import {Grid} from './Grid'
import {Status} from './Status'
import {generatePuzzle} from './GeneratePuzzle'
import {
    puzzleInLocalStorage,
    readPuzzleFromLocalStorage,
    readTileStateFromLocalStorage,
    storePuzzleInLocalStorage,
    storeTileStateInLocalStorage
} from './LocalStorage'

const WIDTH = 7
const HEIGHT = 12

const NUMBER_OF_WORD_COLOURS = 21

// type Tile = 'selected' | 'empty' | number

function emptyTileState() {
    return _.chunk(Array<string>(WIDTH * HEIGHT).fill('0'), WIDTH);
}

function getAllWordNumbers() {
    return [...Array(NUMBER_OF_WORD_COLOURS).keys()].slice(1);
}

function getUnusedWordNumbers(tileState: string[][]) {
    return _.difference(
        getAllWordNumbers(),
        _.uniq(tileState.flatMap(row =>
                row
                    .filter(tile => tile !== 'selected' && parseInt(tile) > 0)
                    .map(tile => parseInt(tile))
            )
        )
    )
}

function App() {
    const [tileState, setTileState] = useState<string[][]>()

    const [availableWordNumbers, setAvailableWordNumbers] = useState<number[]>([])

    const [resolvedMatrix, setResolvedMatrix] = useState<string[][]>([])
    const [solutionMatrix, setSolutionMatrix] = useState<string[][]>([])

    useEffect(() => {
        if (tileState !== undefined) {
            storeTileStateInLocalStorage(tileState)
        }
    }, [tileState])

    useEffect(() => {
        // this below is crap. rewrite it
        if (puzzleInLocalStorage()) {
            const [resolvedMatrix, solutionMatrix] = readPuzzleFromLocalStorage()
            setResolvedMatrix(resolvedMatrix)
            setSolutionMatrix(solutionMatrix)
            const storedTileState = readTileStateFromLocalStorage()
            setTileState(storedTileState)
            setAvailableWordNumbers(getUnusedWordNumbers(storedTileState))
        } else {
            const {matrix, solution} = generatePuzzle(WIDTH, HEIGHT)
            storePuzzleInLocalStorage([matrix, solution])
            setResolvedMatrix(matrix)
            setSolutionMatrix(solution)
            let newTileState = emptyTileState()
            setTileState(newTileState)
            storeTileStateInLocalStorage(newTileState)
            setAvailableWordNumbers(getAllWordNumbers())
        }
    }, [])

    useEffect(() => {
        if (tileState) {
            storeTileStateInLocalStorage(tileState)
        }
    }, [tileState])

    function popNextWordNumber() {
        if (availableWordNumbers.length === 0) {
            throw Error('Ran out of word numbers!')
        }
        setAvailableWordNumbers(_.tail(availableWordNumbers))
        return _.head(availableWordNumbers)!
    }

    function pushNextWordNumber(nextWordNumber: number) {
        setAvailableWordNumbers([nextWordNumber, ...availableWordNumbers])
    }

    function markWord() {
        const nextMarkedWordNumber = popNextWordNumber()
        const newTileState = tileState!.map(row =>
            row.map(tile =>
                tile === 'selected' ? nextMarkedWordNumber.toString(32) : tile))
        setTileState(newTileState)
    }

    function removeWord(wordNumber: number) {
        const newTileState = tileState!.map(row =>
            row.map(tile =>
                tile === wordNumber.toString(32) ? '0' : tile))
        setTileState(newTileState)
        pushNextWordNumber(wordNumber)
    }

    if (tileState) {
        return (
            <div id='app'>
                <Grid
                    matrix={resolvedMatrix}
                    tileState={tileState}
                    updateTileState={(x: number, y: number, newState: string) =>
                        setTileState(tileState => set(tileState!, y, x, newState))}
                    removeWord={removeWord}
                />
                <Status
                    matrix={resolvedMatrix}
                    tileState={tileState}
                    markWord={markWord}
                />
                <table>
                    <tbody>
                    {resolvedMatrix.map((row, y) =>
                        <tr key={'r_' + y}>
                            {row.map((cell, x) =>
                                <td key={'c_' + y + '_' + x} className={'t' + solutionMatrix[y][x]}>{cell}</td>
                            )}
                        </tr>)}
                    </tbody>
                </table>
            </div>
        )
    } else {
        return <></>
    }
}

export default App
