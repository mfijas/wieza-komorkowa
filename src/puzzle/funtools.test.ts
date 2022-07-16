import { set } from './funtools';

test('should replace value in array (0, 0)', () => {
    // given
    const array = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ];

    // when
    const newArray = set(array, 0, 0, 0);

    // then
    expect(newArray).toEqual([
        [0, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ]);
});

test('should replace value in array (2, 1)', () => {
    // given
    const array = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ];

    // when
    const newArray = set(array, 2, 1, 0);

    // then
    expect(newArray).toEqual([
        [1, 2, 3],
        [4, 5, 6],
        [7, 0, 9]
    ]);
});
