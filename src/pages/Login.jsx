import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ShieldCheck, User, Heart, Loader2, Eye, EyeOff, Sparkles, Link2, UserPlus, LogIn, MailCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// ─────────────────────────────────────────────
//  Role definitions for the 3-way toggle
// ─────────────────────────────────────────────
const ROLES = [
  {
    id: "user",     label: "User",     icon: User,        desc: "Neurodivergent individual",
    border: "border-sky-400/40",    bg: "bg-sky-400/10",    hover: "hover:bg-sky-400/20",
    iconColor: "text-sky-400",      nameColor: "text-sky-300",   mutedColor: "text-sky-300/60",
  },
  {
    id: "guardian", label: "Guardian", icon: Heart,       desc: "Family Care-Circle member",
    border: "border-violet-400/40", bg: "bg-violet-400/10", hover: "hover:bg-violet-400/20",
    iconColor: "text-violet-400",   nameColor: "text-violet-300", mutedColor: "text-violet-300/60",
  },
  {
    id: "admin",    label: "Admin",    icon: ShieldCheck, desc: "Clinical Coordinator / ASHA",
    border: "border-amber-400/40",  bg: "bg-amber-400/10",  hover: "hover:bg-amber-400/20",
    iconColor: "text-amber-400",    nameColor: "text-amber-300",  mutedColor: "text-amber-300/60",
  },
];

// ─────────────────────────────────────────────
//  Glassmorphism Login Page — 3-way RBAC
// ─────────────────────────────────────────────
export default function Login() {
  const { login, loginWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // “signin” | “signup”
  const [mode, setMode] = useState("signin");
  const [selectedRole, setSelectedRole] = useState("user");
  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [careLinkId, setCareLinkId] = useState("");
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [loadingRole, setLoadingRole]     = useState(null);
  const [error, setError]           = useState("");
  const [confirmed, setConfirmed]   = useState(false); // email confirmation pending

  const from = location.state?.from?.pathname;
  const roleConfig = ROLES.find((r) => r.id === selectedRole);
  function inferDemoAccountByEmail(rawEmail, rawCareLinkId) {
    const normalizedEmail = String(rawEmail || "").toLowerCase().trim();
    const normalizedCareLink = String(rawCareLinkId || "").toUpperCase().trim();

    if (normalizedEmail === "riya@neurobridge.in" || normalizedEmail.includes("riya")) {
      return { role: "user", accountKey: "user_asd_anxiety" };
    }
    if (
      normalizedEmail === "neha.guardian@neurobridge.in" ||
      normalizedEmail.includes("neha") ||
      normalizedCareLink === "CL-RIYA-0088"
    ) {
      return { role: "guardian", accountKey: "guardian_asd_anxiety" };
    }
    return null;
  }

  function switchMode(next) {
    setMode(next);
    setError("");
    setName(""); setEmail(""); setPassword(""); setConfirmPw("");
  }

  function getRedirectPath(user) {
    if (user.role === "admin") return "/admin";
    if (user.role === "guardian") return "/guardian-dashboard";
    // Always show disorder selection on every login so users can review/update
    // their plan before entering the app.
    return "/onboarding/disorders";
  }

  async function handleDemoLogin(role, options = {}) {
    setError("");
    setLoadingRole(role);
    try {
      // infer account key the same way as before
      const normalizedEmail = String(options.email || "").toLowerCase();
      const normalizedCareLink = String(options.careLinkId || "").toUpperCase();
      let accountKey = options.accountKey;
      if (!accountKey) {
        if (normalizedEmail.includes("neha") || normalizedCareLink === "CL-RIYA-0088") accountKey = "guardian_asd_anxiety";
        else if (normalizedEmail.includes("riya")) accountKey = role === "guardian" ? "guardian_asd_anxiety" : "user_asd_anxiety";
        else accountKey = role;
      }
      const user = await login(role, { ...options, accountKey });
      navigate(getRedirectPath(user), { replace: true });
    } catch (e) {
      setError(e.message || "Login failed. Please try again.");
    } finally {
      setLoadingRole(null);
    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    setError("");

    if (mode === "signup") {
      if (!name.trim()) { setError("Please enter your name."); return; }
      if (!email || !password) { setError("Please fill in all fields."); return; }
      if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
      if (password !== confirmPw) { setError("Passwords do not match."); return; }
      setLoadingRole("form");
      try {
        const result = await signUpWithEmail(email.trim(), password, name.trim(), selectedRole);
        if (result.needsConfirmation) {
          setConfirmed(true); // show confirmation-pending screen
        } else {
          navigate(getRedirectPath(result), { replace: true });
        }
      } catch (e) {
        setError(e.message || "Sign up failed. Please try again.");
      } finally {
        setLoadingRole(null);
      }
    } else {
      if (!email || !password) { setError("Please enter your credentials."); return; }
      setLoadingRole("form");
      try {
        const user = await loginWithEmail(email.trim(), password);
        navigate(getRedirectPath(user), { replace: true });
      } catch (e) {
        const mappedDemo = inferDemoAccountByEmail(email, careLinkId);
        if (mappedDemo) {
          try {
            const demoUser = await login(mappedDemo.role, {
              email,
              careLinkId,
              accountKey: mappedDemo.accountKey,
            });
            navigate(getRedirectPath(demoUser), { replace: true });
            return;
          } catch {
            setError("Sign in failed. Demo fallback could not be loaded.");
            return;
          }
        }

        setError(e.message || "Sign in failed. Check your email and password.");
      } finally {
        setLoadingRole(null);
      }
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-4 py-8"
      >
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl p-8">

          {/* ── Email confirmation pending ─────── */}
          <AnimatePresence mode="wait">
            {confirmed ? (
              <motion.div
                key="confirmed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-4 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                  <MailCheck className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Check your inbox</h2>
                <p className="text-sm text-white/50 leading-relaxed">
                  We sent a confirmation link to <span className="text-white/80 font-medium">{email}</span>.
                  Click it to activate your account, then come back and sign in.
                </p>
                <button
                  onClick={() => { setConfirmed(false); switchMode("signin"); }}
                  className="mt-2 text-sm text-primary hover:text-primary/80 underline underline-offset-2 transition"
                >
                  Back to Sign In
                </button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                {/* Logo */}
                <div className="flex flex-col items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-white tracking-tight">NeuroBridge</h1>
                    <p className="text-sm text-white/50 mt-0.5">Neuro-inclusive care platform</p>
                  </div>
                </div>

                {/* ── Sign in / Sign up tab toggle ── */}
                <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1 gap-1 mb-5">
                  {[
                    { id: "signin", label: "Sign In",  icon: LogIn },
                    { id: "signup", label: "Sign Up",  icon: UserPlus },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => switchMode(id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        mode === id
                          ? "bg-primary/20 border border-primary/40 text-primary"
                          : "text-white/40 hover:text-white/70 hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>

                {/* ── Role toggle (sign-up shows all; sign-in shows user + guardian) ── */}
                <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1 gap-1 mb-2">
                  {(mode === "signup" ? ROLES : ROLES).map((r) => {
                    const Icon = r.icon;
                    const active = selectedRole === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => { setSelectedRole(r.id); setError(""); }}
                        className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl text-xs font-medium transition-all ${
                          active
                            ? `${r.bg} ${r.border} border`
                            : "text-white/40 hover:text-white/70 hover:bg-white/5"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${active ? r.iconColor : ""}`} />
                        <span className={active ? r.nameColor : ""}>{r.label}</span>
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={selectedRole}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.18 }}
                    className="text-center text-xs text-white/40 mb-5"
                  >
                    {roleConfig.desc}
                  </motion.p>
                </AnimatePresence>

                {/* ── Form fields ───────────────── */}
                <form onSubmit={handleFormSubmit} className="space-y-4">

                  {/* Name — sign-up only */}
                  <AnimatePresence>
                    {mode === "signup" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1 overflow-hidden"
                      >
                        <label className="text-xs font-medium text-white/60 uppercase tracking-widest">Full Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/60 transition"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-widest">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/60 transition"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-widest">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={mode === "signup" ? "Min. 8 characters" : "••••••••"}
                        autoComplete={mode === "signup" ? "new-password" : "current-password"}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-11 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/60 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm password — sign-up only */}
                  <AnimatePresence>
                    {mode === "signup" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1 overflow-hidden"
                      >
                        <label className="text-xs font-medium text-white/60 uppercase tracking-widest">Confirm Password</label>
                        <div className="relative">
                          <input
                            type={showConfirm ? "text" : "password"}
                            value={confirmPw}
                            onChange={(e) => setConfirmPw(e.target.value)}
                            placeholder="Repeat password"
                            autoComplete="new-password"
                            className={`w-full rounded-xl border bg-white/5 px-4 py-3 pr-11 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/60 transition ${
                              confirmPw && confirmPw !== password
                                ? "border-red-400/50"
                                : "border-white/10"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition"
                          >
                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {confirmPw && confirmPw !== password && (
                          <p className="text-[11px] text-red-400">Passwords do not match</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Guardian-only: Care-Link ID (sign-in only — sign-up sets this later) */}
                  <AnimatePresence>
                    {selectedRole === "guardian" && mode === "signin" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1 overflow-hidden"
                      >
                        <label className="text-xs font-medium text-white/60 uppercase tracking-widest flex items-center gap-1.5">
                          <Link2 className="w-3 h-3" /> Ward's Care-Link ID
                        </label>
                        <input
                          type="text"
                          value={careLinkId}
                          onChange={(e) => setCareLinkId(e.target.value)}
                          placeholder="e.g. CL-ARUN-0042"
                          className="w-full rounded-xl border border-violet-400/30 bg-violet-400/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-400/50 transition"
                        />
                        <p className="text-[11px] text-violet-300/50 leading-tight">
                          Provided by your ward's NeuroBridge account. Links your Care-Circle.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={!!loadingRole}
                    className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 disabled:opacity-60 transition flex items-center justify-center gap-2"
                  >
                    {loadingRole === "form"
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : mode === "signup"
                        ? <><UserPlus className="w-4 h-4" /> Create Account</>
                        : <><LogIn className="w-4 h-4" /> Sign In</>
                    }
                  </button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-white/30">SheBuildsTech Demo Access</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Demo cards — all 3 roles */}
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map((r) => {
                    const Icon = r.icon;
                    const isLoading = loadingRole === r.id;
                    return (
                      <motion.button
                        key={r.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => { setSelectedRole(r.id); handleDemoLogin(r.id); }}
                        disabled={!!loadingRole}
                        className={`flex flex-col items-center gap-2 rounded-2xl border ${r.border} ${r.bg} ${r.hover} px-3 py-4 disabled:opacity-50 transition`}
                      >
                        {isLoading
                          ? <Loader2 className={`w-6 h-6 ${r.iconColor} animate-spin`} />
                          : <Icon className={`w-6 h-6 ${r.iconColor}`} />
                        }
                        <div className="text-center">
                          <div className={`text-xs font-semibold ${r.nameColor}`}>{r.label}</div>
                          <div className={`text-[10px] ${r.mutedColor} leading-tight`}>Demo</div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <p className="mt-5 text-center text-xs text-white/25">
                  <Sparkles className="inline w-3 h-3 mr-1" />
                  Demo credentials are pre-filled. No real data is stored.
                </p>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  );
}
