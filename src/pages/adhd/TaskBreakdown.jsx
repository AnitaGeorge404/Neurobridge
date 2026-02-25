'use client';

import React, { useEffect, useState } from 'react';

// Constants & Templates
const taskEmojis = ['📚', '💻', '🧹', '📧', '🎨', '🏃', '🧩', '💡', '📝', '🎯', '🏠', '👕'];
const vibes = [
  { label: 'Urgent', icon: '⚡', color: 'red' },
  { label: 'Important', icon: '⭐', color: 'amber' },
  { label: 'Low-energy', icon: '🌙', color: 'indigo' },
  { label: 'Quick', icon: '⚙️', color: 'emerald' },
];
const placeholders = [
  'Clean my room',
  'Study for tomorrow',
  'Reply to scary emails',
  'Organize my files',
  'Start that project',
  'Practice that skill',
  'Prepare a presentation',
  'Finish that article',
];

const breakdownTemplates = {
  'Bare Minimum': (task) => [
    { text: `Think: What's the absolute bare minimum for "${task}"?`, time: 2 },
    { text: `Set a 5-min timer. Just start.`, time: 5 },
    { text: `Do one tiny chunk. Stop if you must.`, time: 5 },
    { text: `Celebrate even if you only did this much.`, time: 1 },
  ],
  'Standard': (task) => [
    { text: `Clarify the outcome: when is "${task}" done enough?`, time: 3 },
    { text: `Gather materials & prep your space.`, time: 5 },
    { text: `Set a timer. Start the first micro-step.`, time: 10 },
    { text: `Complete one small chunk (e.g., 5 min block).`, time: 10 },
    { text: `Take a quick break if needed.`, time: 5 },
    { text: `Decide: next chunk or done? Log where to resume.`, time: 2 },
  ],
  'Hero Mode': (task) => [
    { text: `Define the ideal outcome for "${task}"—no limits.`, time: 5 },
    { text: `Break it into 3–4 large phases.`, time: 5 },
    { text: `For each phase, list 2–3 micro-steps.`, time: 5 },
    { text: `Prep materials and get in the zone.`, time: 10 },
    { text: `Power through phase 1: mini-sprint (20–30 min).`, time: 30 },
    { text: `Reflect & recharge; any phase 2 yet?`, time: 5 },
    { text: `Keep momentum or wrap up strong.`, time: 10 },
  ],
};

const motivationalMessages = {
  0: 'We just need one tiny move.',
  30: 'Momentum unlocked 🚀',
  60: "You're in the zone 🔥",
  100: 'Done is a superpower ✨',
};

const TaskBreakdown = () => {
  const [bigTask, setBigTask] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📚');
  const [selectedVibe, setSelectedVibe] = useState('Important');
  const [steps, setSteps] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState('Standard');
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [recentTasks, setRecentTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSecLeft, setTimerSecLeft] = useState(0);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Load recent tasks on mount
  useEffect(() => {
    const saved = localStorage.getItem('taskBreakdownRecent');
    if (saved) {
      try {
        setRecentTasks(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Cycle placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % placeholders.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Timer logic
  useEffect(() => {
    if (!timerActive || timerSecLeft <= 0) return;
    const t = setTimeout(() => setTimerSecLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timerActive, timerSecLeft]);

  // Save to recent tasks
  const saveToRecent = (task) => {
    const entry = { task, emoji: selectedEmoji, vibe: selectedVibe, timestamp: Date.now() };
    const updated = [entry, ...recentTasks.filter((t) => t.task !== task)].slice(0, 5);
    setRecentTasks(updated);
    localStorage.setItem('taskBreakdownRecent', JSON.stringify(updated));
  };

  // Generate breakdown for selected style
  const generateBreakdown = () => {
    if (!bigTask.trim()) return;
    const template = breakdownTemplates[selectedStyle];
    if (!template) return;
    const generated = template(bigTask).map((s, i) => ({ ...s, id: i, text: s.text }));
    setSteps(generated);
    setCompletedSteps(new Set());
    saveToRecent(bigTask);
  };

  // Toggle step completion
  const toggleStep = (id) => {
    const updated = new Set(completedSteps);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setCompletedSteps(updated);

    // Check for celebration (all done)
    if (updated.size === steps.length && steps.length > 0) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  // Edit step
  const updateStepText = (id, newText) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, text: newText } : s)));
  };

  // Reorder steps
  const moveStep = (id, direction) => {
    const idx = steps.findIndex((s) => s.id === id);
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === steps.length - 1)) return;
    const newSteps = [...steps];
    if (direction === 'up') {
      [newSteps[idx], newSteps[idx - 1]] = [newSteps[idx - 1], newSteps[idx]];
    } else {
      [newSteps[idx], newSteps[idx + 1]] = [newSteps[idx + 1], newSteps[idx]];
    }
    setSteps(newSteps);
  };

  // Start the first uncompleted step with timer
  const startTiny = () => {
    const firstIncomplete = steps.find((s) => !completedSteps.has(s.id));
    if (!firstIncomplete) return;
    setTimerActive(true);
    setTimerSecLeft((firstIncomplete.time || 5) * 60);
  };

  // Calculate progress
  const progress = steps.length ? Math.round((completedSteps.size / steps.length) * 100) : 0;
  const motivational = Object.entries(motivationalMessages)
    .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
    .find(([threshold]) => progress >= parseInt(threshold))?.[1] || motivationalMessages[0];

  // Render timer display
  const timerDisplay = `${Math.floor(timerSecLeft / 60)}:${(timerSecLeft % 60).toString().padStart(2, '0')}`;

  return (
    <div className={`max-w-4xl mx-auto px-4 py-6 transition-all ${showCelebration ? 'bg-gradient-to-br from-yellow-50 to-pink-50' : ''}`}>
      {showCelebration && (
        <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-yellow-300 to-pink-300 text-center">
          <div className="text-4xl mb-2">🎉✨🎊</div>
          <div className="text-lg font-bold text-gray-800">All done! You crushed it!</div>
        </div>
      )}

      <header className="mb-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
          ✨ Task Alchemist
        </h2>
        <p className="text-gray-600">Drop a scary task, watch it transform into doable micro-steps.</p>
      </header>

      {/* Recent Tasks */}
      {recentTasks.length > 0 && !steps.length && (
        <div className="mb-6 p-4 rounded-2xl bg-purple-50 border border-purple-100">
          <div className="text-sm font-semibold text-purple-900 mb-2">Recently broken down:</div>
          <div className="flex gap-2 flex-wrap">
            {recentTasks.map((t, i) => (
              <button
                key={i}
                onClick={() => {
                  setBigTask(t.task);
                  setSelectedEmoji(t.emoji);
                  setSelectedVibe(t.vibe);
                }}
                className="px-3 py-2 rounded-lg bg-white border border-purple-200 text-sm hover:bg-purple-50 transition"
              >
                {t.emoji} {t.task.slice(0, 20)}...
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Task Input */}
      <div className="mb-6 p-6 rounded-3xl bg-gradient-to-br from-white to-gray-50 border-2 border-purple-200 shadow-lg">
        <div className="flex gap-3 mb-4">
          <div className="flex gap-2 flex-wrap">
            {taskEmojis.map((e) => (
              <button
                key={e}
                onClick={() => setSelectedEmoji(e)}
                className={`text-3xl p-2 rounded-lg transition ${selectedEmoji === e ? 'bg-purple-200 scale-125' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <textarea
          className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
          rows={2}
          placeholder={placeholders[placeholderIdx]}
          value={bigTask}
          onChange={(e) => setBigTask(e.target.value)}
        />

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2 flex-wrap">
            {vibes.map((v) => (
              <button
                key={v.label}
                onClick={() => setSelectedVibe(v.label)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  selectedVibe === v.label
                    ? `bg-${v.color}-500 text-white shadow-md`
                    : `bg-${v.color}-100 text-${v.color}-700 hover:bg-${v.color}-200`
                }`}
              >
                {v.icon} {v.label}
              </button>
            ))}
          </div>

          <button
            onClick={generateBreakdown}
            className="px-6 py-3 rounded-xl text-lg font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transition"
          >
            ✨ Break It Down
          </button>
        </div>
      </div>

      {/* Results */}
      {steps.length > 0 && (
        <div className="space-y-6">
          {/* Style Tabs */}
          <div className="flex gap-2 flex-wrap">
            {Object.keys(breakdownTemplates).map((style) => (
              <button
                key={style}
                onClick={() => {
                  setSelectedStyle(style);
                  const template = breakdownTemplates[style];
                  const generated = template(bigTask).map((s, i) => ({ ...s, id: i }));
                  setSteps(generated);
                  setCompletedSteps(new Set());
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  selectedStyle === style
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {style}
              </button>
            ))}
          </div>

          {/* Progress & Motivation */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-amber-900">Progress</div>
              <div className="text-2xl font-bold text-amber-600">{progress}%</div>
            </div>
            <div className="w-full bg-amber-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-3 text-lg font-semibold text-amber-700">{motivational}</div>
          </div>

          {/* Start Tiny Button */}
          {completedSteps.size < steps.length && (
            <button
              onClick={startTiny}
              className="w-full px-6 py-4 rounded-2xl text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-lg hover:shadow-xl hover:scale-102 transition"
            >
              🎯 Just Start This One
            </button>
          )}

          {/* Timer Display */}
          {timerActive && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 text-center">
              <div className="text-5xl font-bold text-red-600 font-mono">{timerDisplay}</div>
              <button
                onClick={() => setTimerActive(false)}
                className="mt-3 px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600"
              >
                Stop Timer
              </button>
            </div>
          )}

          {/* Steps List */}
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div
                key={step.id}
                className={`p-4 rounded-2xl border-2 transition ${
                  completedSteps.has(step.id)
                    ? 'bg-green-50 border-green-300 opacity-70'
                    : 'bg-white border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleStep(step.id)}
                    className={`mt-1 flex-shrink-0 w-6 h-6 rounded-lg border-2 transition font-bold text-sm flex items-center justify-center ${
                      completedSteps.has(step.id)
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {completedSteps.has(step.id) ? '✓' : ''}
                  </button>

                  <div className="flex-1 min-w-0">
                    {editingId === step.id ? (
                      <input
                        autoFocus
                        className="w-full rounded-lg border border-purple-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                        value={step.text}
                        onChange={(e) => updateStepText(step.id, e.target.value)}
                        onBlur={() => setEditingId(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setEditingId(null);
                        }}
                      />
                    ) : (
                      <div
                        onClick={() => setEditingId(step.id)}
                        className={`text-lg cursor-pointer hover:text-purple-600 transition ${
                          completedSteps.has(step.id) ? 'line-through text-gray-500' : 'text-gray-800'
                        }`}
                      >
                        {step.text}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {step.time}m
                    </span>
                    <button
                      onClick={() => moveStep(step.id, 'up')}
                      disabled={i === 0}
                      className="p-1 rounded text-gray-500 hover:text-purple-600 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveStep(step.id, 'down')}
                      disabled={i === steps.length - 1}
                      className="p-1 rounded text-gray-500 hover:text-purple-600 disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Line */}
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700">
            💡 Tip: Check off steps as you go. Each tiny win counts!
          </div>
        </div>
      )}

      {!steps.length && (
        <div className="text-center p-8 text-gray-400 text-lg">
          Pick a task emoji, describe what's overwhelming you, and let's turn it into something doable.
        </div>
      )}
    </div>
  );
};

export default TaskBreakdown;
