/**
 * DisorderSelection.jsx  —  Post-login disorder review & update screen.
 *
 * Shown on EVERY login so users can review and adjust the areas they want
 * support with before entering the app.  Pre-filled with their current plan.
 *
 * Clinical safety rules:
 *  • Language never says "you HAVE X disorder"
 *  • Phrasing: "select the areas you’d like support with"
 *  • No diagnosis reinforcement
 *  • "Not sure" option → gets a balanced default set
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowRight, HelpCircle, Brain } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ALL_DISORDERS, DISORDER_META } from "@/lib/disorders";

export default function DisorderSelection() {
  const { updateDisorders, disorders: savedDisorders } = useAuth();
  const navigate = useNavigate();
  // Pre-fill with whatever the user already had saved
  const [selected, setSelected] = useState(() => new Set(savedDisorders ?? []));
  const [saving, setSaving]     = useState(false);

  function toggle(disorder) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(disorder) ? next.delete(disorder) : next.add(disorder);
      return next;
    });
  }

  async function handleContinue() {
    if (selected.size === 0) return;
    setSaving(true);
    await updateDisorders([...selected]);
    // Navigate to the first selected module, or home
    const first = [...selected][0];
    const path = DISORDER_META[first]?.path ?? "/";
    navigate(path, { replace: true });
  }

  async function handleNotSure() {
    // Give them a broad cross-disorder default so the app is immediately useful
    setSaving(true);
    await updateDisorders(ALL_DISORDERS);
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
            <Brain className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Your support plan</h1>
          <p className="mt-2 text-gray-500 text-sm max-w-md mx-auto">
            Select the areas you’d like support with today. Your sidebar and home screen will show only these tools.
          </p>
          {savedDisorders?.length > 0 && (
            <p className="mt-1 text-xs text-primary font-medium">
              Previously selected: {savedDisorders.length} area{savedDisorders.length > 1 ? "s" : ""} — adjust freely and hit Continue.
            </p>
          )}
        </div>

        {/* Disorder grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {ALL_DISORDERS.map((disorder) => {
            const meta    = DISORDER_META[disorder];
            const Icon    = meta.icon;
            const isOn    = selected.has(disorder);
            return (
              <motion.button
                key={disorder}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggle(disorder)}
                className={`relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all ${
                  isOn
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <AnimatePresence>
                  {isOn && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-2 right-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </motion.span>
                  )}
                </AnimatePresence>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${meta.color} bg-opacity-15`}>
                  <Icon className={`w-5 h-5 ${meta.accent}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{meta.label}</p>
                  <p className="text-xs text-gray-500 leading-tight">{meta.subtitle}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Selection count hint */}
        <p className="text-center text-xs text-gray-400 mb-4">
          {selected.size === 0
            ? "Select at least one area to continue"
            : `${selected.size} area${selected.size > 1 ? "s" : ""} selected — you can change this anytime in Settings`}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleContinue}
            disabled={selected.size === 0 || saving}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Saving…" : "Continue"}
            {!saving && <ArrowRight className="w-4 h-4" />}
          </button>
          <button
            onClick={handleNotSure}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 py-3 px-5 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <HelpCircle className="w-4 h-4" /> Not sure yet
          </button>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-5">
          This selection is stored only on your device and is never shared without your consent.
        </p>
      </motion.div>
    </div>
  );
}
