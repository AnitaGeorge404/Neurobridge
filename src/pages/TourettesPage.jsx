import ComingSoon from "@/components/ComingSoon";
import { Sparkles } from "lucide-react";
export default function TourettesPage() {
    return (<ComingSoon title="Tourette's" subtitle="TicTracker" description="Tic frequency logger, CBIT habit reversal trainer, competing response builder, and trigger pattern analysis with calming exercises." color="bg-mode-tourettes" icon={<Sparkles className="w-12 h-12 text-primary-foreground"/>}/>);
}
