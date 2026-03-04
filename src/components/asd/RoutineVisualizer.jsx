import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock3, Pencil, Plus, Trash2, X } from "lucide-react";

export default function RoutineVisualizer({
  role,
  canManageRoutine,
  routines,
  loading,
  onAddTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
}) {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingTime, setEditingTime] = useState("");

  const canEditRoutine = typeof canManageRoutine === "boolean" ? canManageRoutine : role === "guardian";
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
          View your routine timeline and mark progress. Task management is guardian-only.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">Completion {completion}%</Badge>
          <Badge variant="outline">{routines.length} tasks</Badge>
        </div>

        {canEditRoutine && (
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
                <div className="flex-1 min-w-0">
                  {editingTaskId === task.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input
                        value={editingTitle}
                        onChange={(event) => setEditingTitle(event.target.value)}
                        placeholder="Task name"
                      />
                      <Input
                        value={editingTime}
                        onChange={(event) => setEditingTime(event.target.value)}
                        placeholder="Time"
                      />
                    </div>
                  ) : (
                    <>
                      <p className={`font-medium ${task.is_completed ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{task.time_label || "No time set"}</p>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {canEditRoutine && editingTaskId === task.id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => {
                          const nextTitle = editingTitle.trim();
                          if (!nextTitle) return;
                          onEditTask?.(task, { title: nextTitle, time_label: editingTime.trim() || null });
                          setEditingTaskId(null);
                          setEditingTitle("");
                          setEditingTime("");
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingTaskId(null);
                          setEditingTitle("");
                          setEditingTime("");
                        }}
                      >
                        <X size={14} />
                      </Button>
                    </>
                  ) : (
                    <>
                      {canEditRoutine && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => {
                            setEditingTaskId(task.id);
                            setEditingTitle(task.title || "");
                            setEditingTime(task.time_label || "");
                          }}
                        >
                          <Pencil size={14} /> Edit
                        </Button>
                      )}
                      {canEditRoutine && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => onDeleteTask?.(task)}
                        >
                          <Trash2 size={14} /> Delete
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant={task.is_completed ? "secondary" : "outline"}
                        className="gap-1"
                        onClick={() => onToggleTask(task)}
                      >
                        <CheckCircle2 size={14} />
                        {task.is_completed ? "Completed" : "Mark Complete"}
                      </Button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
