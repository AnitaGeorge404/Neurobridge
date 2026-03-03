import { useMemo } from "react";
import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ReframePanel({ thoughtInput, setThoughtInput, reframes, onGenerate }) {
  const latest = useMemo(() => (reframes.length ? reframes[0] : null), [reframes]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Lightbulb size={18} /> Cognitive Reframe Assistant</CardTitle>
        <CardDescription>Deterministic local reframing logic. Input stays on device only.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          value={thoughtInput}
          onChange={(event) => setThoughtInput(event.target.value)}
          placeholder="I always mess up presentations"
        />
        <Button onClick={onGenerate}>Generate Reframe</Button>

        {latest && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Latest Reframe</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="font-medium">Original:</span> {latest.originalThought}</p>
              <p><span className="font-medium">Distortion:</span> {latest.distortionTag}</p>
              <p><span className="font-medium">Counter:</span> {latest.counterStatement}</p>
              <p><span className="font-medium">Action:</span> {latest.actionStep}</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium">History</p>
          <div className="max-h-72 overflow-auto space-y-2 pr-1">
            {reframes.length === 0 && <p className="text-sm text-muted-foreground">No reframes yet.</p>}
            {reframes.map((entry) => (
              <Textarea
                key={entry.id}
                value={`[${new Date(entry.createdAt).toLocaleString()}]\nOriginal: ${entry.originalThought}\nDistortion: ${entry.distortionTag}\nCounter: ${entry.counterStatement}\nAction: ${entry.actionStep}`}
                readOnly
                className="min-h-28"
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
