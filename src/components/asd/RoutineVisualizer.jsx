import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock3, Pencil, Plus, Save, Trash2, X } from "lucide-react";

export default function RoutineVisualizer({
  role,
  routines,
  loading,
  onAddTask,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  scheduleSettings,
  alertSettings,
  onSaveScheduleAndAlerts,
}) {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingTime, setEditingTime] = useState("");
  const [scheduleDraft, setScheduleDraft] = useState(scheduleSettings || {});
  const [alertDraft, setAlertDraft] = useState(alertSettings || {});

  const canEditRoutine = role === "guardian";

  useEffect(() => {
    setScheduleDraft(scheduleSettings || {});
  }, [scheduleSettings]);

  useEffect(() => {
    setAlertDraft(alertSettings || {});
  }, [alertSettings]);

  const completion = useMemo(() => {
    if (!routines.length) {
      return 0;
    }
    const done = routines.filter((task) => task.is_completed).length;
    return Math.round((done / routines.length) * 100);
  }, [routines]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock3 size={18} /> Routine Visualizer
        </CardTitle>
        <CardDescription>
          View your routine timeline and mark progress. Guardians can add tasks.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">Completion {completion}%</Badge>
          <Badge variant="outline">{routines.length} tasks</Badge>
        </div>

        {canEditRoutine && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                placeholder="Task name"
                value={taskTitle}
                onChange={(event) => setTaskTitle(event.target.value)}
              />
              <Input
                placeholder="Time (e.g., 08:30)"
                value={taskTime}
                onChange={(event) => setTaskTime(event.target.value)}
              />
              <Button
                className="gap-2"
                onClick={() => {
                  const title = taskTitle.trim();
                  if (!title) {
                    return;
                  }
                  onAddTask({ title, timeLabel: taskTime.trim() });
                  setTaskTitle("");
                  setTaskTime("");
                }}
              >
                <Plus size={16} /> Add Task
              </Button>
            </div>

            <div className="rounded-xl border p-3 bg-background/40 space-y-3">
              <p className="text-sm font-medium">Schedule & Alert Settings (Guardian)</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  type="time"
                  value={scheduleDraft.morning_start || "07:00"}
                  onChange={(event) =>
                    setScheduleDraft((prev) => ({ ...prev, morning_start: event.target.value }))
                  }
                />
                <Input
                  type="time"
                  value={scheduleDraft.sensory_break || "10:30"}
                  onChange={(event) =>
                    setScheduleDraft((prev) => ({ ...prev, sensory_break: event.target.value }))
                  }
                />
                <Input
                  type="time"
                  value={scheduleDraft.evening_winddown || "18:30"}
                  onChange={(event) =>
                    setScheduleDraft((prev) => ({ ...prev, evening_winddown: event.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  type="number"
                  min={0}
                  max={40}
                  value={alertDraft.baseline_risk ?? 10}
                  onChange={(event) =>
                    setAlertDraft((prev) => ({
                      ...prev,
                      baseline_risk: Math.max(0, Math.min(40, Number(event.target.value) || 10)),
                    }))
                  }
                  placeholder="Baseline risk"
                />
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={alertDraft.task_risk_weight ?? 5}
                  onChange={(event) =>
                    setAlertDraft((prev) => ({
                      ...prev,
                      task_risk_weight: Math.max(1, Math.min(12, Number(event.target.value) || 5)),
                    }))
                  }
                  placeholder="Task risk weight"
                />
                <Input
                  type="number"
                  min={10}
                  max={60}
                  value={alertDraft.task_risk_cap ?? 40}
                  onChange={(event) =>
                    setAlertDraft((prev) => ({
                      ...prev,
                      task_risk_cap: Math.max(10, Math.min(60, Number(event.target.value) || 40)),
                    }))
                  }
                  placeholder="Task risk cap"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input
                  type="number"
                  min={30}
                  max={90}
                  value={alertDraft.sensory_caution_threshold ?? 60}
                  onChange={(event) =>
                    setAlertDraft((prev) => ({
                      ...prev,
                      sensory_caution_threshold: Math.max(30, Math.min(90, Number(event.target.value) || 60)),
                    }))
                  }
                  placeholder="Sensory caution threshold"
                />
                <Input
                  type="number"
                  min={40}
                  max={100}
                  value={alertDraft.sensory_high_threshold ?? 70}
                  onChange={(event) =>
                    setAlertDraft((prev) => ({
                      ...prev,
                      sensory_high_threshold: Math.max(40, Math.min(100, Number(event.target.value) || 70)),
                    }))
                  }
                  placeholder="Sensory high threshold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input
                  type="number"
                  min={0}
                  max={40}
                  value={alertDraft.sensory_caution_bonus ?? 12}
                  onChange={(event) =>
                    setAlertDraft((prev) => ({
                      ...prev,
                      sensory_caution_bonus: Math.max(0, Math.min(40, Number(event.target.value) || 12)),
                    }))
                  }
                  placeholder="Caution bonus"
                />
                <Input
                  type="number"
                  min={0}
                  max={50}
                  value={alertDraft.sensory_high_bonus ?? 25}
                  onChange={(event) =>
                    setAlertDraft((prev) => ({
                      ...prev,
                      sensory_high_bonus: Math.max(0, Math.min(50, Number(event.target.value) || 25)),
                    }))
                  }
                  placeholder="High bonus"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  type="number"
                  min={15}
                  max={240}
                  value={alertDraft.reminder_minutes ?? 45}
                  onChange={(event) =>
                    setAlertDraft((prev) => ({
                      ...prev,
                      reminder_minutes: Math.max(15, Math.min(240, Number(event.target.value) || 45)),
                    }))
                  }
                  placeholder="Reminder interval (mins)"
                />
                <Input
                  type="number"
                  min={20}
                  max={95}
                  value={alertDraft.meltdown_risk_threshold ?? 65}
                  onChange={(event) =>
                    setAlertDraft((prev) => ({
                      ...prev,
                      meltdown_risk_threshold: Math.max(20, Math.min(95, Number(event.target.value) || 65)),
                    }))
                  }
                  placeholder="Risk alert threshold"
                />
                <div className="rounded-md border px-3 py-2 text-sm bg-background/60 flex items-center justify-between">
                  <span>Alerts enabled</span>
                  <input
                    type="checkbox"
                    checked={Boolean(alertDraft.alerts_enabled)}
                    onChange={(event) =>
                      setAlertDraft((prev) => ({ ...prev, alerts_enabled: event.target.checked }))
                    }
                  />
                </div>
              </div>

              <Button
                onClick={() =>
                  onSaveScheduleAndAlerts({
                    schedule: {
                      morning_start: scheduleDraft.morning_start || "07:00",
                      sensory_break: scheduleDraft.sensory_break || "10:30",
                      evening_winddown: scheduleDraft.evening_winddown || "18:30",
                    },
                    alerts: {
                      reminder_minutes: Number(alertDraft.reminder_minutes) || 45,
                      meltdown_risk_threshold: Number(alertDraft.meltdown_risk_threshold) || 65,
                      alerts_enabled: Boolean(alertDraft.alerts_enabled),
                      baseline_risk: Number(alertDraft.baseline_risk) || 10,
                      task_risk_weight: Number(alertDraft.task_risk_weight) || 5,
                      task_risk_cap: Number(alertDraft.task_risk_cap) || 40,
                      sensory_caution_threshold: Number(alertDraft.sensory_caution_threshold) || 60,
                      sensory_high_threshold: Number(alertDraft.sensory_high_threshold) || 70,
                      sensory_caution_bonus: Number(alertDraft.sensory_caution_bonus) || 12,
                      sensory_high_bonus: Number(alertDraft.sensory_high_bonus) || 25,
                    },
                  })
                }
              >
                Save Schedule & Alerts
              </Button>
            </div>
          </div>
        )}

        {!canEditRoutine && (
          <div className="rounded-xl border p-3 bg-background/40 space-y-2">
            <p className="text-sm font-medium">Current schedule and alerts</p>
            <p className="text-sm text-muted-foreground">
              Morning {scheduleSettings?.morning_start || "07:00"} · Break {scheduleSettings?.sensory_break || "10:30"} · Wind-down {scheduleSettings?.evening_winddown || "18:30"}
            </p>
            <p className="text-sm text-muted-foreground">
              Alerts {alertSettings?.alerts_enabled ? "On" : "Off"} · Every {alertSettings?.reminder_minutes ?? 45} mins · Risk threshold {alertSettings?.meltdown_risk_threshold ?? 65}
            </p>
            <p className="text-sm text-muted-foreground">
              Model baseline {alertSettings?.baseline_risk ?? 10} · task weight {alertSettings?.task_risk_weight ?? 5} · sensory high {alertSettings?.sensory_high_threshold ?? 70}
            </p>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading routine...</p>
        ) : (
          <div className="space-y-2">
            {routines.length === 0 && <p className="text-sm text-muted-foreground">No routine tasks yet.</p>}
            {routines.map((task) => (
              <article
                key={task.id}
                className="rounded-xl border p-3 bg-background/40 flex items-center justify-between gap-3"
              >
                {editingId === task.id ? (
                  <div className="w-full space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input
                        value={editingTitle}
                        onChange={(event) => setEditingTitle(event.target.value)}
                        placeholder="Task name"
                      />
                      <Input
                        value={editingTime}
                        onChange={(event) => setEditingTime(event.target.value)}
                        placeholder="Time (e.g., 08:30)"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="gap-1"
                        onClick={() => {
                          const nextTitle = editingTitle.trim();
                          if (!nextTitle) {
                            return;
                          }
                          onUpdateTask(task, {
                            title: nextTitle,
                            timeLabel: editingTime.trim(),
                          });
                          setEditingId(null);
                          setEditingTitle("");
                          setEditingTime("");
                        }}
                      >
                        <Save size={14} /> Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => {
                          setEditingId(null);
                          setEditingTitle("");
                          setEditingTime("");
                        }}
                      >
                        <X size={14} /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className={`font-medium ${task.is_completed ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{task.time_label || "No time set"}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <Button
                        size="sm"
                        variant={task.is_completed ? "secondary" : "outline"}
                        className="gap-1"
                        onClick={() => onToggleTask(task)}
                      >
                        <CheckCircle2 size={14} />
                        {task.is_completed ? "Completed" : "Mark Complete"}
                      </Button>

                      {canEditRoutine && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => {
                              setEditingId(task.id);
                              setEditingTitle(task.title || "");
                              setEditingTime(task.time_label || "");
                            }}
                          >
                            <Pencil size={14} /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1"
                            onClick={() => onDeleteTask(task)}
                          >
                            <Trash2 size={14} /> Remove
                          </Button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
