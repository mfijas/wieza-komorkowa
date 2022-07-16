import { useEffect, useState } from 'react';
import './App.scss';
import _ from 'lodash';
import { set } from './funtools';
import { Grid } from './Grid';
import { Status } from './Status';
import { generatePuzzle } from './GeneratePuzzle';
import {
    puzzleInLocalStorage,
    readPuzzleFromLocalStorage,
    readTileStateFromLocalStorage,
    storePuzzleInLocalStorage,
    storeTileStateInLocalStorage
} from './LocalStorage';
import { emptyTileState, TileState } from './TileState';
import { Header } from './Header';
import { Menu } from './Menu';
import addResizeListener from './ResizeListener';

const NUMBER_OF_WORD_COLOURS = 21;

function getAllWordNumbers() {
    return [...Array(NUMBER_OF_WORD_COLOURS).keys()].slice(1);
}

function getUnusedWordNumbers(tileState: TileState[][]) {
    return _.difference(
        getAllWordNumbers(),
        _.uniq(tileState.flatMap(row =>
                row.filter(tile => tile !== 'selected' && tile !== 'unselected')
            )
        )
    ) as number[];
}

interface AppProps {
    width: number;
    height: number;
}

function App(props: AppProps) {
    const [tileState, setTileState] = useState<TileState[][]>();

    const [availableWordNumbers, setAvailableWordNumbers] = useState<number[]>([]);

    const [matrix, setMatrix] = useState<string[][]>([]);
    const [solution, setSolution] = useState<number[][]>([]);

    const [currentScreen, setCurrentScreen] = useState<'game' | 'menu'>('game');

    useEffect(() => {
        addResizeListener();
    }, []);

    useEffect(() => {
        if (tileState !== undefined) {
            storeTileStateInLocalStorage(tileState);
        }
    }, [tileState]);

    useEffect(() => {
        function readPuzzleStateFromLocalStorage() {
            const { matrix, solution } = readPuzzleFromLocalStorage();
            const storedTileState = readTileStateFromLocalStorage();
            const availableWordNumbers = getUnusedWordNumbers(storedTileState);
            return { matrix, solution, storedTileState, availableWordNumbers };
        }

        function generatePuzzleStateAndStoreInLocalStorage() {
            const { matrix, solution } = generatePuzzle(props.width, props.height);
            storePuzzleInLocalStorage(matrix, solution);
            const newTileState = emptyTileState(props.width, props.height);
            storeTileStateInLocalStorage(newTileState);
            const availableWordNumbers = getAllWordNumbers();
            return { matrix, solution, newTileState, availableWordNumbers };
        }

        // this below is crap. rewrite it
        if (puzzleInLocalStorage()) {
            const { matrix, solution, storedTileState, availableWordNumbers } = readPuzzleStateFromLocalStorage();

            setMatrix(matrix);
            setSolution(solution);
            setTileState(storedTileState);
            setAvailableWordNumbers(availableWordNumbers);
        } else {
            const {
                matrix,
                solution,
                newTileState,
                availableWordNumbers
            } = generatePuzzleStateAndStoreInLocalStorage();

            setMatrix(matrix);
            setSolution(solution);
            setTileState(newTileState);
            setAvailableWordNumbers(availableWordNumbers);
        }
    }, [props.width, props.height]);

    function popNextWordNumber() {
        if (availableWordNumbers.length === 0) {
            throw Error('Ran out of word numbers!');
        }
        setAvailableWordNumbers(_.tail(availableWordNumbers));
        return _.head(availableWordNumbers)!;
    }

    function pushNextWordNumber(nextWordNumber: number) {
        setAvailableWordNumbers([nextWordNumber, ...availableWordNumbers]);
    }

    function markWord() {
        const nextMarkedWordNumber = popNextWordNumber();
        const newTileState = tileState!.map(row =>
            row.map(tile =>
                tile === 'selected' ? nextMarkedWordNumber : tile));
        setTileState(newTileState);
    }

    function removeWord(wordNumber: number) {
        const newTileState = tileState!.map(row =>
            row.map(tile =>
                tile === wordNumber ? 'unselected' : tile));
        setTileState(newTileState);
        pushNextWordNumber(wordNumber);
    }

    function renderScreen(currentScreen: 'game' | 'menu') {
        switch (currentScreen) {
            case 'game':
                if (tileState) {
                    return (
                        <>
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
                        </>
                    );
                } else {
                    return <></>;
                }
            case 'menu':
                return <Menu/>;
        }
    }

    function burgerClicked() {
        setCurrentScreen(currentScreen === 'menu' ? 'game' : 'menu');
    }

    return (
        <>
            <div id="app">
                <Header onClick={burgerClicked}/>
                {renderScreen(currentScreen)}
            </div>
        </>
    );
}

export default App;
