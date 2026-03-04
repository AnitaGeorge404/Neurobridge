import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Activity,
  AudioLines,
  BarChart3,
  BookText,
  Brain,
  BrainCircuit,
  CheckCircle2,
  Play,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import { PhonemeWeaknessDetector } from "@/lib/PhonemeWeaknessDetector";

const MODE_TABS = [
  { key: "my-text", label: "My Text Mode", icon: BookText },
  { key: "training", label: "Training Mode", icon: AudioLines },
  { key: "phoneme", label: "Phoneme Analysis", icon: Brain },
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
];

const DEFAULT_TEXT =
  "The migration of Monarch butterflies spans thousands of miles, requiring precise orientation, weather adaptation, and sustained energy management across multiple ecological zones.";

const WPM_THRESHOLD = 130;
const AVG_DWELL_THRESHOLD = 1.2;

const COMMON_PHONEMES = [
  { value: "th", label: "th (think, that)" },
  { value: "ch", label: "ch (chair, church)" },
  { value: "sh", label: "sh (ship, fish)" },
  { value: "wh", label: "wh (what, when)" },
  { value: "ph", label: "ph (phone, graph)" },
  { value: "ng", label: "ng (sing, long)" },
  { value: "oo", label: "oo (book, moon)" },
  { value: "ea", label: "ea (read, bread)" },
  { value: "ai", label: "ai (rain, paid)" },
  { value: "aw", label: "aw (saw, draw)" },
  { value: "oy", label: "oy (boy, toy)" },
  { value: "ou", label: "ou (out, loud)" },
  { value: "er", label: "er (her, term)" },
  { value: "ar", label: "ar (car, star)" },
  { value: "or", label: "or (for, torn)" },
];

const fallbackDrills = {
  focus: "th",
  fillBlank: [
    {
      prompt: "I am ___inking about my plan.",
      options: ["th", "f", "s"],
      answer: "th",
    },
    {
      prompt: "Please pass me the ___read.",
      options: ["ch", "th", "wh"],
      answer: "th",
    },
  ],
  wordBuild: {
    targetWord: "thinking",
    chunks: ["thin", "k", "ing"],
    hint: "Build from left to right and say each chunk aloud.",
  },
  soundMatch: [
    {
      prompt: "Pick the chunk that sounds like /th/",
      choices: ["th", "sh", "ch"],
      answer: "th",
    },
    {
      prompt: "Pick the word that starts with /th/",
      choices: ["think", "sink", "wink"],
      answer: "think",
    },
  ],
};

const clamp = (value, min = 0, max = 100) =>
  Math.max(min, Math.min(max, value));

const normalizeWord = (word) =>
  word
    .toLowerCase()
    .replace(/[^a-z0-9']/gi, "")
    .trim();

const average = (items) => {
  if (!items.length) return 0;
  return items.reduce((sum, item) => sum + item, 0) / items.length;
};

async function getCurrentSupabaseUserId() {
  if (!isSupabaseConfigured) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

export default function AdaptiveReadingIntelligence() {
  const [activeMode, setActiveMode] = useState("my-text");
  const [userId, setUserId] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const resolveUser = useCallback(async () => {
    setIsAuthLoading(true);
    try {
      const id = await getCurrentSupabaseUserId();
      setUserId(id);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    resolveUser();
  }, [resolveUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header with Tabs */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-600 text-white font-semibold">
                <BookText className="h-4 w-4" />
                Adaptive Reading Intelligence
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={resolveUser}>
              Refresh Auth
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 pb-4 border-t border-slate-100">
            {MODE_TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveMode(key)}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition ${
                  activeMode === key
                    ? "text-teal-700 border-b-2 border-teal-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto w-full max-w-7xl p-6 md:p-8 space-y-5">
        {!isSupabaseConfigured && (
          <Card className="border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-2 text-amber-800">
              <TriangleAlert className="mt-0.5 h-4 w-4" />
              <p className="text-sm">
                Supabase is not configured. Set{" "}
                <strong>VITE_SUPABASE_URL</strong> and{" "}
                <strong>VITE_SUPABASE_ANON_KEY</strong> for full persistence.
              </p>
            </div>
          </Card>
        )}

        {isSupabaseConfigured && !isAuthLoading && !userId && (
          <Card className="border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              Supabase session not found. You can still test the UI, but
              RLS-protected writes require authenticated users.
            </p>
          </Card>
        )}

        {activeMode === "my-text" && <AdaptiveReadingMode userId={userId} />}
        {activeMode === "training" && <AdaptiveTrainingMode userId={userId} />}
        {activeMode === "phoneme" && <PhonemeWeaknessDetector userId={userId} />}
        {activeMode === "dashboard" && <ProgressDashboard userId={userId} />}
      </div>
    </div>
  );
}

export function AdaptiveReadingMode({ userId }) {
  const [sourceText, setSourceText] = useState(DEFAULT_TEXT);
  const [renderedText, setRenderedText] = useState(DEFAULT_TEXT);
  const [lineHeight, setLineHeight] = useState(1.9);
  const [letterSpacing, setLetterSpacing] = useState(0.015);
  const [rulerEnabled, setRulerEnabled] = useState(false);
  const [rulerY, setRulerY] = useState(0);
  const [scrollRegressions, setScrollRegressions] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const [lastSession, setLastSession] = useState(null);
  const [highDwellWords, setHighDwellWords] = useState([]);
  const [adaptiveSuggestions, setAdaptiveSuggestions] = useState({
    increase_letter_spacing: false,
    apply_simplification: false,
    enable_reading_ruler: false,
  });

  const sessionStartMsRef = useRef(0);
  const hoverStartRef = useRef({});
  const hoverCountRef = useRef({});
  const wordStatsRef = useRef({});
  const previousScrollTopRef = useRef(0);

  const words = useMemo(
    () => renderedText.split(/\s+/).filter(Boolean),
    [renderedText],
  );
  const canPersist = Boolean(userId && isSupabaseConfigured);

  const resetTracking = () => {
    hoverStartRef.current = {};
    hoverCountRef.current = {};
    wordStatsRef.current = {};
    previousScrollTopRef.current = 0;
    setScrollRegressions(0);
  };

  const startSession = () => {
    if (!sourceText.trim()) {
      return;
    }

    resetTracking();
    sessionStartMsRef.current = Date.now();
    setSessionActive(true);
    setSessionError("");
    setLastSession(null);
  };

  const handleWordEnter = (word, index) => {
    if (!sessionActive) return;

    const key = `${index}`;
    hoverStartRef.current[key] = performance.now();
    hoverCountRef.current[key] = (hoverCountRef.current[key] ?? 0) + 1;

    const token = normalizeWord(word);
    if (!token) return;

    if (!wordStatsRef.current[token]) {
      wordStatsRef.current[token] = {
        totalDwell: 0,
        events: 0,
        rereadCount: 0,
      };
    }

    if (hoverCountRef.current[key] > 1) {
      wordStatsRef.current[token].rereadCount += 1;
    }
  };

  const handleWordLeave = (word, index) => {
    if (!sessionActive) return;

    const key = `${index}`;
    const start = hoverStartRef.current[key];
    if (!start) return;

    const dwellTime = (performance.now() - start) / 1000;
    delete hoverStartRef.current[key];

    const token = normalizeWord(word);
    if (!token) return;

    const stats = wordStatsRef.current[token] ?? {
      totalDwell: 0,
      events: 0,
      rereadCount: 0,
    };
    stats.totalDwell += dwellTime;
    stats.events += 1;
    wordStatsRef.current[token] = stats;
  };

  const handleScroll = (event) => {
    if (!sessionActive) return;

    const current = event.currentTarget.scrollTop;
    if (current < previousScrollTopRef.current) {
      setScrollRegressions((value) => value + 1);
    }
    previousScrollTopRef.current = current;
  };

  const calculateMetrics = () => {
    const totalSeconds = sessionStartMsRef.current
      ? Math.max(1, (Date.now() - sessionStartMsRef.current) / 1000)
      : 1;

    const wordMetrics = Object.entries(wordStatsRef.current).map(
      ([word, stats]) => ({
        word,
        dwell_time: Number(
          (stats.totalDwell / Math.max(1, stats.events)).toFixed(3),
        ),
        reread_count: stats.rereadCount,
      }),
    );

    const avgDwell = wordMetrics.length
      ? average(wordMetrics.map((metric) => Number(metric.dwell_time)))
      : 0;

    const minutes = totalSeconds / 60;
    const wpm = minutes > 0 ? words.length / minutes : 0;
    const comfortScore = clamp(
      100 - scrollRegressions * 7 - avgDwell * 20 + Math.min(wpm, 180) * 0.15,
    );

    return {
      totalSeconds: Number(totalSeconds.toFixed(2)),
      wpm: Number(wpm.toFixed(2)),
      comfortScore: Number(comfortScore.toFixed(2)),
      avgDwell: Number(avgDwell.toFixed(3)),
      wordMetrics,
    };
  };

  const fetchAdaptiveSuggestions = useCallback(async () => {
    if (!canPersist) {
      return {
        suggestions: {
          increase_letter_spacing: false,
          apply_simplification: false,
          enable_reading_ruler: false,
        },
        highWords: [],
      };
    }

    const { data: sessions, error: sessionsError } = await supabase
      .from("reading_sessions")
      .select("id, wpm")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (sessionsError) {
      throw new Error(sessionsError.message);
    }

    const recentSessions = sessions ?? [];
    const averageWpm = recentSessions.length
      ? average(recentSessions.map((session) => Number(session.wpm) || 0))
      : 0;

    const sessionIds = recentSessions.map((session) => session.id);
    let recentWordMetrics = [];
    if (sessionIds.length) {
      const { data: metrics, error: metricsError } = await supabase
        .from("word_metrics")
        .select("word, dwell_time")
        .in("session_id", sessionIds);

      if (metricsError) {
        throw new Error(metricsError.message);
      }

      recentWordMetrics = metrics ?? [];
    }

    const averageDwell = recentWordMetrics.length
      ? average(
          recentWordMetrics.map((metric) => Number(metric.dwell_time) || 0),
        )
      : 0;

    const highWords = recentWordMetrics
      .filter((metric) => Number(metric.dwell_time) > AVG_DWELL_THRESHOLD)
      .sort((a, b) => Number(b.dwell_time) - Number(a.dwell_time))
      .map((metric) => metric.word)
      .filter(Boolean);

    const uniqueHighWords = [...new Set(highWords)].slice(0, 8);

    return {
      suggestions: {
        increase_letter_spacing:
          averageWpm < WPM_THRESHOLD || averageDwell > AVG_DWELL_THRESHOLD,
        apply_simplification:
          averageWpm < WPM_THRESHOLD || uniqueHighWords.length > 0,
        enable_reading_ruler:
          averageDwell > AVG_DWELL_THRESHOLD || scrollRegressions >= 2,
      },
      highWords: uniqueHighWords,
    };
  }, [canPersist, scrollRegressions, userId]);

  const finishSession = async () => {
    if (!sessionActive) {
      startSession();
      return;
    }

    const metrics = calculateMetrics();
    setLastSession(metrics);
    setIsSaving(true);
    setSessionError("");

    try {
      if (!canPersist) {
        const localSuggestions = {
          increase_letter_spacing: metrics.wpm < WPM_THRESHOLD,
          apply_simplification: metrics.avgDwell > AVG_DWELL_THRESHOLD,
          enable_reading_ruler: scrollRegressions >= 2,
        };
        setAdaptiveSuggestions(localSuggestions);
        setLetterSpacing(
          localSuggestions.increase_letter_spacing ? 0.06 : 0.015,
        );
        setRulerEnabled(localSuggestions.enable_reading_ruler);
        setHighDwellWords(
          metrics.wordMetrics
            .filter((metric) => metric.dwell_time > AVG_DWELL_THRESHOLD)
            .map((metric) => metric.word)
            .slice(0, 8),
        );
        setSessionError(
          "Sign in with Supabase-authenticated account to persist analytics and AI outputs.",
        );
        return;
      }

      const { data: sessionRow, error: insertSessionError } = await supabase
        .from("reading_sessions")
        .insert({
          user_id: userId,
          original_text: sourceText,
          wpm: metrics.wpm,
          reading_comfort_score: metrics.comfortScore,
        })
        .select("id")
        .single();

      if (insertSessionError) {
        throw new Error(insertSessionError.message);
      }

      if (metrics.wordMetrics.length) {
        const wordMetricsPayload = metrics.wordMetrics.map((metric) => ({
          session_id: sessionRow.id,
          word: metric.word,
          dwell_time: metric.dwell_time,
          reread_count: metric.reread_count,
        }));

        const { error: wordMetricError } = await supabase
          .from("word_metrics")
          .insert(wordMetricsPayload);
        if (wordMetricError) {
          throw new Error(wordMetricError.message);
        }
      }

      const guidance = await fetchAdaptiveSuggestions();
      setAdaptiveSuggestions(guidance.suggestions);
      setHighDwellWords(guidance.highWords);
      setLetterSpacing(
        guidance.suggestions.increase_letter_spacing ? 0.06 : 0.015,
      );
      setRulerEnabled(guidance.suggestions.enable_reading_ruler);

      if (guidance.suggestions.apply_simplification) {
        const { data: simplifyResponse, error: simplifyError } =
          await supabase.functions.invoke("simplify-text", {
            body: {
              originalText: sourceText,
              sessionId: sessionRow.id,
            },
          });

        if (simplifyError) {
          throw new Error(simplifyError.message);
        }

        if (simplifyResponse?.simplifiedText) {
          setRenderedText(simplifyResponse.simplifiedText);
        }
      }
    } catch (error) {
      setSessionError(
        error instanceof Error ? error.message : "Session save failed",
      );
    } finally {
      setSessionActive(false);
      setIsSaving(false);
    }
  };

  const effectiveLineHeight = adaptiveSuggestions.enable_reading_ruler
    ? Math.max(lineHeight, 2.05)
    : lineHeight;

  return (
    <div className="space-y-5">
      <Card className="rounded-2xl border-slate-200 p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <BrainCircuit className="h-5 w-5 text-teal-700" />
          <h2 className="text-2xl font-semibold text-slate-900">
            Adaptive Reading Mode
          </h2>
          <Badge className="bg-teal-100 text-teal-800">
            My Text + Live Behavioral Adaptation
          </Badge>
        </div>

        <label className="text-sm text-slate-600">
          Paste or write your text
        </label>
        <textarea
          className="mt-2 h-32 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
          value={sourceText}
          onChange={(event) => {
            const nextText = event.target.value;
            setSourceText(nextText);
            setRenderedText(nextText);
          }}
          placeholder="Paste a paragraph to begin adaptive reading analysis"
        />

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="text-sm text-slate-600">
            Line spacing: {lineHeight.toFixed(1)}
            <input
              type="range"
              min="1.4"
              max="2.6"
              step="0.1"
              value={lineHeight}
              onChange={(event) => setLineHeight(Number(event.target.value))}
              className="mt-2 w-full"
            />
          </label>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <p className="text-slate-500">Letter spacing</p>
            <p className="text-lg font-semibold text-slate-800">
              {letterSpacing.toFixed(3)}em
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <p className="text-slate-500">Reading ruler</p>
            <p className="text-lg font-semibold text-slate-800">
              {rulerEnabled ? "Enabled" : "Disabled"}
            </p>
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl border-slate-200 p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Sparkles className="h-4 w-4 text-teal-700" />
            Word-level span tracking, scroll regression detection, and adaptive
            formatting
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={startSession}
              className="bg-slate-800 hover:bg-slate-900"
              disabled={sessionActive || isSaving}
            >
              <Play className="mr-1 h-4 w-4" /> Start
            </Button>
            <Button
              onClick={finishSession}
              className="bg-teal-600 hover:bg-teal-700"
              disabled={isSaving}
            >
              {isSaving
                ? "Processing..."
                : sessionActive
                  ? "Finish + Auto-Adapt"
                  : "Analyze Last Session"}
            </Button>
          </div>
        </div>

        <div
          className="relative max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-emerald-50/40 p-5"
          onScroll={handleScroll}
          onMouseMove={(event) => setRulerY(event.nativeEvent.offsetY)}
          style={{
            fontFamily: "OpenDyslexic, Arial, sans-serif",
            lineHeight: effectiveLineHeight,
            letterSpacing: `${letterSpacing}em`,
          }}
        >
          {rulerEnabled && (
            <div
              className="pointer-events-none absolute left-4 right-4 h-7 rounded bg-teal-200/25"
              style={{ top: Math.max(8, rulerY - 8) }}
            />
          )}

          {words.map((word, index) => (
            <span
              key={`${word}-${index}`}
              onMouseEnter={() => handleWordEnter(word, index)}
              onMouseLeave={() => handleWordLeave(word, index)}
              className="mr-1 inline-block rounded px-0.5 hover:bg-yellow-100"
            >
              {word}
            </span>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge className="bg-cyan-100 text-cyan-700">
            Regressions: {scrollRegressions}
          </Badge>
          <Badge className="bg-violet-100 text-violet-700">
            Session: {sessionActive ? "Active" : "Idle"}
          </Badge>
          {lastSession && (
            <Badge className="bg-emerald-100 text-emerald-700">
              WPM: {lastSession.wpm}
            </Badge>
          )}
          {lastSession && (
            <Badge className="bg-blue-100 text-blue-700">
              Comfort: {lastSession.comfortScore}
            </Badge>
          )}
          {lastSession && (
            <Badge className="bg-amber-100 text-amber-700">
              Reading Time: {lastSession.totalSeconds}s
            </Badge>
          )}
        </div>

        {sessionError && (
          <p className="mt-3 text-sm text-amber-700">{sessionError}</p>
        )}
      </Card>

      <Card className="rounded-2xl border-slate-200 p-5">
        <div className="mb-3 flex items-center gap-2 text-slate-800">
          <Activity className="h-4 w-4 text-teal-700" />
          <h3 className="text-lg font-semibold">Adaptive Output</h3>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Increase letter spacing</p>
            <p className="mt-1 text-base font-semibold text-slate-800">
              {adaptiveSuggestions.increase_letter_spacing ? "Yes" : "No"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Apply simplification</p>
            <p className="mt-1 text-base font-semibold text-slate-800">
              {adaptiveSuggestions.apply_simplification ? "Yes" : "No"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Enable reading ruler</p>
            <p className="mt-1 text-base font-semibold text-slate-800">
              {adaptiveSuggestions.enable_reading_ruler ? "Yes" : "No"}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-slate-700">
            High dwell words
          </p>
          <div className="flex flex-wrap gap-2">
            {highDwellWords.length > 0 ? (
              highDwellWords.map((word) => (
                <Badge key={word} className="bg-rose-100 text-rose-700">
                  {word}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No elevated dwell words yet.
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export function AdaptiveTrainingMode({ userId }) {
  const [dominantPhoneme, setDominantPhoneme] = useState("th");
  const [selectedPhoneme, setSelectedPhoneme] = useState("th");
  const [drills, setDrills] = useState(fallbackDrills);
  const [isGenerating, setIsGenerating] = useState(false);
  const [trainingError, setTrainingError] = useState("");
  
  // Fill-in-the-Blank state
  const [fillAnswers, setFillAnswers] = useState({});
  const [fillFeedback, setFillFeedback] = useState({});
  const [currentFillIndex, setCurrentFillIndex] = useState(0);
  const [fillScore, setFillScore] = useState({ correct: 0, total: 0 });
  
  // Word Building state
  const [builtChunks, setBuiltChunks] = useState([]);
  const [wordBuildFeedback, setWordBuildFeedback] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordBuildScore, setWordBuildScore] = useState({ correct: 0, total: 0 });
  const [wordBuildAttempts, setWordBuildAttempts] = useState(0);
  
  // Sound Matching state
  const [soundAnswers, setSoundAnswers] = useState({});
  const [soundFeedback, setSoundFeedback] = useState({});
  const [currentSoundIndex, setCurrentSoundIndex] = useState(0);
  const [soundScore, setSoundScore] = useState({ correct: 0, total: 0 });

  const canPersist = Boolean(userId && isSupabaseConfigured);

  const loadDominantPhoneme = useCallback(async () => {
    if (!canPersist) {
      setDominantPhoneme("th");
      return;
    }

    const { data, error } = await supabase
      .from("phoneme_errors")
      .select("phoneme")
      .eq("user_id", userId)
      .order("error_count", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      setTrainingError(error.message);
      return;
    }

    if (data?.phoneme) {
      setDominantPhoneme(data.phoneme);
      setSelectedPhoneme(data.phoneme);
    }
  }, [canPersist, userId]);

  useEffect(() => {
    loadDominantPhoneme();
  }, [loadDominantPhoneme]);

  const logIncorrectAttempt = useCallback(
    async (phoneme) => {
      if (!canPersist) return;

      const { data: current, error: currentError } = await supabase
        .from("phoneme_errors")
        .select("error_count")
        .eq("user_id", userId)
        .eq("phoneme", phoneme)
        .maybeSingle();

      if (currentError) {
        setTrainingError(currentError.message);
        return;
      }

      const nextCount = (current?.error_count ?? 0) + 1;
      const { error: upsertError } = await supabase
        .from("phoneme_errors")
        .upsert(
          {
            user_id: userId,
            phoneme,
            error_count: nextCount,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,phoneme" },
        );

      if (upsertError) {
        setTrainingError(upsertError.message);
      }
    },
    [canPersist, userId],
  );

  const requestDrills = async () => {
    setIsGenerating(true);
    setTrainingError("");
    try {
      if (!canPersist) {
        setDrills({ ...fallbackDrills, focus: selectedPhoneme });
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "generate-training-drills",
        {
          body: { dominantPhoneme: selectedPhoneme },
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      setDrills(data?.drills ?? fallbackDrills);
      resetAllExercises();
    } catch (error) {
      setTrainingError(
        error instanceof Error ? error.message : "Drill generation failed",
      );
      setDrills({ ...fallbackDrills, focus: selectedPhoneme });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetAllExercises = () => {
    setFillAnswers({});
    setFillFeedback({});
    setCurrentFillIndex(0);
    setBuiltChunks([]);
    setWordBuildFeedback("");
    setCurrentWordIndex(0);
    setWordBuildAttempts(0);
    setSoundAnswers({});
    setSoundFeedback({});
    setCurrentSoundIndex(0);
  };

  // Fill-in-the-Blank handlers
  const handleFillAnswer = async (option) => {
    const item = drills.fillBlank[currentFillIndex];
    if (!item) return;

    const isCorrect = option === item.answer;
    setFillAnswers({ [currentFillIndex]: option });
    setFillFeedback({
      [currentFillIndex]: {
        isCorrect,
        message: isCorrect ? "✅ Correct!" : `❌ Try again. The answer is "${item.answer}"`,
      },
    });

    if (!isCorrect) {
      await logIncorrectAttempt(dominantPhoneme);
    } else {
      setFillScore((prev) => ({ correct: prev.correct + 1, total: prev.total + 1 }));
    }
  };

  const nextFillProblem = () => {
    const nextIndex = (currentFillIndex + 1) % drills.fillBlank.length;
    setCurrentFillIndex(nextIndex);
    setFillAnswers({});
    setFillFeedback({});
  };

  // Word Building handlers
  const handleAddChunk = (chunk) => {
    setBuiltChunks((prev) => [...prev, chunk]);
  };

  const handleRemoveChunk = (index) => {
    setBuiltChunks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearChunks = () => {
    setBuiltChunks([]);
    setWordBuildFeedback("");
  };

  const submitWordBuild = async () => {
    const builtWord = builtChunks.join("");
    const target = drills.wordBuild?.targetWord ?? "";
    const isCorrect = builtWord.toLowerCase() === target.toLowerCase();

    setWordBuildFeedback({
      isCorrect,
      message: isCorrect
        ? `✅ Perfect! "${target}" is correct!`
        : `❌ Not quite. The target word is "${target}". You built "${builtWord || 'nothing'}"`,
    });

    setWordBuildAttempts((prev) => prev + 1);

    if (!isCorrect) {
      await logIncorrectAttempt(dominantPhoneme);
    } else if (wordBuildAttempts === 0) {
      // Only count first correct attempt
      setWordBuildScore((prev) => ({ correct: prev.correct + 1, total: prev.total + 1 }));
    }
  };

  const nextWordProblem = () => {
    const nextIndex = (currentWordIndex + 1) % fallbackDrills.wordBuild.length || 0;
    setCurrentWordIndex(nextIndex);
    handleClearChunks();
    setWordBuildAttempts(0);
  };

  // Sound Matching handlers
  const handleSoundAnswer = async (option) => {
    const item = drills.soundMatch[currentSoundIndex];
    if (!item) return;

    const isCorrect = option === item.answer;
    setSoundAnswers({ [currentSoundIndex]: option });
    setSoundFeedback({
      [currentSoundIndex]: {
        isCorrect,
        message: isCorrect ? "✅ Correct!" : `❌ Try again. The answer is "${item.answer}"`,
      },
    });

    if (!isCorrect) {
      await logIncorrectAttempt(dominantPhoneme);
    } else {
      setSoundScore((prev) => ({ correct: prev.correct + 1, total: prev.total + 1 }));
    }
  };

  const nextSoundProblem = () => {
    const nextIndex = (currentSoundIndex + 1) % drills.soundMatch.length;
    setCurrentSoundIndex(nextIndex);
    setSoundAnswers({});
    setSoundFeedback({});
  };

  const fillItem = drills.fillBlank[currentFillIndex];
  const soundItem = drills.soundMatch[currentSoundIndex];
  const fillItemFeedback = fillFeedback[currentFillIndex];
  const soundItemFeedback = soundFeedback[currentSoundIndex];

  return (
    <div className="space-y-5">
      <Card className="rounded-2xl border-slate-200 p-5">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <AudioLines className="h-5 w-5 text-teal-700" />
          <h2 className="text-2xl font-semibold text-slate-900">
            Adaptive Training Mode
          </h2>
          <Badge className="bg-teal-100 text-teal-800">
            Live error-driven drills
          </Badge>
        </div>

        <div className="mb-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-slate-100 text-slate-700">
              Most errors: {dominantPhoneme}
            </Badge>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">
                Select phoneme:
              </label>
              <Select
                value={selectedPhoneme}
                onValueChange={setSelectedPhoneme}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Choose phoneme" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_PHONEMES.map((phoneme) => (
                    <SelectItem key={phoneme.value} value={phoneme.value}>
                      {phoneme.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={requestDrills}
              className="bg-teal-600 hover:bg-teal-700"
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate AI Drills"}
            </Button>
          </div>
        </div>

        {trainingError && (
          <p className="text-sm text-amber-700">{trainingError}</p>
        )}
      </Card>

      <div className="grid gap-5 xl:grid-cols-3">
        {/* Fill-in-the-Blank */}
        <Card className="rounded-2xl border-slate-200 p-5">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Fill-in-the-Blank
              </h3>
              <p className="text-xs text-slate-500">
                Problem {currentFillIndex + 1} of {drills.fillBlank.length} | Score: {fillScore.correct}/{fillScore.total}
              </p>
            </div>
          </div>

          {fillItem && (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="mb-3 text-sm text-slate-700">{fillItem.prompt}</p>
                <div className="flex flex-wrap gap-2">
                  {fillItem.options.map((option) => {
                    const selected = fillAnswers[currentFillIndex] === option;
                    const feedback = fillItemFeedback;
                    const correct = fillItem.answer === option;
                    const showCorrect = feedback && selected && feedback.isCorrect;
                    const showWrong = feedback && selected && !feedback.isCorrect;

                    return (
                      <button
                        type="button"
                        key={option}
                        onClick={() => !feedback && handleFillAnswer(option)}
                        disabled={Boolean(feedback)}
                        className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                          showCorrect
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                            : showWrong
                              ? "border-rose-300 bg-rose-50 text-rose-700"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              {fillItemFeedback && (
                <div className={`rounded-lg p-3 text-sm ${
                  fillItemFeedback.isCorrect
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-rose-50 text-rose-800"
                }`}>
                  {fillItemFeedback.message}
                </div>
              )}

              {fillItemFeedback && (
                <Button
                  onClick={nextFillProblem}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  size="sm"
                >
                  Next Problem →
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* Word Building */}
        <Card className="rounded-2xl border-slate-200 p-5">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Word Building
              </h3>
              <p className="text-xs text-slate-500">
                Score: {wordBuildScore.correct}/{wordBuildScore.total}
              </p>
            </div>
          </div>

          <p className="mb-3 text-sm text-slate-600">
            {drills.wordBuild?.hint}
          </p>

          <div className="mb-3 flex flex-wrap gap-2">
            {drills.wordBuild?.chunks.map((chunk) => {
              const isUsed = builtChunks.includes(chunk);
              return (
                <button
                  key={chunk}
                  type="button"
                  draggable
                  onDragStart={(event) =>
                    event.dataTransfer.setData("text/plain", chunk)
                  }
                  onClick={() => handleAddChunk(chunk)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    isUsed
                      ? "border-slate-300 bg-slate-200 text-slate-600"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {chunk}
                </button>
              );
            })}
          </div>

          <div
            className="mb-3 min-h-14 rounded-xl border-2 border-dashed border-teal-300 bg-teal-50 p-3"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const dropped = event.dataTransfer.getData("text/plain");
              if (dropped) {
                handleAddChunk(dropped);
              }
            }}
          >
            {builtChunks.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {builtChunks.map((chunk, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRemoveChunk(idx)}
                    className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1 text-sm font-medium text-white hover:bg-teal-700"
                  >
                    {chunk} ✕
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-teal-800">Drop chunks here or click them</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={submitWordBuild}
              className="flex-1 bg-slate-800 hover:bg-slate-900"
              disabled={builtChunks.length === 0}
            >
              Check Word
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearChunks}
            >
              Clear
            </Button>
          </div>

          {wordBuildFeedback && (
            <div className={`mt-3 rounded-lg p-3 text-sm ${
              wordBuildFeedback.isCorrect
                ? "bg-emerald-50 text-emerald-800"
                : "bg-rose-50 text-rose-800"
            }`}>
              {wordBuildFeedback.message}
            </div>
          )}
        </Card>

        {/* Sound Matching */}
        <Card className="rounded-2xl border-slate-200 p-5">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Sound Matching
              </h3>
              <p className="text-xs text-slate-500">
                Problem {currentSoundIndex + 1} of {drills.soundMatch.length} | Score: {soundScore.correct}/{soundScore.total}
              </p>
            </div>
          </div>

          {soundItem && (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="mb-3 text-sm text-slate-700">
                  {soundItem.prompt}
                </p>
                <div className="flex flex-wrap gap-2">
                  {soundItem.choices.map((choice) => {
                    const selected = soundAnswers[currentSoundIndex] === choice;
                    const feedback = soundItemFeedback;
                    const isCorrect = soundItem.answer === choice;
                    const showCorrect = feedback && selected && feedback.isCorrect;
                    const showWrong = feedback && selected && !feedback.isCorrect;

                    return (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => !feedback && handleSoundAnswer(choice)}
                        disabled={Boolean(feedback)}
                        className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                          showCorrect
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                            : showWrong
                              ? "border-rose-300 bg-rose-50 text-rose-700"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
              </div>

              {soundItemFeedback && (
                <div className={`rounded-lg p-3 text-sm ${
                  soundItemFeedback.isCorrect
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-rose-50 text-rose-800"
                }`}>
                  {soundItemFeedback.message}
                </div>
              )}

              {soundItemFeedback && (
                <Button
                  onClick={nextSoundProblem}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  size="sm"
                >
                  Next Problem →
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export function ProgressDashboard({ userId }) {
  const [readingTrend, setReadingTrend] = useState([]);
  const [phonemeData, setPhonemeData] = useState([]);
  const [writingTrend, setWritingTrend] = useState([]);
  const [latestPlan, setLatestPlan] = useState(null);
  const [latestScores, setLatestScores] = useState(null);
  const [dashboardError, setDashboardError] = useState("");
  const [loading, setLoading] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState("Idle");
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const canPersist = Boolean(userId && isSupabaseConfigured);

  const refreshDashboard = useCallback(async () => {
    if (!canPersist) {
      setReadingTrend([]);
      setPhonemeData([]);
      setWritingTrend([]);
      setLatestPlan(null);
      setLatestScores(null);
      return;
    }

    setLoading(true);
    setDashboardError("");
    try {
      const [sessionsRes, phonemeRes, profilesRes] = await Promise.all([
        supabase
          .from("reading_sessions")
          .select("wpm, reading_comfort_score, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: true })
          .limit(30),
        supabase
          .from("phoneme_errors")
          .select("phoneme, error_count")
          .eq("user_id", userId)
          .order("error_count", { ascending: false })
          .limit(12),
        supabase
          .from("cognitive_profiles")
          .select(
            "reading_speed_score, phonological_score, writing_stability_score, confidence_trend, generated_plan, created_at",
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(12),
      ]);

      if (sessionsRes.error) throw new Error(sessionsRes.error.message);
      if (phonemeRes.error) throw new Error(phonemeRes.error.message);
      if (profilesRes.error) throw new Error(profilesRes.error.message);

      const sessions = sessionsRes.data ?? [];
      const profiles = profilesRes.data ?? [];

      setReadingTrend(
        sessions.map((session) => ({
          date: new Date(session.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
          wpm: Number(session.wpm) || 0,
          comfort: Number(session.reading_comfort_score) || 0,
        })),
      );

      setPhonemeData(
        (phonemeRes.data ?? []).map((item) => ({
          phoneme: item.phoneme,
          errors: Number(item.error_count) || 0,
        })),
      );

      setWritingTrend(
        [...profiles].reverse().map((profile) => ({
          date: new Date(profile.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
          writingStability: Number(profile.writing_stability_score) || 0,
          confidence: Number(profile.confidence_trend) || 0,
        })),
      );

      setLatestPlan(profiles[0]?.generated_plan ?? null);
      setLatestScores(
        profiles[0]
          ? {
              readingSpeed: Number(profiles[0].reading_speed_score) || 0,
              phonological: Number(profiles[0].phonological_score) || 0,
              writingStability:
                Number(profiles[0].writing_stability_score) || 0,
              confidence: Number(profiles[0].confidence_trend) || 0,
            }
          : null,
      );
    } catch (error) {
      setDashboardError(
        error instanceof Error ? error.message : "Dashboard load failed",
      );
    } finally {
      setLoading(false);
    }
  }, [canPersist, userId]);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  useEffect(() => {
    if (!canPersist) return undefined;

    const channel = supabase
      .channel(`dyslexia-progress-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reading_sessions",
          filter: `user_id=eq.${userId}`,
        },
        refreshDashboard,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "phoneme_errors",
          filter: `user_id=eq.${userId}`,
        },
        refreshDashboard,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cognitive_profiles",
          filter: `user_id=eq.${userId}`,
        },
        refreshDashboard,
      )
      .subscribe((status) => {
        setRealtimeStatus(status === "SUBSCRIBED" ? "Live" : status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [canPersist, refreshDashboard, userId]);

  const generateWeeklyPlan = async () => {
    if (!canPersist) return;

    setIsGeneratingPlan(true);
    setDashboardError("");
    try {
      const { error } = await supabase.functions.invoke(
        "generate-weekly-plan",
        { body: {} },
      );
      if (error) {
        throw new Error(error.message);
      }
      await refreshDashboard();
    } catch (error) {
      setDashboardError(
        error instanceof Error
          ? error.message
          : "Failed to generate weekly plan",
      );
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const planDays = Array.isArray(latestPlan?.days) ? latestPlan.days : [];

  return (
    <div className="space-y-5">
      <Card className="rounded-2xl border-slate-200 p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-teal-700" />
            <h2 className="text-2xl font-semibold text-slate-900">
              Progress Dashboard
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-slate-100 text-slate-700">
              Realtime: {realtimeStatus}
            </Badge>
            <Button
              onClick={generateWeeklyPlan}
              className="bg-teal-600 hover:bg-teal-700"
              disabled={isGeneratingPlan}
            >
              {isGeneratingPlan ? "Generating..." : "Generate Weekly AI Plan"}
            </Button>
          </div>
        </div>

        {dashboardError && (
          <p className="text-sm text-amber-700">{dashboardError}</p>
        )}

        {latestScores && (
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <ScoreTile
              label="Reading Speed"
              value={latestScores.readingSpeed}
            />
            <ScoreTile label="Phonological" value={latestScores.phonological} />
            <ScoreTile
              label="Writing Stability"
              value={latestScores.writingStability}
            />
            <ScoreTile label="Confidence" value={latestScores.confidence} />
          </div>
        )}
      </Card>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="rounded-2xl border-slate-200 p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-800">
            Reading Speed Trend
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={readingTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="wpm"
                  stroke="#0f766e"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="comfort"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {!loading && !readingTrend.length && (
            <p className="text-sm text-slate-500">No reading sessions yet.</p>
          )}
        </Card>

        <Card className="rounded-2xl border-slate-200 p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-800">
            Phoneme Weakness Chart
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={phonemeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="phoneme" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="errors" fill="#0d9488" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {!loading && !phonemeData.length && (
            <p className="text-sm text-slate-500">No phoneme error logs yet.</p>
          )}
        </Card>

        <Card className="rounded-2xl border-slate-200 p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-800">
            Writing Stability Trend
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={writingTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="writingStability"
                  stroke="#7c3aed"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="confidence"
                  stroke="#10b981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {!loading && !writingTrend.length && (
            <p className="text-sm text-slate-500">No cognitive profiles yet.</p>
          )}
        </Card>
      </div>

      <Card className="rounded-2xl border-slate-200 p-5">
        <div className="mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-teal-700" />
          <h3 className="text-lg font-semibold text-slate-900">
            Weekly AI Plan
          </h3>
        </div>

        {latestPlan?.summary && (
          <p className="mb-4 text-sm text-slate-700">{latestPlan.summary}</p>
        )}

        {planDays.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {planDays.map((dayItem) => (
              <div
                key={dayItem.day}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="font-semibold text-slate-800">{dayItem.day}</p>
                <p className="mt-2 text-sm text-slate-700">
                  <strong>Reading:</strong> {dayItem.readingExercise}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  <strong>Phoneme:</strong> {dayItem.phonemeDrill}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  <strong>Writing:</strong> {dayItem.writingTask}
                </p>
                <p className="mt-2 text-sm text-teal-700">
                  {dayItem.encouragement}
                </p>
              </div>
            ))}
          </div>
        ) : latestPlan ? (
          <pre className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 whitespace-pre-wrap">
            {JSON.stringify(latestPlan, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-slate-500">
            Generate a weekly plan to populate this section.
          </p>
        )}
      </Card>
    </div>
  );
}

function ScoreTile({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-800">
        {Number(value).toFixed(1)}
      </p>
    </div>
  );
}
