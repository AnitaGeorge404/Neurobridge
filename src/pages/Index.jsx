import { Link } from "react-router-dom";
import { Brain, Zap, BookOpen, Calculator, Shield, Hand, Ear, Sparkles, } from "lucide-react";
const modes = [
    {
        id: "asd",
        title: "ASD",
        subtitle: "Autism Spectrum",
        icon: Brain,
        color: "bg-mode-asd",
        path: "/asd",
    },
    {
        id: "adhd",
        title: "ADHD",
        subtitle: "Attention & Focus",
        icon: Zap,
        color: "bg-mode-adhd",
        path: "/adhd",
    },
    {
        id: "dyslexia",
        title: "Dyslexia",
        subtitle: "Reading & Language",
        icon: BookOpen,
        color: "bg-mode-dyslexia",
        path: "/dyslexia",
    },
    {
        id: "dyscalculia",
        title: "Dyscalculia",
        subtitle: "Numbers & Math",
        icon: Calculator,
        color: "bg-mode-dyscalculia",
        path: "/dyscalculia",
    },
    {
        id: "ocd",
        title: "OCD",
        subtitle: "MindBridge",
        icon: Shield,
        color: "bg-mode-ocd",
        path: "/ocd",
    },
    {
        id: "dyspraxia",
        title: "Dyspraxia",
        subtitle: "CoordiMate",
        icon: Hand,
        color: "bg-mode-dyspraxia",
        path: "/dyspraxia",
    },
    {
        id: "apd",
        title: "APD",
        subtitle: "Auditory Processing",
        icon: Ear,
        color: "bg-mode-apd",
        path: "/apd",
    },
    {
        id: "tourettes",
        title: "Tourette's",
        subtitle: "Tic Management",
        icon: Sparkles,
        color: "bg-mode-tourettes",
        path: "/tourettes",
    },
];
const Index = () => {
    return (<div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Welcome to <span className="text-primary">NeuroBridge</span>
        </h1>
        <p className="section-subtitle text-lg">
          Choose your neurodivergent mode to access personalized tools and support.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {modes.map((mode, i) => (<Link key={mode.id} to={mode.path} className="mode-card group" style={{ animationDelay: `${i * 50}ms` }}>
            <div className={`w-16 h-16 rounded-2xl ${mode.color} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
              <mode.icon className="w-8 h-8 text-primary-foreground"/>
            </div>
            <h2 className="text-xl font-bold">{mode.title}</h2>
            <p className="text-sm text-muted-foreground">{mode.subtitle}</p>
          </Link>))}
      </div>
    </div>);
};
export default Index;
