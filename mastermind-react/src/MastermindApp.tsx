import * as React from "react";
import {type ChangeEventHandler, type MouseEventHandler, useEffect} from "react";
import ProgressBar from "./components/common/ProgressBar.tsx";
import Container from "./components/common/Container.tsx";
import Card from "./components/common/Card.tsx";
import Table from "./components/common/Table.tsx";
import InputText from "./components/common/InputText.tsx";
import Button from "./components/common/Button.tsx";
import type Move from "./model/Move.ts";
import createSecret, {evaluateMove} from "./utils/utility.ts";
import Badge from "./components/common/Badge.tsx";


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

    const countDown = () => {
        if (counter === 1) {
            setLives(prevLives => prevLives - 1);
            setCounter(maxCount);
            setMoves([]);
            setSecret(createSecret(gameLevel));
        }
        setCounter(prevCounter => prevCounter - 1);
    }

    useEffect(() => {
        const timerId = setInterval(countDown, 1_000);
        return () => clearInterval(timerId);
    })

    const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setGuess(Number(e.target.value));
    };

    const play: MouseEventHandler<HTMLButtonElement> = () => {
        if (guess === secret) {
            setMoves([]);
            setGameLevel(level => level + 1);
            setMaxCount(prevMaxCount => prevMaxCount + 10);
            setMaxMoves(prevMaxMoves => prevMaxMoves + 4);
            setCounter(maxCount + 10);
            setLives(prevLives => prevLives + 1);
            setSecret(createSecret(gameLevel + 1));
        } else {
            const move = evaluateMove({guess, secret});
            setMoves(prevMoves => [...prevMoves, move]);
        }
    };

    return (
        <Container>
            <Card title={"Mastermind Game Console"}>
                <div className="form-group mb-3">
                    <Badge isVisible={true} label="Game Level" color="bg-success" value={gameLevel}/>
                </div>
                <div className="form-group mb-3">
                    <Badge isVisible={true} label="Lives" color="bg-success" value={lives}/>
                </div>
                <div className="form-group mb-3">
                    <Badge isVisible={true} label="Counter" color="bg-success" value={counter}/>
                </div>
                <div className="form-group mb-3">
                    <ProgressBar max={maxCount} min={0} value={counter}/>
                </div>
                <div className="form-group mb-3">
                    <label className={"form-label"}>Moves:</label>
                    <div className="badge bg-success">{moves.length}</div>
                    <span> out of </span>
                    <div className="badge bg-danger">{maxMoves}</div>
                </div>
                <div className="form-group mb-3">
                    <InputText id="guess" label="Guess" value={guess} handleChange={handleChange}
                               explain="Enter your guess"/>
                    <Button label="Play" click={play} color="btn-success"/>
                </div>
            </Card>
            <Card title={"Moves"}>
                <Table values={moves}
                       headers={["Guess", "Perfect Match", "Partial Match", "Evaluation"]}
                       fields={["guess", "perfectMatch", "partialMatch", "evaluation"]}
                       keyField="guess"
                />
            </Card>
        </Container>
    )
}

export default MastermindApp
