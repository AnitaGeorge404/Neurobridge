import { useEffect, useMemo, useState } from "react";
import styles from "./DyspraxiaModule.module.css";

const randomPercent = () => Math.floor(Math.random() * 70) + 10;

export default function GamifiedMotorExercises() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [target, setTarget] = useState({ x: 30, y: 30 });
  const [hits, setHits] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [lastMovedAt, setLastMovedAt] = useState(Date.now());
  const [bestReaction, setBestReaction] = useState(null);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const moveId = setInterval(() => {
      setTarget({ x: randomPercent(), y: randomPercent() });
      setLastMovedAt(Date.now());
    }, 900);

    const timerId = setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          setIsPlaying(false);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => {
      clearInterval(moveId);
      clearInterval(timerId);
    };
  }, [isPlaying]);

  const accuracy = useMemo(() => (attempts === 0 ? 0 : Math.round((hits / attempts) * 100)), [hits, attempts]);

  const startGame = () => {
    setHits(0);
    setAttempts(0);
    setBestReaction(null);
    setSecondsLeft(30);
    setIsPlaying(true);
  };

  const registerMiss = () => {
    if (isPlaying) {
      setAttempts((previous) => previous + 1);
    }
  };

  const hitTarget = (event) => {
    event.stopPropagation();
    if (!isPlaying) {
      return;
    }

    const reaction = Date.now() - lastMovedAt;
    setBestReaction((previous) => (previous === null ? reaction : Math.min(previous, reaction)));
    setHits((previous) => previous + 1);
    setAttempts((previous) => previous + 1);
    setTarget({ x: randomPercent(), y: randomPercent() });
    setLastMovedAt(Date.now());
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate([30]);
    }
  };

  return (
    <section className={styles.card} aria-labelledby="motor-title">
      <h2 id="motor-title" className={styles.sectionTitle}>Gamified Motor Exercises</h2>
      <p className={styles.helper}>Tap the moving target. Larger targets support motor planning and precision.</p>

      <div className={styles.scoreBoard}>
        <p>Time: {secondsLeft}s</p>
        <p>Hits: {hits}</p>
        <p>Accuracy: {accuracy}%</p>
        <p>Best reaction: {bestReaction ? `${bestReaction}ms` : "--"}</p>
      </div>

      <div className={styles.gameArena} onClick={registerMiss} role="application" aria-label="Tap the moving target game">
        <button
          className={styles.targetButton}
          style={{ left: `${target.x}%`, top: `${target.y}%` }}
          onClick={hitTarget}
          aria-label="Moving tap target"
        >
          Tap
        </button>
      </div>

      <button className={styles.primaryButton} onClick={startGame}>Start 30s round</button>
    </section>
  );
}
