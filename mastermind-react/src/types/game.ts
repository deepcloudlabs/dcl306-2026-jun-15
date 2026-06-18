import type Move from "../model/Move";

export type GameStatus = "PLAYING" | "WINS" | "LOSES";

export interface GameState {
  secret: number;
  guess: number;
  level: number;
  maxTimeout: number;
  lives: number;
  moves: Move[];
  counter: number;
  numberOfMoves: number;
  maxNumberOfMoves: number;
  status: GameStatus;
}

export type GameAction =
  | { type: "PLAY_EVENT" }
  | { type: "TIMER_TICK" }
  | { type: "CHANGE_EVENT"; value: string };
