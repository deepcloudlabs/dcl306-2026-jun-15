export default class Move {
  readonly guess: number;
  readonly perfectMatch: number;
  readonly partialMatch: number;
  readonly evaluation: string;

  constructor(guess: number, perfectMatch: number, partialMatch: number) {
    this.guess = guess;
    this.perfectMatch = perfectMatch;
    this.partialMatch = partialMatch;

    if (perfectMatch === 0 && partialMatch === 0) {
      this.evaluation = "No match";
      return;
    }

    const partialMessage = partialMatch > 0 ? `-${partialMatch}` : "";
    const perfectMessage = perfectMatch > 0 ? `+${perfectMatch}` : "";
    this.evaluation = `${partialMessage}${perfectMessage}`;
  }
}
