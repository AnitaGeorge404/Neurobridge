import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Play,
  Plus,
  Repeat,
  Trash2,
  X,
} from "lucide-react";

const createEmptyStep = () => ({
  id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  text: "",
  image_url: "",
});

const inferEmojiForText = (text = "") => {
  const value = text.toLowerCase();
  if (/school|class|teacher|homework/.test(value)) return "🏫";
  if (/doctor|hospital|clinic|nurse/.test(value)) return "🩺";
  if (/store|grocery|shopping|market/.test(value)) return "🛒";
  if (/bus|car|ride|travel|road/.test(value)) return "🚌";
  if (/break|breathe|calm|quiet|rest/.test(value)) return "🌿";
  if (/eat|snack|lunch|breakfast|dinner/.test(value)) return "🍽️";
  if (/play|game|fun|recess/.test(value)) return "🎲";
  return "💡";
};

const normalizeStorySteps = (story) => {
  if (Array.isArray(story?.steps) && story.steps.length > 0) {
    return story.steps.map((step, index) => ({
      id: step.id || `${story.id}-step-${index + 1}`,
      text: typeof step.text === "string" ? step.text : "",
      image_url: typeof step.image_url === "string" ? step.image_url : "",
    }));
  }

  if (typeof story?.content === "string" && story.content.trim()) {
    return [
      {
        id: `${story.id}-legacy-content-step`,
        text: story.content,
        image_url: "",
      },
    ];
  }

  return [
    {
      id: `${story?.id || "draft"}-fallback-step`,
      text: "No step content available.",
      image_url: "",
    },
  ];
};

const normalizeStory = (story) => ({
  ...story,
  steps: normalizeStorySteps(story),
});

const buildStoryPayload = ({ title, steps }) => {
  const cleanedSteps = steps
    .map((step) => ({
      id: step.id || `step-${Date.now()}`,
      text: (step.text || "").trim(),
      image_url: (step.image_url || "").trim(),
    }))
    .filter((step) => step.text.length > 0);

  return {
    title: title.trim(),
    steps: cleanedSteps,
    content: cleanedSteps[0]?.text || "",
  };
};

const moveStep = (list, fromIndex, toIndex) => {
  if (toIndex < 0 || toIndex >= list.length) {
    return list;
  }
  const next = [...list];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

const buildTaskSteps = (taskText) => {
  const task = taskText.trim();
  if (!task) {
    return [];
  }

  return [
    {
      id: `step-${Date.now()}-1`,
      text: `First, I look at my plan for: ${task}.`,
      image_url: "",
    },
    {
      id: `step-${Date.now()}-2`,
      text: "Next, I take one small step and ask for help if needed.",
      image_url: "",
    },
    {
      id: `step-${Date.now()}-3`,
      text: "Then, I take a short calm break (3 breaths or quiet minute).",
      image_url: "",
    },
    {
      id: `step-${Date.now()}-4`,
      text: "After that, I finish the next step at my own pace.",
      image_url: "",
    },
    {
      id: `step-${Date.now()}-5`,
      text: "Finally, I celebrate progress, even if it is not perfect.",
      image_url: "",
    },
  ];
};

export default function SocialStoryBuilder({ role, stories, loading, onCreateStory, onUpdateStory, onDeleteStory }) {
  const canManageStories = role === "guardian";
  const normalizedStories = useMemo(() => stories.map(normalizeStory), [stories]);

  const [draftTitle, setDraftTitle] = useState("");
  const [draftSteps, setDraftSteps] = useState([createEmptyStep()]);
  const [taskBreakdownInput, setTaskBreakdownInput] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingSteps, setEditingSteps] = useState([]);

  const [activeStoryId, setActiveStoryId] = useState(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);
  const [autoPlaySeconds, setAutoPlaySeconds] = useState(5);

  const activeStory = useMemo(
    () => normalizedStories.find((story) => story.id === activeStoryId) || null,
    [normalizedStories, activeStoryId],
  );

  const activeSteps = activeStory?.steps || [];
  const activeStep = activeSteps[activeStepIndex] || null;

  useEffect(() => {
    if (!autoPlayEnabled || !activeStory || activeSteps.length === 0) {
      return;
    }

    if (activeStepIndex >= activeSteps.length - 1) {
      return;
    }

    const wait = Math.max(2, Number(autoPlaySeconds) || 5) * 1000;
    const id = setTimeout(() => {
      setActiveStepIndex((previous) => Math.min(previous + 1, activeSteps.length - 1));
    }, wait);

    return () => clearTimeout(id);
  }, [autoPlayEnabled, autoPlaySeconds, activeStory, activeStepIndex, activeSteps.length]);

  const updateDraftStep = (index, patch) => {
    setDraftSteps((previous) => previous.map((step, i) => (i === index ? { ...step, ...patch } : step)));
  };

  const updateEditingStep = (index, patch) => {
    setEditingSteps((previous) => previous.map((step, i) => (i === index ? { ...step, ...patch } : step)));
  };

  const startStory = (storyId) => {
    setActiveStoryId(storyId);
    setActiveStepIndex(0);
  };

  const exitStory = () => {
    setActiveStoryId(null);
    setActiveStepIndex(0);
    setAutoPlayEnabled(false);
  };

  const replayStory = () => {
    setActiveStepIndex(0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><BookOpen size={18} /> Social Story Builder</CardTitle>
        <CardDescription>
          Multiple visual cards for each single task, with emoji context and interactive story playback.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {activeStory && activeStep && (
          <div className="rounded-xl border p-4 bg-background/50 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <p className="font-semibold text-lg">{activeStory.title}</p>
                <p className="text-sm text-muted-foreground">Step {activeStepIndex + 1} of {activeSteps.length}</p>
              </div>
              <Badge variant="secondary">Flashcard Mode</Badge>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeStory.id}-${activeStep.id}-${activeStepIndex}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl border bg-card p-5 space-y-4"
              >
                {activeStep.image_url ? (
                  <img
                    src={activeStep.image_url}
                    alt={`Story step ${activeStepIndex + 1}`}
                    className="w-full max-h-72 object-cover rounded-lg border"
                  />
                ) : (
                  <div className="w-full h-40 rounded-lg border bg-muted/30 flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                    <div className="text-5xl" aria-hidden="true">{inferEmojiForText(activeStep.text)}</div>
                  </div>
                )}

                <p className="text-xl md:text-2xl leading-relaxed font-medium tracking-wide">
                  <span className="mr-2" aria-hidden="true">{inferEmojiForText(activeStep.text)}</span>
                  {activeStep.text}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {activeSteps.map((step, index) => {
                const isCurrent = index === activeStepIndex;
                return (
                  <button
                    key={step.id}
                    className={`min-w-28 rounded-lg border px-3 py-2 text-left transition ${
                      isCurrent ? "border-primary bg-primary/10" : "bg-background/60"
                    }`}
                    onClick={() => setActiveStepIndex(index)}
                  >
                    <p className="text-sm">{inferEmojiForText(step.text)} Step {index + 1}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{step.text}</p>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button variant="outline" className="gap-1" disabled={activeStepIndex === 0} onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}>
                <ChevronLeft size={14} /> Previous
              </Button>
              <Button variant="outline" className="gap-1" disabled={activeStepIndex >= activeSteps.length - 1} onClick={() => setActiveStepIndex((prev) => Math.min(activeSteps.length - 1, prev + 1))}>
                Next <ChevronRight size={14} />
              </Button>
              <Button variant="outline" className="gap-1" onClick={replayStory}>
                <Repeat size={14} /> Replay
              </Button>
              <Button variant="destructive" className="gap-1" onClick={exitStory}>
                <X size={14} /> Exit
              </Button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button variant={autoPlayEnabled ? "default" : "outline"} size="sm" className="gap-1" onClick={() => setAutoPlayEnabled((value) => !value)}>
                <Play size={14} /> {autoPlayEnabled ? "Auto-play On" : "Auto-play Off"}
              </Button>
              <Input
                type="number"
                min={2}
                max={20}
                value={autoPlaySeconds}
                onChange={(event) => setAutoPlaySeconds(Math.max(2, Math.min(20, Number(event.target.value) || 5)))}
                className="w-28"
              />
              <p className="text-xs text-muted-foreground">seconds per step</p>
            </div>
          </div>
        )}

        {canManageStories && (
          <div className="rounded-xl border p-3 bg-background/40 space-y-2">
            <div className="rounded-lg border p-2 bg-background/60 space-y-2">
              <p className="text-sm font-medium">Break One Task Into Multiple Story Cards</p>
              <div className="flex gap-2 flex-wrap">
                <Input
                  placeholder="Example: Going to school on Monday"
                  value={taskBreakdownInput}
                  onChange={(event) => setTaskBreakdownInput(event.target.value)}
                  className="flex-1 min-w-52"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    const generated = buildTaskSteps(taskBreakdownInput);
                    if (!generated.length) {
                      return;
                    }
                    if (!draftTitle.trim()) {
                      setDraftTitle(taskBreakdownInput.trim());
                    }
                    setDraftSteps(generated);
                  }}
                >
                  Auto Create Cards
                </Button>
              </div>
            </div>

            <Input placeholder="Story title" value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} />

            <div className="space-y-2">
              {draftSteps.map((step, index) => (
                <div key={step.id} className="rounded-lg border p-2 space-y-2 bg-background/50">
                  <p className="text-xs text-muted-foreground">Card {index + 1} {inferEmojiForText(step.text)}</p>
                  <Textarea placeholder="Step text" value={step.text} onChange={(event) => updateDraftStep(index, { text: event.target.value })} />
                  <Input placeholder="Image URL (optional)" value={step.image_url} onChange={(event) => updateDraftStep(index, { image_url: event.target.value })} />
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" disabled={index === 0} onClick={() => setDraftSteps((previous) => moveStep(previous, index, index - 1))}>Move Up</Button>
                    <Button size="sm" variant="outline" disabled={index === draftSteps.length - 1} onClick={() => setDraftSteps((previous) => moveStep(previous, index, index + 1))}>Move Down</Button>
                    <Button size="sm" variant="destructive" disabled={draftSteps.length <= 1} onClick={() => setDraftSteps((previous) => previous.filter((_, i) => i !== index))}>Remove Card</Button>
                  </div>
                </div>
              ))}
            </div>

            <Button size="sm" variant="outline" onClick={() => setDraftSteps((prev) => [...prev, createEmptyStep()])}>
              Add Card
            </Button>

            <Button
              className="gap-2"
              onClick={() => {
                const payload = buildStoryPayload({ title: draftTitle, steps: draftSteps });
                if (!payload.title || payload.steps.length === 0) {
                  return;
                }
                onCreateStory(payload);
                setDraftTitle("");
                setDraftSteps([createEmptyStep()]);
              }}
            >
              <Plus size={16} /> Add Story
            </Button>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading social stories...</p>
        ) : (
          <div className="space-y-3">
            {normalizedStories.length === 0 && <p className="text-sm text-muted-foreground">No social stories yet.</p>}

            {normalizedStories.map((story) => {
              const isEditing = editingId === story.id;
              const isBuiltIn = Boolean(story.is_builtin) || String(story.id).startsWith("builtin-");

              return (
                <article key={story.id} className="rounded-xl border p-3 bg-background/40 space-y-3">
                  {isEditing ? (
                    <>
                      <Input value={editingTitle} onChange={(event) => setEditingTitle(event.target.value)} />

                      <div className="space-y-2">
                        {editingSteps.map((step, index) => (
                          <div key={step.id} className="rounded-lg border p-2 space-y-2 bg-background/50">
                            <p className="text-xs text-muted-foreground">Card {index + 1} {inferEmojiForText(step.text)}</p>
                            <Textarea value={step.text} onChange={(event) => updateEditingStep(index, { text: event.target.value })} />
                            <Input placeholder="Image URL (optional)" value={step.image_url} onChange={(event) => updateEditingStep(index, { image_url: event.target.value })} />
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" variant="outline" disabled={index === 0} onClick={() => setEditingSteps((prev) => moveStep(prev, index, index - 1))}>Move Up</Button>
                              <Button size="sm" variant="outline" disabled={index === editingSteps.length - 1} onClick={() => setEditingSteps((prev) => moveStep(prev, index, index + 1))}>Move Down</Button>
                              <Button size="sm" variant="destructive" disabled={editingSteps.length <= 1} onClick={() => setEditingSteps((prev) => prev.filter((_, i) => i !== index))}>Remove Card</Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button size="sm" variant="outline" onClick={() => setEditingSteps((prev) => [...prev, createEmptyStep()])}>
                        Add Card
                      </Button>

                      <div className="flex gap-2 flex-wrap">
                        <Button
                          onClick={() => {
                            const payload = buildStoryPayload({ title: editingTitle, steps: editingSteps });
                            if (!payload.title || payload.steps.length === 0) {
                              return;
                            }
                            onUpdateStory(story.id, payload);
                            setEditingId(null);
                          }}
                        >
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <p className="font-medium">{story.title}</p>
                          <p className="text-xs text-muted-foreground">{story.steps.length} cards in this task story</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary">{isBuiltIn ? "Built-in" : "Story"}</Badge>
                          {!isBuiltIn && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => {
                                setEditingId(story.id);
                                setEditingTitle(story.title);
                                setEditingSteps(story.steps.map((step) => ({ ...step })));
                              }}
                            >
                              <Pencil size={14} /> Edit
                            </Button>
                          )}
                          {!isBuiltIn && (
                            <Button size="sm" variant="destructive" className="gap-1" onClick={() => onDeleteStory(story.id)}>
                              <Trash2 size={14} /> Delete
                            </Button>
                          )}
                          <Button size="sm" className="gap-1" onClick={() => startStory(story.id)}>
                            <Play size={14} /> Start Story
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {story.steps.map((step, index) => (
                          <div key={step.id} className="rounded-lg border p-2 bg-card/80 space-y-2">
                            {step.image_url ? (
                              <img src={step.image_url} alt={`Step card ${index + 1}`} className="w-full h-24 object-cover rounded-md border" />
                            ) : (
                              <div className="w-full h-24 rounded-md border bg-muted/30 flex items-center justify-center text-3xl">
                                {inferEmojiForText(step.text)}
                              </div>
                            )}
                            <p className="text-xs font-medium">Card {index + 1}</p>
                            <p className="text-xs text-muted-foreground line-clamp-3">{step.text}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
