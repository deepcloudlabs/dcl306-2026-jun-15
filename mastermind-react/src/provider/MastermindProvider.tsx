import { createContext, useContext, useReducer, type Dispatch, type ReactNode, type JSX } from "react";
import createSecret from "../utils/utility";
import MastermindStateless from "../MastermindStateless";
import gameReducer from "../reducer/gameReducer";
import type { GameAction, GameState } from "../types/game";

const initialGameState: GameState = {
  secret: createSecret(3),
  guess: 123,
  level: 3,
  maxTimeout: 60,
  lives: 3,
  moves: [],
  counter: 60,
  numberOfMoves: 0,
  maxNumberOfMoves: 10,
  status: "PLAYING"
};

interface GameContextValue {
  game: GameState;
  dispatchGame: Dispatch<GameAction>;
}

export const GameContext = createContext<GameContextValue | undefined>(undefined);

export function useGame(): GameState {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error("useGame must be used inside MastermindProvider");
  }

  return context.game;
}

export function useGameDispatcher(): Dispatch<GameAction> {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error("useGameDispatcher must be used inside MastermindProvider");
  }

  return context.dispatchGame;
}

interface MastermindProviderProps {
  children?: ReactNode;
}

export default function MastermindProvider({ children }: MastermindProviderProps): JSX.Element {
  const [game, dispatchGame] = useReducer(gameReducer, initialGameState);

  return (
    <GameContext.Provider value={{ game, dispatchGame }}>
      {children ?? <MastermindStateless />}
    </GameContext.Provider>
  );
}
