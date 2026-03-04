import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Heart, Shield, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { loadWardTasks, saveWardTasks, toAsdRoutineTask, fromAsdRoutineTask } from "@/lib/wardTaskStore";
import { pushWardActivity, pushWardAlert } from "@/lib/careSyncStore";
import RoutineVisualizer from "./RoutineVisualizer";
import SensoryMonitor from "./SensoryMonitor";
import SocialStoryBuilder from "./SocialStoryBuilder";
import MeltdownPrevention from "./MeltdownPrevention";

const ROLE_FALLBACK = "user";
const ASD_PROFILE_PREFIX = "nb_asd_profile_";
const ASD_STORIES_PREFIX = "nb_asd_stories_";
const ASD_MELTDOWN_PREFIX = "nb_asd_meltdown_";

const createStep = (id, text, image_url = "") => ({ id, text, image_url });

const getBuiltInStories = (name = "the child") => [
  {
    id: "builtin-school-day",
    user_id: "builtin",
    title: "Going to School Calmly",
    steps: [
      createStep("school-1", `🏫 ${name} checks the plan for the day.`),
      createStep("school-2", "🚌 Travel to school with one calm breath."),
      createStep("school-3", "👋 Say hello to teacher/class with a simple greeting."),
      createStep("school-4", "🌿 If noise is high, use headphones or quiet breathing."),
      createStep("school-5", "✅ Complete one class task at a time."),
      createStep("school-6", "🎉 End of day: celebrate effort, not perfection."),
    ],
    content: `🏫 ${name} checks the plan for the day.`,
    is_builtin: true,
  },
  {
    id: "builtin-routine-change",
    user_id: "builtin",
    title: "When Plans Change",
    steps: [
      createStep("change-1", "⚠️ Plans changed. Pause and take one breath."),
      createStep("change-2", "📋 Look at the updated plan with support."),
      createStep("change-3", "❓ Ask one clear question about what happens next."),
      createStep("change-4", "🌿 Pick one calming strategy before moving on."),
    ],
    content: "⚠️ Plans changed. Pause and take one breath.",
    is_builtin: true,
  },
];

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export default function ASDModule() {
  const { user: appUser, role: appRole, isAuthenticated, isLoading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("routine");

  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(ROLE_FALLBACK);
  const [targetWardId, setTargetWardId] = useState(null);

  const [routines, setRoutines] = useState([]);
  const [sensoryProfile, setSensoryProfile] = useState(null);
  const [stories, setStories] = useState([]);
  const [meltdownLogs, setMeltdownLogs] = useState([]);
  const [emotionCheckin, setEmotionCheckin] = useState("Calm");

  const hasLinkedWards = Array.isArray(appUser?.linkedWardIds) && appUser.linkedWardIds.length > 0;
  const isGuardian = role === "guardian" || appRole === "guardian" || appUser?.role === "guardian";
  const isManagerMode = isGuardian || hasLinkedWards || String(appUser?.email || "").toLowerCase().includes("guardian");
  const canEditRoutine = isManagerMode;
  const canEditThresholds = isManagerMode;
  const canManageStories = isManagerMode;
  const canViewMeltdownLogs = isManagerMode;
  const canUseCalmingTools = role === "user" || role === "guardian";
  const isAdmin = role === "admin";

  const wardOptions = useMemo(() => {
    const linkedIds = Array.isArray(appUser?.linkedWardIds) ? appUser.linkedWardIds : [];
    if (linkedIds.length === 0 && isManagerMode) {
      return [{ id: "nb-user-088", name: "Riya Sen" }];
    }
    return linkedIds.map((id) => ({ id, name: id === "nb-user-088" ? "Riya Sen" : id }));
  }, [appUser?.linkedWardIds]);

  useEffect(() => {
    if (authLoading) return;

    setLoading(true);
    setError("");

    if (!isAuthenticated || !appUser?.id) {
      setError("User session is unavailable in the app. Please open this page after logging in.");
      setLoading(false);
      return;
    }

    const resolvedRole = appRole || appUser?.role || ROLE_FALLBACK;
    const linkedIds = Array.isArray(appUser?.linkedWardIds) ? appUser.linkedWardIds : [];
    const resolvedWardId = (resolvedRole === "guardian" || isManagerMode) ? linkedIds[0] || "nb-user-088" : appUser.id;

    setCurrentUser(appUser);
    setRole(resolvedRole);
    setTargetWardId(resolvedWardId);
    setLoading(false);
  }, [authLoading, isAuthenticated, appUser?.id, appRole, isManagerMode]);

  useEffect(() => {
    if (!targetWardId || !currentUser) return;

    setLoading(true);
    const builtInStories = getBuiltInStories(currentUser.name);

    const tasksByWard = loadWardTasks([targetWardId]);
    const wardTaskList = tasksByWard[targetWardId] || [];
    setRoutines(wardTaskList.map((task) => toAsdRoutineTask(task, targetWardId)));

    setSensoryProfile(
      readJson(`${ASD_PROFILE_PREFIX}${targetWardId}`, {
        user_id: targetWardId,
        sound_threshold: 60,
        light_threshold: 60,
        crowd_threshold: 50,
        notes: "Local ASD profile",
      }),
    );

    const customStories = readJson(`${ASD_STORIES_PREFIX}${targetWardId}`, []);
    setStories([...builtInStories, ...customStories]);
    setMeltdownLogs(readJson(`${ASD_MELTDOWN_PREFIX}${targetWardId}`, []));

    setLoading(false);
  }, [targetWardId, currentUser?.id, currentUser?.name]);

  useEffect(() => {
    if (!targetWardId) return;

    const refresh = () => {
      const tasksByWard = loadWardTasks([targetWardId]);
      const wardTaskList = tasksByWard[targetWardId] || [];
      setRoutines(wardTaskList.map((task) => toAsdRoutineTask(task, targetWardId)));
      setSensoryProfile(readJson(`${ASD_PROFILE_PREFIX}${targetWardId}`, sensoryProfile || null));
      const builtInStories = getBuiltInStories(currentUser?.name || "the child");
      const customStories = readJson(`${ASD_STORIES_PREFIX}${targetWardId}`, []);
      setStories([...builtInStories, ...customStories]);
      setMeltdownLogs(readJson(`${ASD_MELTDOWN_PREFIX}${targetWardId}`, []));
    };

    const timer = setInterval(refresh, 2500);
    window.addEventListener("storage", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("storage", refresh);
    };
  }, [targetWardId, currentUser?.name, sensoryProfile]);

  const persistRoutines = (nextRoutines) => {
    if (!targetWardId) return;
    const tasksByWard = loadWardTasks();
    tasksByWard[targetWardId] = nextRoutines.map(fromAsdRoutineTask);
    saveWardTasks(tasksByWard);
  };

  const addRoutineTask = ({ title, timeLabel }) => {
    if (!canEditRoutine || !targetWardId) return;

    const next = [
      ...routines,
      {
        id: `local-${Date.now()}`,
        user_id: targetWardId,
        title,
        time_label: timeLabel || null,
        is_completed: false,
      },
    ];

    setRoutines(next);
    persistRoutines(next);
    pushWardActivity(targetWardId, { event: `Routine added: ${title}`, type: "neutral" });
  };

  const toggleTaskCompletion = (task) => {
    const next = routines.map((item) =>
      item.id === task.id ? { ...item, is_completed: !item.is_completed } : item,
    );
    setRoutines(next);
    persistRoutines(next);
    if (targetWardId && !task.is_completed) {
      pushWardActivity(targetWardId, { event: `${task.title} marked complete`, type: "positive" });
    }
  };

  const editRoutineTask = (task, patch) => {
    if (!canEditRoutine) return;
    const next = routines.map((item) =>
      item.id === task.id
        ? {
            ...item,
            title: patch?.title ?? item.title,
            time_label: patch?.time_label ?? item.time_label,
          }
        : item,
    );
    setRoutines(next);
    persistRoutines(next);
    if (targetWardId) {
      pushWardActivity(targetWardId, {
        event: `Routine updated: ${patch?.title || task.title}`,
        type: "neutral",
      });
    }
  };

  const deleteRoutineTask = (task) => {
    if (!canEditRoutine || !task?.id) return;
    const next = routines.filter((item) => item.id !== task.id);
    setRoutines(next);
    persistRoutines(next);
    if (targetWardId) {
      pushWardActivity(targetWardId, {
        event: `Routine deleted: ${task.title}`,
        type: "neutral",
      });
    }
  };

  const saveThresholds = (payload) => {
    if (!canEditThresholds || !targetWardId) return;
    const next = { ...sensoryProfile, ...payload };
    setSensoryProfile(next);
    writeJson(`${ASD_PROFILE_PREFIX}${targetWardId}`, next);
  };

  const createStory = ({ title, content, steps }) => {
    if (!canManageStories || !targetWardId) return;

    const normalizedSteps = Array.isArray(steps)
      ? steps.filter((step) => typeof step?.text === "string" && step.text.trim())
      : [];

    const customStories = readJson(`${ASD_STORIES_PREFIX}${targetWardId}`, []);
    const nextCustom = [
      {
        id: `local-story-${Date.now()}`,
        user_id: targetWardId,
        title,
        content: content || normalizedSteps[0]?.text || "",
        steps: normalizedSteps,
        is_builtin: false,
      },
      ...customStories,
    ];

    writeJson(`${ASD_STORIES_PREFIX}${targetWardId}`, nextCustom);
    setStories([...getBuiltInStories(currentUser?.name || "the child"), ...nextCustom]);
  };

  const updateStory = (storyId, patch) => {
    if (!canManageStories || !targetWardId) return;
    if (storyId.startsWith("builtin-")) {
      setError("Built-in stories are read-only. Create a new custom story to modify steps.");
      return;
    }

    const customStories = readJson(`${ASD_STORIES_PREFIX}${targetWardId}`, []);
    const nextCustom = customStories.map((item) => (item.id === storyId ? { ...item, ...patch } : item));
    writeJson(`${ASD_STORIES_PREFIX}${targetWardId}`, nextCustom);
    setStories([...getBuiltInStories(currentUser?.name || "the child"), ...nextCustom]);
  };

  const deleteStory = (storyId) => {
    if (!canManageStories || !targetWardId) return;
    if (storyId.startsWith("builtin-")) {
      setError("Built-in stories cannot be deleted.");
      return;
    }

    const customStories = readJson(`${ASD_STORIES_PREFIX}${targetWardId}`, []);
    const nextCustom = customStories.filter((item) => item.id !== storyId);
    writeJson(`${ASD_STORIES_PREFIX}${targetWardId}`, nextCustom);
    setStories([...getBuiltInStories(currentUser?.name || "the child"), ...nextCustom]);
  };

  const createMeltdownLog = (payload) => {
    if (!canUseCalmingTools || !targetWardId) return;

    const entry = {
      id: `local-log-${Date.now()}`,
      user_id: targetWardId,
      created_at: new Date().toISOString(),
      ...payload,
    };

    const next = [entry, ...meltdownLogs];
    setMeltdownLogs(next);
    writeJson(`${ASD_MELTDOWN_PREFIX}${targetWardId}`, next);

    pushWardAlert(targetWardId, {
      level: payload?.risk_level === "high" ? "high" : "medium",
      message: payload?.notes || "Coping mode activated",
    });
  };

  const roleBadge = useMemo(() => (isManagerMode ? "GUARDIAN" : role.toUpperCase()), [role, isManagerMode]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Link to="/" className="neuro-btn-ghost text-sm gap-2 inline-flex min-h-0 py-2 px-3">
          <ArrowLeft size={16} /> Back to Modes
        </Link>
        <Badge variant="secondary" className="gap-1"><Shield size={14} /> Role: {roleBadge}</Badge>
        <Badge variant="outline">Local Shared Sync</Badge>
      </div>

      {isManagerMode && wardOptions.length > 0 && (
        <Card>
          <CardContent className="pt-5 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Viewing child:</span>
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={targetWardId || ""}
              onChange={(event) => setTargetWardId(event.target.value)}
            >
              {wardOptions.map((ward) => (
                <option key={ward.id} value={ward.id}>{ward.name}</option>
              ))}
            </select>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">ASD Support Module</CardTitle>
          <CardDescription>
            Current layout preserved with integrated guardian-child local synchronization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-muted-foreground">Loading ASD module...</p>}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!loading && isManagerMode && (
            <Alert>
              <AlertDescription>
                Guardian task manager is enabled. You can Add, Edit, and Delete tasks in the Routine tab.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {!isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><Heart size={18} /> Emotional Check-in</CardTitle>
            <CardDescription>
              Quick emotional card for Riya to self-identify and trigger coping support when needed.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {["Calm", "Worried", "Overwhelmed", "Upset"].map((emotion) => (
              <Button
                key={emotion}
                variant={emotionCheckin === emotion ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setEmotionCheckin(emotion);
                  if (emotion === "Overwhelmed" || emotion === "Upset") {
                    createMeltdownLog({
                      event_type: "emotional-checkin",
                      notes: `Emotion selected: ${emotion}`,
                      risk_level: emotion === "Overwhelmed" ? "high" : "moderate",
                    });
                    setActiveTab("meltdown");
                  }
                }}
              >
                {emotion}
              </Button>
            ))}
            <Badge variant="secondary">Current: {emotionCheckin}</Badge>
          </CardContent>
        </Card>
      )}

      {isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users size={18} /> Admin View</CardTitle>
            <CardDescription>
              Admin controls are read-only in local shared sync mode.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Guardian-user ASD data sharing is active via local synchronized storage.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-1 p-1">
            <TabsTrigger value="routine">Routine</TabsTrigger>
            <TabsTrigger value="sensory">Sensory</TabsTrigger>
            <TabsTrigger value="stories">Stories</TabsTrigger>
            <TabsTrigger value="meltdown">Meltdown</TabsTrigger>
          </TabsList>

          <TabsContent value="routine">
            <RoutineVisualizer
              role={role}
              canManageRoutine={canEditRoutine}
              routines={routines}
              loading={loading}
              onAddTask={addRoutineTask}
              onToggleTask={toggleTaskCompletion}
              onEditTask={editRoutineTask}
              onDeleteTask={deleteRoutineTask}
            />
          </TabsContent>

          <TabsContent value="sensory">
            <SensoryMonitor
              role={role}
              profile={sensoryProfile}
              loading={loading}
              onSaveThresholds={saveThresholds}
            />
          </TabsContent>

          <TabsContent value="stories">
            <SocialStoryBuilder
              role={role}
              stories={stories}
              loading={loading}
              onCreateStory={createStory}
              onUpdateStory={updateStory}
              onDeleteStory={deleteStory}
            />
          </TabsContent>

          <TabsContent value="meltdown">
            <MeltdownPrevention
              role={role}
              routines={routines}
              sensoryProfile={sensoryProfile}
              meltdownLogs={canViewMeltdownLogs ? meltdownLogs : []}
              onCreateMeltdownLog={createMeltdownLog}
            />
          </TabsContent>
        </Tabs>
      )}

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Neha-Riya ASD integration is enabled in local shared sync mode.
        </AlertDescription>
      </Alert>
    </div>
  );
}
