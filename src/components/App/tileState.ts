import { chunk } from 'lodash-es';

export type TileState = 'selected' | 'unselected' | number;

export function emptyTileState(width: number, height: number) {
    return chunk(Array<TileState>(width * height).fill('unselected'), width);
}
