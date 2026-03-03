import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { FEATURES } from "@/lib/featureRegistry";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

// ── Onboarding ─────────────────────────────
import DisorderSelection from "./pages/onboarding/DisorderSelection";

// ── Pages ───────────────────────────────────
import Login from "./pages/Login";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserSettings from "./pages/user/UserSettings";
import GuardianDashboard from "./pages/guardian/GuardianDashboard";

// ── ASD ─────────────────────────────────────
import ASDPage from "./pages/ASDPage";

// ── ADHD ────────────────────────────────────
import ADHDDashboard from "./pages/adhd/ADHDDashboard";
import EmotionCoach from "./pages/adhd/EmotionCoach";
import VisualTimeline from "./pages/adhd/VisualTimeline";
import TaskBreakdown from "./pages/adhd/TaskBreakdown";
import FocusSessions from "./pages/adhd/FocusSessions";
import Soundscapes from "./pages/adhd/SoundScapes";
import BodyDoubling from "./pages/adhd/BodyDoubling";

// ── Dyslexia ────────────────────────────────
import DyslexiaPage from "./pages/DyslexiaPage";

// ── Other conditions ─────────────────────────
import DyscalculiaPage from "./pages/DyscalculiaPage";
import AnxietyPage from "./pages/AnxietyPage";

// ✅ Depression (YOUR EXACT FILES)
import DepressionDashboard from "./pages/depression/DepressionDashboard";
import MVHProtocol from "./pages/depression/MVHProtocol";
import AnxietyDissolver from "./pages/depression/AnxietyDissolver";
import SocialBroadcaster from "./pages/depression/SocialBroadcaster";
import EvidenceFolder from "./pages/depression/EvidenceFolder";
import CognitiveReframer from "./pages/depression/CognitiveReframer";
import VoidWhisper from "./pages/depression/VoidWhisper";

// ── OCD ─────────────────────────────────────
import OCDDashboard from "./pages/ocd/OCDDashboard";
import ERPHierarchy from "./pages/ocd/ERPHierarchy";
import RitualDelayer from "./pages/ocd/RitualDelayer";
import CompulsionHeatmap from "./pages/ocd/CompulsionHeatmap";
import LogicCheckJournal from "./pages/ocd/LogicCheckJournal";

// ── Dyspraxia ───────────────────────────────
import DyspraxiaDashboard from "./pages/dyspraxia/DyspraxiaDashboard";
import AOMILibrary from "./pages/dyspraxia/AOMILibrary";
import HapticPacer from "./pages/dyspraxia/HapticPacer";
import ARInstructionCards from "./pages/dyspraxia/ARInstructionCards";
import SafeRoutePlanner from "./pages/dyspraxia/SafeRoutePlanner";

const queryClient = new QueryClient();

/* =====================================================
   Shell Routes
===================================================== */
function ShellRoutes() {
  return (
    <AppLayout>
      <Routes>

        {/* Admin */}
        <Route path="/admin"
          element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>}
        />

        {/* Guardian */}
        <Route path="/guardian-dashboard"
          element={<ProtectedRoute role="guardian"><GuardianDashboard /></ProtectedRoute>}
        />

        {/* Settings */}
        <Route path="/settings"
          element={<ProtectedRoute role="user"><UserSettings /></ProtectedRoute>}
        />

        {/* Home */}
        <Route path="/"
          element={<ProtectedRoute><Index /></ProtectedRoute>}
        />

        {/* ASD */}
        <Route path="/asd"
          element={<ProtectedRoute feature={FEATURES.ASD}><ASDPage /></ProtectedRoute>}
        />

        {/* ADHD */}
        <Route path="/adhd"
          element={<ProtectedRoute feature={FEATURES.ADHD}><ADHDDashboard /></ProtectedRoute>}
        />
        <Route path="/adhd/timeline"
          element={<VisualTimeline />}
        />
        <Route path="/adhd/breakdown"
          element={<TaskBreakdown />}
        />
        <Route path="/adhd/focus"
          element={<FocusSessions />}
        />
        <Route path="/adhd/sounds"
          element={<Soundscapes />}
        />
        <Route path="/adhd/doubling"
          element={<BodyDoubling />}
        />
        <Route path="/adhd/emotion-coach"
          element={<EmotionCoach />}
        />

        {/* Learning */}
        <Route path="/dyslexia"
          element={<ProtectedRoute feature={FEATURES.DYSLEXIA}><DyslexiaPage /></ProtectedRoute>}
        />

        <Route path="/dyscalculia"
          element={<ProtectedRoute feature={FEATURES.DYSCALCULIA}><DyscalculiaPage /></ProtectedRoute>}
        />

        {/* OCD */}
        <Route path="/ocd"
          element={<ProtectedRoute feature={FEATURES.OCD}><OCDDashboard /></ProtectedRoute>}
        />
        <Route path="/ocd/erp-hierarchy" element={<ERPHierarchy />} />
        <Route path="/ocd/ritual-delayer" element={<RitualDelayer />} />
        <Route path="/ocd/compulsion-heatmap" element={<CompulsionHeatmap />} />
        <Route path="/ocd/logic-journal" element={<LogicCheckJournal />} />

        {/* Dyspraxia */}
        <Route path="/dyspraxia"
          element={<ProtectedRoute feature={FEATURES.DYSPRAXIA}><DyspraxiaDashboard /></ProtectedRoute>}
        />
        <Route path="/dyspraxia/aomi-library" element={<AOMILibrary />} />
        <Route path="/dyspraxia/haptic-pacer" element={<HapticPacer />} />
        <Route path="/dyspraxia/ar-instructions" element={<ARInstructionCards />} />
        <Route path="/dyspraxia/safe-route" element={<SafeRoutePlanner />} />

        {/* Anxiety */}
        <Route path="/anxiety"
          element={<ProtectedRoute feature={FEATURES.ANXIETY}><AnxietyPage /></ProtectedRoute>}
        />

        {/* ✅ Depression Routes */}
        <Route path="/depression"
          element={<ProtectedRoute feature={FEATURES.DEPRESSION}><DepressionDashboard /></ProtectedRoute>}
        />
        <Route path="/depression/mvh" element={<MVHProtocol />} />
        <Route path="/depression/anxietydissolver" element={<AnxietyDissolver />} />
        <Route path="/depression/social" element={<SocialBroadcaster />} />
        <Route path="/depression/proof" element={<EvidenceFolder />} />
        <Route path="/depression/reality" element={<CognitiveReframer />} />
        <Route path="/depression/void" element={<VoidWhisper />} />

        <Route path="*" element={<NotFound />} />

      </Routes>
    </AppLayout>
  );
}

/* =====================================================
   App Root
===================================================== */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>

            <Route path="/login" element={<Login />} />

            <Route
              path="/onboarding/disorders"
              element={
                <ProtectedRoute>
                  <DisorderSelection />
                </ProtectedRoute>
              }
            />

            <Route path="/*" element={<ShellRoutes />} />

          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;