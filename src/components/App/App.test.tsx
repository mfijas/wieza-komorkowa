/**
 * @jest-environment jsdom
 */
import { StrictMode } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { emptyTileState } from './tileState';

const WIDTH = 7;
const HEIGHT = 12;

// Every test here mounts a real board, and puzzle generation is deliberately
// expensive — the new-game test generates two. That fits the default 5s locally
// but overran it on CI, which is slower.
jest.setTimeout(30_000);

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

        remount();

        expect(renderedBoard()).toEqual(firstBoard);
        expect(localStorage.getItem('puzzle')).toEqual(storedAfterFirstRender);
    });

    it('seeds tile state from local storage', () => {
        renderApp();
        const markedTileState = emptyTileState(WIDTH, HEIGHT);
        markedTileState[0][0] = 1;
        localStorage.setItem('solution', JSON.stringify(markedTileState));

        remount();

        expect(document.querySelectorAll('#grid button')[0]).toHaveClass('t1');
    });

    // The two storage keys are written separately and can go out of step. This
    // used to throw `SyntaxError: Unexpected end of JSON input` during render,
    // taking the whole app down; a fresh puzzle is the right fallback.
    it('starts a fresh puzzle when the stored tile state is unusable', () => {
        renderApp();
        localStorage.removeItem('solution');

        remount();

        expect(document.querySelectorAll('#grid button')).toHaveLength(WIDTH * HEIGHT);
        expect(storedBoard()).toEqual(renderedBoard());
    });

    it('starts a fresh puzzle when the stored puzzle itself is corrupt', () => {
        localStorage.setItem('puzzle', 'not json');

        renderApp();

        expect(document.querySelectorAll('#grid button')).toHaveLength(WIDTH * HEIGHT);
        expect(storedBoard()).toEqual(renderedBoard());
    });

    // `delay: null` drops userEvent's artificial pause between events, which is
    // pure waiting here — nothing debounces.
    it('replaces both the rendered and the stored puzzle on a new game', async () => {
        const user = userEvent.setup({ delay: null });
        renderApp();
        const firstBoard = renderedBoard();

        await user.click(screen.getByRole('button', { name: 'Menu' }));
        await user.click(screen.getByText('Nowa gra'));

        expect(renderedBoard()).not.toEqual(firstBoard);
        expect(storedBoard()).toEqual(renderedBoard());
    });
});

// Stands in for a page reload: unmount properly, so the persist effect of the
// old tree is torn down before the new one mounts, then mount again against
// whatever is in local storage.
function remount() {
    cleanup();
    renderApp();
}
