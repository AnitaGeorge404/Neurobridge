import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User, Shield, Brain, Zap, BookOpen, Calculator, Hand, Wind, Sparkles,
  Check, LogOut, Save, Heart, Eye, EyeOff,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// ─────────────────────────────────────────────
//  Neuro-category options (mirrors Index.jsx)
// ─────────────────────────────────────────────
const PROFILES = [
  { id: "asd",         label: "ASD",          subtitle: "Autism Spectrum",    icon: Brain,      color: "bg-mode-asd" },
  { id: "adhd",        label: "ADHD",         subtitle: "Attention & Focus",  icon: Zap,        color: "bg-mode-adhd" },
  { id: "dyslexia",    label: "Dyslexia",     subtitle: "Reading & Language", icon: BookOpen,   color: "bg-mode-dyslexia" },
  { id: "dyscalculia", label: "Dyscalculia",  subtitle: "Numbers & Math",     icon: Calculator, color: "bg-mode-dyscalculia" },
  { id: "ocd",         label: "OCD",          subtitle: "MindBridge",         icon: Shield,     color: "bg-mode-ocd" },
  { id: "dyspraxia",   label: "Dyspraxia",    subtitle: "CoordiMate",         icon: Hand,       color: "bg-mode-dyspraxia" },
  { id: "anxiety",     label: "Anxiety",      subtitle: "CalmFlow Toolkit",   icon: Wind,       color: "bg-mode-ocd" },
  { id: "tourettes",   label: "Tourette's",   subtitle: "Tic Management",     icon: Sparkles,   color: "bg-mode-tourettes" },
];

export default function UserSettings() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [abhaId, setAbhaId]           = useState(user?.abhaId ?? "");
  const [selectedProfile, setSelected] = useState(user?.selectedProfile ?? null);
  const [accessibility, setAccess]    = useState(
    user?.accessibility ?? { reduceMotion: false, screenReader: false },
  );
  const [privacy, setPrivacy] = useState(
    user?.privacy ?? { shareActivity: true, shareJournal: false, shareAlerts: true },
  );
  const [saved, setSaved]             = useState(false);

  function handleSave() {
    updateUser({ abhaId, selectedProfile, accessibility, privacy });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function toggleAccess(key) {
    setAccess((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleGoToProfile() {
    if (selectedProfile) navigate(`/${selectedProfile}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Personalise your NeuroBridge experience
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="neuro-btn-outline flex items-center gap-2 text-sm"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>

      {/* Identity card */}
      <div className="neuro-card p-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0">
          <User className="w-7 h-7 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-lg">{user?.name}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      {/* ABHA ID */}
      <section className="neuro-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-primary" />
          <h2 className="font-semibold">ABHA Health ID</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Your Ayushman Bharat Health Account ID links your NeuroBridge records with India's national health grid.
        </p>
        <input
          type="text"
          value={abhaId}
          onChange={(e) => setAbhaId(e.target.value)}
          placeholder="e.g. 14-2345-6789-0123"
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </section>

      {/* Neuro-profile selector */}
      <section className="neuro-card p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" /> Preferred Neuro-Category
        </h2>
        <p className="text-xs text-muted-foreground">
          Select your primary neuro-profile. NeuroBridge will open this app-within-an-app automatically on your next login.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PROFILES.map(({ id, label, subtitle, icon: Icon, color }) => {
            const active = selectedProfile === id;
            return (
              <motion.button
                key={id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelected(id)}
                className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all ${
                  active
                    ? "border-primary bg-primary/10 shadow-md shadow-primary/20"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {active && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </span>
                )}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold">{label}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{subtitle}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {selectedProfile && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleGoToProfile}
            className="neuro-btn text-sm w-full mt-2"
          >
            Open {PROFILES.find((p) => p.id === selectedProfile)?.label} Dashboard →
          </motion.button>
        )}
      </section>

      {/* Accessibility toggles */}
      <section className="neuro-card p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" /> Accessibility Preferences
        </h2>

        {[
          {
            key: "reduceMotion",
            label: "Reduce Motion",
            desc: "Disables decorative animations that may cause vestibular discomfort.",
          },
          {
            key: "screenReader",
            label: "Screen Reader Mode",
            desc: "Adds ARIA labels and increases tap-target sizes for assistive technologies.",
          },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-start gap-4">
            <button
              role="switch"
              aria-checked={accessibility[key]}
              onClick={() => toggleAccess(key)}
              className={`relative flex-shrink-0 mt-0.5 w-11 h-6 rounded-full transition-colors ${
                accessibility[key] ? "bg-primary" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  accessibility[key] ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Privacy — Guardian sharing */}
      <section className="neuro-card p-6 space-y-4 border-l-4 border-l-violet-500">
        <h2 className="font-semibold flex items-center gap-2">
          <Heart className="w-4 h-4 text-violet-500" /> Guardian Privacy Controls
        </h2>
        <p className="text-xs text-muted-foreground">
          Your guardian can only see the data you choose to share. Your private journal entries and anything you disable below will <strong>never</strong> be visible to them.
        </p>

        {[
          {
            key: "shareActivity",
            label: "Share Daily Activity",
            desc: "Lets your guardian see which modules you completed today.",
            icon: Eye,
          },
          {
            key: "shareAlerts",
            label: "Share Safety Alerts",
            desc: "Notifies your guardian when you trigger an SOS or meltdown mode.",
            icon: Eye,
          },
          {
            key: "shareJournal",
            label: "Share Journal Notes",
            desc: "Allows your guardian to read (and write into) the Shared Journal space.",
            icon: Eye,
          },
        ].map(({ key, label, desc, icon: Icon }) => (
          <div key={key} className="flex items-start gap-4">
            <button
              role="switch"
              aria-checked={privacy[key]}
              onClick={() => setPrivacy((p) => ({ ...p, [key]: !p[key] }))}
              className={`relative flex-shrink-0 mt-0.5 w-11 h-6 rounded-full transition-colors ${
                privacy[key] ? "bg-violet-500" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  privacy[key] ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <div>
              <p className="text-sm font-medium flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                {label}
              </p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Save */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleSave}
        className="neuro-btn w-full flex items-center justify-center gap-2 text-sm"
      >
        {saved ? (
          <><Check className="w-4 h-4" /> Preferences saved!</>
        ) : (
          <><Save className="w-4 h-4" /> Save Changes</>
        )}
      </motion.button>
    </motion.div>
  );
}
