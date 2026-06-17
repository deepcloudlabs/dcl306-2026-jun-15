import Move from "../model/Move";

export default function createSecret(level: number): number {
  const digits: number[] = [createDigit(1, 9)];

  while (digits.length < level) {
    const digit = createDigit(0, 9);
    if (digits.includes(digit)) continue;
    digits.push(digit);
  }

  return Number(digits.join(""));
}

function createDigit(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export interface EvaluateMoveInput {
  secret: number;
  guess: number;
}

export function evaluateMove({ secret, guess }: EvaluateMoveInput): Move {
  const secretAsString = secret.toString();
  const guessAsString = guess.toString();
  let perfectMatch = 0;
  let partialMatch = 0;

  for (let i = 0; i < secretAsString.length; i += 1) {
    const secretDigit = secretAsString.charAt(i);

    for (let j = 0; j < guessAsString.length; j += 1) {
      const guessDigit = guessAsString.charAt(j);

      if (guessDigit === secretDigit) {
        if (i === j) {
          perfectMatch += 1;
        } else {
          partialMatch += 1;
        }
      }
    }
  }

  return new Move(guess, perfectMatch, partialMatch);
}
