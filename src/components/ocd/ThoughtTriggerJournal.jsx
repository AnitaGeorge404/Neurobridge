import { useEffect, useMemo, useState } from "react";
import { createEntry, getEntries } from "@/lib/moduleApi";
import styles from "./OCDModule.module.css";

const TAGS = ["Contamination", "Symmetry", "Checking", "Intrusive Thought", "Harm", "Religious"];

export default function ThoughtTriggerJournal({ onEntrySaved }) {
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [mood, setMood] = useState(3);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    getEntries("/api/ocd/journal", "ocd-journal-entries").then(setEntries);
  }, []);

  const tagSummary = useMemo(() => (selectedTags.length === 0 ? "No tags selected" : selectedTags.join(", ")), [selectedTags]);

  const toggleTag = (tag) => {
    setSelectedTags((previous) =>
      previous.includes(tag) ? previous.filter((entry) => entry !== tag) : [...previous, tag],
    );
  };

  const saveEntry = async () => {
    const text = content.trim();
    if (!text) {
      return;
    }

    const payload = { content: text, tags: selectedTags, mood };
    const created = await createEntry("/api/ocd/journal", "ocd-journal-entries", payload);
    setEntries((previous) => [created, ...previous]);
    if (onEntrySaved) {
      onEntrySaved(payload);
    }
    setContent("");
    setSelectedTags([]);
    setMood(3);
  };

  return (
    <section className={styles.card} aria-labelledby="journal-title">
      <h2 id="journal-title" className={styles.sectionTitle}>Thought & Trigger Journal</h2>
      <p className={styles.helper}>Entries are stored locally or synced with your Python API when available.</p>

      <label className={styles.fieldLabel}>
        Secure Reflection
        <textarea
          className={styles.fieldTextarea}
          placeholder="Write what happened, what triggered it, and what helped."
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
      </label>

      <div className={styles.chipRow} role="group" aria-label="Trigger tags">
        {TAGS.map((tag) => {
          const active = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              className={active ? styles.chipActive : styles.chip}
              onClick={() => toggleTag(tag)}
              aria-pressed={active}
            >
              {tag}
            </button>
          );
        })}
      </div>

      <p className={styles.helper}>{tagSummary}</p>

      <label className={styles.fieldLabel}>
        Mood Rating: {mood} / 5
        <input
          className={styles.rangeInput}
          type="range"
          min={1}
          max={5}
          value={mood}
          onChange={(event) => setMood(Number(event.target.value))}
          aria-label="Mood rating scale"
        />
      </label>

      <button className={styles.primaryButton} onClick={saveEntry}>Save journal entry</button>

      <div className={styles.logList} aria-live="polite">
        {entries.slice(0, 4).map((entry) => (
          <article key={entry.id} className={styles.logCard}>
            <p>{entry.content}</p>
            <p className={styles.logMeta}>Mood {entry.mood ?? mood} • {(entry.tags || []).join(", ") || "No tags"}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
