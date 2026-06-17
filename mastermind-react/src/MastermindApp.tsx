import * as React from "react";

type Move = {
    guess: number;
    evaluation: string;
    perfectMatch: number;
    partialMatch: number;
};

function MastermindApp() {
    const [gameLevel, setGameLevel] = React.useState<number>(3);
    const [lives, setLives] = React.useState<number>(3);
    const [counter, setCounter] = React.useState<number>(60);
    const [maxCount, setMaxCount] = React.useState<number>(60);
    const [moves, setMoves] = React.useState<Move[]>([]);
    const [maxMoves, setMaxMoves] = React.useState<number>(10);

    return (
        <div className="container">
            <div className="Card">
                <div className="card-header">
                    <h3 className="card-title">Mastermind Game Console</h3>
                </div>
                <div className="card-body">
                    <div className="row">
                        <label>Game Level:</label>
                        <div className="badge bg-success">{gameLevel}</div>
                    </div>
                    <div className="row">
                        <label>Lives:</label>
                        <div className="badge bg-success">{lives}</div>
                    </div>
                    <div className="row">
                        <label>Counter:</label>
                        <div className="badge bg-success">{counter}</div>
                    </div>
                    <div className="row">
                        <label>Moves:</label>
                        <div className="badge bg-success">{moves.length}</div>
                        out of
                        <div className="badge bg-danger">{maxMoves}</div>
                    </div>
                    <div className="row">
                        <label>Guess:</label>

                    </div>

                </div>
            </div>

        </div>
    )
}

export default MastermindApp
