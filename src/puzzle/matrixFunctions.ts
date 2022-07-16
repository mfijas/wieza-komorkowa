import { TileState } from '../components/App/tileState';

export function findIndex<T>(array: Array<Array<T>>, value: T) {
    const i1 = array.findIndex((row) => row.some(item => item === value));
    if (i1 !== -1) {
        const i2 = array[i1].findIndex(item => item === value);
        return [i1, i2];
    } else {
        return null;
    }
}

export function count<T>(array: Array<Array<T>>, value: T) {
    return array.reduce((total, row) =>
        total + row.reduce((rowTotal, cell) =>
            rowTotal + (cell === value ? 1 : 0), 0), 0);
}

export type Point = [number, number];

function equals(p1: Point, p2: Point) {
    return p1[0] === p2[0] && p1[1] === p2[1];
}

export function unique(array: Point[]) {
    return array.filter((value, index) =>
        array.findIndex(p => equals(p, value)) === index);
}

export function getNumberOfSelectedTiles(tileStates: TileState[][]) {
    return count(tileStates, 'selected');
}

export function checkIfSelectionIsContiguous(tileStates: TileState[][]) {
    const height = tileStates.length;
    const width = tileStates[0].length;

    function withinBounds([y, x]: Point) {
        return x >= 0 && x < width && y >= 0 && y < height;
    }

    function containsPoint(array: Point[], p: Point) {
        return array.some(cp => equals(cp, p));
    }

    function isSelected([y, x]: Point) {
        return tileStates[y][x] === 'selected';
    }

    const numberOfSelectedTiles = getNumberOfSelectedTiles(tileStates);
    if (numberOfSelectedTiles === 0) {
        return true;
    }

    const [y, x] = findIndex(tileStates, 'selected')!;

    const area = [[y, x] as Point];

    let newNeighbours: Point[];
    do {
        newNeighbours =
            area.flatMap(([y, x]) =>
                ([
                    [y - 1, x],
                    [y + 1, x],
                    [y, x - 1],
                    [y, x + 1]
                ] as Point[])
                    .filter(withinBounds)
                    .filter(isSelected)
                    .filter(point => !containsPoint(area, point))
            );
        area.push(...unique(newNeighbours));
    } while (newNeighbours.length > 0);

    return area.length === numberOfSelectedTiles;
}
