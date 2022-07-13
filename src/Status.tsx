import {checkIfSelectionIsContiguous, extractSelectedWord, getNumberOfSelectedTiles} from './matrixFunctions'
import {words} from './words'
import React from 'react'

interface StatusParams {
    matrix: string[][]
    tileState: string[][]
    markWord: () => void
}

export function Status({matrix, tileState, markWord}: StatusParams) {
    const selectedWord = extractSelectedWord(matrix, tileState)
    const isProperWord = (selectedWord: string) => words.indexOf(selectedWord) !== -1

    function onClick() {
        if (isProperWord(selectedWord)) {
            markWord()
        }
    }

    let message: string
    let disabled: boolean
    if (getNumberOfSelectedTiles(tileState) === 0) {
        message = 'Enter word'
        disabled = true
    } else if (checkIfSelectionIsContiguous(tileState)) {
        if (selectedWord.length < 4) {
            message = 'Too short: ' + selectedWord.toUpperCase()
            disabled = true
        } else if (selectedWord.length > 8) {
            message = 'Too long'
            disabled = true
        } else {
            if (isProperWord(selectedWord)) {
                message = 'Add word: ' + selectedWord.toUpperCase()
                disabled = false
            } else {
                message = 'Not a word: ' + selectedWord.toUpperCase()
                disabled = true
            }
        }
    } else {
        message = 'Selection must be contiguous'
        disabled = true
    }

    const margin = 1
    return (
        <div className='status'>
            <button onClick={() => onClick()} style={{width: '100%', height: '2em'}} disabled={disabled}>
                <svg viewBox='0 0 100 14'>
                    <rect x={margin}
                          y={margin}
                          width={100 - 2 * margin}
                          height={14 - 2 * margin}
                          rx={margin}
                          ry={margin}
                    />
                    <text x='50%' y='50%'>{message}</text>
                </svg>
            </button>
        </div>
    )
}
