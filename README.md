# Linear Nim with React (Vite) #

[Demo](https://funforks.github.io/linear-nim-react/)

A React version of the [pure JS Linear Nim game](https://github.com/FunForks/linear-nim) (demoed [here](https://funforks.github.io/linear-nim/)).

This version uses:
* An (unchanging) component for the Rules
* An interactive component for the Game
* A Context (which is not strictly necessary)
* A Reducer to take care of the game logic

It also contains a series of tests, run by Jest. (Running the tests requires a minor edit to the end of GameReducer.jsx.)