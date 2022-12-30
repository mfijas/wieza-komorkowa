import './Menu.scss';

interface MenuParams {
    onNewGame: () => void;
    onShowInstructions: () => void;
}

export function Menu({ onNewGame, onShowInstructions }: MenuParams) {
    const margin = 1;
    return (
        <div id="menu">
            <button onClick={() => onShowInstructions()}>
                <svg viewBox="0 0 100 14">
                    <rect
                        x={margin}
                        y={margin}
                        width={100 - 2 * margin}
                        height={14 - 2 * margin}
                        rx={margin}
                        ry={margin}
                    />
                    <text x="50%" y="50%">Instrukcje</text>
                </svg>
            </button>
            <button onClick={() => onNewGame()}>
                <svg viewBox="0 0 100 14">
                    <rect
                        x={margin}
                        y={margin}
                        width={100 - 2 * margin}
                        height={14 - 2 * margin}
                        rx={margin}
                        ry={margin}
                    />
                    <text x="50%" y="50%">Nowa gra</text>
                </svg>
            </button>
        </div>
    );
}
