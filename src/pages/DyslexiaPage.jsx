import ComingSoon from "@/components/ComingSoon";
import { BookOpen } from "lucide-react";
export default function DyslexiaPage() {
    return (<ComingSoon title="Dyslexia" subtitle="ReadEase" description="OpenDyslexic font toggle, text-to-speech reader, syllable highlighter, and phonemic awareness exercises with bionic reading mode." color="bg-mode-dyslexia" icon={<BookOpen className="w-12 h-12 text-primary-foreground"/>}/>);
}
