import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { FEATURES } from "@/lib/featureRegistry";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

// ── Onboarding ─────────────────────────────
import DisorderSelection from "./pages/onboarding/DisorderSelection";

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
        <Route path="/"                       element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/asd"                    element={<ProtectedRoute feature={FEATURES.ASD}><ASDPage /></ProtectedRoute>} />
        <Route path="/adhd"                   element={<ProtectedRoute feature={FEATURES.ADHD}><ADHDDashboard /></ProtectedRoute>} />
        <Route path="/adhd/timeline"          element={<ProtectedRoute feature={FEATURES.ADHD_TIMELINE}><VisualTimeline /></ProtectedRoute>} />
        <Route path="/adhd/breakdown"         element={<ProtectedRoute feature={FEATURES.ADHD_BREAKDOWN}><TaskBreakdown /></ProtectedRoute>} />
        <Route path="/adhd/focus"             element={<ProtectedRoute feature={FEATURES.ADHD_FOCUS}><FocusSessions /></ProtectedRoute>} />
        <Route path="/adhd/sounds"            element={<ProtectedRoute feature={FEATURES.ADHD_SOUNDS}><Soundscapes /></ProtectedRoute>} />
        <Route path="/adhd/doubling"          element={<ProtectedRoute feature={FEATURES.ADHD_DOUBLING}><BodyDoubling /></ProtectedRoute>} />
        <Route path="/adhd/emotion-coach"     element={<ProtectedRoute feature={FEATURES.ADHD_EMOTION}><EmotionCoach /></ProtectedRoute>} />
        <Route path="/dyslexia"               element={<ProtectedRoute feature={FEATURES.DYSLEXIA}><DyslexiaPage /></ProtectedRoute>} />
        <Route path="/dyslexia/reader"        element={<ProtectedRoute feature={FEATURES.DYSLEXIA_READER}><ReaderMode /></ProtectedRoute>} />
        <Route path="/dyslexia/word-bank"     element={<ProtectedRoute feature={FEATURES.DYSLEXIA_WORDBANK}><WordBank /></ProtectedRoute>} />
        <Route path="/dyscalculia"            element={<ProtectedRoute feature={FEATURES.DYSCALCULIA}><DyscalculiaPage /></ProtectedRoute>} />
        <Route path="/ocd"                    element={<ProtectedRoute feature={FEATURES.OCD}><OCDDashboard /></ProtectedRoute>} />
        <Route path="/ocd/erp-hierarchy"      element={<ProtectedRoute feature={FEATURES.OCD_ERP_TRACKER}><ERPHierarchy /></ProtectedRoute>} />
        <Route path="/ocd/ritual-delayer"     element={<ProtectedRoute feature={FEATURES.OCD_RITUAL_DELAYER}><RitualDelayer /></ProtectedRoute>} />
        <Route path="/ocd/compulsion-heatmap" element={<ProtectedRoute feature={FEATURES.OCD_HEATMAP}><CompulsionHeatmap /></ProtectedRoute>} />
        <Route path="/ocd/logic-journal"      element={<ProtectedRoute feature={FEATURES.OCD_LOGIC_JOURNAL}><LogicCheckJournal /></ProtectedRoute>} />
        <Route path="/dyspraxia"              element={<ProtectedRoute feature={FEATURES.DYSPRAXIA}><DyspraxiaDashboard /></ProtectedRoute>} />
        <Route path="/dyspraxia/aomi-library" element={<ProtectedRoute feature={FEATURES.DYSPRAXIA_AOMI}><AOMILibrary /></ProtectedRoute>} />
        <Route path="/dyspraxia/haptic-pacer" element={<ProtectedRoute feature={FEATURES.DYSPRAXIA_HAPTIC}><HapticPacer /></ProtectedRoute>} />
        <Route path="/dyspraxia/ar-instructions" element={<ProtectedRoute feature={FEATURES.DYSPRAXIA_AR}><ARInstructionCards /></ProtectedRoute>} />
        <Route path="/dyspraxia/safe-route"   element={<ProtectedRoute feature={FEATURES.DYSPRAXIA_ROUTE}><SafeRoutePlanner /></ProtectedRoute>} />
        <Route path="/anxiety"                element={<ProtectedRoute feature={FEATURES.ANXIETY}><AnxietyPage /></ProtectedRoute>} />
        <Route path="/tourettes"              element={<ProtectedRoute feature={FEATURES.TOURETTES}><TourettesPage /></ProtectedRoute>} />

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

            {/* Onboarding — auth required, its own minimal layout */}
            <Route
              path="/onboarding/disorders"
              element={
                <ProtectedRoute>
                  <DisorderSelection />
                </ProtectedRoute>
              }
            />

            {/* Everything else goes through the sidebar shell */}
            <Route path="/*" element={<ShellRoutes />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

