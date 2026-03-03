import { AlertOctagon, Siren } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PanicModePanel({ onActivate }) {
  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive"><AlertOctagon size={18} /> Panic Mode</CardTitle>
        <CardDescription>One-click emergency grounding flow with calming prompts and breathing shortcut.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Alert className="border-destructive/30 bg-destructive/5">
          <AlertDescription className="space-y-2 text-sm">
            <p className="font-medium">If anxiety spikes suddenly:</p>
            <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
              <li>Name 5 things you can see right now.</li>
              <li>Place both feet on the floor and slow your breath.</li>
              <li>Exhale longer than inhale for 60 seconds.</li>
              <li>Message a trusted person if symptoms continue.</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button variant="destructive" onClick={onActivate} className="gap-2"><Siren size={16} /> Activate Panic Flow</Button>
          <Button variant="outline" onClick={() => window.open("tel:112", "_self")}>Emergency Call Shortcut</Button>
        </div>

        <p className="text-xs text-muted-foreground">Emergency call behavior depends on browser/device permissions.</p>
      </CardContent>
    </Card>
  );
}
