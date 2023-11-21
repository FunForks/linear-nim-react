/**
 * GameReducer.test.js
 *
 * The tests play three games:
 * 1. One where the "human" player starts and:
 *    * Takes two tokens before letting the AI play
 *    * Takes three tokens the second time.
 *    * Tries all possible moves the third time.
 *    This game is played out over several tests, each with a
 *    a specific purpose.
 * 2. Another where the AI starts and the "human" player
 *    follows the AI's winning algorithm... and the "human"
 *    player wins.
 * 3. A third game where the "human" player starts and tries
 *    all possible permutations of moves... and loses
 *
 * The last two games are played in a single test each. They rely
 * on the fact that all the tests for the first game pass.
 */


const { initialState, reducer } = require('./GameReducer.jsx')


describe('GameReducer should', () => {
  // Define standard actions
  const SWITCH_TO_AI = {
    type: "SET_PLAYER_TO_HUMAN",
    payload: false
  }
  const TAKE_TOKEN = { type: "TAKE_TOKEN" }


  // Test setting the player at the start
  test(`treat initial player as human`, () => {
    expect(initialState.playerIsHuman).toBe(true)
  })

  let alteredState // updates as the game is played

  test(`set player to  AI and adjust canTake and aiMove`, () => {
    const expectedState = {
      ...initialState,
      playerIsHuman: false,
      canTake: 1,
      aiMove: 1
    }

    alteredState = reducer( initialState, SWITCH_TO_AI )
    expect(alteredState).toStrictEqual(expectedState)
  })


  test(`set player back to human`, () => {
    const switchToHuman = {
      type: "SET_PLAYER_TO_HUMAN",
      payload: true
    }

    alteredState = reducer( alteredState, switchToHuman )
    expect(alteredState).toStrictEqual(initialState)
  });


  // Play a game where the human will lose //

  test(`allow human to take a token`, () => {
    const expectedState = {
      ...initialState,
      tokensLeft: 11,
      canTake: 2
    }

    alteredState = reducer( alteredState, TAKE_TOKEN )
    expect(alteredState).toStrictEqual(expectedState)
  });


  test(`allow human to take a second token`, () => {
    const expectedState = {
      ...initialState,
      tokensLeft: 10,
      canTake: 1
    }

    alteredState = reducer( alteredState, TAKE_TOKEN )
    expect(alteredState).toStrictEqual(expectedState)
  });


  test(`switch to AI and calculate best aiMove when asked`, () => {
    const expectedState = {
      ...alteredState,
      tokensLeft: 10,
      canTake: 2,
      aiMove: 2,
      playerIsHuman: false
    }

    alteredState = reducer( alteredState, SWITCH_TO_AI )
    expect(alteredState).toStrictEqual(expectedState)
  });


  test(`take a token as AI`, () => {
    const expectedState = {
      ...alteredState,
      tokensLeft: 9,
      canTake: 1,
      aiMove: 2,
    }

    alteredState = reducer( alteredState, TAKE_TOKEN )
    expect(alteredState).toStrictEqual(expectedState)
  });


  test(`switch back to human automatically when AI move is over`, () => {
    const expectedState = {
      ...alteredState,
      tokensLeft: 8,
      canTake: 3,
      aiMove: 0,
      playerIsHuman: true
    }

    alteredState = reducer( alteredState, TAKE_TOKEN )
    expect(alteredState).toStrictEqual(expectedState)
  });


  test(`switch to AI automatically after human has moved 3 times`, () => {
    alteredState = reducer( alteredState, TAKE_TOKEN )
    alteredState = reducer( alteredState, TAKE_TOKEN )
    alteredState = reducer( alteredState, TAKE_TOKEN )

    const expectedState = {
      ...alteredState,
      tokensLeft: 5,
      canTake: 1,
      aiMove: 1,
      playerIsHuman: false
    }

    expect(alteredState).toStrictEqual(expectedState)
  });


  test(`ignore switch to AI if AI is already the player`, () => {
    const switchedState = reducer( alteredState, SWITCH_TO_AI )

    expect(switchedState).toBe(alteredState)
  });


  test(`make AI take only one token when 5 tokensLeft`, () => {
    let counter = 0

    while (!alteredState.playerIsHuman) {
      alteredState = reducer( alteredState, TAKE_TOKEN )
      counter += 1
    }

    expect(counter).toBe(1)
  });


  test(`ensure humans can't win if they start first`, () => {
    const finalHumanStartingState = { ...alteredState }

    const tokensToTake = Array.from(
      { length: alteredState.canTake }, (_, index) => index + 1
    )

    const winningState = {
      tokensLeft: 0,
      canTake: 0,
      aiMove: 0, // will depend on number of tokens taken by human
      playerIsHuman: false,
      winner: false
    }

    tokensToTake.forEach( tokens => {
      alteredState = { ...finalHumanStartingState }

      // Final aiMove depends on the value of tokens
      winningState.aiMove = 4 - tokens
      // console.log(`When there are ${alteredState.tokensLeft} tokens left, if you take ${tokens} token${tokens-1 ? "s" : ""}...`)

      // Human plays the given number of times...
      while (tokens--) {
        alteredState = reducer( alteredState, TAKE_TOKEN )
      }

      // ... then we make sure it's AI's turn
      const SWITCH_TO_AI = {
        type: "SET_PLAYER_TO_HUMAN",
        payload: false
      }

      alteredState = reducer( alteredState, SWITCH_TO_AI)

      // AI plays
      while ( !alteredState.playerIsHuman
           && alteredState.winner === undefined
      ) {
        alteredState = reducer( alteredState, TAKE_TOKEN )
      }

      // console.log(`... you ${alteredState.winner ? "DO" : "can't"} win.`)

      expect(alteredState).toStrictEqual(winningState)
    })
  })


  test(`lose to human if human plays perfectly`, () => {
    alteredState = { ...initialState }

    // Get AI to start
    alteredState = reducer( alteredState, SWITCH_TO_AI )
    // console.log("AI to play:", alteredState);
    // {
    //   tokensLeft: 12,
    //   canTake: 1,
    //   aiMove: 1,
    //   playerIsHuman: false,
    //   winner: undefined
    // }

    while(alteredState.winner === undefined) {
      // Make AI play as it wishes
      while ( !alteredState.playerIsHuman
            && alteredState.winner === undefined
      ) {
        alteredState = reducer( alteredState, TAKE_TOKEN )
      }
      // console.log("AI completes move:", alteredState);
      // {
      //   tokensLeft: 11,
      //   canTake: 3,
      //   aiMove: 0,
      //   playerIsHuman: true,
      //   winner: undefined
      // }

      let moves = (alteredState.tokensLeft % 4) || 1
      while ( moves-- && alteredState.playerIsHuman
            && alteredState.winner === undefined
      ) {
        alteredState = reducer( alteredState, TAKE_TOKEN )
      }
      // console.log("human completes move:", alteredState);
      // {
      //   tokensLeft: 8,
      //   canTake: 1,
      //   aiMove: 1,
      //   playerIsHuman: false,
      //   winner: undefined
      // }
    }

    // console.log("human is winner:", alteredState);
    // {
    //   tokensLeft: 0,
    //   canTake: 0,
    //   aiMove: 0,
    //   playerIsHuman: true,
    //   winner: true
    // }

    expect(alteredState.winner).toBe(true)
  });


  test(`do nothing if the game is over`, () => {
    // Truthy winner
    let state = { ...initialState, winner: "game over" }

    expect(reducer( state, TAKE_TOKEN )).toBe(state)
    expect(reducer( state, SWITCH_TO_AI )).toBe(state)

    // winner === true; state is arbitrary
    state = { winner: true, we: "are the champions" }
    expect(reducer( state, TAKE_TOKEN )).toBe(state)
    expect(reducer( state, SWITCH_TO_AI )).toBe(state)

    // winner === false; state is arbitrary
    state = { winner: false, whatever: "whatever" }
    expect(reducer( state, TAKE_TOKEN )).toBe(state)
    expect(reducer( state, SWITCH_TO_AI )).toBe(state)
  });


  test(`win every time if the human plays first`, () => {
    // Create an array of all the possible human moves
    const permutations = Array.from({length: 27}, (_, ii) => {
      const a = (ii % 3)
      const b = (ii - a) / 3 % 3
      const c = ((ii - a - b * 3) / 9) % 3
      return [a + 1, b + 1, c + 1]
    })
    // console.log("permutations:", permutations);
    // [
    //   [ 1, 1, 1 ], [ 2, 1, 1 ], [ 3, 1, 1 ],
    //   [ 1, 2, 1 ], [ 2, 2, 1 ], [ 3, 2, 1 ],
    //   [ 1, 3, 1 ], [ 2, 3, 1 ], [ 3, 3, 1 ],
    //   [ 1, 1, 2 ], [ 2, 1, 2 ], [ 3, 1, 2 ],
    //   [ 1, 2, 2 ], [ 2, 2, 2 ], [ 3, 2, 2 ],
    //   [ 1, 3, 2 ], [ 2, 3, 2 ], [ 3, 3, 2 ],
    //   [ 1, 1, 3 ], [ 2, 1, 3 ], [ 3, 1, 3 ],
    //   [ 1, 2, 3 ], [ 2, 2, 3 ], [ 3, 2, 3 ],
    //   [ 1, 3, 3 ], [ 2, 3, 3 ], [ 3, 3, 3 ]
    // ]

    const aiWinsEveryTime = permutations.every( moves => {
      alteredState = { ...initialState }

      while (alteredState.winner === undefined) {
        // Play the human's moves
        moves.forEach( move => {
          while ( move-- && alteredState.playerIsHuman) {
            alteredState = reducer( alteredState, TAKE_TOKEN )
          }
        })

        // It's just possible that the human player might be the
        // winner, but in that case no AI moves would be played,
        // and switching the player to the AI would have no effect.

        // Switch to AI
        alteredState = reducer(alteredState, SWITCH_TO_AI)

        // Play the AI's moves until the AI wins or passes the
        // turn back to the human
        while ( !alteredState.playerIsHuman
              && alteredState.winner === undefined
        ) {
          alteredState = reducer( alteredState, TAKE_TOKEN )
        }
      }

      // We will get here as soon as alteredState.winner is
      // set to a boolean
      return alteredState.winner === false
    })

    expect(aiWinsEveryTime).toBe(true)
  });
});