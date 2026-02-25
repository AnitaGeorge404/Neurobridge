import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ASDPage from "./pages/ASDPage";
import ADHDDashboard from "./pages/adhd/ADHDDashboard";  
import EmotionCoach from "./pages/adhd/EmotionCoach";
import VisualTimeline from "./pages/adhd/VisualTimeline";     
import TaskBreakdown from "./pages/adhd/TaskBreakdown";
import FocusSessions from "./pages/adhd/FocusSessions";
import Soundscapes from "./pages/adhd/Soundscapes";
import BodyDoubling from "./pages/adhd/BodyDoubling";
import DyslexiaPage from "./pages/DyslexiaPage";
import DyscalculiaPage from "./pages/DyscalculiaPage";
import APDPage from "./pages/APDPage";
import TourettesPage from "./pages/TourettesPage";
import OCDDashboard from "./pages/ocd/OCDDashboard";
import ERPHierarchy from "./pages/ocd/ERPHierarchy";
import RitualDelayer from "./pages/ocd/RitualDelayer";
import CompulsionHeatmap from "./pages/ocd/CompulsionHeatmap";
import LogicCheckJournal from "./pages/ocd/LogicCheckJournal";
import DyspraxiaDashboard from "./pages/dyspraxia/DyspraxiaDashboard";
import AOMILibrary from "./pages/dyspraxia/AOMILibrary";
import HapticPacer from "./pages/dyspraxia/HapticPacer";
import ARInstructionCards from "./pages/dyspraxia/ARInstructionCards";
import SafeRoutePlanner from "./pages/dyspraxia/SafeRoutePlanner";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/asd" element={<ASDPage />} />
            <Route path="/adhd" element={<ADHDDashboard />} />
            <Route path="/adhd/timeline" element={<VisualTimeline />} />
            <Route path="/adhd/breakdown" element={<TaskBreakdown />} />
            <Route path="/adhd/focus" element={<FocusSessions />} />
            <Route path="/adhd/sounds" element={<Soundscapes />} />
            <Route path="/adhd/doubling" element={<BodyDoubling />} />
            <Route path="/adhd/emotion-coach" element={<EmotionCoach />} />
            <Route path="/dyslexia" element={<DyslexiaPage />} />
            <Route path="/dyscalculia" element={<DyscalculiaPage />} />
            <Route path="/ocd" element={<OCDDashboard />} />
            <Route path="/ocd/erp-hierarchy" element={<ERPHierarchy />} />
            <Route path="/ocd/ritual-delayer" element={<RitualDelayer />} />
            <Route path="/ocd/compulsion-heatmap" element={<CompulsionHeatmap />} />
            <Route path="/ocd/logic-journal" element={<LogicCheckJournal />} />
            <Route path="/dyspraxia" element={<DyspraxiaDashboard />} />
            <Route path="/dyspraxia/aomi-library" element={<AOMILibrary />} />
            <Route path="/dyspraxia/haptic-pacer" element={<HapticPacer />} />
            <Route path="/dyspraxia/ar-instructions" element={<ARInstructionCards />} />
            <Route path="/dyspraxia/safe-route" element={<SafeRoutePlanner />} />
            <Route path="/apd" element={<APDPage />} />
            <Route path="/tourettes" element={<TourettesPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
