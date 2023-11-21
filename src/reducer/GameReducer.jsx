/**
 * GameReducer.jsx
 *
 * Use useReducer when:
 * + The next state depends on the previous state
 * + The state is complex
 * + You want to keep business logic:
 *   + as a pure function
 *   + in a separate module
 * + You want to be able to test easily
 */


// Define house rules
const STARTING_TOTAL = 12
const MAX_TAKEN = 3


const initialState = {
  // Initialize according to house rules
  tokensLeft: STARTING_TOTAL,
  canTake: MAX_TAKEN,

  aiMove: 0, // AI must take at least one on its turn...

  // ... but we assume the human player will call takeToken first
  playerIsHuman: true,
  winner: undefined // will be true if human wins, false if AI wins
}


const reducer = ( state, action) => {
  if (state.winner !== undefined) {
    return state // Can't play after the game is over
  }

  const { type, payload } = action

  switch (type) {
    case "SET_PLAYER_TO_HUMAN":
      return setPlayerToHuman(state, payload) // true or false

    case "TAKE_TOKEN":
      return takeToken(state, payload)

    default:
      return {...state}
  }
}


/**
 * setPlayerToHuman
 * Ensures that state.playerIsHuman is the given value. If the
 * value of state.playerIsHuman changes, the values for canTake
 * and aiMove will be recalculated for the new player.
 *
 * @param {object} state { tokensLeft    : <integer <= 12>,,
 *                         canTake       : <1|2|3>,
 *                         aiMove        : <1|2|3>,
 *                         playerIsHuman : <boolean>,
 *                         winner        : <undefined|boolean>,
 *                       }
 * @param {boolean} playerIsHuman
 * @returns {object} updated clone of state. playerIsHuman will
 * be the given value. The values for canTake and aiMove may also
 * change.
 */
function setPlayerToHuman( state, playerIsHuman ) {
  if (playerIsHuman === state.playerIsHuman) {
    return state
  }

  let aiMove = 0 // assume playerIsHuman
  let canTake = Math.min(MAX_TAKEN, state.tokensLeft)

  if (!playerIsHuman) {
    // Calculate the AI's best (legal) move
    aiMove = (state.tokensLeft % (MAX_TAKEN + 1)) || 1
    // To simplify the calculation of when to swap turns, make
    // canTake the same as the number that the AI will take
    canTake = aiMove
  }

  return { ...state, playerIsHuman, canTake, aiMove }
}



/**
 * takeToken
 * Reduces the number of tokensLeft by 1.
 * Checks if the current player can choose to take another token.
 * If not, passes the turn to the other player
 *
 * @param {object} state { tokensLeft    : <integer <= 12>,,
 *                         canTake       : <1|2|3>,
 *                         aiMove        : <1|2|3>,
 *                         playerIsHuman : <boolean>,
 *                         winner        : <undefined|boolean>,
 *                       }
 * @returns {object} updated clone of state. All values except
 * aiMove might change.
 */
function takeToken( state, { tokensLeft, canTake } ) {
  tokensLeft -= 1
  canTake -= 1
  state = { ...state, tokensLeft, canTake }

  if (!canTake) {
    if (tokensLeft) {
      // Pass the turn to the other player
      const playerIsHuman = !state.playerIsHuman
      return setPlayerToHuman( state, playerIsHuman )

    } else {
      state.winner = state.playerIsHuman
    }
  }

  return state
}


// // Uncomment _just_ the module.exports line when testing...
// module.exports = { initialState, reducer }

// ... or _just the export line when used in the project
export { initialState, reducer }
