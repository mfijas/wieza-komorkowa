import {randomizeWordLengths, randomizeWords} from "./wordRandomizer";
import _ from "lodash";


test('randomized numbers should sum up to desired sum', () => {
    // given
    const totalLength = 100

    // when
    const lengths = randomizeWordLengths(totalLength)

    // then
    expect(_.sum(lengths)).toBe(totalLength)
})

test('randomized word lengths should sum up to total length', () => {
    // given
    const totalLength = 100

    // when
    const words = randomizeWords(totalLength)

    // then
    expect(_.sum(words.map(w => w.length))).toBe(totalLength)
})
