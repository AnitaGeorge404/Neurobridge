import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { createEntry, getEntries } from "@/lib/moduleApi";
import styles from "./OCDModule.module.css";

const TRIGGER_OPTIONS = ["Contamination", "Symmetry", "Checking", "Harm", "Uncertainty"];

export default function SymptomDashboard({ externalEntries = [] }) {
  const [records, setRecords] = useState([]);
  const [trigger, setTrigger] = useState(TRIGGER_OPTIONS[0]);
  const [anxiety, setAnxiety] = useState(40);

  useEffect(() => {
    getEntries("/api/ocd/symptoms", "ocd-symptom-records").then((data) => {
      const merged = [...data, ...externalEntries].sort(
        (a, b) => new Date(a.created_at || Date.now()) - new Date(b.created_at || Date.now()),
      );
      setRecords(merged);
    });
  }, [externalEntries]);

  const trendData = useMemo(
    () =>
      records.map((item, index) => ({
        sample: index + 1,
        anxiety: Number(item.anxiety ?? 0),
        trigger: item.trigger,
      })),
    [records],
  );

  const triggerAverages = useMemo(() => {
    const grouped = records.reduce((accumulator, item) => {
      const key = item.trigger || "Other";
      if (!accumulator[key]) {
        accumulator[key] = { count: 0, total: 0 };
      }
      accumulator[key].count += 1;
      accumulator[key].total += Number(item.anxiety ?? 0);
      return accumulator;
    }, {});

    return Object.entries(grouped).map(([name, stats]) => ({
      trigger: name,
      avgAnxiety: Number((stats.total / stats.count).toFixed(1)),
    }));
  }, [records]);

  const addRecord = async () => {
    const payload = { trigger, anxiety };
    const created = await createEntry("/api/ocd/symptoms", "ocd-symptom-records", payload);
    setRecords((previous) => [...previous, created]);
  };

  return (
    <section className={styles.card} aria-labelledby="symptom-title">
      <h2 id="symptom-title" className={styles.sectionTitle}>Symptom Dashboard</h2>
      <p className={styles.helper}>Correlation between triggers and anxiety level over time.</p>

      <div className={styles.formGrid}>
        <label className={styles.fieldLabel}>
          Trigger
          <select className={styles.fieldInput} value={trigger} onChange={(event) => setTrigger(event.target.value)}>
            {TRIGGER_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className={styles.fieldLabel}>
          Anxiety: {anxiety}
          <input
            className={styles.rangeInput}
            type="range"
            min={0}
            max={100}
            value={anxiety}
            onChange={(event) => setAnxiety(Number(event.target.value))}
          />
        </label>
      </div>

      <button className={styles.primaryButton} onClick={addRecord}>Add symptom sample</button>

      <div className={styles.chartContainer}>
        <h3 className={styles.chartTitle}>Anxiety trend by sample</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sample" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="anxiety" stroke="hsl(var(--mode-ocd))" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartContainer}>
        <h3 className={styles.chartTitle}>Average anxiety by trigger</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={triggerAverages}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="trigger" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="avgAnxiety" fill="hsl(var(--mode-ocd))" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
