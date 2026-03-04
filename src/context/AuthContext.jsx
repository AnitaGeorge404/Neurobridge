import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { resolveEnabledFeatures } from "@/lib/featureRegistry";
import { DISORDERS } from "@/lib/disorders";
import { pushWardNote } from "@/lib/careSyncStore";
import { supabase } from "@/lib/supabaseClient";

// ─────────────────────────────────────────────
//  Build a NeuroBridge profile from a Supabase
//  auth user object (real sign-in path).
//  Role + disorders are stored in user_metadata
//  so clinicians can set them via the dashboard.
// ─────────────────────────────────────────────
function buildProfileFromSupabase(supabaseUser) {
  const meta    = supabaseUser.user_metadata  ?? {};
  const appMeta = supabaseUser.app_metadata   ?? {};
  return {
    id:              supabaseUser.id,
    email:           supabaseUser.email,
    name:            meta.name || meta.full_name || supabaseUser.email?.split("@")[0] || "User",
    role:            appMeta.role    || meta.role    || "user",
    abhaId:          meta.abhaId    ?? null,
    selectedProfile: meta.selectedProfile ?? null,
    disorders:       Array.isArray(meta.disorders) ? meta.disorders : [],
    privacy:         meta.privacy         ?? { shareActivity: true, shareJournal: false, shareAlerts: true },
    accessibility:   meta.accessibility   ?? { reduceMotion: false, screenReader: false },
    linkedWardIds:   meta.linkedWardIds   ?? [],
    _supabase: true,   // distinguishes real users from mock demo users
  };
}

// ─────────────────────────────────────────────
//  Care-Link ID → ward user lookup
//  Each user has a unique careLinkId that a
//  guardian enters during onboarding.
// ─────────────────────────────────────────────
export const CARE_LINK_REGISTRY = {
  "CL-ARUN-0042": "nb-user-042",
  "CL-MEERA-0011": "nb-user-011",
  "CL-RIYA-0088": "nb-user-088",
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
  user_asd_anxiety: {
    id: "nb-user-088",
    name: "Riya Sen",
    email: "riya@neurobridge.in",
    role: "user",
    abhaId: "44-8080-9090-1010",
    careLinkId: "CL-RIYA-0088",
    selectedProfile: "anxiety",
    disorders: [DISORDERS.ANXIETY, DISORDERS.ASD],
    privacy: {
      shareActivity: true,
      shareJournal: true,
      shareAlerts: true,
    },
    accessibility: {
      reduceMotion: false,
      screenReader: false,
    },
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
  guardian_asd_anxiety: {
    id: "nb-guardian-088",
    name: "Neha Sen",
    email: "neha.guardian@neurobridge.in",
    role: "guardian",
    abhaId: "55-2222-3333-4444",
    linkedWardIds: ["nb-user-088"],
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
  "nb-user-088": {
    name: "Riya Sen",
    profile: "anxiety",
    today: [
      { time: "08:10", event: "Started ASD routine visual schedule", type: "positive" },
      { time: "10:05", event: "Sensory break completed with calm breathing", type: "positive" },
      { time: "13:20", event: "Anxiety trigger logged: loud classroom noise", type: "neutral" },
      { time: "16:00", event: "Panic mode activated and resolved in 5 minutes", type: "alert" },
      { time: "18:30", event: "Completed social story flashcards", type: "positive" },
    ],
    alerts: [
      { id: "a88-1", ts: "Today 16:00", level: "medium", message: "Panic mode triggered from Anxiety toolkit.", resolved: false },
    ],
    journalNotes: [
      { id: "j88-1", from: "ward", text: "Noise felt too much, but breathing helped me calm down.", ts: "Today 16:20", private: false },
    ],
    weeklyStats: { calmingSessions: 9, sensoryBreaks: 12, averageAnxiety: 42, streakDays: 5 },
  },
};

function resolveMockAccountKey(role, options = {}) {
  const email = String(options.email || "").toLowerCase().trim();
  const careLinkId = String(options.careLinkId || "").toUpperCase();

  if (email.includes("riya")) {
    return role === "guardian" ? "guardian_asd_anxiety" : "user_asd_anxiety";
  }

  if (email.includes("neha")) {
    return "guardian_asd_anxiety";
  }

  if (careLinkId === "CL-RIYA-0088") {
    return "guardian_asd_anxiety";
  }

  if (role === "user") {
    if (email.includes("anxiety") || email.includes("asd")) {
      return "user_asd_anxiety";
    }
    return "user";
  }

  if (role === "guardian") {
    if (
      email.includes("neha") ||
      email.includes("riya") ||
      careLinkId === "CL-RIYA-0088"
    ) {
      return "guardian_asd_anxiety";
    }
    return "guardian";
  }

  return role;
}

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

  // Hydrate: Supabase session takes priority; fall back to nb_auth (demo users)
  useEffect(() => {
    let mounted = true;

    // 1. Subscribe to Supabase session changes (real users)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          const profile = buildProfileFromSupabase(session.user);
          // Merge any persisted prefs (disorders etc.) saved via updateDisorders
          const persisted = (() => {
            try { return JSON.parse(localStorage.getItem(`nb_prefs_${profile.id}`) || "{}"); }
            catch { return {}; }
          })();
          const merged = { ...profile, ...persisted };
          localStorage.setItem("nb_auth", JSON.stringify(merged));
          setUser(merged);
          setIsAuthenticated(true);
        }
      }
    );

    // 2. Check for existing Supabase session first, then nb_auth for demo users
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        // Real user — handled by onAuthStateChange above; just release loading
        setIsLoading(false);
      } else {
        // No Supabase session → try demo/mock nb_auth
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
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ── Real Supabase login (email + password) ─
  // Used by the sign-in form.  Demo cards still use the mock login below.
  const loginWithEmail = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    const profile = buildProfileFromSupabase(data.user);
    const persisted = (() => {
      try { return JSON.parse(localStorage.getItem(`nb_prefs_${profile.id}`) || "{}"); }
      catch { return {}; }
    })();
    return { ...profile, ...persisted };
  }, []);

  // ── Real Supabase sign-up ───────────────────
  // Stores name + role in user_metadata so buildProfileFromSupabase picks them up.
  // Supabase sends a confirmation email; returns { needsConfirmation: true } when
  // email confirmation is required, or the full profile when auto-confirm is on.
  const signUpWithEmail = useCallback(async (email, password, name, role = "user") => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role, disorders: [] },
      },
    });
    if (error) throw new Error(error.message);
    // identities array is empty when the email already exists
    if (data.user && data.user.identities?.length === 0) {
      throw new Error("An account with this email already exists. Please sign in.");
    }
    // If Supabase requires email confirmation, the session will be null
    if (!data.session) {
      return { needsConfirmation: true };
    }
    const profile = buildProfileFromSupabase(data.user);
    return { ...profile, needsConfirmation: false };
  }, []);

  // ── mock login (demo cards only) ───────────
  const login = useCallback((role, options = {}) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const accountKey = options.accountKey || resolveMockAccountKey(role, options);
        const mockUser = MOCK_USERS[accountKey];
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
        const note = {
          id: `gn-${Date.now()}`,
          from: "guardian",
          text,
          ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          private: false,
        };
        pushWardNote(wardId, { from: "guardian", text, isPrivate: false });
        resolve(note);
      }, 400);
    });
  }, []);

  // ── logout ─────────────────────────────────
  const logout = useCallback(async () => {
    // Sign out from Supabase (no-op if not a real session)
    await supabase.auth.signOut().catch(() => {});
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
      // For real Supabase users, sync to user_metadata so it persists server-side
      if (prev?._supabase) {
        supabase.auth.updateUser({ data: patch }).catch(() => {});
      }
      return updated;
    });
  }, []);

  // ── update selected disorders + recompute features
  const updateDisorders = useCallback((newDisorders) => {
    return new Promise((resolve) => {
      setUser((prev) => {
        const updated = { ...prev, disorders: newDisorders };
        localStorage.setItem("nb_auth", JSON.stringify(updated));
        localStorage.setItem(`nb_prefs_${prev.id}`, JSON.stringify({ disorders: newDisorders }));
        // Sync to Supabase user_metadata for real users so it survives re-login
        if (prev?._supabase) {
          supabase.auth.updateUser({ data: { disorders: newDisorders } }).catch(() => {});
        }
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
    login,           // mock demo cards
    loginWithEmail,  // real Supabase sign-in form
    signUpWithEmail, // real Supabase sign-up form
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
