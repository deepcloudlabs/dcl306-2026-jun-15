import createSecret, {evaluateMove} from "../utils/utility";
import type {GameAction, GameState} from "../types/game";

function moveToNextLevel(game: GameState): GameState {
  const maxTimeout = game.maxTimeout + 10;

  return {
    ...game,
    moves: [],
    numberOfMoves: 0,
    maxTimeout,
    counter: maxTimeout,
    maxNumberOfMoves: game.maxNumberOfMoves + 2,
    secret: createSecret(game.level)
  };
}

function replayLevel(game: GameState): GameState {
  return {
    ...game,
    moves: [],
    numberOfMoves: 0,
    counter: game.maxTimeout,
    secret: createSecret(game.level)
  };
}

export default function gameReducer(gameState: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "PLAY_EVENT": {
      const newGameState: GameState = {
        ...gameState,
        moves: [...gameState.moves],
        numberOfMoves: gameState.numberOfMoves + 1
      };

      if (newGameState.secret === newGameState.guess) {
        const leveledUpGameState: GameState = {
          ...newGameState,
          level: newGameState.level + 1
        };

        if (leveledUpGameState.level === 10) {
          return {
            ...leveledUpGameState,
            status: "WINS"
          };
        }

        return moveToNextLevel(leveledUpGameState);
      }

      if (newGameState.numberOfMoves >= newGameState.maxNumberOfMoves) {
        const gameAfterLifeLost: GameState = {
          ...newGameState,
          lives: newGameState.lives - 1
        };

        if (gameAfterLifeLost.lives === 0) {
          return {
            ...gameAfterLifeLost,
            status: "LOSES"
          };
        }

        return replayLevel(gameAfterLifeLost);
      }

      return {
        ...newGameState,
        moves: [
          ...newGameState.moves,
          evaluateMove({ secret: newGameState.secret, guess: newGameState.guess })
        ]
      };
    }

    case "TIMER_TICK": {
      if (gameState.status !== "PLAYING") return gameState;

      const newCounter = gameState.counter - 1;
      const newGameState: GameState = {
        ...gameState,
        counter: newCounter
      };

      if (newCounter > 0) return newGameState;

      const gameAfterLifeLost: GameState = {
        ...newGameState,
        lives: newGameState.lives - 1
      };

      if (gameAfterLifeLost.lives === 0) {
        return {
          ...gameAfterLifeLost,
          status: "LOSES"
        };
      }

      return replayLevel(gameAfterLifeLost);
    }

    case "CHANGE_EVENT":
      return {
        ...gameState,
        guess: Number(action.value)
      };

    default: {
      throw new Error(`Unknown action type ${JSON.stringify(action)}`);
    }
  }
}
