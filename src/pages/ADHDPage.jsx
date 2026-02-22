import ComingSoon from "@/components/ComingSoon";
import { Zap } from "lucide-react";
export default function ADHDPage() {
    return (<ComingSoon title="ADHD" subtitle="FocusForge" description="Body-doubling timer, dopamine menu builder, task paralysis breaker, and hyperfocus channel with Pomodoro-style work sessions." color="bg-mode-adhd" icon={<Zap className="w-12 h-12 text-primary-foreground"/>}/>);
}
