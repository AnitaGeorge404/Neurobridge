import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { Settings2, Sun, Volume2, Zap } from "lucide-react";

export default function SensoryMonitor({ role, profile, loading, onSaveThresholds }) {
  const canEditThresholds = role === "guardian" || role === "admin";

  const [sound, setSound] = useState(profile?.sound_threshold ?? 60);
  const [light, setLight] = useState(profile?.light_threshold ?? 60);
  const [crowd, setCrowd] = useState(profile?.crowd_threshold ?? 50);

  const sensoryScore = useMemo(() => {
    const score = Math.round((sound + light + crowd) / 3);
    return Math.max(0, Math.min(100, score));
  }, [sound, light, crowd]);

  const status = sensoryScore < 40 ? "safe" : sensoryScore < 70 ? "caution" : "high";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Settings2 size={18} /> Sensory Regulation Tools</CardTitle>
        <CardDescription>
          Tune sensory thresholds and use calming supports. Threshold editing is guardian-only.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && <p className="text-sm text-muted-foreground">Loading sensory profile...</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl border p-3 bg-background/50 space-y-2">
            <p className="text-sm font-medium flex items-center gap-2"><Volume2 size={14} /> Sound Threshold</p>
            <Slider value={[sound]} max={100} step={1} onValueChange={(value) => setSound(value[0])} disabled={!canEditThresholds} />
            <p className="text-xs text-muted-foreground">{sound}</p>
          </div>

          <div className="rounded-xl border p-3 bg-background/50 space-y-2">
            <p className="text-sm font-medium flex items-center gap-2"><Sun size={14} /> Light Threshold</p>
            <Slider value={[light]} max={100} step={1} onValueChange={(value) => setLight(value[0])} disabled={!canEditThresholds} />
            <p className="text-xs text-muted-foreground">{light}</p>
          </div>

          <div className="rounded-xl border p-3 bg-background/50 space-y-2">
            <p className="text-sm font-medium flex items-center gap-2"><Zap size={14} /> Crowd Threshold</p>
            <Slider value={[crowd]} max={100} step={1} onValueChange={(value) => setCrowd(value[0])} disabled={!canEditThresholds} />
            <p className="text-xs text-muted-foreground">{crowd}</p>
          </div>
        </div>

        <Alert>
          <AlertDescription>
            <span className="font-medium">Sensory load status:</span>{" "}
            {status === "safe" ? "Safe zone" : status === "caution" ? "Caution zone" : "High load zone"}
            {" "}({sensoryScore}/100)
          </AlertDescription>
        </Alert>

        {canEditThresholds && (
          <Button
            onClick={() =>
              onSaveThresholds({
                sound_threshold: sound,
                light_threshold: light,
                crowd_threshold: crowd,
              })
            }
          >
            Save Thresholds
          </Button>
        )}

        {!canEditThresholds && (
          <Badge variant="outline">Viewer mode: threshold edits are restricted</Badge>
        )}

        <div className="rounded-xl border p-3 bg-background/50 space-y-2">
          <p className="text-sm font-medium">Calming tools (all users)</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">Deep Breathing</Button>
            <Button variant="outline" size="sm">Noise Break</Button>
            <Button variant="outline" size="sm">Dim Screen Prompt</Button>
          </div>
        </div>

        <Input value={profile?.notes || ""} readOnly className="opacity-70" />
      </CardContent>
    </Card>
  );
}
