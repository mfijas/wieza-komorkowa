/**
 * @jest-environment jsdom
 */
import { StrictMode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { emptyTileState } from './tileState';

const WIDTH = 7;
const HEIGHT = 12;

// The board React actually rendered, as one row-major uppercase string.
function renderedBoard() {
    return Array.from(document.querySelectorAll('#grid button'))
        .map(button => button.textContent)
        .join('');
}

// The board sitting in local storage, in the same shape.
function storedBoard() {
    const puzzleJson = localStorage.getItem('puzzle');
    if (puzzleJson === null) {
        throw Error('No puzzle in local storage!');
    }
    const [matrix] = JSON.parse(puzzleJson) as [string[][], number[][]];
    return matrix.flat().join('').toUpperCase();
}

function renderApp() {
    return render(
        <StrictMode>
            <App width={WIDTH} height={HEIGHT}/>
        </StrictMode>
    );
}

beforeEach(() => {
    localStorage.clear();
});

describe('App', () => {
    it('renders a full board when local storage is empty', () => {
        renderApp();

        expect(document.querySelectorAll('#grid button')).toHaveLength(WIDTH * HEIGHT);
    });

    // Rendered inside StrictMode, which invokes the state initializer twice in
    // development. Whatever React ends up keeping must be what is persisted,
    // or the board silently changes on the next reload.
    it('stores the same puzzle it rendered', () => {
        renderApp();

        expect(storedBoard()).toEqual(renderedBoard());
    });

    it('restores the puzzle already in local storage rather than generating a new one', () => {
        renderApp();
        const firstBoard = renderedBoard();
        const storedAfterFirstRender = localStorage.getItem('puzzle');

        cleanupAndRerender();

        expect(renderedBoard()).toEqual(firstBoard);
        expect(localStorage.getItem('puzzle')).toEqual(storedAfterFirstRender);
    });

    it('seeds tile state from local storage', () => {
        renderApp();
        const markedTileState = emptyTileState(WIDTH, HEIGHT);
        markedTileState[0][0] = 1;
        localStorage.setItem('solution', JSON.stringify(markedTileState));

        cleanupAndRerender();

        expect(document.querySelectorAll('#grid button')[0]).toHaveClass('t1');
    });

    it('replaces both the rendered and the stored puzzle on a new game', async () => {
        const user = userEvent.setup();
        renderApp();
        const firstBoard = renderedBoard();

        await user.click(screen.getByRole('button', { name: '' }));
        await user.click(screen.getByText('Nowa gra'));

        expect(renderedBoard()).not.toEqual(firstBoard);
        expect(storedBoard()).toEqual(renderedBoard());
    });
});

function cleanupAndRerender() {
    document.body.innerHTML = '';
    renderApp();
}
