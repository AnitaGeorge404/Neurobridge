'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Tag, Crosshair, Sun, Moon, Coffee } from 'lucide-react';

// ── Preset & Mode Definitions ──────────────────────────────────
const PRESETS = [
  { label: '15 min Sprint', minutes: 15, emoji: '⚡' },
  { label: '25 min Classic', minutes: 25, emoji: '🍅' },
  { label: '45 min Deep Dive', minutes: 45, emoji: '🌊' },
];

const MODES = [
  { id: 'focus', label: 'Focus', icon: Sun, desc: 'Deep work, no distractions.' },
  { id: 'shortBreak', label: 'Short break', icon: Coffee, desc: 'Quick recharge.' },
  { id: 'longBreak', label: 'Long break', icon: Moon, desc: 'Longer reset.' },
];

const DEFAULT_MODE_MINUTES = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
};

const CONFETTI_COLORS = [
  'hsl(142, 50%, 42%)',
  'hsl(36, 90%, 55%)',
  'hsl(210, 70%, 55%)',
  'hsl(340, 70%, 55%)',
  'hsl(270, 60%, 55%)',
  'hsl(50, 90%, 55%)',
];

const BREAK_TIPS = [
  'Stretch your arms & legs 🧘',
  'Drink some water 💧',
  'Look at something 20ft away for 20s 👁️',
  'Take 5 deep breaths 🌬️',
  'Walk around for a minute 🚶',
];

const MODE_COLORS = {
  focus: 'hsl(var(--primary))',
  shortBreak: 'hsl(var(--secondary))',
  longBreak: 'hsl(var(--accent))',
};

// ── Helpers ────────────────────────────────────────────────────
const todayKey = () => new Date().toISOString().slice(0, 10);

const loadStreakData = () => {
  if (typeof window === 'undefined') return { streak: 0, lastDay: null, weeklyMinutes: 0 };
  try {
    const raw = window.localStorage.getItem('focusforge-streak');
    if (!raw) return { streak: 0, lastDay: null, weeklyMinutes: 0 };
    return JSON.parse(raw);
  } catch {
    return { streak: 0, lastDay: null, weeklyMinutes: 0 };
  }
};

const saveStreakData = (data) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem('focusforge-streak', JSON.stringify(data));
  } catch {
    // ignore
  }
};

// ── CircularProgress ───────────────────────────────────────────

const CircularProgress = ({ progress, mode, children }) => {
  const size = 260;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  const color = MODE_COLORS[mode] || MODE_COLORS.focus;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="absolute -rotate-90 transform">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-slate-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="circle-transition"
          style={{ filter: `drop-shadow(0px 0px 18px ${color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        {children}
      </div>
    </div>
  );
};

// ── TaskInput (high contrast) ──────────────────────────────────

const TaskInput = ({ intent, setIntent, tag, setTag, isActive }) => {
  return (
    <div className="w-full space-y-3">
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
          <Crosshair size={18} />
        </div>
        <input
          type="text"
          placeholder="What are you focusing on?"
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          disabled={isActive}
          className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-800/80 border border-slate-600 text-slate-50 placeholder:text-slate-500 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/60 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
          <Tag size={18} />
        </div>
        <input
          type="text"
          placeholder="Add a tag (e.g. Work, Study)"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          disabled={isActive}
          className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-800/80 border border-slate-600 text-slate-50 placeholder:text-slate-500 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/60 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};

// ── Modes, Presets, Micro‑goals, Stats ─────────────────────────

const ModeSelector = ({ mode, setMode, setFocusMinutes, setSecondsLeft }) => {
  const handleModeChange = (id) => {
    setMode(id);
    const mins = DEFAULT_MODE_MINUTES[id] ?? 25;
    setFocusMinutes(mins);
    setSecondsLeft(mins * 60);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {MODES.map((m) => {
        const Icon = m.icon;
        const active = mode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => handleModeChange(m.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              active
                ? 'bg-slate-100 text-slate-900 shadow-sm'
                : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Icon size={14} />
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
};

const PresetSelector = ({ selected, onSelect, customMinutes, onCustomChange }) => (
  <div className="space-y-3">
    <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
      Session length
    </p>
    <div className="flex gap-2 flex-wrap">
      {PRESETS.map((p) => (
        <button
          key={p.minutes}
          onClick={() => onSelect(p.minutes)}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            selected === p.minutes
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
          }`}
        >
          {p.emoji} {p.label}
        </button>
      ))}
    </div>
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400">Custom</span>
      <input
        type="range"
        min={5}
        max={90}
        value={customMinutes}
        onChange={(e) => onCustomChange(Number(e.target.value))}
        className="flex-1 accent-primary"
      />
      <span className="text-sm font-semibold w-12 text-right text-slate-100">
        {customMinutes}m
      </span>
      <button
        onClick={() => onSelect(customMinutes)}
        className="text-xs px-3 py-1 rounded-lg bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700"
      >
        Set
      </button>
    </div>
  </div>
);

const MicroGoals = ({ goals, setGoals }) => {
  const toggleGoal = (index) => {
    setGoals((prev) =>
      prev.map((g, i) =>
        i === index ? { ...g, done: !g.done } : g
      )
    );
  };

  const completedCount = goals.filter((g) => g.done).length;

  return (
    <div className="glass-card rounded-2xl p-4 bg-slate-900/80 border border-slate-700 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
          Micro‑goals for this block
        </p>
        <span className="text-[11px] text-slate-400">
          {completedCount}/{goals.length} done
        </span>
      </div>
      <ul className="space-y-1.5">
        {goals.map((g, idx) => (
          <li
            key={idx}
            className="flex items-center gap-2 text-xs text-slate-200"
          >
            <button
              onClick={() => toggleGoal(idx)}
              className={`w-4 h-4 rounded border flex items-center justify-center ${
                g.done
                  ? 'bg-emerald-400 border-emerald-400'
                  : 'border-slate-500 bg-slate-800'
              }`}
            >
              {g.done && (
                <span className="w-2 h-2 rounded-sm bg-slate-900" />
              )}
            </button>
            <span
              className={g.done ? 'line-through text-slate-500' : ''}
            >
              {g.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const StatsRow = ({ sessions, totalMinutes, streak, weeklyMinutes }) => {
  const message =
    totalMinutes >= 50
      ? "You're stacking serious deep work 🔥"
      : totalMinutes >= 25
      ? 'Solid focus streak building 💪'
      : 'Tiny steps still count 🌱';

  return (
    <div className="glass-card rounded-2xl p-4 bg-slate-900/90 border border-slate-700 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-200">
        <div className="flex items-center gap-2">
          <span>
            Today:{' '}
            <strong className="text-slate-50">
              {sessions}
            </strong>{' '}
            sessions
          </span>
          <span className="text-slate-500">•</span>
          <span>
            <strong className="text-slate-50">
              {totalMinutes}
            </strong>{' '}
            min focused
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span>
            Streak:{' '}
            <strong className="text-amber-300">
              {streak}
            </strong>{' '}
            days
          </span>
          <span className="text-slate-500">•</span>
          <span>
            This week:{' '}
            <strong className="text-sky-300">
              {weeklyMinutes}
            </strong>{' '}
            min
          </span>
        </div>
      </div>
      <p className="text-[11px] text-slate-400 italic">{message}</p>
    </div>
  );
};

const CelebrationBanner = ({ onStartBreak, onSkip, intent, focusMinutes }) => (
  <div className="glass-card rounded-2xl p-5 bg-emerald-900/70 border border-emerald-500/60 space-y-3">
    <div className="text-3xl animate-gentle-bounce">🌳</div>
    <h3 className="text-lg font-bold text-slate-50">Session complete!</h3>
    <p className="text-sm text-emerald-100">
      You protected {focusMinutes} minutes of real focus.
      {intent ? ` "${intent}" just moved forward.` : ''}
    </p>
    <p className="text-xs text-emerald-200/80">
      Even one finished block trains your brain that “starting is worth it”.
    </p>
    <div className="flex gap-3 justify-center pt-1">
      <button
        onClick={onStartBreak}
        className="px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-400 text-emerald-950 hover:bg-emerald-300 transition-all hover:translate-y-0.5"
      >
        5‑min break
      </button>
      <button
        onClick={onSkip}
        className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 text-slate-50 border border-emerald-400/40 hover:bg-slate-800 transition-all"
      >
        Skip → Next block
      </button>
    </div>
  </div>
);

const BreakMode = ({ secondsLeft, tip, onEnd }) => {
  const m = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, '0');
  const s = (secondsLeft % 60).toString().padStart(2, '0');

  return (
    <div className="glass-card rounded-2xl p-6 bg-sky-900/70 border border-sky-500/60 space-y-4">
      <p className="text-xs font-semibold text-sky-200 uppercase tracking-wider">
        Break time
      </p>
      <div className="text-4xl font-bold timer-font text-slate-50">
        {m}:{s}
      </div>
      <p className="text-sm text-sky-100">{tip}</p>
      <button
        onClick={onEnd}
        className="px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all"
      >
        End break → Focus
      </button>
    </div>
  );
};

const ConfettiPiece = ({ index }) => {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const left = 10 + Math.random() * 80;
  const delay = Math.random() * 0.5;
  const size = 6 + Math.random() * 6;

  return (
    <div
      className="absolute animate-confetti rounded-sm pointer-events-none"
      style={{
        left: `${left}%`,
        top: '-10px',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        animationDelay: `${delay}s`,
      }}
    />
  );
};

// ── Main Component ──────────────────────────────────────────────

const FocusSessions = () => {
  const [phase, setPhase] = useState('setup'); // 'setup' | 'running' | 'paused' | 'celebration' | 'break'
  const [mode, setMode] = useState('focus'); // focus | shortBreak | longBreak
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [intent, setIntent] = useState('');
  const [tag, setTag] = useState('');
  const [completedCount, setCompletedCount] = useState(0);
  const [totalFocusedMinutes, setTotalFocusedMinutes] = useState(0);
  const [breakSecondsLeft, setBreakSecondsLeft] = useState(5 * 60);
  const [breakTip, setBreakTip] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [microGoals, setMicroGoals] = useState([
    { label: 'Just open the thing', done: false },
    { label: 'Do one tiny chunk', done: false },
    { label: 'Write down where to resume', done: false },
  ]);
  const [{ streak, weeklyMinutes }, setStreakState] = useState({
    streak: 0,
    weeklyMinutes: 0,
    lastDay: null,
  });

  // load streak on mount
  useEffect(() => {
    const data = loadStreakData();
    setStreakState(data);
  }, []);

  // Focus timer
  useEffect(() => {
    if (phase !== 'running') return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase('celebration');
          setCompletedCount((c) => c + 1);
          if (mode === 'focus') {
            setTotalFocusedMinutes((t) => t + focusMinutes);
            // update streak + weekly minutes
            setStreakState((curr) => {
              const day = todayKey();
              let newStreak = curr.streak;
              if (!curr.lastDay) {
                newStreak = 1;
              } else if (curr.lastDay === day) {
                newStreak = curr.streak;
              } else {
                const lastDate = new Date(curr.lastDay);
                const todayDate = new Date(day);
                const diffDays =
                  (todayDate.getTime() - lastDate.getTime()) /
                  (1000 * 60 * 60 * 24);
                newStreak = diffDays === 1 ? curr.streak + 1 : 1;
              }

              const updated = {
                streak: newStreak,
                lastDay: day,
                weeklyMinutes: curr.weeklyMinutes + focusMinutes,
              };
              saveStreakData(updated);
              return updated;
            });
          }
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, focusMinutes, mode]);

  // Break timer
  useEffect(() => {
    if (phase !== 'break') return;
    const interval = setInterval(() => {
      setBreakSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          resetToSetup();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const selectPreset = useCallback((m) => {
    setFocusMinutes(m);
    setSecondsLeft(m * 60);
  }, []);

  const startSession = () => {
    setSecondsLeft(focusMinutes * 60);
    // regenerate micro‑goals lightly to keep novelty
    setMicroGoals([
      { label: 'Just open the thing', done: false },
      { label: 'Do one tiny chunk', done: false },
      { label: 'Note where you stop', done: false },
    ]);
    setPhase('running');
  };

  const togglePause = () => {
    setPhase((p) => (p === 'running' ? 'paused' : 'running'));
  };

  const resetToSetup = () => {
    setPhase('setup');
    setSecondsLeft(focusMinutes * 60);
    setBreakSecondsLeft(5 * 60);
  };

  const startBreak = () => {
    setBreakSecondsLeft(5 * 60);
    setBreakTip(BREAK_TIPS[Math.floor(Math.random() * BREAK_TIPS.length)]);
    setPhase('break');
  };

  const skipToNext = () => {
    resetToSetup();
  };

  const totalSeconds = focusMinutes * 60;
  const elapsed = totalSeconds - secondsLeft;
  const progress = totalSeconds > 0 ? elapsed / totalSeconds : 0;
  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');
  const isActive = phase === 'running' || phase === 'paused';

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="px-6 pt-4 pb-2 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌳</span>
          <span className="font-semibold tracking-tight">FocusForge</span>
        </div>
        <span className="text-xs text-slate-400">
          Not just a timer. A focus ritual.
        </span>
      </header>

      {/* Main layout */}
      <main className="flex-1 flex items-center justify-center px-4 pb-6">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)] gap-6 items-stretch">
          {/* Timer + Intent column */}
          <div className="relative">
            {showConfetti && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-30">
                {Array.from({ length: 24 }).map((_, i) => (
                  <ConfettiPiece key={i} index={i} />
                ))}
              </div>
            )}

            <div className="glass-card rounded-3xl p-6 sm:p-8 h-full flex flex-col gap-6 bg-slate-900/80 border border-slate-700 relative overflow-hidden">
              {/* Glow background accent */}
              <div className="pointer-events-none absolute -top-28 -right-24 w-72 h-72 rounded-full bg-primary/25 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-28 -left-24 w-72 h-72 rounded-full bg-sky-500/25 blur-3xl" />

              {/* Mode & Intent */}
              <div className="relative z-10 flex flex-col gap-4">
                <ModeSelector
                  mode={mode}
                  setMode={setMode}
                  setFocusMinutes={setFocusMinutes}
                  setSecondsLeft={setSecondsLeft}
                />
                <TaskInput
                  intent={intent}
                  setIntent={setIntent}
                  tag={tag}
                  setTag={setTag}
                  isActive={isActive}
                />
              </div>

              {/* Timer + controls */}
              <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-center">
                <div className="flex-1 flex flex-col items-center justify-center">
                  <CircularProgress progress={progress} mode={mode}>
                    <div className="text-4xl font-bold timer-font text-slate-50 tracking-wider">
                      {minutes}:{seconds}
                    </div>
                    <div
                      className={`text-[10px] font-semibold uppercase tracking-widest mt-1 ${
                        phase === 'running'
                          ? 'text-primary'
                          : 'text-slate-400'
                      }`}
                    >
                      {phase === 'running'
                        ? mode === 'focus'
                          ? 'Focus ON'
                          : 'Break running'
                        : 'Paused'}
                    </div>
                  </CircularProgress>
                </div>

                <div className="flex-1 flex flex-col gap-4 w-full">
                  <PresetSelector
                    selected={focusMinutes}
                    onSelect={selectPreset}
                    customMinutes={customMinutes}
                    onCustomChange={setCustomMinutes}
                  />

                  <div className="flex gap-3 mt-1">
                    {phase === 'setup' ? (
                      <button
                        onClick={startSession}
                        className="flex-1 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Start {mode === 'focus' ? 'Focus' : 'Break'} Session
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={togglePause}
                          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                            phase === 'running'
                              ? 'bg-rose-500 text-rose-50'
                              : 'bg-primary text-primary-foreground'
                          }`}
                        >
                          {phase === 'running' ? '⏸ Pause' : '▶ Resume'}
                        </button>
                        <button
                          onClick={resetToSetup}
                          className="px-4 py-3 rounded-xl text-sm font-semibold bg-slate-800 text-slate-100 border border-slate-600 hover:bg-slate-700 transition-all"
                        >
                          Reset
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Celebration / Break overlays */}
              <div className="relative z-20 mt-2 space-y-3">
                {phase === 'celebration' && (
                  <CelebrationBanner
                    onStartBreak={startBreak}
                    onSkip={skipToNext}
                    intent={intent}
                    focusMinutes={focusMinutes}
                  />
                )}

                {phase === 'break' && (
                  <BreakMode
                    secondsLeft={breakSecondsLeft}
                    tip={breakTip}
                    onEnd={resetToSetup}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right column: micro‑goals + stats + explanation */}
          <div className="flex flex-col gap-4">
            <MicroGoals goals={microGoals} setGoals={setMicroGoals} />

            <StatsRow
              sessions={completedCount}
              totalMinutes={totalFocusedMinutes}
              streak={streak}
              weeklyMinutes={weeklyMinutes}
            />

            <div className="glass-card rounded-2xl p-4 bg-slate-900/85 border border-slate-700 flex flex-col gap-3 text-sm text-slate-100">
              <h3 className="text-sm font-semibold text-slate-50">
                Why not a simple timer?
              </h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-200">
                <li>Each block has a clear intent and tiny micro‑goals.</li>
                <li>Your streak and weekly minutes make “just one session” feel worth it.</li>
                <li>Modes (focus vs breaks) keep your brain from burning out.</li>
              </ul>
              <p className="text-[11px] text-slate-400 mt-1">
                The goal is not perfection. It is training your brain that
                short, focused blocks are doable and rewarded.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FocusSessions;
