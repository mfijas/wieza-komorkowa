import { useEffect, useState } from 'react';
import './App.scss';
import { head, tail } from 'lodash-es';
import { set } from '../../puzzle/funtools';
import { Grid } from '../Grid/Grid';
import { Status } from '../Status/Status';
import { TileState } from './tileState';
import { Header } from '../Header/Header';
import { Menu } from '../Menu/Menu';
import {
    generatePuzzleState,
    PuzzleState,
    readPuzzleStateFromLocalStorage,
    storePuzzleState
} from './puzzleGenerationAndStorage';
import { Instructions } from '../Instructions/Instructions';

interface AppProps {
    width: number;
    height: number;
}

type ActiveScreen = 'game' | 'menu' | 'instructions';

function App(props: AppProps) {
    const [puzzleState, setPuzzleState] = useState<PuzzleState>(() =>
        readPuzzleStateFromLocalStorage() || generatePuzzleState(props.width, props.height));

    const { matrix, solution, tileState, availableWordNumbers } = puzzleState;

    const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('game');

    // Storage follows state: whatever the board is, that is what gets persisted.
    // This does rewrite the puzzle key on tile-only changes, when the matrix has
    // not moved. Measured at 12µs per interaction — 0.07% of a frame, 1ms across
    // a drag over the whole board — so splitting it into two effects buys
    // nothing and costs the single "storage mirrors state" invariant. See TODO.
    useEffect(() => {
        storePuzzleState(puzzleState);
    }, [puzzleState]);

    function setTileState(newTileState: TileState[][]) {
        setPuzzleState(state => ({ ...state, tileState: newTileState }));
    }

    function setAvailableWordNumbers(newAvailableWordNumbers: number[]) {
        setPuzzleState(state => ({ ...state, availableWordNumbers: newAvailableWordNumbers }));
    }

    function popNextWordNumber() {
        if (availableWordNumbers.length === 0) {
            throw Error('Ran out of word numbers!');
        }
        setAvailableWordNumbers(tail(availableWordNumbers));
        return head(availableWordNumbers)!;
    }

    function pushNextWordNumber(nextWordNumber: number) {
        setAvailableWordNumbers([nextWordNumber, ...availableWordNumbers]);
    }

    function markWord() {
        const nextMarkedWordNumber = popNextWordNumber();
        const newTileState = tileState.map(row =>
            row.map(tile =>
                tile === 'selected' ? nextMarkedWordNumber : tile));
        setTileState(newTileState);
    }

    function newGame() {
        setPuzzleState(generatePuzzleState(props.width, props.height));
    }

    function removeWord(wordNumber: number) {
        const newTileState = tileState.map(row =>
            row.map(tile =>
                tile === wordNumber ? 'unselected' : tile));
        setTileState(newTileState);
        pushNextWordNumber(wordNumber);
    }

    function renderScreen(currentScreen: ActiveScreen) {
        switch (currentScreen) {
            case 'game':
                return (
                    <>
                        <Grid
                            matrix={matrix}
                            tileState={tileState}
                            updateTileState={(x: number, y: number, newState: TileState) =>
                                setPuzzleState(state => ({
                                    ...state,
                                    tileState: set(state.tileState, y, x, newState)
                                }))}
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
