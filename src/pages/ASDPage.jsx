import ComingSoon from "@/components/ComingSoon";
import { Brain } from "lucide-react";
export default function ASDPage() {
    return (<ComingSoon title="ASD" subtitle="SpectrumSpace" description="Sensory regulation tools, social story builder, routine visualizer, and meltdown prevention system with customizable sensory profiles." color="bg-mode-asd" icon={<Brain className="w-12 h-12 text-primary-foreground"/>}/>);
}
