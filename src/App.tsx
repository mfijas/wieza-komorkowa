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
import {TileState} from "./TileState";

const NUMBER_OF_WORD_COLOURS = 21

function emptyTileState(width: number, height: number) {
    return _.chunk(Array<TileState>(width * height).fill('unselected'), width);
}

function getAllWordNumbers() {
    return [...Array(NUMBER_OF_WORD_COLOURS).keys()].slice(1);
}

function getUnusedWordNumbers(tileState: TileState[][]) {
    return _.difference(
        getAllWordNumbers(),
        _.uniq(tileState.flatMap(row =>
                row
                    .filter(tile => tile !== 'selected' && tile !== 'unselected')
            )
        )
    ) as number[]
}

interface AppProps {
    width: number
    height: number
}

function App(props: AppProps) {
    const [tileState, setTileState] = useState<TileState[][]>()

    const [availableWordNumbers, setAvailableWordNumbers] = useState<number[]>([])

    const [matrix, setMatrix] = useState<string[][]>([])
    const [solution, setSolution] = useState<number[][]>([])

    useEffect(() => {
        if (tileState !== undefined) {
            storeTileStateInLocalStorage(tileState)
        }
    }, [tileState])

    useEffect(() => {
        // this below is crap. rewrite it
        if (puzzleInLocalStorage()) {
            const {matrix, solution} = readPuzzleFromLocalStorage()
            setMatrix(matrix)
            setSolution(solution)
            const storedTileState = readTileStateFromLocalStorage()
            setTileState(storedTileState)
            setAvailableWordNumbers(getUnusedWordNumbers(storedTileState))
        } else {
            const {matrix, solution} = generatePuzzle(props.width, props.height)
            storePuzzleInLocalStorage(matrix, solution)
            setMatrix(matrix)
            setSolution(solution)
            let newTileState = emptyTileState(props.width, props.height)
            setTileState(newTileState)
            storeTileStateInLocalStorage(newTileState)
            setAvailableWordNumbers(getAllWordNumbers())
        }
    }, [props.width, props.height])

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
                tile === 'selected' ? nextMarkedWordNumber : tile))
        setTileState(newTileState)
    }

    function removeWord(wordNumber: number) {
        const newTileState = tileState!.map(row =>
            row.map(tile =>
                tile === wordNumber ? 'unselected' : tile))
        setTileState(newTileState)
        pushNextWordNumber(wordNumber)
    }

    return tileState ? (
        <div id='app'>
            <Grid
                matrix={matrix}
                tileState={tileState}
                updateTileState={(x: number, y: number, newState: TileState) =>
                    setTileState(tileState => set(tileState!, y, x, newState))}
                removeWord={removeWord}
            />
            <Status
                matrix={matrix}
                tileState={tileState}
                markWord={markWord}
            />
            <table>
                <tbody>
                {matrix.map((row, y) =>
                    <tr key={'r_' + y}>
                        {row.map((cell, x) =>
                            <td key={'c_' + y + '_' + x} className={'t' + solution[y][x]}>{cell}</td>
                        )}
                    </tr>)}
                </tbody>
            </table>
        </div>
    ) : <></>;
}

export default App
