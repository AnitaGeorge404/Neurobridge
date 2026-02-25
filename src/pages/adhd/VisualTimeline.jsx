'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

// Helper time utilities
const timeToMinutes = (t) => {
  if (!t) return 0;
  const [h, m] = t.split(':');
  return parseInt(h, 10) * 60 + parseInt(m || '0', 10);
};

const minutesToTime = (m) => {
  const hh = Math.floor(m / 60).toString().padStart(2, '0');
  const mm = (m % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
};

const durationMinutes = (start, end) => Math.max(0, timeToMinutes(end) - timeToMinutes(start));

// Default sample blocks (with structured start/end)
const sampleBlocks = [
  { id: 1, label: 'Morning Routine', start: '07:00', end: '08:00', icon: '🌅', category: 'self-care', color: 'amber', done: false },
  { id: 2, label: 'Deep Work', start: '09:00', end: '11:00', icon: '🧠', category: 'study', color: 'purple', done: false },
  { id: 3, label: 'Break', start: '11:00', end: '11:30', icon: '☕', category: 'self-care', color: 'rose', done: false },
  { id: 4, label: 'Admin', start: '16:00', end: '17:00', icon: '📋', category: 'admin', color: 'sky', done: false },
];

const defaultCategories = {
  study: 'purple',
  'self-care': 'amber',
  admin: 'sky',
  other: 'gray',
};

const todayKey = (d = new Date()) => d.toISOString().slice(0, 10);

const VisualTimeline = () => {
  const [view, setView] = useState('day'); // 'day' | 'week'
  const [density, setDensity] = useState('comfortable'); // 'compact' | 'comfortable'
  const idRef = useRef(100);

  // Store blocks per date to support week view (start with today)
  const [blocksByDate, setBlocksByDate] = useState({ [todayKey()]: sampleBlocks });

  const [brainDump, setBrainDump] = useState([
    { id: 'b1', text: 'Buy groceries' },
    { id: 'b2', text: 'Email Prof about project' },
  ]);

  // Toast / banner state for simulated reminders
  const [banner, setBanner] = useState(null);
  const firedRemindersRef = useRef(new Set());

  // Live clock (minutes since midnight)
  const [nowMinutes, setNowMinutes] = useState(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  useEffect(() => {
    const t = setInterval(() => {
      const d = new Date();
      setNowMinutes(d.getHours() * 60 + d.getMinutes());
    }, 1000 * 30);
    return () => clearInterval(t);
  }, []);

  // Small set of routine templates
  const routines = useMemo(() => ({
    Morning: [
      { label: 'Stretch', start: '07:00', end: '07:10', icon: '🧘', category: 'self-care', color: 'amber' },
      { label: 'Shower & Dress', start: '07:10', end: '07:30', icon: '🚿', category: 'self-care', color: 'amber' },
      { label: 'Breakfast', start: '07:30', end: '08:00', icon: '🥣', category: 'self-care', color: 'amber' },
    ],
    'Study Session': [
      { label: 'Focus Block', start: '09:00', end: '10:00', icon: '🧠', category: 'study', color: 'purple' },
      { label: 'Short Break', start: '10:00', end: '10:10', icon: '☕', category: 'self-care', color: 'rose' },
      { label: 'Focus Block', start: '10:10', end: '11:00', icon: '🧠', category: 'study', color: 'purple' },
    ],
    Bedtime: [
      { label: 'Wind Down', start: '22:00', end: '22:20', icon: '📚', category: 'self-care', color: 'amber' },
      { label: 'Sleep Prep', start: '22:20', end: '22:30', icon: '🛌', category: 'self-care', color: 'amber' },
    ],
  }), []);

  // Helpers to operate on today's blocks
  const getBlocksForDate = (key) => blocksByDate[key] || [];

  const setBlocksForDate = (key, arr) => {
    setBlocksByDate((prev) => ({ ...prev, [key]: arr }));
  };

  const addBlockToDate = (key, block) => {
    const withId = { id: ++idRef.current, ...block, done: false, started: false, snoozed: 0, skipped: false, reminders: { enabled: false, minutesBefore: 5 } };
    setBlocksForDate(key, [...getBlocksForDate(key), withId]);
    return withId;
  };

  const updateBlock = (key, id, patch) => {
    setBlocksForDate(key, getBlocksForDate(key).map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const removeBlock = (key, id) => {
    setBlocksForDate(key, getBlocksForDate(key).filter((b) => b.id !== id));
  };

  // Reminders check (runs on clock tick)
  useEffect(() => {
    const key = todayKey();
    const blocks = getBlocksForDate(key);
    blocks.forEach((b) => {
      if (!b.reminders || !b.reminders.enabled) return;
      const fireAt = timeToMinutes(b.start) - (b.reminders.minutesBefore || 5);
      const uid = `${key}-${b.id}-reminder-${b.reminders.minutesBefore}`;
      if (nowMinutes >= fireAt && nowMinutes < timeToMinutes(b.start) && !firedRemindersRef.current.has(uid)) {
        firedRemindersRef.current.add(uid);
        setBanner({ type: 'reminder', text: `Reminder: ${b.label} starts in ${b.reminders.minutesBefore} min` });
        setTimeout(() => setBanner(null), 5000);
      }
    });
  }, [nowMinutes, blocksByDate]);

  // Simple toast/banner close helper
  const clearBanner = () => setBanner(null);

  // Gamification counts for today
  const todayStats = useMemo(() => {
    const arr = getBlocksForDate(todayKey());
    const completed = arr.filter((b) => b.done).length;
    const snoozed = arr.filter((b) => b.snoozed && b.snoozed > 0).length;
    const skipped = arr.filter((b) => b.skipped).length;
    const planned = arr.length;
    const startedOrDone = arr.filter((b) => b.started || b.done).length;
    const filledPercent = planned ? Math.round((startedOrDone / planned) * 100) : 0;
    const plannedTime = arr.reduce((s, b) => s + durationMinutes(b.start, b.end), 0);
    const completedTime = arr.reduce((s, b) => s + (b.done ? durationMinutes(b.start, b.end) : 0), 0);
    const byCategory = arr.reduce((acc, b) => {
      acc[b.category] = (acc[b.category] || 0) + durationMinutes(b.start, b.end);
      return acc;
    }, {});
    return { completed, snoozed, skipped, planned, filledPercent, plannedTime, completedTime, byCategory };
  }, [blocksByDate, nowMinutes]);

  // Compact helpers
  const toggleDone = (id) => updateBlock(todayKey(), id, (prev) => ({ done: !prev }));

  // For simplicity, implement inline actions
  const startBlock = (id) => {
    updateBlock(todayKey(), id, { started: true, startedAt: Date.now() });
  };

  const stopBlock = (id) => updateBlock(todayKey(), id, { started: false });

  const snoozeBlock = (id, minutes = 10) => {
    const key = todayKey();
    setBlocksForDate(key, getBlocksForDate(key).map((b) => {
      if (b.id !== id) return b;
      const newStart = minutesToTime(timeToMinutes(b.start) + minutes);
      const newEnd = minutesToTime(timeToMinutes(b.end) + minutes);
      return { ...b, start: newStart, end: newEnd, snoozed: (b.snoozed || 0) + 1 };
    }));
  };

  const skipBlock = (id) => updateBlock(todayKey(), id, { skipped: true });

  // Assign brain-dump item to a block (adds note)
  const assignBrainDump = (dumpId, blockId) => {
    const key = todayKey();
    const item = brainDump.find((d) => d.id === dumpId);
    if (!item) return;
    setBlocksForDate(key, getBlocksForDate(key).map((b) => (b.id === blockId ? { ...b, notes: [...(b.notes || []), item.text] } : b)));
    setBrainDump((prev) => prev.filter((d) => d.id !== dumpId));
    setBanner({ type: 'info', text: `Assigned: “${item.text}” to block` });
    setTimeout(() => setBanner(null), 3000);
  };

  // Add routine to today's blocks (merge)
  const addRoutine = (name) => {
    const tmpl = routines[name];
    if (!tmpl) return;
    tmpl.forEach((t) => addBlockToDate(todayKey(), { ...t, routine: name }));
  };

  // Simple inline block creation
  const addNewBlock = (data) => {
    addBlockToDate(todayKey(), data);
  };

  // Small subcomponents (kept inside file per instructions)
  function TimelineBlock({ block }) {
    const startM = timeToMinutes(block.start);
    const endM = timeToMinutes(block.end);
    const total = Math.max(1, endM - startM);
    const progressed = block.started ? Math.min(100, Math.round(((nowMinutes - startM) / total) * 100)) : (block.done ? 100 : 20);
    const isActive = nowMinutes >= startM && nowMinutes < endM;

    return (
      <div className={`w-full flex items-center gap-3 px-3 py-${density === 'compact' ? '2' : '3'} rounded-xl border ${block.done ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'} transition-shadow`}>
        <div className="text-2xl" aria-hidden>
          {block.icon || '🔹'}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800 truncate">{block.label}</span>
                {block.routine && <span className="text-xs text-gray-500">• {block.routine}</span>}
              </div>
              <div className="text-xs font-mono text-gray-500">{block.start} – {block.end}</div>
            </div>
            <div className="flex items-center gap-2">
              {isActive && (
                <div className="text-xs text-amber-600 font-medium">Now • {minutesToCountdown(endM - nowMinutes)}</div>
              )}
              <button onClick={() => updateBlock(todayKey(), block.id, { done: !block.done })} className="text-xs text-gray-600 px-2 py-1 rounded bg-gray-50 hover:bg-gray-100">{block.done ? 'Undo' : 'Done'}</button>
              {!block.started ? (
                <button onClick={() => startBlock(block.id)} className="text-xs text-white bg-purple-600 px-2 py-1 rounded">Start</button>
              ) : (
                <button onClick={() => stopBlock(block.id)} className="text-xs text-gray-700 bg-yellow-100 px-2 py-1 rounded">Stop</button>
              )}
            </div>
          </div>
          <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${block.done ? 'bg-green-400' : 'bg-purple-400'}`} style={{ width: `${Math.max(5, progressed)}%` }} />
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <label className="flex items-center gap-1"><input type="checkbox" checked={block.reminders?.enabled} onChange={(e) => updateBlock(todayKey(), block.id, { reminders: { ...(block.reminders || {}), enabled: e.target.checked } })} /> Remind</label>
            <button onClick={() => snoozeBlock(block.id, 10)} className="text-xs text-gray-600">Snooze 10m</button>
            <button onClick={() => skipBlock(block.id)} className="text-xs text-gray-600">Skip</button>
            <button onClick={() => removeBlock(todayKey(), block.id)} className="text-xs text-red-500">Delete</button>
          </div>
        </div>
      </div>
    );
  }

  function minutesToCountdown(mins) {
    if (mins <= 0) return '0m';
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  }

  function AddBlockForm({ onAdd }) {
    const [label, setLabel] = useState('');
    const [start, setStart] = useState('12:00');
    const [end, setEnd] = useState('12:30');
    const [icon, setIcon] = useState('🔹');
    const [category, setCategory] = useState('other');
    const submit = (e) => {
      e.preventDefault();
      if (!label) return;
      onAdd({ label, start, end, icon, category, color: defaultCategories[category] || 'gray' });
      setLabel('');
    };
    return (
      <form onSubmit={submit} className="flex items-center gap-2">
        <input aria-label="Block label" className="flex-1 rounded-lg border px-3 py-2" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Quick add: Email 20m" />
        <input aria-label="Start" className="w-20 rounded-lg border px-2 py-2" value={start} onChange={(e) => setStart(e.target.value)} />
        <input aria-label="End" className="w-20 rounded-lg border px-2 py-2" value={end} onChange={(e) => setEnd(e.target.value)} />
        <button className="bg-purple-600 text-white px-3 py-2 rounded-lg">Add</button>
      </form>
    );
  }

  function RoutineTemplates() {
    return (
      <div className="flex gap-2">
        {Object.keys(routines).map((name) => (
          <button key={name} onClick={() => addRoutine(name)} className="px-3 py-1 rounded-md bg-gray-100 text-sm">+ {name}</button>
        ))}
      </div>
    );
  }

  function BrainDump() {
    const [text, setText] = useState('');
    const add = () => {
      if (!text) return;
      setBrainDump((prev) => [...prev, { id: `b${Date.now()}`, text }]);
      setText('');
    };
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <input aria-label="Brain dump" className="flex-1 rounded-lg border px-3 py-2" value={text} onChange={(e) => setText(e.target.value)} placeholder="Brain dump something quick" />
          <button onClick={add} className="bg-amber-500 text-white px-3 py-2 rounded">Dump</button>
        </div>
        <div className="space-y-1">
          {brainDump.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-2 border rounded px-3 py-2 bg-white">
              <div className="text-sm truncate">{d.text}</div>
              <div className="flex items-center gap-2">
                <select onChange={(e) => assignBrainDump(d.id, Number(e.target.value))} defaultValue="" className="text-sm border rounded px-2 py-1">
                  <option value="">Assign →</option>
                  {getBlocksForDate(todayKey()).map((b) => (
                    <option key={b.id} value={b.id}>{b.label} ({b.start})</option>
                  ))}
                </select>
                <button onClick={() => setBrainDump((p) => p.filter((x) => x.id !== d.id))} className="text-xs text-red-500">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Week view tiny cells
  const weekDays = useMemo(() => {
    const base = new Date();
    const dow = base.getDay(); // 0 Sun - 6 Sat
    const monday = new Date(base);
    monday.setDate(base.getDate() - ((dow + 6) % 7)); // set to Monday
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return { key: todayKey(d), label: d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }) };
    });
  }, [nowMinutes]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {banner && (
        <div role="status" className="mb-4 rounded p-3 bg-yellow-50 border-l-4 border-amber-400">
          <div className="flex items-center justify-between">
            <div className="text-sm text-amber-800">{banner.text}</div>
            <button onClick={clearBanner} className="text-xs text-amber-700">Dismiss</button>
          </div>
        </div>
      )}

      <header className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-1 flex items-center gap-2">🕐 Visual Timeline</h2>
          <div className="text-gray-600 text-sm">Make time visible. Toggle a view, add blocks, and use routines to plan fast.</div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <button onClick={() => setView('day')} className={`px-3 py-1 rounded ${view === 'day' ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}>Today</button>
            <button onClick={() => setView('week')} className={`px-3 py-1 rounded ${view === 'week' ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}>Week</button>
          </div>
          <div className="text-sm text-gray-500">Today score: {todayStats.completed} completed • {todayStats.snoozed} snoozed • {todayStats.skipped} skipped</div>
          <div className="text-sm text-gray-500">Filled: {todayStats.filledPercent}%</div>
        </div>
      </header>

      <section className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <RoutineTemplates />
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-600">Density
              <select value={density} onChange={(e) => setDensity(e.target.value)} className="ml-1 rounded border px-2 py-1 text-sm">
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact</option>
              </select>
            </label>
          </div>
        </div>

        {view === 'day' ? (
          <div className="space-y-4">
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Today — {new Date().toLocaleDateString()}</h3>
                <div className="text-sm text-gray-500">Now: {minutesToTime(nowMinutes)}</div>
              </div>

              <AddBlockForm onAdd={addNewBlock} />

              <div className="mt-4 space-y-3">
                {getBlocksForDate(todayKey()).length === 0 && (
                  <div className="text-sm text-gray-500">No blocks yet — add one or use a routine.</div>
                )}
                {getBlocksForDate(todayKey()).map((b) => (
                  <TimelineBlock key={b.id} block={b} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Brain Dump</h4>
                <BrainDump />
              </div>
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Today Summary</h4>
                <div className="text-sm text-gray-700">Planned time: {todayStats.plannedTime} min</div>
                <div className="text-sm text-gray-700">Completed time: {todayStats.completedTime} min</div>
                <div className="mt-2 text-sm">
                  {Object.entries(todayStats.byCategory).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between text-sm"><span className="capitalize">{k}</span><span>{v} min</span></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((d) => (
                <div key={d.key} className={`p-3 rounded border ${d.key === todayKey() ? 'bg-purple-50 border-purple-200' : 'bg-white'}`}>
                  <div className="text-xs text-gray-500">{d.label}</div>
                  <div className="mt-2 text-sm">
                    {getBlocksForDate(d.key).slice(0, 3).map((b) => (
                      <div key={b.id} className="text-sm text-gray-700 truncate">{b.start} {b.icon} {b.label}</div>
                    ))}
                    {getBlocksForDate(d.key).length === 0 && <div className="text-xs text-gray-400">—</div>}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500">Tap a day to edit its blocks (today is interactive).</div>
          </div>
        )}
      </section>

      <footer className="mt-6 text-sm text-gray-500">
        Hint: keep labels short and concrete, like “Email 20 min” instead of “Be productive”.
      </footer>
    </div>
  );
};

export default VisualTimeline;
