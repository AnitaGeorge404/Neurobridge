import { useMemo, useState } from "react";
import ERPTracker from "./ERPTracker";
import ThoughtTriggerJournal from "./ThoughtTriggerJournal";
import ResponsePreventionGoals from "./ResponsePreventionGoals";
import MindfulnessInterruptions from "./MindfulnessInterruptions";
import SymptomDashboard from "./SymptomDashboard";
import styles from "./OCDModule.module.css";

const TABS = [
  { id: "erp", label: "ERP Tracker" },
  { id: "journal", label: "Journal" },
  { id: "goals", label: "Delay Goals" },
  { id: "mindfulness", label: "Mindfulness" },
  { id: "dashboard", label: "Symptom Dashboard" },
];

export default function OCDModule() {
  const [activeTab, setActiveTab] = useState("erp");
  const [symptomSeed, setSymptomSeed] = useState([]);

  const activeContent = useMemo(() => {
    if (activeTab === "erp") {
      return (
        <ERPTracker
          onSessionLogged={(session) => {
            setSymptomSeed((previous) => [
              ...previous,
              {
                trigger: session.trigger,
                anxiety: session.anxiety,
                created_at: new Date().toISOString(),
              },
            ]);
          }}
        />
      );
    }
    if (activeTab === "journal") {
      return <ThoughtTriggerJournal />;
    }
    if (activeTab === "goals") {
      return <ResponsePreventionGoals />;
    }
    if (activeTab === "mindfulness") {
      return <MindfulnessInterruptions />;
    }
    return <SymptomDashboard externalEntries={symptomSeed} />;
  }, [activeTab, symptomSeed]);

  return (
    <div className={styles.moduleShell}>
      <header className={styles.moduleHeader}>
        <h1>OCD Module</h1>
        <p>Exposure, journaling, response prevention, and anxiety trends in one accessible workflow.</p>
      </header>

      <nav className={styles.tabRow} aria-label="OCD module sections">
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

      {activeContent}
    </div>
  );
}
