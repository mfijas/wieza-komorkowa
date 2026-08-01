import { generatePuzzle } from './GeneratePuzzle';

test('should generate a random puzzle', () => {
    // when
    const { matrix, solution } = generatePuzzle(10, 10);

    // then
    expect(matrix).toBeDefined();
    expect(solution).toBeDefined();
});
