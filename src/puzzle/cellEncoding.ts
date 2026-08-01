// A matrix cell is a single character holding the number of the word that
// occupies it, so the base of that character is what limits how many words a
// puzzle can contain. Encoder and decoder must agree: they used to be written
// out separately and drifted apart (base 32 vs base 30), which crashed
// resolveMatrix on word 30.
export const CELL_BASE = 32;

// Word numbers run 0..CELL_BASE-1; CELL_BASE itself needs two characters.
export const MAX_WORDS = CELL_BASE;

export function numberToChar(n: number) {
    return n.toString(CELL_BASE);
}

export function charToNumber(c: string) {
    return parseInt(c, CELL_BASE);
}
