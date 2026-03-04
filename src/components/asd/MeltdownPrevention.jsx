import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ShieldCheck, Siren, Waves } from "lucide-react";

export default function MeltdownPrevention({ role, routines, sensoryProfile, meltdownLogs, onCreateMeltdownLog }) {
  const [isCopingMode, setIsCopingMode] = useState(false);

  const riskData = useMemo(() => {
    const incomplete = routines.filter((task) => !task.is_completed).length;
    const thresholdLoad = [
      sensoryProfile?.sound_threshold ?? 60,
      sensoryProfile?.light_threshold ?? 60,
      sensoryProfile?.crowd_threshold ?? 50,
    ].reduce((sum, value) => sum + value, 0) / 3;

    let risk = 10;
    risk += Math.min(40, incomplete * 5);
    risk += thresholdLoad > 70 ? 25 : thresholdLoad > 60 ? 12 : 0;

    const level = risk < 35 ? "low" : risk < 65 ? "moderate" : "high";

    return { risk: Math.min(100, Math.round(risk)), level };
  }, [routines, sensoryProfile]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><AlertTriangle size={18} /> Meltdown Prevention System</CardTitle>
        <CardDescription>
          Risk awareness and calming workflow. Guardians can review meltdown logs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            <span className="font-medium">Current risk:</span> {riskData.level.toUpperCase()} ({riskData.risk}/100)
          </AlertDescription>
        </Alert>

        <div className="flex flex-wrap gap-2">
          <Badge variant={riskData.level === "high" ? "destructive" : "secondary"}>
            {riskData.level === "high" ? "High Alert" : riskData.level === "moderate" ? "Moderate Alert" : "Stable"}
          </Badge>
          <Badge variant="outline" className="gap-1"><ShieldCheck size={14} /> Preventive Mode</Badge>
        </div>

        <div className="rounded-xl border p-3 bg-background/40 space-y-2">
          <p className="font-medium">Calming actions (all users)</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsCopingMode((value) => !value)} className="gap-1">
              <Waves size={14} /> {isCopingMode ? "Exit Coping" : "Start Coping"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => onCreateMeltdownLog({
                event_type: "early-warning",
                notes: `User triggered coping mode: ${new Date().toLocaleString()}`,
                risk_level: riskData.level,
              })}
            >
              <Siren size={14} /> Log Early Warning
            </Button>
          </div>
        </div>

        {isCopingMode && (
          <div className="rounded-xl border p-3 bg-background/40 space-y-1 text-sm">
            <p>1. Move to quieter space for 3–5 minutes.</p>
            <p>2. Use deep pressure or breathing routine.</p>
            <p>3. Hydrate and reduce sensory load.</p>
            <p>4. Resume one low-demand task.</p>
          </div>
        )}

        {role === "guardian" && (
          <div className="space-y-2">
            <p className="font-medium">Meltdown logs (guardian view)</p>
            <div className="max-h-64 overflow-auto space-y-2 pr-1">
              {meltdownLogs.length === 0 && <p className="text-sm text-muted-foreground">No logs yet.</p>}
              {meltdownLogs.map((log) => (
                <article key={log.id} className="rounded-xl border p-3 bg-background/40 text-sm">
                  <p className="font-medium">{log.event_type || "event"} · {log.risk_level || "unknown"}</p>
                  <p className="text-muted-foreground mt-1">{log.notes || "No notes"}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(log.created_at).toLocaleString()}</p>
                </article>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
