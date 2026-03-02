import { useEffect, useMemo, useState } from "react";
import styles from "./OCDModule.module.css";

const getStoredStreak = () => Number(localStorage.getItem("ocd-delay-streak") || 0);

export default function ResponsePreventionGoals() {
  const [delayMinutes, setDelayMinutes] = useState(2);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [streak, setStreak] = useState(getStoredStreak);

  useEffect(() => {
    if (!isRunning || secondsRemaining <= 0) {
      return;
    }

    const timerId = setInterval(() => {
      setSecondsRemaining((previous) => {
        if (previous <= 1) {
          setIsRunning(false);
          const nextStreak = streak + 1;
          setStreak(nextStreak);
          localStorage.setItem("ocd-delay-streak", String(nextStreak));
          if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
            navigator.vibrate([90, 80, 90]);
          }
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [isRunning, secondsRemaining, streak]);

  const badge = useMemo(() => {
    if (streak >= 14) return "Gold Delay Badge";
    if (streak >= 7) return "Silver Delay Badge";
    if (streak >= 3) return "Bronze Delay Badge";
    return "Starter Badge";
  }, [streak]);

  const startDelay = () => {
    const totalSeconds = Math.max(15, Math.round(delayMinutes * 60));
    setSecondsRemaining(totalSeconds);
    setIsRunning(true);
  };

  return (
    <section className={styles.card} aria-labelledby="prevention-title">
      <h2 id="prevention-title" className={styles.sectionTitle}>Response Prevention Goals</h2>

      <label className={styles.fieldLabel}>
        Delay window (minutes)
        <input
          className={styles.fieldInput}
          type="number"
          min={0.25}
          max={30}
          step={0.25}
          value={delayMinutes}
          onChange={(event) => setDelayMinutes(Number(event.target.value))}
        />
      </label>

      <div className={styles.goalPanel}>
        <p className={styles.timerValue}>
          {String(Math.floor(secondsRemaining / 60)).padStart(2, "0")}:{String(secondsRemaining % 60).padStart(2, "0")}
        </p>
        <p className={styles.helper}>Streak: {streak} successful delays</p>
        <p className={styles.badgeText}>{badge}</p>
      </div>

      <div className={styles.timerActions}>
        <button className={styles.primaryButton} onClick={startDelay}>Delay compulsion</button>
        <button className={styles.secondaryButton} onClick={() => setIsRunning((value) => !value)}>
          {isRunning ? "Pause" : "Resume"}
        </button>
      </div>
    </section>
  );
}
