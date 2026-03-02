import { useMemo, useState } from "react";
import { createEntry } from "@/lib/moduleApi";
import styles from "./DyspraxiaModule.module.css";

const INITIAL_TASKS = [
  {
    id: "task-cooking",
    name: "Cooking Pasta",
    icon: "🍳",
    steps: [
      {
        id: "step-water",
        title: "Boil water",
        icon: "💧",
        microSteps: [
          { id: "ms-pot", label: "Fill pot halfway" },
          { id: "ms-stove", label: "Place pot on stove" },
          { id: "ms-heat", label: "Turn heat to high" },
        ],
      },
      {
        id: "step-pasta",
        title: "Cook pasta",
        icon: "🍝",
        microSteps: [
          { id: "ms-add", label: "Add pasta to boiling water" },
          { id: "ms-stir", label: "Stir once to avoid sticking" },
          { id: "ms-timer", label: "Set 8-minute timer" },
        ],
      },
    ],
  },
  {
    id: "task-bag",
    name: "Pack School Bag",
    icon: "🎒",
    steps: [
      {
        id: "step-books",
        title: "Place heavy items first",
        icon: "📚",
        microSteps: [
          { id: "ms-book", label: "Put books against back panel" },
          { id: "ms-laptop", label: "Slide laptop into sleeve" },
        ],
      },
      {
        id: "step-small",
        title: "Add smaller items",
        icon: "🖊️",
        microSteps: [
          { id: "ms-pencil", label: "Insert pencil pouch" },
          { id: "ms-bottle", label: "Store water bottle upright" },
        ],
      },
    ],
  },
];

const getProgress = (task, checkedMap) => {
  const allMicroSteps = task.steps.flatMap((step) => step.microSteps);
  const checkedCount = allMicroSteps.filter((entry) => checkedMap[entry.id]).length;
  return {
    checkedCount,
    totalCount: allMicroSteps.length,
    percent: allMicroSteps.length === 0 ? 0 : Math.round((checkedCount / allMicroSteps.length) * 100),
  };
};

export default function TaskBreakdown() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [activeTaskId, setActiveTaskId] = useState(INITIAL_TASKS[0].id);
  const [checked, setChecked] = useState({});
  const [customStepText, setCustomStepText] = useState("");

  const activeTask = useMemo(
    () => tasks.find((task) => task.id === activeTaskId) ?? tasks[0],
    [tasks, activeTaskId],
  );
  const progress = useMemo(() => getProgress(activeTask, checked), [activeTask, checked]);

  const toggleMicroStep = async (microStepId, parentTaskName, parentStepName, nextState) => {
    setChecked((previous) => ({ ...previous, [microStepId]: nextState }));
    await createEntry("/api/dyspraxia/task-breakdown", "dyspraxia-task-breakdown-log", {
      task: parentTaskName,
      step: parentStepName,
      micro_step_id: microStepId,
      completed: nextState,
    });
  };

  const addCustomMicroStep = () => {
    const text = customStepText.trim();
    if (!text || !activeTask.steps[0]) {
      return;
    }

    const newStep = {
      id: `custom-ms-${Date.now()}`,
      label: text,
    };

    setTasks((previous) =>
      previous.map((task) => {
        if (task.id !== activeTask.id) {
          return task;
        }

        const [firstStep, ...rest] = task.steps;
        return {
          ...task,
          steps: [
            {
              ...firstStep,
              microSteps: [...firstStep.microSteps, newStep],
            },
            ...rest,
          ],
        };
      }),
    );

    setCustomStepText("");
  };

  return (
    <section className={styles.card} aria-labelledby="task-breakdown-title">
      <h2 id="task-breakdown-title" className={styles.sectionTitle}>Task Breakdown Guides</h2>
      <p className={styles.helper}>Nested checklist with large tap targets and clear icon cues for each micro-step.</p>

      <div className={styles.tabRow} role="tablist" aria-label="Choose task to break down">
        {tasks.map((task) => {
          const selected = task.id === activeTask.id;
          return (
            <button
              key={task.id}
              className={selected ? styles.tabButtonActive : styles.tabButton}
              onClick={() => setActiveTaskId(task.id)}
              role="tab"
              aria-selected={selected}
            >
              <span aria-hidden="true">{task.icon}</span> {task.name}
            </button>
          );
        })}
      </div>

      <div className={styles.progressRow}>
        <p className={styles.progressText}>
          Progress: {progress.checkedCount}/{progress.totalCount} micro-steps ({progress.percent}%)
        </p>
        <div className={styles.progressTrack} aria-hidden="true">
          <span className={styles.progressFill} style={{ width: `${progress.percent}%` }} />
        </div>
      </div>

      <div className={styles.nestedList}>
        {activeTask.steps.map((step) => (
          <article key={step.id} className={styles.nestedStepCard}>
            <h3 className={styles.nestedStepTitle}><span aria-hidden="true">{step.icon}</span> {step.title}</h3>
            <ul className={styles.microStepList}>
              {step.microSteps.map((microStep) => {
                const isChecked = Boolean(checked[microStep.id]);
                return (
                  <li key={microStep.id}>
                    <label className={styles.microStepItem}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(event) =>
                          toggleMicroStep(microStep.id, activeTask.name, step.title, event.target.checked)
                        }
                      />
                      <span>{microStep.label}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>

      <div className={styles.inlineForm}>
        <label className={styles.fieldLabel}>
          Add a custom micro-step to the first section
          <input
            className={styles.fieldInput}
            value={customStepText}
            onChange={(event) => setCustomStepText(event.target.value)}
            placeholder="Example: Place colander in sink before draining"
          />
        </label>
        <button className={styles.primaryButton} onClick={addCustomMicroStep}>Add micro-step</button>
      </div>
    </section>
  );
}
