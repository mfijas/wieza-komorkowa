import _ from 'lodash';

export type TileState = 'selected' | 'unselected' | number;

export function emptyTileState(width: number, height: number) {
    return _.chunk(Array<TileState>(width * height).fill('unselected'), width);
}
