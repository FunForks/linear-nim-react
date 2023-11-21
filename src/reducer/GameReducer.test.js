
const { initialState, reducer } = require('./GameReducer.jsx')

console.log("initialState:", initialState);

const functionToCall = a => a

describe('GameReducer should', () => {
  test(`set player to human or AI`, () => {
    expect(true).toBe(true)
  });

  test.each`
    input| output 
    ${"in"} | ${"out"},
    ${"shake it"} | ${"all about"}
    `('convert $input to $output', ({ input, output }) => {
        expect(functionToCall(input)).toStrictEqual(input);
    });
});