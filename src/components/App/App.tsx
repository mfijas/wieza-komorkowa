import { useEffect, useState } from 'react';
import './App.scss';
import _ from 'lodash';
import { set } from '../../puzzle/funtools';
import { Grid } from '../Grid/Grid';
import { Status } from '../Status/Status';
import { storeTileStateInLocalStorage } from './localStorage';
import { TileState } from './tileState';
import { Header } from '../Header/Header';
import { Menu } from '../Menu/Menu';
import {
    generatePuzzleStateAndStoreInLocalStorage,
    readPuzzleStateFromLocalStorage
} from './puzzleGenerationAndStorage';
import { Instructions } from '../Instructions/Instructions';

interface AppProps {
    width: number;
    height: number;
}

type ActiveScreen = 'game' | 'menu' | 'instructions';

function App(props: AppProps) {
    const [tileState, setTileState] = useState<TileState[][]>();

    const [availableWordNumbers, setAvailableWordNumbers] = useState<number[]>([]);

    const [matrix, setMatrix] = useState<string[][]>([]);
    const [solution, setSolution] = useState<number[][]>([]);

    const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('game');

    useEffect(() => {
        if (tileState !== undefined) {
            storeTileStateInLocalStorage(tileState);
        }
    }, [tileState]);

    useEffect(() => {
        const {
            matrix,
            solution,
            tileState,
            availableWordNumbers
        } = readPuzzleStateFromLocalStorage() || generatePuzzleStateAndStoreInLocalStorage(props.width, props.height);

        setMatrix(matrix);
        setSolution(solution);
        setTileState(tileState);
        setAvailableWordNumbers(availableWordNumbers);
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

    function newGame() {
        const {
            matrix,
            solution,
            tileState,
            availableWordNumbers
        } = generatePuzzleStateAndStoreInLocalStorage(props.width, props.height);

        setMatrix(matrix);
        setSolution(solution);
        setTileState(tileState);
        setAvailableWordNumbers(availableWordNumbers);
    }

    function removeWord(wordNumber: number) {
        const newTileState = tileState!.map(row =>
            row.map(tile =>
                tile === wordNumber ? 'unselected' : tile));
        setTileState(newTileState);
        pushNextWordNumber(wordNumber);
    }

    function renderScreen(currentScreen: ActiveScreen) {
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
                                newGame={newGame}
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
                return <Menu
                    onNewGame={() => {
                        newGame();
                        setCurrentScreen('game');
                    }}
                    onShowInstructions={() => setCurrentScreen('instructions')}/>;
            case 'instructions':
                return <Instructions onShowGame={() => setCurrentScreen('game')}/>;
        }
    }

    function burgerClicked() {
        setCurrentScreen(currentScreen === 'game' ? 'menu' : 'game');
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
