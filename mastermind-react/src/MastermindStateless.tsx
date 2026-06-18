import {useEffect, useRef, type ChangeEventHandler, type MouseEventHandler, type JSX, useContext} from "react";
import { useNavigate } from "react-router-dom";
import Badge from "./components/common/Badge";
import Button from "./components/common/Button";
import Card from "./components/common/Card";
import Container from "./components/common/Container";
import InputText from "./components/common/InputText";
import ProgressBar from "./components/common/ProgressBar";
import Table from "./components/common/Table";
import {GameContext, useGame, useGameDispatcher} from "./provider/MastermindProvider";

export default function MastermindStateless(): JSX.Element {
  const game = useGame();
  const gameDispatcher = useGameDispatcher();
  const timerId = useRef<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    timerId.current = window.setInterval(() => {
      gameDispatcher({ type: "TIMER_TICK" });
    }, 1_000);

    return () => {
      if (timerId.current !== null) {
        window.clearInterval(timerId.current);
      }
    };
  }, [gameDispatcher]);

  useEffect(() => {
    if (game.status === "WINS") {
      navigate("/wins");
    } else if (game.status === "LOSES") {
      navigate("/loses");
    }
  }, [game.status, navigate]);

  const play: MouseEventHandler<HTMLButtonElement> = () => {
    gameDispatcher({ type: "PLAY_EVENT" });
  };

  const handleGuess: ChangeEventHandler<HTMLInputElement> = (event) => {
    gameDispatcher({ type: "CHANGE_EVENT", value: event.target.value });
  };

  return (
    <Container>
      <Card title="Mastermind Game Console">
        <InputText id="guess" label="Guess" value={game.guess} handleChange={handleGuess} explain="Enter your guess" />
        <Button label="Play" click={play} color="btn-success" />
        <div className="mt-3">
          <Badge value={game.level} label="Level" color="bg-primary" isVisible />
          <Badge value={game.lives} label="Lives" color="bg-secondary" isVisible />
          <Badge
            value={`${game.numberOfMoves} out of ${game.maxNumberOfMoves}`}
            label="Number of moves"
            color="bg-warning"
            isVisible
          />
          <Badge value={game.counter} label="Counter" color="bg-warning" isVisible />
        </div>
        <ProgressBar value={game.counter} max={game.maxTimeout} min={0} />
      </Card>

      <Card title="Moves">
        <Table
          values={game.moves}
          headers={["Guess", "Perfect Match", "Partial Match", "Evaluation"]}
          fields={["guess", "perfectMatch", "partialMatch", "evaluation"]}
          keyField="guess"
        />
      </Card>
    </Container>
  );
}
