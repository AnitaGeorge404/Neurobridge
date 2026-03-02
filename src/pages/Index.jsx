import { Link } from "react-router-dom";
import { Brain, Zap, BookOpen, Calculator, Shield, Hand, Wind, Sparkles, Ear, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { FEATURES } from "@/lib/featureRegistry";

// Each card maps to a top-level feature key so we can filter by disorders.
const ALL_MODES = [
  { featureKey: FEATURES.ASD,         title: "ASD",         subtitle: "Autism Spectrum",     icon: Brain,      color: "bg-mode-asd",         path: "/asd" },
  { featureKey: FEATURES.ADHD,        title: "ADHD",        subtitle: "Attention & Focus",    icon: Zap,        color: "bg-mode-adhd",        path: "/adhd" },
  { featureKey: FEATURES.DYSLEXIA,    title: "Dyslexia",    subtitle: "Reading & Language",   icon: BookOpen,   color: "bg-mode-dyslexia",    path: "/dyslexia" },
  { featureKey: FEATURES.DYSCALCULIA, title: "Dyscalculia", subtitle: "Numbers & Math",       icon: Calculator, color: "bg-mode-dyscalculia", path: "/dyscalculia" },
  { featureKey: FEATURES.OCD,         title: "OCD",         subtitle: "MindBridge",           icon: Shield,     color: "bg-mode-ocd",         path: "/ocd" },
  { featureKey: FEATURES.DYSPRAXIA,   title: "Dyspraxia",   subtitle: "CoordiMate",           icon: Hand,       color: "bg-mode-dyspraxia",   path: "/dyspraxia" },
  { featureKey: FEATURES.ANXIETY,     title: "Anxiety",     subtitle: "CalmFlow Toolkit",     icon: Wind,       color: "bg-mode-anxiety",     path: "/anxiety" },
  { featureKey: FEATURES.TOURETTES,   title: "Tourette's",  subtitle: "Tic Management",       icon: Sparkles,   color: "bg-mode-tourettes",   path: "/tourettes" },
  { featureKey: FEATURES.APD,         title: "APD",         subtitle: "Auditory Processing",  icon: Ear,        color: "bg-mode-apd",         path: "/apd" },
];

const Index = () => {
  const { hasFeature, role } = useAuth();

  // Admins and guardians see all modes; regular users see only their enabled modules.
  const modes = (role === "admin" || role === "guardian")
    ? ALL_MODES
    : ALL_MODES.filter((m) => hasFeature(m.featureKey));

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Welcome to <span className="text-primary">NeuroBridge</span>
        </h1>
        <p className="section-subtitle text-lg">
          {modes.length > 0
            ? "Your personalised toolkit — tools selected for the areas you're working on."
            : "No tools have been set up yet."}
        </p>
      </div>

      {modes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modes.map((mode, i) => (
            <Link key={mode.featureKey} to={mode.path} className="mode-card group" style={{ animationDelay: `${i * 50}ms` }}>
              <div className={`w-16 h-16 rounded-2xl ${mode.color} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                <mode.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold">{mode.title}</h2>
              <p className="text-sm text-muted-foreground">{mode.subtitle}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-sm mb-4">Your plan is empty. Visit Settings to select the areas you'd like support with.</p>
          <Link to="/settings" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
            <Settings className="w-4 h-4" /> Open Settings
          </Link>
        </div>
      )}
    </div>
  );
};

export default Index;
