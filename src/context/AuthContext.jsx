import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { resolveEnabledFeatures } from "@/lib/featureRegistry";
import { DISORDERS } from "@/lib/disorders";

// ─────────────────────────────────────────────
//  Care-Link ID → ward user lookup
//  Each user has a unique careLinkId that a
//  guardian enters during onboarding.
// ─────────────────────────────────────────────
export const CARE_LINK_REGISTRY = {
  "CL-ARUN-0042": "nb-user-042",
  "CL-MEERA-0011": "nb-user-011",
};

// ─────────────────────────────────────────────
//  Mock user database
// ─────────────────────────────────────────────
const MOCK_USERS = {
  admin: {
    id: "nb-admin-001",
    name: "Dr. Priya Nair",
    email: "admin@neurobridge.in",
    role: "admin",
    abhaId: "27-4567-8901-2345",
    designation: "Lead Clinical Coordinator",
  },
  user: {
    id: "nb-user-042",
    name: "Arun Kumar",
    email: "arun@neurobridge.in",
    role: "user",
    abhaId: "14-2345-6789-0123",
    careLinkId: "CL-ARUN-0042",
    selectedProfile: "ocd",
    disorders: [DISORDERS.OCD],
    privacy: {
      shareActivity: true,
      shareJournal: false,  // journal stays private by default
      shareAlerts: true,
    },
    accessibility: {
      reduceMotion: false,
      screenReader: false,
    },
  },
  // Second mock ward for the second linked child
  "nb-user-011": {
    id: "nb-user-011",
    name: "Meera Pillai",
    email: "meera@neurobridge.in",
    role: "user",
    abhaId: "22-9876-5432-1100",
    careLinkId: "CL-MEERA-0011",
    selectedProfile: "dyslexia",
    disorders: [DISORDERS.DYSLEXIA],
    privacy: {
      shareActivity: true,
      shareJournal: true,
      shareAlerts: true,
    },
    accessibility: { reduceMotion: false, screenReader: true },
  },
  guardian: {
    id: "nb-guardian-001",
    name: "Suma Thomas",
    email: "suma@neurobridge.in",
    role: "guardian",
    abhaId: "33-1122-3344-5566",
    linkedWardIds: ["nb-user-042", "nb-user-011"],
    relationship: "Parent",
  },
};

// ─────────────────────────────────────────────
//  Ward profiles (used by guardian dashboard)
//  In production this would be a secure API call.
// ─────────────────────────────────────────────
export const MOCK_WARD_ACTIVITY = {
  "nb-user-042": {
    name: "Arun Kumar",
    profile: "ocd",
    today: [
      { time: "08:14", event: "Completed a 10-min Mindfulness session", type: "positive" },
      { time: "10:02", event: "Resisted 3 compulsions using Ritual Delayer", type: "positive" },
      { time: "12:30", event: "Logged a thought trigger: contamination concern", type: "neutral" },
      { time: "14:55", event: "ERP session: SUDS dropped from 72 → 34", type: "positive" },
      { time: "16:10", event: "SOS Grounding triggered — high anxiety moment", type: "alert" },
      { time: "18:00", event: "Completed 2 Response Prevention Goals", type: "positive" },
    ],
    alerts: [
      { id: "a1", ts: "Today 16:10", level: "high",   message: "SOS Grounding activated. SUDS reported at 85.", resolved: false },
      { id: "a2", ts: "Yesterday",   level: "medium", message: "Missed 2 scheduled ERP sessions.",             resolved: true },
    ],
    journalNotes: [
      { id: "j1", from: "guardian", text: "So proud of you for your ERP session today! 🌟", ts: "Today 08:00", private: false },
      { id: "j2", from: "ward",     text: "Felt really anxious at school but used the 4-7-8 breathing.", ts: "Today 13:00", private: false },
    ],
    weeklyStats: { erpSessions: 5, compulsionsResisted: 14, averageSuds: 48, streakDays: 4 },
  },
  "nb-user-011": {
    name: "Meera Pillai",
    profile: "dyslexia",
    today: [
      { time: "09:00", event: "Completed 3 Adaptive Reading modules", type: "positive" },
      { time: "11:30", event: "Word Bank: 12 new words mastered", type: "positive" },
      { time: "14:00", event: "Reader Mode session: 22 minutes", type: "positive" },
    ],
    alerts: [],
    journalNotes: [
      { id: "j3", from: "guardian", text: "Amazing reading session today, Meera!", ts: "Today 09:30", private: false },
    ],
    weeklyStats: { readingModules: 11, wordsMastered: 47, averageSession: 18, streakDays: 7 },
  },
};

// ─────────────────────────────────────────────
//  Context
// ─────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // hydrating from storage

  // Derive disorders and enabled features from the user object.
  // disorders: user.disorders ?? [selectedProfile] for backward compat
  const disorders = useMemo(() => {
    if (!user) return [];
    if (Array.isArray(user.disorders) && user.disorders.length > 0) return user.disorders;
    if (user.selectedProfile) return [user.selectedProfile]; // legacy single-profile
    return [];
  }, [user]);

  const enabledFeatures = useMemo(() => resolveEnabledFeatures(disorders), [disorders]);

  /** Check whether a feature key is unlocked for the current user. */
  const hasFeature = useCallback((featureKey) => enabledFeatures.has(featureKey), [enabledFeatures]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("nb_auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setIsAuthenticated(true);
      }
    } catch {
      localStorage.removeItem("nb_auth");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── mock login ─────────────────────────────
  // Returns a Promise so the Login page can await it and show a spinner.
  // Swap the setTimeout internals for a real fetch() when backend is ready.
  const login = useCallback((role) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mockUser = MOCK_USERS[role];
        if (!mockUser) {
          reject(new Error("Invalid role"));
          return;
        }
        // Merge any persisted user prefs from previous session
        const persisted = (() => {
          try {
            return JSON.parse(localStorage.getItem(`nb_prefs_${mockUser.id}`) || "{}");
          } catch {
            return {};
          }
        })();
        const fullUser = { ...mockUser, ...persisted };
        localStorage.setItem("nb_auth", JSON.stringify(fullUser));
        setUser(fullUser);
        setIsAuthenticated(true);
        resolve(fullUser);
      }, 900); // simulates network latency
    });
  }, []);

  // ── Guardian: link a ward via Care-Link ID ──
  // In production: POST /api/guardian/link-ward { careLinkId }
  const linkWard = useCallback((careLinkId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const wardId = CARE_LINK_REGISTRY[careLinkId.trim().toUpperCase()];
        if (!wardId) {
          reject(new Error("Care-Link ID not found. Please check and try again."));
          return;
        }
        setUser((prev) => {
          const updated = {
            ...prev,
            linkedWardIds: [...new Set([...(prev.linkedWardIds ?? []), wardId])],
          };
          localStorage.setItem("nb_auth", JSON.stringify(updated));
          return updated;
        });
        resolve(wardId);
      }, 700);
    });
  }, []);

  // ── Guardian: post a journal note to a ward ─
  const postGuardianNote = useCallback((wardId, text) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In production this writes to backend; here we store in localStorage
        const key = `nb_guardian_notes_${wardId}`;
        const existing = (() => {
          try { return JSON.parse(localStorage.getItem(key) || "[]"); }
          catch { return []; }
        })();
        const note = {
          id: `gn-${Date.now()}`,
          from: "guardian",
          text,
          ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          private: false,
        };
        localStorage.setItem(key, JSON.stringify([note, ...existing]));
        resolve(note);
      }, 400);
    });
  }, []);

  // ── logout ─────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("nb_auth");
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // ── update user profile (persists) ─────────
  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      const updated = { ...prev, ...patch };
      localStorage.setItem("nb_auth", JSON.stringify(updated));
      localStorage.setItem(`nb_prefs_${prev.id}`, JSON.stringify(patch));
      return updated;
    });
  }, []);

  // ── update selected disorders + recompute features
  // Returns a Promise so callers can await it (e.g. onboarding page).
  const updateDisorders = useCallback((newDisorders) => {
    return new Promise((resolve) => {
      setUser((prev) => {
        const updated = { ...prev, disorders: newDisorders };
        localStorage.setItem("nb_auth", JSON.stringify(updated));
        localStorage.setItem(`nb_prefs_${prev.id}`, JSON.stringify({ disorders: newDisorders }));
        resolve(updated);
        return updated;
      });
    });
  }, []);

  const value = {
    user,
    role: user?.role ?? null,
    isAuthenticated,
    isLoading,
    // ── Disorder-aware feature system ──────────
    disorders,
    enabledFeatures,
    hasFeature,
    updateDisorders,
    // ── Core auth ──────────────────────────────
    login,
    logout,
    updateUser,
    linkWard,
    postGuardianNote,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─────────────────────────────────────────────
//  Hook
// ─────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
