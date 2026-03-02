import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Brain, Zap, BookOpen, Calculator, Shield, Hand, Ear, Sparkles,
  Home, ArrowLeftRight, User, Settings, ShieldCheck, LogOut, Heart,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const USER_NAV = [
  { title: "Home",        path: "/",            icon: Home },
  { title: "ASD",         path: "/asd",         icon: Brain },
  { title: "ADHD",        path: "/adhd",        icon: Zap },
  { title: "Dyslexia",    path: "/dyslexia",    icon: BookOpen },
  { title: "Dyscalculia", path: "/dyscalculia", icon: Calculator },
  { title: "OCD",         path: "/ocd",         icon: Shield },
  { title: "Dyspraxia",   path: "/dyspraxia",   icon: Hand },
  { title: "APD",         path: "/apd",         icon: Ear },
  { title: "Tourette's",  path: "/tourettes",   icon: Sparkles },
];

const ADMIN_NAV = [
  { title: "Dashboard",   path: "/admin",              icon: ShieldCheck },
];

const GUARDIAN_NAV = [
  { title: "Care-Circle", path: "/guardian-dashboard", icon: Heart },
];

export default function AppLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, isAuthenticated, logout } = useAuth();

  const navItems = role === "admin" ? ADMIN_NAV : role === "guardian" ? GUARDIAN_NAV : USER_NAV;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* ── Sidebar (desktop) ─────────────────── */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card p-4 gap-2 sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-3 px-3 py-4 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">NeuroBridge</span>
        </div>

        {/* User identity card */}
        {isAuthenticated && user ? (
          <Link
            to={role === "admin" ? "/admin" : role === "guardian" ? "/guardian-dashboard" : "/settings"}
            className="neuro-card p-3 mb-4 flex items-center gap-3 hover:bg-secondary transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
              {role === "admin"
                ? <ShieldCheck className="w-4 h-4 text-amber-500" />                : role === "guardian"
                ? <Heart className="w-4 h-4 text-violet-500" />                : <User className="w-4 h-4 text-primary" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user.abhaId ?? (role === "admin" ? "Admin" : "No ABHA linked")}
              </p>
            </div>
          </Link>
        ) : (
          <div className="neuro-card p-3 mb-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Not signed in</p>
            </div>
          </div>
        )}

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="flex flex-col gap-1 mt-2">
          {role === "user" && (
            <Link to="/settings" className="neuro-btn-outline text-sm gap-2">
              <Settings className="w-4 h-4" /> Settings
            </Link>
          )}
          {isAuthenticated ? (
            <button onClick={handleLogout} className="neuro-btn-outline text-sm gap-2">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          ) : (
            <Link to="/login" className="neuro-btn-outline text-sm gap-2">
              <User className="w-4 h-4" /> Sign in
            </Link>
          )}
          {role === "user" && (
            <Link to="/" className="neuro-btn-outline text-sm gap-2 mt-1">
              <ArrowLeftRight className="w-4 h-4" /> Switch Mode
            </Link>
          )}
        </div>
      </aside>

      {/* ── Mobile top bar ─────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="md:hidden flex items-center justify-between border-b border-border bg-card px-4 py-3 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">NeuroBridge</span>
          </div>
          <div className="flex items-center gap-2">
            {role === "user" && (
              <Link to="/settings" className="neuro-btn-ghost text-sm py-2 px-3 min-h-0 gap-1">
                <Settings className="w-4 h-4" />
              </Link>
            )}
            {isAuthenticated ? (
              <button onClick={handleLogout} className="neuro-btn-ghost text-sm py-2 px-3 min-h-0 gap-1">
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <Link to="/login" className="neuro-btn-ghost text-sm py-2 px-3 min-h-0 gap-1">
                <User className="w-4 h-4" />
              </Link>
            )}
            {role === "user" && (
              <Link to="/" className="neuro-btn-ghost text-sm py-2 px-3 min-h-0 gap-1">
                <ArrowLeftRight className="w-4 h-4" /> Modes
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
