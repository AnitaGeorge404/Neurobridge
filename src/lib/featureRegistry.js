/**
 * featureRegistry.js  —  Central authority for feature availability.
 *
 * Rules:
 *  • Every feature MUST appear here.
 *  • "disorders" lists which conditions unlock the feature.
 *  • "modeConfig" (optional) records per-disorder behaviour differences so the
 *    same component can adapt without duplicating features.
 *  • resolveEnabledFeatures() is the ONLY place access decisions are made.
 *    Nothing else may gate features manually.
 */

import { DISORDERS } from "./disorders";

// ─────────────────────────────────────────────
//  Feature keys  (union of all valid strings)
// ─────────────────────────────────────────────
export const FEATURES = /** @type {const} */ ({
  // ── Top-level module landing pages ──────────
  OCD:          "ocd",
  ADHD:         "adhd",
  DYSLEXIA:     "dyslexia",
  DYSCALCULIA:  "dyscalculia",
  DYSPRAXIA:    "dyspraxia",
  ASD:          "asd",
  ANXIETY:      "anxiety",
  DEPRESSION:    "depression",
  APD:          "apd",

  // ── OCD sub-features ────────────────────────
  OCD_ERP_TRACKER:      "ocd.erp-tracker",
  OCD_RITUAL_DELAYER:   "ocd.ritual-delayer",
  OCD_HEATMAP:          "ocd.compulsion-heatmap",
  OCD_LOGIC_JOURNAL:    "ocd.logic-journal",

  // ── ADHD sub-features ───────────────────────
  ADHD_FOCUS:     "adhd.focus-sessions",
  ADHD_EMOTION:   "adhd.emotion-coach",
  ADHD_TIMELINE:  "adhd.visual-timeline",
  ADHD_BREAKDOWN: "adhd.task-breakdown",
  ADHD_SOUNDS:    "adhd.soundscapes",
  ADHD_DOUBLING:  "adhd.body-doubling",

  // ── Dyslexia sub-features ───────────────────
  DYSLEXIA_READER:   "dyslexia.reader-mode",
  DYSLEXIA_WORDBANK: "dyslexia.word-bank",

  // ── Dyspraxia sub-features ──────────────────
  DYSPRAXIA_AOMI:     "dyspraxia.aomi-library",
  DYSPRAXIA_HAPTIC:   "dyspraxia.haptic-pacer",
  DYSPRAXIA_AR:       "dyspraxia.ar-instructions",
  DYSPRAXIA_ROUTE:    "dyspraxia.safe-route",
});

// ─────────────────────────────────────────────
//  Feature registry
//
//  Each entry:
//    label:      Human-readable name (never shown as diagnosis)
//    disorders:  Which conditions unlock this feature
//    modeConfig: (optional) per-disorder behaviour overrides
// ─────────────────────────────────────────────
export const FEATURE_REGISTRY = {
  // ── Module roots ────────────────────────────
  [FEATURES.OCD]: {
    label: "OCD Support",
    disorders: [DISORDERS.OCD],
  },
  [FEATURES.ADHD]: {
    label: "Focus & Attention",
    disorders: [DISORDERS.ADHD],
  },
  [FEATURES.DYSLEXIA]: {
    label: "Reading Support",
    disorders: [DISORDERS.DYSLEXIA],
  },
  [FEATURES.DYSCALCULIA]: {
    label: "Number Support",
    disorders: [DISORDERS.DYSCALCULIA],
  },
  [FEATURES.DYSPRAXIA]: {
    label: "Motor Skills",
    disorders: [DISORDERS.DYSPRAXIA],
  },
  [FEATURES.ASD]: {
    label: "Sensory & Social",
    disorders: [DISORDERS.ASD],
  },
  [FEATURES.ANXIETY]: {
    label: "Anxiety Tools",
    disorders: [DISORDERS.ANXIETY],
    // Also unlocked for OCD users — anxiety management is clinically relevant
    // for ERP prep and generalised anxiety comorbidity.
  },
  [FEATURES.DEPRESSION]: {
    label: "Depression Support",
    disorders: [DISORDERS.DEPRESSION],
  },
  [FEATURES.APD]: {
    label: "Audio Support",
    disorders: [DISORDERS.APD],
  },

  // ── OCD sub-features ────────────────────────
  [FEATURES.OCD_ERP_TRACKER]: {
    label: "ERP Exposure Tracker",
    disorders: [DISORDERS.OCD],
    modeConfig: {
      [DISORDERS.OCD]: { showHabituation: true, showCoaching: true },
    },
  },
  [FEATURES.OCD_RITUAL_DELAYER]: {
    label: "Ritual Delay Timer",
    disorders: [DISORDERS.OCD],
  },
  [FEATURES.OCD_HEATMAP]: {
    label: "Compulsion Heatmap",
    disorders: [DISORDERS.OCD],
  },
  [FEATURES.OCD_LOGIC_JOURNAL]: {
    label: "Logic-Check Journal",
    disorders: [DISORDERS.OCD],
    // Shared feature: also relevant to anxiety-driven intrusive thoughts
    // disorders: [DISORDERS.OCD, DISORDERS.ANXIETY], — enable when anxiety page exists
  },

  // ── ADHD sub-features ───────────────────────
  [FEATURES.ADHD_FOCUS]: {
    label: "Focus Sessions",
    disorders: [DISORDERS.ADHD],
  },
  [FEATURES.ADHD_EMOTION]: {
    label: "Emotion Coach",
    disorders: [DISORDERS.ADHD],
    modeConfig: {
      [DISORDERS.ADHD]: { showImpulsivityTips: true },
      [DISORDERS.ASD]:  { showImpulsivityTips: false, showSensoryCheck: true },
    },
  },
  [FEATURES.ADHD_TIMELINE]: {
    label: "Visual Timeline",
    disorders: [DISORDERS.ADHD],
  },
  [FEATURES.ADHD_BREAKDOWN]: {
    label: "Task Breakdown",
    // Shared: dyspraxia users also benefit from step-by-step task decomposition
    disorders: [DISORDERS.ADHD, DISORDERS.DYSPRAXIA],
  },
  [FEATURES.ADHD_SOUNDS]: {
    label: "Focus Soundscapes",
    disorders: [DISORDERS.ADHD],
  },
  [FEATURES.ADHD_DOUBLING]: {
    label: "Body Doubling",
    disorders: [DISORDERS.ADHD],
  },

  // ── Dyslexia sub-features ───────────────────
  [FEATURES.DYSLEXIA_READER]: {
    label: "Reader Mode",
    disorders: [DISORDERS.DYSLEXIA],
  },
  [FEATURES.DYSLEXIA_WORDBANK]: {
    label: "Word Bank",
    disorders: [DISORDERS.DYSLEXIA],
  },

  // ── Dyspraxia sub-features ──────────────────
  [FEATURES.DYSPRAXIA_AOMI]: {
    label: "AOMI Library",
    disorders: [DISORDERS.DYSPRAXIA],
  },
  [FEATURES.DYSPRAXIA_HAPTIC]: {
    label: "Haptic Pacer",
    disorders: [DISORDERS.DYSPRAXIA],
  },
  [FEATURES.DYSPRAXIA_AR]: {
    label: "AR Instructions",
    disorders: [DISORDERS.DYSPRAXIA],
  },
  [FEATURES.DYSPRAXIA_ROUTE]: {
    label: "Safe Route Planner",
    disorders: [DISORDERS.DYSPRAXIA],
  },
};

// ─────────────────────────────────────────────
//  Core algorithm — O(F × D)
//
//  Pure function: no side effects, no imports from
//  React, no context reads.  Safe to call anywhere.
// ─────────────────────────────────────────────

/**
 * Given a user's selected disorders, return the Set of enabled feature keys.
 *
 * @param {string[]} disorders  — e.g. ["ocd", "adhd"]
 * @returns {Set<string>}
 */
export function resolveEnabledFeatures(disorders) {
  const active = new Set(disorders ?? []);
  const enabled = new Set();

  for (const [key, config] of Object.entries(FEATURE_REGISTRY)) {
    if (config.disorders.some((d) => active.has(d))) {
      enabled.add(key);
    }
  }

  return enabled;
}

/**
 * Return the per-disorder mode config for a given feature + active disorder.
 * Useful inside a component to adapt behaviour without duplicating features.
 *
 * @param {string} featureKey
 * @param {string} disorder
 * @returns {Record<string, unknown> | null}
 */
export function getFeatureModeConfig(featureKey, disorder) {
  return FEATURE_REGISTRY[featureKey]?.modeConfig?.[disorder] ?? null;
}
