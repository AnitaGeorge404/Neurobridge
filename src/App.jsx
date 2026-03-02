import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

// ── Pages ────────────────────────────────────
import Login from "./pages/Login";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserSettings from "./pages/user/UserSettings";
import GuardianDashboard from "./pages/guardian/GuardianDashboard";

// ── ASD ──────────────────────────────────────
import ASDPage from "./pages/ASDPage";

// ── ADHD ─────────────────────────────────────
import ADHDDashboard from "./pages/adhd/ADHDDashboard";
import EmotionCoach from "./pages/adhd/EmotionCoach";
import VisualTimeline from "./pages/adhd/VisualTimeline";
import TaskBreakdown from "./pages/adhd/TaskBreakdown";
import FocusSessions from "./pages/adhd/FocusSessions";
import Soundscapes from "./pages/adhd/SoundScapes";
import BodyDoubling from "./pages/adhd/BodyDoubling";

// ── Dyslexia ─────────────────────────────────
import DyslexiaPage from "./pages/DyslexiaPage";
import ReaderMode from "./pages/dyslexia/ReaderMode";
import WordBank from "./pages/dyslexia/WordBank";

// ── Other conditions ─────────────────────────
import DyscalculiaPage from "./pages/DyscalculiaPage";
import AnxietyPage from "./pages/AnxietyPage";
import TourettesPage from "./pages/TourettesPage";

// ── OCD ──────────────────────────────────────
import OCDDashboard from "./pages/ocd/OCDDashboard";
import ERPHierarchy from "./pages/ocd/ERPHierarchy";
import RitualDelayer from "./pages/ocd/RitualDelayer";
import CompulsionHeatmap from "./pages/ocd/CompulsionHeatmap";
import LogicCheckJournal from "./pages/ocd/LogicCheckJournal";

// ── Dyspraxia ────────────────────────────────
import DyspraxiaDashboard from "./pages/dyspraxia/DyspraxiaDashboard";
import AOMILibrary from "./pages/dyspraxia/AOMILibrary";
import HapticPacer from "./pages/dyspraxia/HapticPacer";
import ARInstructionCards from "./pages/dyspraxia/ARInstructionCards";
import SafeRoutePlanner from "./pages/dyspraxia/SafeRoutePlanner";

const queryClient = new QueryClient();

// ─────────────────────────────────────────────
//  ShellRoutes — all routes rendered inside the
//  AppLayout sidebar shell (auth-protected)
// ─────────────────────────────────────────────
function ShellRoutes() {
  return (
    <AppLayout>
      <Routes>
        {/* Admin-only */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />

        {/* Guardian-only */}
        <Route path="/guardian-dashboard" element={<ProtectedRoute role="guardian"><GuardianDashboard /></ProtectedRoute>} />

        {/* User-only */}
        <Route path="/settings" element={<ProtectedRoute role="user"><UserSettings /></ProtectedRoute>} />

        {/* Any authenticated user */}
        <Route path="/"                      element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/asd"                   element={<ProtectedRoute><ASDPage /></ProtectedRoute>} />
        <Route path="/adhd"                  element={<ProtectedRoute><ADHDDashboard /></ProtectedRoute>} />
        <Route path="/adhd/timeline"         element={<ProtectedRoute><VisualTimeline /></ProtectedRoute>} />
        <Route path="/adhd/breakdown"        element={<ProtectedRoute><TaskBreakdown /></ProtectedRoute>} />
        <Route path="/adhd/focus"            element={<ProtectedRoute><FocusSessions /></ProtectedRoute>} />
        <Route path="/adhd/sounds"           element={<ProtectedRoute><Soundscapes /></ProtectedRoute>} />
        <Route path="/adhd/doubling"         element={<ProtectedRoute><BodyDoubling /></ProtectedRoute>} />
        <Route path="/adhd/emotion-coach"    element={<ProtectedRoute><EmotionCoach /></ProtectedRoute>} />
        <Route path="/dyslexia"              element={<ProtectedRoute><DyslexiaPage /></ProtectedRoute>} />
        <Route path="/dyslexia/reader"       element={<ProtectedRoute><ReaderMode /></ProtectedRoute>} />
        <Route path="/dyslexia/word-bank"    element={<ProtectedRoute><WordBank /></ProtectedRoute>} />
        <Route path="/dyscalculia"           element={<ProtectedRoute><DyscalculiaPage /></ProtectedRoute>} />
        <Route path="/ocd"                   element={<ProtectedRoute><OCDDashboard /></ProtectedRoute>} />
        <Route path="/ocd/erp-hierarchy"     element={<ProtectedRoute><ERPHierarchy /></ProtectedRoute>} />
        <Route path="/ocd/ritual-delayer"    element={<ProtectedRoute><RitualDelayer /></ProtectedRoute>} />
        <Route path="/ocd/compulsion-heatmap" element={<ProtectedRoute><CompulsionHeatmap /></ProtectedRoute>} />
        <Route path="/ocd/logic-journal"     element={<ProtectedRoute><LogicCheckJournal /></ProtectedRoute>} />
        <Route path="/dyspraxia"             element={<ProtectedRoute><DyspraxiaDashboard /></ProtectedRoute>} />
        <Route path="/dyspraxia/aomi-library" element={<ProtectedRoute><AOMILibrary /></ProtectedRoute>} />
        <Route path="/dyspraxia/haptic-pacer" element={<ProtectedRoute><HapticPacer /></ProtectedRoute>} />
        <Route path="/dyspraxia/ar-instructions" element={<ProtectedRoute><ARInstructionCards /></ProtectedRoute>} />
        <Route path="/dyspraxia/safe-route"  element={<ProtectedRoute><SafeRoutePlanner /></ProtectedRoute>} />
        <Route path="/anxiety"               element={<ProtectedRoute><AnxietyPage /></ProtectedRoute>} />
        <Route path="/tourettes"             element={<ProtectedRoute><TourettesPage /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

// ─────────────────────────────────────────────
//  App root
// ─────────────────────────────────────────────
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public — no layout, no auth required */}
            <Route path="/login" element={<Login />} />

            {/* Everything else goes through the sidebar shell */}
            <Route path="/*" element={<ShellRoutes />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

