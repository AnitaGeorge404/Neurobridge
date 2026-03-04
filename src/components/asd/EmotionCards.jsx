import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Volume2 } from "lucide-react";

export default function EmotionCards({
  states,
  selectedEmotion,
  onSelectEmotion,
  onReadEmotion,
}) {
  const activeState = states.find((item) => item.label === selectedEmotion) || states[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl"><Heart size={18} /> Emotional Check-in</CardTitle>
        <CardDescription>
          Tap any emotion card to hear support guidance aloud and update your current state.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {states.map((state) => {
            const isActive = selectedEmotion === state.label;
            return (
              <button
                key={state.label}
                onClick={() => onSelectEmotion(state)}
                className={`rounded-xl border p-3 text-left transition ${
                  isActive
                    ? "border-violet-400/60 bg-violet-500/15"
                    : "border-border bg-background/40 hover:bg-background/70"
                }`}
              >
                <p className="text-sm font-semibold">{state.label}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{state.supportText}</p>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant="secondary">Current: {selectedEmotion}</Badge>
          <Badge variant="outline">Risk: {activeState?.risk || "low"}</Badge>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => onReadEmotion(activeState)}
          >
            <Volume2 size={14} /> Read Current State
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
