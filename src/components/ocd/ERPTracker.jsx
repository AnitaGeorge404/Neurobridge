import { useEffect, useMemo, useState } from "react";
import styles from "./OCDModule.module.css";

const INITIAL_EXPOSURES = [
  {
    id: "entry-1",
    title: "Touch doorknob for 60 seconds",
    suds: 35,
    durationSeconds: 60,
    children: [
      {
        id: "entry-2",
        title: "Wait 2 minutes before handwashing",
        suds: 55,
        durationSeconds: 120,
        children: [],
      },
    ],
  },
];

const flattenItems = (items, depth = 0) =>
  items.flatMap((item) => [
    { id: item.id, label: `${"• ".repeat(depth)}${item.title}`.trim() },
    ...flattenItems(item.children, depth + 1),
  ]);

const addChildToTree = (tree, parentId, child) =>
  tree.map((item) => {
    if (item.id === parentId) {
      return { ...item, children: [...item.children, child] };
    }
    return { ...item, children: addChildToTree(item.children, parentId, child) };
  });

const formatTime = (seconds) => {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${secs}`;
};

function ExposureNode({ item, onStart }) {
  return (
    <li className={styles.treeItem}>
      <div className={styles.treeRow}>
        <div>
          <p className={styles.treeTitle}>{item.title}</p>
          <p className={styles.treeMeta}>SUDS: {item.suds} / 100 • Duration: {Math.round(item.durationSeconds / 60)} min</p>
        </div>
        <button
          className={styles.primaryButton}
          onClick={() => onStart(item)}
          aria-label={`Start exposure for ${item.title}`}
        >
          Start
        </button>
      </div>

      {item.children.length > 0 && (
        <ul className={styles.treeChildren} aria-label={`Sub steps for ${item.title}`}>
          {item.children.map((child) => (
            <ExposureNode key={child.id} item={child} onStart={onStart} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function ERPTracker({ onSessionLogged }) {
  const [items, setItems] = useState(INITIAL_EXPOSURES);
  const [fearedSituation, setFearedSituation] = useState("");
  const [suds, setSuds] = useState(40);
  const [minutes, setMinutes] = useState(2);
  const [parentId, setParentId] = useState("root");

  const [activeExposure, setActiveExposure] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const allEntries = useMemo(() => flattenItems(items), [items]);

  useEffect(() => {
    if (!isRunning || secondsRemaining <= 0) {
      return;
    }

    const timerId = setInterval(() => {
      setSecondsRemaining((previous) => {
        if (previous <= 1) {
          setIsRunning(false);
          if (activeExposure && onSessionLogged) {
            onSessionLogged({
              trigger: activeExposure.title,
              anxiety: activeExposure.suds,
              durationSeconds: activeExposure.durationSeconds,
            });
          }
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [isRunning, secondsRemaining, activeExposure, onSessionLogged]);

  const handleAdd = () => {
    const title = fearedSituation.trim();
    if (!title) {
      return;
    }

    const newEntry = {
      id: `entry-${Date.now()}`,
      title,
      suds,
      durationSeconds: Math.max(1, Math.round(minutes * 60)),
      children: [],
    };

    if (parentId === "root") {
      setItems((previous) => [...previous, newEntry]);
    } else {
      setItems((previous) => addChildToTree(previous, parentId, newEntry));
    }

    setFearedSituation("");
    setSuds(40);
    setMinutes(2);
  };

  const startExposure = (item) => {
    setActiveExposure(item);
    setSecondsRemaining(item.durationSeconds);
    setIsRunning(true);
  };

  return (
    <section className={styles.card} aria-labelledby="erp-title">
      <h2 id="erp-title" className={styles.sectionTitle}>ERP Exposure Tracker</h2>

      <div className={styles.formGrid}>
        <label className={styles.fieldLabel}>
          Feared Situation
          <input
            className={styles.fieldInput}
            value={fearedSituation}
            onChange={(event) => setFearedSituation(event.target.value)}
            placeholder="Example: Leave a desk item asymmetrical"
          />
        </label>

        <label className={styles.fieldLabel}>
          Parent Step
          <select className={styles.fieldInput} value={parentId} onChange={(event) => setParentId(event.target.value)}>
            <option value="root">Top-level exposure</option>
            {allEntries.map((entry) => (
              <option key={entry.id} value={entry.id}>{entry.label}</option>
            ))}
          </select>
        </label>

        <label className={styles.fieldLabel}>
          SUDS: {suds}
          <input
            className={styles.rangeInput}
            type="range"
            min={0}
            max={100}
            value={suds}
            onChange={(event) => setSuds(Number(event.target.value))}
            aria-label="SUDS anxiety rating"
          />
        </label>

        <label className={styles.fieldLabel}>
          Countdown Minutes
          <input
            className={styles.fieldInput}
            type="number"
            min={1}
            max={30}
            value={minutes}
            onChange={(event) => setMinutes(Number(event.target.value))}
          />
        </label>
      </div>

      <button className={styles.primaryButton} onClick={handleAdd}>Add to hierarchy</button>

      <ul className={styles.treeList} aria-label="Exposure hierarchy list">
        {items.map((item) => (
          <ExposureNode key={item.id} item={item} onStart={startExposure} />
        ))}
      </ul>

      {activeExposure && (
        <div className={styles.timerBox} role="status" aria-live="polite">
          <p className={styles.timerTitle}>{activeExposure.title}</p>
          <p className={styles.timerValue}>{formatTime(secondsRemaining)}</p>
          <div className={styles.timerActions}>
            <button className={styles.secondaryButton} onClick={() => setIsRunning((value) => !value)}>
              {isRunning ? "Pause" : "Resume"}
            </button>
            <button className={styles.secondaryButton} onClick={() => setSecondsRemaining(activeExposure.durationSeconds)}>
              Reset
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
