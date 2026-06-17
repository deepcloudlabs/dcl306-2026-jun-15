import * as React from "react";
import {type ChangeEventHandler, useEffect} from "react";
import ProgressBar from "./components/common/ProgressBar.tsx";

type Move = {
    guess: number;
    evaluation: string;
    perfectMatch: number;
    partialMatch: number;
};

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

    const handleChange : ChangeEventHandler<HTMLInputElement> = (e) => {
        setGuess(Number(e.target.value));
    };

    const play = () => {
            
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
                               onChange={handleChange} />
                        <button className={"btn btn-success"}
                                onClick={play}>Play</button>
                    </div>

                </div>
            </div>

        </div>
    )
}

export default MastermindApp
