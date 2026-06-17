import * as React from "react";
import {type ChangeEventHandler, type MouseEventHandler, useEffect} from "react";
import ProgressBar from "./components/common/ProgressBar.tsx";

type Move = {
    guess: number;
    evaluation: string;
    perfectMatch: number;
    partialMatch: number;
};

function evaluateMove(guess: number, secret: number): Move {
    const guessAsString = guess.toString();
    const secretAsString = secret.toString();
    let perfectMatch = 0;
    let partialMatch = 0;
    for (let i = 0; i < guessAsString.length; i++) {
        const g = guessAsString.charAt(i);
        for (let j = 0; j < secretAsString.length; j++) {
            const s = secretAsString.charAt(j);
            if (s === g) {
                if (i === j) {
                    perfectMatch++;
                } else {
                    partialMatch++;
                }
            }
        }
    }
    let evaluation = "";
    if (perfectMatch === 0 && partialMatch === 0) {
        evaluation = "No match"!
    }
    if (partialMatch > 0) {
        evaluation = `-${partialMatch}`;
    }
    if (perfectMatch > 0) {
        evaluation = `${evaluation}+${perfectMatch}`;
    }
    return {
        "perfectMatch": perfectMatch,
        "partialMatch": partialMatch,
        "evaluation": evaluation,
        "guess": guess
    }
}

function createDigit(min: number = 0, max: number = 9) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function createSecret(level: number): number {
    const digits = [createDigit(1)];
    while (digits.length < level) {
        const digit = createDigit();
        if (!digits.includes(digit)) {
            digits.push(digit);
        }
    }
    return Number(digits.join(""));
}

const initialSecret = createSecret(3);

function MastermindApp() {
    const [gameLevel, setGameLevel] = React.useState<number>(3);
    const [lives, setLives] = React.useState<number>(3);
    const [counter, setCounter] = React.useState<number>(60);
    const [maxCount, setMaxCount] = React.useState<number>(60);
    const [moves, setMoves] = React.useState<Move[]>([]);
    const [maxMoves, setMaxMoves] = React.useState<number>(10);
    const [secret, setSecret] = React.useState<number>(initialSecret);
    const [guess, setGuess] = React.useState<number>(123);

    useEffect(() => {
        const timerId = setInterval(() => {
            setCounter(prevCounter => prevCounter - 1);
        }, 1_000);
        return () => {
            clearInterval(timerId);
        };
    })

    const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setGuess(Number(e.target.value));
    };

    const play: MouseEventHandler<HTMLButtonElement> = () => {
        if (guess === secret) {
            //TODO: next game level
        } else {
            const move = evaluateMove(guess, secret);
            setMoves(prevMoves => [...prevMoves, move]);
        }
    };

    return (
        <div className="container py-4">
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Mastermind Game Console</h3>
                </div>
                <div className="card-body">
                    <div className="form-group mb-3">
                        <label className={"form-label"}>Game Level:</label>
                        <span className="badge bg-success">{gameLevel}</span>
                    </div>
                    <div className="form-group mb-3">
                        <label>Lives: </label>
                        <span className="badge bg-success">{lives}</span>
                    </div>
                    <div className="form-group mb-3">
                        <label>Counter: </label>
                        <span className="badge bg-success">{counter}</span>
                    </div>
                    <div className="form-group mb-3">
                        <ProgressBar id="pbCounter"
                                     maxValue={maxCount}
                                     label={"Time left"}
                                     value={counter}/>
                    </div>
                    <div className="form-group mb-3">
                        <label>Moves: </label>
                        <div className="badge bg-success">{moves.length}</div>
                        out of <div className="badge bg-danger">{maxMoves}</div>
                    </div>
                    <div className="form-group mb-3">
                        <label className={"form-label"}
                               htmlFor={"guess"}>Guess: </label>
                        <input type={"text"}
                               className={"form-control"}
                               id={"guess"}
                               name={"guess"}
                               value={guess}
                               onChange={handleChange}/>
                        <button className={"btn btn-success"}
                                onClick={play}>Play
                        </button>
                    </div>
                </div>
            </div>
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Moves</h3>
                </div>
                <div className="card-body">
                    <table className="table table-bordered table-hover table-responsive">
                        <thead>
                            <tr>
                                <th>Guess</th>
                                <th>Evaluation</th>
                                <th>Perfect Match</th>
                                <th>Partial Match</th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            moves.map((move: Move,index) => (
                                <tr key={index}>
                                    <td>{move.guess}</td>
                                    <td>{move.evaluation}</td>
                                    <td>+{move.perfectMatch}</td>
                                    <td>-{move.partialMatch}</td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default MastermindApp
