import React, {useState} from 'react'

enum MouseState {none, deselecting, selecting}

interface GridProps {
    matrix: string[][]
    tileState: string[][]
    updateTileState: (x: number, y: number, newState: string) => void
    removeWord: (wordNumber: number) => void
}

export function Grid(props: GridProps) {
    const [mouseState, setMouseState] = useState(MouseState.none)

    const tileState = (x: number, y: number) => props.tileState[y][x]
    const tileSelected = (x: number, y: number) => tileState(x, y) === 'selected'
    const tileEmpty = (x: number, y: number) => tileState(x, y) === '0'
    const tileContainsWordLetter = (x: number, y: number) => !tileEmpty(x, y) && !tileSelected(x, y)

    function selectTile(x: number, y: number) {
        props.updateTileState(x, y, 'selected')
    }

    function deselectTile(x: number, y: number) {
        props.updateTileState(x, y, '0')
    }

    function onClick(x: number, y: number) {
        if (tileContainsWordLetter(x, y)) {
            console.log(`clickety click (${tileState(x, y)})`)
            props.removeWord(parseInt(tileState(x, y), 32))
        }
    }

    function mouseDown(x: number, y: number) {
        function registerOnMouseUpListener() {
            function handleMouseUp() {
                setMouseState(MouseState.none)
                document.removeEventListener('mouseup', handleMouseUp)
            }

            document.addEventListener('mouseup', handleMouseUp)
        }

        if (tileEmpty(x, y)) {
            selectTile(x, y)
            setMouseState(MouseState.selecting)
            registerOnMouseUpListener()
        } else if (tileSelected(x, y)) {
            deselectTile(x, y)
            setMouseState(MouseState.deselecting)
            registerOnMouseUpListener()
        }
    }

    function mouseEnter(x: number, y: number) {
        switch (mouseState) {
            case MouseState.selecting:
                if (tileEmpty(x, y)) {
                    selectTile(x, y)
                }
                break
            case MouseState.deselecting:
                if (tileSelected(x, y)) {
                    deselectTile(x, y)
                }
        }
    }

    const margin = 8
    return (
        <div id='grid'>
            {props.matrix.map((row, y) =>
                row.map((cell, x) =>
                    <button
                        key={'c_' + y + '_' + x}
                        onClick={() => onClick(x, y)}
                        onMouseDown={() => mouseDown(x, y)}
                        onMouseEnter={() => mouseEnter(x, y)}
                        className={'t' + tileState(x, y)}
                    >
                        <svg viewBox='0 0 100 100'>
                            <rect x={margin}
                                  y={margin}
                                  width={100 - 2 * margin}
                                  height={100 - 2 * margin}
                                  rx={margin}
                                  ry={margin}
                            />
                            <text x='50%' y='50%' className='letter'>{cell.toUpperCase()}</text>
                        </svg>
                    </button>))
            }
        </div>
    )
}
