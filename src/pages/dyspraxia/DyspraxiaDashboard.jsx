import { Link } from "react-router-dom";
import { ArrowLeft, Video, Activity, Map, FileText, Hand } from "lucide-react";
const tools = [
    {
        title: "AOMI First-Person Library",
        description: "Watch task guides from a first-person perspective",
        icon: Video,
        path: "/dyspraxia/aomi-library",
    },
    {
        title: "Haptic Rhythmic Pacer",
        description: "Visual and audio metronome for steady movement",
        icon: Activity,
        path: "/dyspraxia/haptic-pacer",
    },
    {
        title: "AR Instruction Cards",
        description: "Step-by-step visual guides with body icons",
        icon: FileText,
        path: "/dyspraxia/ar-instructions",
    },
    {
        title: "Safe-Route Planner",
        description: "Find low-stress paths avoiding obstacles",
        icon: Map,
        path: "/dyspraxia/safe-route",
    },
];
export default function DyspraxiaDashboard() {
    return (<div className="animate-fade-in">
      <Link to="/" className="neuro-btn-ghost text-sm mb-6 gap-2 inline-flex min-h-0 py-2 px-3">
        <ArrowLeft className="w-4 h-4"/>
        Back to Modes
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-mode-dyspraxia flex items-center justify-center">
            <Hand className="w-6 h-6 text-primary-foreground"/>
          </div>
          <div>
            <h1 className="text-3xl font-bold">CoordiMate</h1>
            <p className="section-subtitle">Dyspraxia Support Tools</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map((tool) => (<Link key={tool.path} to={tool.path} className="mode-card items-start text-left min-h-[120px]">
            <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
              <tool.icon className="w-7 h-7 text-mode-dyspraxia"/>
            </div>
            <h3 className="text-lg font-bold">{tool.title}</h3>
            <p className="text-sm text-muted-foreground">{tool.description}</p>
          </Link>))}
      </div>
    </div>);
}
