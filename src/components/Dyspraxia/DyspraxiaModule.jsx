import { useMemo, useState } from "react";
import GamifiedMotorExercises from "./GamifiedMotorExercises";
import TaskBreakdown from "./TaskBreakdown";
import RoutineScheduler from "./RoutineScheduler";
import SpatialAwarenessTrainer from "./SpatialAwarenessTrainer";
import FrustrationMoodTracker from "./FrustrationMoodTracker";
import styles from "./DyspraxiaModule.module.css";

const TABS = [
  { id: "motor", label: "Motor Exercises" },
  { id: "tasks", label: "Task Breakdown" },
  { id: "routine", label: "Routine Scheduler" },
  { id: "spatial", label: "Spatial Trainer" },
  { id: "mood", label: "Mood Tracker" },
];

export default function DyspraxiaModule() {
  const [activeTab, setActiveTab] = useState("motor");

  const content = useMemo(() => {
    if (activeTab === "motor") return <GamifiedMotorExercises />;
    if (activeTab === "tasks") return <TaskBreakdown />;
    if (activeTab === "routine") return <RoutineScheduler />;
    if (activeTab === "spatial") return <SpatialAwarenessTrainer />;
    return <FrustrationMoodTracker />;
  }, [activeTab]);

  return (
    <div className={styles.moduleShell}>
      <header className={styles.moduleHeader}>
        <h1>Dyspraxia Module</h1>
        <p>Motor-friendly training tools with large controls, high contrast, and guided routines.</p>
      </header>

      <nav className={styles.tabRow} aria-label="Dyspraxia module sections">
        {TABS.map((tab) => {
          const selected = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              className={selected ? styles.tabButtonActive : styles.tabButton}
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={selected}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {content}
    </div>
  );
}
