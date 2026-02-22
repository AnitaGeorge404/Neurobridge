import { Link } from "react-router-dom";
import { ArrowLeft, List, Timer, Flame, BookOpen, Shield } from "lucide-react";
import { useState } from "react";
import ACTSOSModal from "@/components/ocd/ACTSOSModal";
const tools = [
    {
        title: "ERP Hierarchy Builder",
        description: "Rank your triggers from 1-10 to build a Fear Hierarchy",
        icon: List,
        path: "/ocd/erp-hierarchy",
    },
    {
        title: "Ritual Delayer",
        description: "Ride the wave with a calming countdown timer",
        icon: Timer,
        path: "/ocd/ritual-delayer",
    },
    {
        title: "Compulsion Heatmap",
        description: "Track resisted vs. performed compulsions over time",
        icon: Flame,
        path: "/ocd/compulsion-heatmap",
    },
    {
        title: "Logic-Check Journal",
        description: "Challenge obsessions with evidence-based reasoning",
        icon: BookOpen,
        path: "/ocd/logic-journal",
    },
];
export default function OCDDashboard() {
    const [showACT, setShowACT] = useState(false);
    return (<div className="animate-fade-in">
      <Link to="/" className="neuro-btn-ghost text-sm mb-6 gap-2 inline-flex min-h-0 py-2 px-3">
        <ArrowLeft className="w-4 h-4"/>
        Back to Modes
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-mode-ocd flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary-foreground"/>
          </div>
          <div>
            <h1 className="text-3xl font-bold">MindBridge</h1>
            <p className="section-subtitle">OCD Support Tools</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map((tool) => (<Link key={tool.path} to={tool.path} className="mode-card items-start text-left">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
              <tool.icon className="w-6 h-6 text-primary"/>
            </div>
            <h3 className="text-lg font-bold">{tool.title}</h3>
            <p className="text-sm text-muted-foreground">{tool.description}</p>
          </Link>))}
      </div>

      {/* ACT SOS Button */}
      <button className="act-sos-btn" onClick={() => setShowACT(true)} aria-label="ACT SOS">
        SOS
      </button>

      <ACTSOSModal open={showACT} onClose={() => setShowACT(false)}/>
    </div>);
}
