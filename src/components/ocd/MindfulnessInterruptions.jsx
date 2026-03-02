import { useEffect, useMemo, useState } from "react";
import styles from "./OCDModule.module.css";

const TRACKS = [
  { id: "breathe-1", label: "Guided Breathing • 1 min", minutes: 1, script: "breathe" },
  { id: "breathe-3", label: "Guided Breathing • 3 min", minutes: 3, script: "breathe" },
  { id: "breathe-5", label: "Guided Breathing • 5 min", minutes: 5, script: "breathe" },
  { id: "label-2", label: "Labeling Thoughts • 2 min", minutes: 2, script: "label" },
  { id: "label-4", label: "Labeling Thoughts • 4 min", minutes: 4, script: "label" },
];

export default function MindfulnessInterruptions() {
  const [trackId, setTrackId] = useState(TRACKS[0].id);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentTrack = useMemo(() => TRACKS.find((track) => track.id === trackId) ?? TRACKS[0], [trackId]);

  useEffect(() => {
    if (!isPlaying || secondsRemaining <= 0) {
      return;
    }

    const id = setInterval(() => {
      setSecondsRemaining((previous) => {
        if (previous <= 1) {
          setIsPlaying(false);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isPlaying, secondsRemaining]);

  useEffect(() => {
    if (!isPlaying || typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }

    const phrase =
      currentTrack.script === "breathe"
        ? "Breathe in slowly. Breathe out gently."
        : "Name the thought. Name the feeling. Return to the present action.";

    const speechInterval = setInterval(() => {
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.rate = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }, 12000);

    return () => {
      clearInterval(speechInterval);
      window.speechSynthesis.cancel();
    };
  }, [isPlaying, currentTrack]);

  const startTrack = () => {
    setSecondsRemaining(currentTrack.minutes * 60);
    setIsPlaying(true);
  };

  return (
    <section className={styles.card} aria-labelledby="mindful-title">
      <h2 id="mindful-title" className={styles.sectionTitle}>Mindfulness Interruptions</h2>

      <label className={styles.fieldLabel}>
        Select guided track
        <select className={styles.fieldInput} value={trackId} onChange={(event) => setTrackId(event.target.value)}>
          {TRACKS.map((track) => (
            <option key={track.id} value={track.id}>{track.label}</option>
          ))}
        </select>
      </label>

      <div className={styles.goalPanel}>
        <p className={styles.timerValue}>
          {String(Math.floor(secondsRemaining / 60)).padStart(2, "0")}:{String(secondsRemaining % 60).padStart(2, "0")}
        </p>
        <p className={styles.helper}>Screen-reader friendly voice prompts play every few seconds.</p>
      </div>

      <div className={styles.timerActions}>
        <button className={styles.primaryButton} onClick={startTrack}>Play</button>
        <button className={styles.secondaryButton} onClick={() => setIsPlaying((value) => !value)}>
          {isPlaying ? "Pause" : "Resume"}
        </button>
      </div>
    </section>
  );
}
