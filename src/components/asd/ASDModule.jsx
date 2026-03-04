import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Bell, BookOpen, Shield, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import {
  fromAsdRoutineTask,
  loadTaskNotifications,
  loadWardTasks,
  markAllTaskNotificationsRead,
  saveWardTasks,
  toAsdRoutineTask,
} from "@/lib/wardTaskStore";
import { loadWardNotes, pushWardActivity, pushWardAlert } from "@/lib/careSyncStore";
import { MOCK_WARD_ACTIVITY } from "@/context/AuthContext";
import RoutineVisualizer from "./RoutineVisualizer";
import SensoryMonitor from "./SensoryMonitor";
import SocialStoryBuilder from "./SocialStoryBuilder";
import MeltdownPrevention from "./MeltdownPrevention";

const ROLE_FALLBACK = "user";

const LOCAL_DEFAULT_SCHEDULE = {
  morning_start: "07:00",
  sensory_break: "10:30",
  evening_winddown: "18:30",
};

const LOCAL_DEFAULT_ALERTS = {
  alerts_enabled: true,
  reminder_minutes: 45,
  meltdown_risk_threshold: 65,
};

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
    id: "builtin-doctor-visit",
    user_id: "builtin",
    title: "Doctor Visit Routine",
    steps: [
      createStep("doctor-1", "🩺 First, we arrive and check in at reception."),
      createStep("doctor-2", "🪑 Then, we wait in the waiting area."),
      createStep("doctor-3", "🗣️ When called, I walk in with my support person."),
      createStep("doctor-4", "🌿 If I feel overloaded, I ask for a short break."),
      createStep("doctor-5", "✅ After the visit, I choose a comfort activity."),
    ],
    content: "🩺 First, we arrive and check in at reception.",
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
      createStep("change-5", "💪 Continue with one small next step."),
    ],
    content: "⚠️ Plans changed. Pause and take one breath.",
    is_builtin: true,
  },
  {
    id: "builtin-grocery-store",
    user_id: "builtin",
    title: "Grocery Store Success Steps",
    steps: [
      createStep("store-1", "🛒 Enter store and hold the shopping list."),
      createStep("store-2", "🥦 Complete one aisle at a time."),
      createStep("store-3", "🌿 If overwhelmed, pause in a quiet aisle and breathe."),
      createStep("store-4", "✅ Check off finished items on the list."),
      createStep("store-5", "🎉 Finishing even part of the list is success."),
    ],
    content: "🛒 Enter store and hold the shopping list.",
    is_builtin: true,
  },
  {
    id: "builtin-assembly-day",
    user_id: "builtin",
    title: "Assembly Day Plan",
    steps: [
      createStep("assembly-1", "🎒 Check bag and water bottle before leaving class."),
      createStep("assembly-2", "👫 Walk with class in a calm line."),
      createStep("assembly-3", "🎧 Use headphones if sound is too loud."),
      createStep("assembly-4", "🌿 Take three slow breaths if crowded feelings rise."),
      createStep("assembly-5", "✅ Return to class and note one thing that went well."),
    ],
    content: "🎒 Check bag and water bottle before leaving class.",
    is_builtin: true,
  },
  {
    id: "builtin-birthday-party",
    user_id: "builtin",
    title: "Birthday Party Steps",
    steps: [
      createStep("party-1", "🎁 Enter with support person and say hello."),
      createStep("party-2", "👀 Find a quiet spot option before joining activities."),
      createStep("party-3", "🎂 Join one activity at a time."),
      createStep("party-4", "🌿 Take a break if noise or lights feel strong."),
      createStep("party-5", "👋 Say goodbye and celebrate trying your best."),
    ],
    content: "🎁 Enter with support person and say hello.",
    is_builtin: true,
  },
  {
    id: "builtin-fire-drill",
    user_id: "builtin",
    title: "Unexpected Fire Drill",
    steps: [
      createStep("drill-1", "🚨 Hear alarm and pause with one deep breath."),
      createStep("drill-2", "👂 Cover ears or use supports if needed."),
      createStep("drill-3", "🚶 Follow teacher directions step by step."),
      createStep("drill-4", "🌿 At safe point, breathe slowly until calm."),
      createStep("drill-5", "✅ Return to class and restart with one easy task."),
    ],
    content: "🚨 Hear alarm and pause with one deep breath.",
    is_builtin: true,
  },
];

export default function ASDModule() {
  const { user: appUser, role: appRole, isAuthenticated, isLoading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(ROLE_FALLBACK);

  const [routines, setRoutines] = useState([]);
  const [sensoryProfile, setSensoryProfile] = useState(null);
  const [stories, setStories] = useState([]);
  const [meltdownLogs, setMeltdownLogs] = useState([]);
  const [scheduleSettings, setScheduleSettings] = useState(LOCAL_DEFAULT_SCHEDULE);
  const [alertSettings, setAlertSettings] = useState(LOCAL_DEFAULT_ALERTS);
  const [taskNotifications, setTaskNotifications] = useState([]);
  const [guardianNotes, setGuardianNotes] = useState([]);

  const canEditRoutine = role === "guardian";
  const canEditThresholds = role === "guardian";
  const canManageStories = role === "guardian";
  const canViewMeltdownLogs = role === "guardian";
  const canUseCalmingTools = role === "user" || role === "guardian";
  const isAdmin = role === "admin";

  useEffect(() => {
    if (authLoading) {
      return;
    }

    setLoading(true);
    setError("");

    if (!isAuthenticated || !appUser?.id) {
      setError("User session is unavailable in the app. Please open this page after logging in.");
      setLoading(false);
      return;
    }

    setCurrentUser(appUser);
    setRole(appRole || ROLE_FALLBACK);

    const builtInStories = getBuiltInStories(appUser.name);
    const tasksByWard = loadWardTasks([appUser.id]);
    const wardTaskList = tasksByWard[appUser.id] || [];
    setRoutines(wardTaskList.map((task) => toAsdRoutineTask(task, appUser.id)));
    setSensoryProfile({
      user_id: appUser.id,
      sound_threshold: 60,
      light_threshold: 60,
      crowd_threshold: 50,
      notes: "Local ASD profile",
    });
    setStories(builtInStories);
    setMeltdownLogs([]);
    setScheduleSettings(LOCAL_DEFAULT_SCHEDULE);
    setAlertSettings(LOCAL_DEFAULT_ALERTS);
    setTaskNotifications(loadTaskNotifications(appUser.id));
    setGuardianNotes(
      loadWardNotes(appUser.id, MOCK_WARD_ACTIVITY[appUser.id]?.journalNotes || []).filter(
        (note) => note.from === "guardian",
      ),
    );

    setLoading(false);
  }, [authLoading, isAuthenticated, appUser?.id, appUser?.name, appRole]);

  useEffect(() => {
    if (!currentUser?.id) {
      return;
    }

    const tasksByWard = loadWardTasks();
    tasksByWard[currentUser.id] = routines.map(fromAsdRoutineTask);
    saveWardTasks(tasksByWard);
  }, [currentUser?.id, routines]);

  useEffect(() => {
    if (!currentUser?.id) {
      return;
    }

    const syncNotifications = () => {
      setTaskNotifications(loadTaskNotifications(currentUser.id));
      setGuardianNotes(
        loadWardNotes(currentUser.id, MOCK_WARD_ACTIVITY[currentUser.id]?.journalNotes || []).filter(
          (note) => note.from === "guardian",
        ),
      );
    };

    syncNotifications();
    const timer = setInterval(syncNotifications, 2000);
    window.addEventListener("storage", syncNotifications);

    return () => {
      clearInterval(timer);
      window.removeEventListener("storage", syncNotifications);
    };
  }, [currentUser?.id]);

  const addRoutineTask = ({ title, timeLabel }) => {
    if (!canEditRoutine || !currentUser) {
      return;
    }

    setRoutines((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        user_id: currentUser.id,
        title,
        time_label: timeLabel || null,
        is_completed: false,
      },
    ]);
  };

  const toggleTaskCompletion = (task) => {
    setRoutines((prev) => prev.map((item) => (item.id === task.id ? { ...item, is_completed: !item.is_completed } : item)));
    if (currentUser?.id) {
      pushWardActivity(currentUser.id, {
        event: `${task.title} marked ${task.is_completed ? "pending" : "complete"}.`,
        type: task.is_completed ? "neutral" : "positive",
      });
    }
  };

  const updateRoutineTask = (task, { title, timeLabel }) => {
    if (!canEditRoutine || !currentUser) {
      return;
    }

    const nextTitle = (title || "").trim();
    if (!nextTitle) {
      return;
    }

    setRoutines((prev) =>
      prev.map((item) =>
        item.id === task.id
          ? {
              ...item,
              title: nextTitle,
              time_label: (timeLabel || "").trim() || null,
            }
          : item,
      ),
    );
  };

  const deleteRoutineTask = (task) => {
    if (!canEditRoutine || !currentUser) {
      return;
    }

    setRoutines((prev) => prev.filter((item) => item.id !== task.id));
  };

  const saveScheduleAndAlerts = ({ schedule, alerts }) => {
    if (!canEditRoutine || !currentUser) {
      return;
    }

    setScheduleSettings((prev) => ({ ...prev, ...(schedule || {}) }));
    setAlertSettings((prev) => ({ ...prev, ...(alerts || {}) }));
    pushWardActivity(currentUser.id, {
      event: "Guardian updated schedule and alert settings.",
      type: "neutral",
    });
  };

  const saveThresholds = (payload) => {
    if (!canEditThresholds || !currentUser) {
      return;
    }
    setSensoryProfile((prev) => ({ ...prev, ...payload }));
  };

  const createStory = ({ title, content, steps }) => {
    if (!canManageStories || !currentUser) {
      return;
    }

    const normalizedSteps = Array.isArray(steps)
      ? steps.filter((step) => typeof step?.text === "string" && step.text.trim())
      : [];

    const fallbackContent = content || normalizedSteps[0]?.text || "";

    setStories((prev) => [
      {
        id: `local-story-${Date.now()}`,
        user_id: currentUser.id,
        title,
        content: fallbackContent,
        steps: normalizedSteps,
        is_builtin: false,
      },
      ...prev,
    ]);
  };

  const updateStory = (storyId, patch) => {
    if (!canManageStories || !currentUser) {
      return;
    }

    if (storyId.startsWith("builtin-")) {
      setError("Built-in stories are read-only. Create a new custom story to modify steps.");
      return;
    }

    setStories((prev) => prev.map((item) => (item.id === storyId ? { ...item, ...patch } : item)));
  };

  const deleteStory = (storyId) => {
    if (!canManageStories || !currentUser) {
      return;
    }

    if (storyId.startsWith("builtin-")) {
      setError("Built-in stories cannot be deleted.");
      return;
    }

    setStories((prev) => prev.filter((item) => item.id !== storyId));
  };

  const createMeltdownLog = (payload) => {
    if (!canUseCalmingTools || !currentUser) {
      return;
    }

    setMeltdownLogs((prev) => [
      {
        id: `local-log-${Date.now()}`,
        user_id: currentUser.id,
        created_at: new Date().toISOString(),
        ...payload,
      },
      ...prev,
    ]);

    pushWardActivity(currentUser.id, {
      event: payload?.notes || "Meltdown prevention action logged.",
      type: payload?.risk_level === "high" ? "alert" : "neutral",
    });

    if (payload?.risk_level === "high") {
      pushWardAlert(currentUser.id, {
        level: "high",
        message: payload?.notes || "High-risk meltdown alert recorded.",
      });
    }
  };

  const roleBadge = useMemo(() => role.toUpperCase(), [role]);
  const unreadTaskNotifications = useMemo(
    () => taskNotifications.filter((item) => !item.read),
    [taskNotifications],
  );

  const markTaskAlertsRead = () => {
    if (!currentUser?.id) {
      return;
    }
    markAllTaskNotificationsRead(currentUser.id);
    setTaskNotifications(loadTaskNotifications(currentUser.id));
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Link to="/" className="neuro-btn-ghost text-sm gap-2 inline-flex min-h-0 py-2 px-3">
          <ArrowLeft size={16} /> Back to Modes
        </Link>
        <Badge variant="secondary" className="gap-1"><Shield size={14} /> Role: {roleBadge}</Badge>
        <Badge variant="outline">Local Mode (No Database)</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">ASD Support Module</CardTitle>
          <CardDescription>
            Modular ASD features running in local mode (database removed for now).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-muted-foreground">Loading ASD module...</p>}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {role === "user" && unreadTaskNotifications.length > 0 && (
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Guardian task change alerts ({unreadTaskNotifications.length})</p>
              <div className="space-y-1">
                {unreadTaskNotifications.slice(0, 3).map((item) => (
                  <p key={item.id} className="text-sm">
                    • {item.message}
                  </p>
                ))}
              </div>
              <Button size="sm" variant="outline" onClick={markTaskAlertsRead}>Mark all read</Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {role === "user" && guardianNotes.length > 0 && (
        <Alert>
          <BookOpen className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Shared Journal from Guardian</p>
              {guardianNotes.slice(0, 3).map((note) => (
                <p key={note.id} className="text-sm">• {note.text} <span className="text-muted-foreground">({note.ts})</span></p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users size={18} /> Admin View</CardTitle>
            <CardDescription>
              Database-linked admin controls are disabled in local mode.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Guardian-user linking and user-directory management are paused until database mode is re-enabled.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="routine" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-1 p-1">
            <TabsTrigger value="routine">Routine</TabsTrigger>
            <TabsTrigger value="sensory">Sensory</TabsTrigger>
            <TabsTrigger value="stories">Stories</TabsTrigger>
            <TabsTrigger value="meltdown">Meltdown</TabsTrigger>
          </TabsList>

          <TabsContent value="routine">
            <RoutineVisualizer
              role={role}
              routines={routines}
              loading={loading}
              onAddTask={addRoutineTask}
              onToggleTask={toggleTaskCompletion}
              onUpdateTask={updateRoutineTask}
              onDeleteTask={deleteRoutineTask}
              scheduleSettings={scheduleSettings}
              alertSettings={alertSettings}
              onSaveScheduleAndAlerts={saveScheduleAndAlerts}
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
              alertSettings={alertSettings}
            />
          </TabsContent>
        </Tabs>
      )}

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          ASD module is currently local-only. Reintroduce database syncing when backend policies and auth are ready.
        </AlertDescription>
      </Alert>
    </div>
  );
}
