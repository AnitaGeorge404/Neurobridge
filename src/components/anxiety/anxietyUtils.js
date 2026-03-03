export const LOG_STORAGE_KEY = "anxiety-tracker-logs-v2";
export const REFRAME_STORAGE_KEY = "anxiety-reframe-history-v1";

export const GROUNDING_STEPS = [
  "Name 5 things you can see",
  "Name 4 things you can feel",
  "Name 3 things you can hear",
  "Name 2 things you can smell",
  "Name 1 thing you can taste",
];

export const PMR_STEPS = [
  "Hands and forearms: tense 5 seconds, release 10 seconds.",
  "Shoulders: lift toward ears for 5 seconds, release slowly.",
  "Jaw and face: squeeze lightly for 5 seconds, then soften.",
  "Core: tighten abdomen for 5 seconds, then let go.",
  "Legs and feet: flex for 5 seconds, release fully.",
];

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "just",
  "very",
  "have",
  "been",
  "into",
  "about",
  "when",
  "what",
  "your",
  "will",
  "would",
  "could",
  "they",
  "them",
  "were",
]);

export const formatDateTimeInput = (date = new Date()) => {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const formatClock = (seconds) => {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
};

export const clampLevel = (value) => Math.max(0, Math.min(10, Number(value)));

export const getTimeWindow = (isoDate) => {
  const hour = new Date(isoDate).getHours();
  if (hour >= 5 && hour <= 11) return "Morning";
  if (hour >= 12 && hour <= 16) return "Afternoon";
  if (hour >= 17 && hour <= 21) return "Evening";
  return "Night";
};

const tokenize = (text) =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));

export const analyzeLogs = (logs) => {
  const windows = {
    Morning: { total: 0, count: 0 },
    Afternoon: { total: 0, count: 0 },
    Evening: { total: 0, count: 0 },
    Night: { total: 0, count: 0 },
  };

  const triggerCounts = {};
  const keywordCounts = {};
  const keywordWindowCounts = {};
  const locationCounts = {};

  logs.forEach((entry) => {
    const window = getTimeWindow(entry.loggedAt);
    windows[window].total += entry.level;
    windows[window].count += 1;

    const trigger = entry.trigger.trim().toLowerCase();
    triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;

    tokenize(entry.trigger).forEach((keyword) => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
      if (!keywordWindowCounts[keyword]) {
        keywordWindowCounts[keyword] = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
      }
      keywordWindowCounts[keyword][window] += 1;
    });

    const normalizedLocation = (entry.location || "unspecified").toLowerCase();
    locationCounts[normalizedLocation] = (locationCounts[normalizedLocation] || 0) + 1;
  });

  const averageByTimeOfDay = Object.entries(windows).map(([key, value]) => ({
    key,
    average: value.count ? Number((value.total / value.count).toFixed(2)) : 0,
    count: value.count,
  }));

  const topKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([keyword, count]) => ({ keyword, count }));

  const mostFrequentTrigger =
    Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Not enough data";

  const highestAnxietyWindow =
    averageByTimeOfDay.filter((item) => item.count > 0).sort((a, b) => b.average - a.average)[0]?.key || "Not enough data";

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weeklyLogs = logs.filter((entry) => new Date(entry.loggedAt).getTime() >= weekAgo);
  const weeklyAverage = weeklyLogs.length
    ? Number((weeklyLogs.reduce((sum, entry) => sum + entry.level, 0) / weeklyLogs.length).toFixed(2))
    : 0;

  const topLocation = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Not enough data";

  let predictedRisk = "Log at least 3 entries to generate a risk prediction.";
  const strongestWindow = averageByTimeOfDay.filter((item) => item.count >= 2).sort((a, b) => b.average - a.average)[0];
  if (strongestWindow && strongestWindow.average >= 6.5) {
    predictedRisk = `${strongestWindow.key} appears elevated based on current anxiety averages.`;
  }

  const topKeyword = topKeywords[0];
  if (topKeyword && topKeyword.count >= 3) {
    const dominantWindow = Object.entries(keywordWindowCounts[topKeyword.keyword] || {}).sort((a, b) => b[1] - a[1])[0];
    if (dominantWindow?.[1] >= 2) {
      predictedRisk = `${dominantWindow[0]} may be high-risk when "${topKeyword.keyword}" trigger patterns show up.`;
    }
  }

  const dayBuckets = {};
  logs.forEach((entry) => {
    const dayKey = new Date(entry.loggedAt).toISOString().slice(0, 10);
    if (!dayBuckets[dayKey]) dayBuckets[dayKey] = { total: 0, count: 0 };
    dayBuckets[dayKey].total += entry.level;
    dayBuckets[dayKey].count += 1;
  });

  const last7Days = Object.entries(dayBuckets)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-7)
    .map(([date, value]) => ({ date, average: Number((value.total / value.count).toFixed(2)) }));

  return {
    averageByTimeOfDay,
    topKeywords,
    mostFrequentTrigger,
    highestAnxietyWindow,
    weeklyAverage,
    predictedRisk,
    topLocation,
    last7Days,
  };
};

export const generateReframe = (thought) => {
  const value = thought.trim();
  if (!value) return null;

  if (/(always|never|everyone|nobody)/i.test(value)) {
    return {
      evidencePrompt: "What real examples show this is not true in every situation?",
      balancedThought: "Sometimes this feels true, but it is not true all the time.",
      reinforcement: "You can pause, gather evidence, and respond more gently to yourself.",
      pattern: "All-or-nothing thinking",
    };
  }

  if (/(disaster|catastrophe|ruined|worst|terrible)/i.test(value)) {
    return {
      evidencePrompt: "What objective facts support the worst-case outcome, and what facts support a likely outcome?",
      balancedThought: "This is difficult, but I can handle it step by step.",
      reinforcement: "Anxiety predicts danger loudly. Breathing and facts can lower that alarm.",
      pattern: "Catastrophizing",
    };
  }

  if (/(can't|cannot|impossible)/i.test(value)) {
    return {
      evidencePrompt: "What have you handled before that suggests you can cope now too?",
      balancedThought: "I may not control everything, but I can choose one useful next action.",
      reinforcement: "Small actions build stability. One action right now is enough.",
      pattern: "Hopeless prediction",
    };
  }

  return {
    evidencePrompt: "What facts support this thought, and what facts suggest a calmer interpretation?",
    balancedThought: "I notice anxiety, and I can choose a grounded response instead of reacting automatically.",
    reinforcement: "A feeling is real, but it is temporary and manageable.",
    pattern: "General anxiety narrative",
  };
};
