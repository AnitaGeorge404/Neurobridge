import { useState, useEffect } from "react";
import { Brain, Clock, Eye, AlertTriangle, Settings, BookOpen, Plus, Trash2, Play, ChevronRight, Volume2, Sun, AlertCircle, SaveIcon, RotateCcw, Zap, TrendingUp, Lightbulb, History } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

// ==================== AI HELPER FUNCTIONS ====================
/**
 * Simulates AI routine optimization based on sensory trends and past behavior
 * In production, this would call an AI backend service
 */
const aiSuggestRoutineOptimizations = (sensoryHistory, routineHistory, currentRoutine) => {
  const suggestions = [];
  
  // Analyze sensory patterns
  if (sensoryHistory.length > 3) {
    const avgScore = sensoryHistory.reduce((a, b) => a + b, 0) / sensoryHistory.length;
    if (avgScore > 60) {
      suggestions.push({
        id: "routine-break",
        type: "task-modification",
        title: "Add Sensory Breaks",
        description: "Your sensory load tends to spike mid-day. Consider adding 5-10 minute breaks every 1-2 hours.",
        confidence: 0.85,
        suggestedTasks: ["Take a walk", "Listen to calming music", "Deep breathing exercise"],
      });
    }
  }

  // Suggest task reordering
  if (currentRoutine.length > 2) {
    suggestions.push({
      id: "routine-reorder",
      type: "reorder",
      title: "Optimize Task Order",
      description: "Consider moving high-stimulation tasks (like video calls) to earlier in the day when you're fresher.",
      confidence: 0.78,
      reason: "High stimulation tasks are better handled with full energy reserves",
    });
  }

  // Identify potentially stressful tasks
  const stressfulKeywords = ["meeting", "presentation", "social", "new", "crowd"];
  const potentialStressors = currentRoutine.filter(task =>
    stressfulKeywords.some(keyword => task.task.toLowerCase().includes(keyword))
  );

  if (potentialStressors.length > 0) {
    suggestions.push({
      id: "stress-prep",
      type: "preparation",
      title: "Prepare for Potentially Stressful Tasks",
      description: `Tasks like "${potentialStressors[0].task}" may trigger stress. Consider preparing strategies in advance.`,
      confidence: 0.72,
      suggestions: ["Review social story beforehand", "Prepare calming music playlist", "Plan a post-task recovery activity"],
    });
  }

  return suggestions;
};

/**
 * Predicts meltdown risk based on sensory trends and schedule deviations
 */
const aiPredictMeltdownRisk = (sensoryHistory, routineDeviation, timeOfDay) => {
  let riskScore = 0;
  let factors = [];

  // Sensory trend analysis
  if (sensoryHistory.length >= 2) {
    const recentAvg = sensoryHistory.slice(-2).reduce((a, b) => a + b) / 2;
    const prevAvg = sensoryHistory.slice(-4, -2).length > 0 
      ? sensoryHistory.slice(-4, -2).reduce((a, b) => a + b) / 2 
      : recentAvg;

    if (recentAvg > prevAvg) {
      const trend = ((recentAvg - prevAvg) / prevAvg) * 100;
      if (trend > 15) {
        riskScore += 25;
        factors.push(`Sensory load rising rapidly (+${Math.round(trend)}%)`);
      }
    }

    if (recentAvg > 70) {
      riskScore += 20;
      factors.push("Current sensory level is high (>70)");
    }
  }

  // Schedule deviation impact
  if (routineDeviation > 20) {
    riskScore += 30;
    factors.push(`Schedule significantly delayed (${routineDeviation} minutes late)`);
  } else if (routineDeviation > 10) {
    riskScore += 15;
    factors.push(`Schedule moderately delayed (${routineDeviation} minutes late)`);
  }

  // Time-of-day factors (energy depletion towards end of day)
  const hour = new Date().getHours();
  if (hour > 17) {
    riskScore += 10;
    factors.push("Late in the day (higher fatigue risk)");
  }

  return {
    riskScore: Math.min(100, riskScore),
    riskLevel: riskScore < 30 ? "low" : riskScore < 60 ? "moderate" : "high",
    factors,
    recommendations: generateMeltdownRecommendations(riskScore, sensoryHistory),
  };
};

/**
 * Generate specific recommendations based on meltdown risk
 */
const generateMeltdownRecommendations = (riskScore, sensoryHistory) => {
  const recommendations = [];

  if (riskScore > 70) {
    recommendations.push({
      priority: "critical",
      strategy: "Immediate Safe Space Activation",
      steps: ["Move to quiet area immediately", "Use noise-canceling headphones", "Reduce screen brightness to 30%"],
    });
    recommendations.push({
      priority: "critical",
      strategy: "Progressive Muscle Relaxation",
      duration: "5-10 minutes",
      steps: ["Tense toes for 5 seconds", "Release and breathe", "Move up through each muscle group"],
    });
  } else if (riskScore > 40) {
    recommendations.push({
      priority: "high",
      strategy: "Preventive Grounding (5-4-3-2-1)",
      duration: "3-5 minutes",
      steps: ["Name 5 things you see", "4 things you can touch", "3 things you hear", "2 things you smell", "1 thing you taste"],
    });
    recommendations.push({
      priority: "high",
      strategy: "Take a Sensory Break",
      duration: "10-15 minutes",
      steps: ["Step outside for fresh air", "Listen to calm music", "Do light stretching"],
    });
  } else {
    recommendations.push({
      priority: "medium",
      strategy: "Maintain Current Strategies",
      description: "Keep monitoring sensory levels. Continue with scheduled breaks.",
    });
  }

  return recommendations;
};

/**
 * AI-powered social story suggestions based on scenario type
 */
const aiSuggestStoryConcepts = (scenarioType) => {
  const storyTemplates = {
    "first-day": {
      title: "First Day at School",
      cards: [
        { emoji: "🛏️", text: "I wake up and have breakfast" },
        { emoji: "🚌", text: "I ride the school bus" },
        { emoji: "🏫", text: "I arrive at school" },
        { emoji: "📚", text: "I meet my teacher and classmates" },
        { emoji: "🎓", text: "We do learning activities together" },
        { emoji: "🍽️", text: "We eat lunch in the cafeteria" },
        { emoji: "🏃", text: "We play at recess" },
        { emoji: "🚌", text: "I ride the bus home" },
        { emoji: "😊", text: "I tell my family about my day" },
      ],
    },
    "doctor-visit": {
      title: "Going to the Doctor",
      cards: [
        { emoji: "🚗", text: "We drive to the doctor's office" },
        { emoji: "🏥", text: "We arrive at the building" },
        { emoji: "📋", text: "We check in at the front desk" },
        { emoji: "⏳", text: "We wait in the waiting room" },
        { emoji: "👨‍⚕️", text: "The doctor calls my name" },
        { emoji: "💉", text: "The doctor checks me with tools" },
        { emoji: "✓", text: "The doctor says I'm healthy" },
        { emoji: "🏥", text: "We leave the doctor's office" },
        { emoji: "🎉", text: "I did a great job!" },
      ],
    },
    "grocery-shopping": {
      title: "Going to the Grocery Store",
      cards: [
        { emoji: "🚗", text: "We drive to the store" },
        { emoji: "🛒", text: "We get a shopping cart" },
        { emoji: "🥬", text: "We look for vegetables" },
        { emoji: "🍎", text: "We look for fruits" },
        { emoji: "🥛", text: "We look for dairy products" },
        { emoji: "💳", text: "We pay at the checkout" },
        { emoji: "🏠", text: "We drive home" },
        { emoji: "📦", text: "We put groceries away" },
        { emoji: "😊", text: "We did great shopping!" },
      ],
    },
  };

  return storyTemplates[scenarioType] || null;
};

/**
 * AI-powered sensory feedback with explanations
 */
const aiGenerateSensoryFeedback = (sensoryScore, sensoryData, thresholds) => {
  const feedback = {
    score: sensoryScore,
    message: "",
    reason: "",
    actions: [],
  };

  if (sensoryScore < 30) {
    feedback.message = "✓ You're in the safe zone!";
    feedback.reason = "Your sensory load is well-managed. Keep doing what you're doing.";
    feedback.actions = ["Continue current activities", "Maintain current environment"];
  } else if (sensoryScore < 50) {
    feedback.message = "⚠️ Monitor your sensory input";
    feedback.reason = "Sensory levels are approaching caution. ";
    if (sensoryData.soundLevel > thresholds.soundLevel * 0.7) {
      feedback.reason += "High ambient noise is a factor. ";
      feedback.actions.push("Consider using earplugs or noise-canceling headphones");
    }
    if (sensoryData.brightness > thresholds.brightness * 0.7) {
      feedback.reason += "Screen brightness is elevated. ";
      feedback.actions.push("Reduce screen brightness to 50-70%");
    }
    feedback.actions.push("Take a short 5-minute break soon");
  } else if (sensoryScore < 70) {
    feedback.message = "🟡 Take a sensory break soon";
    feedback.reason = "Your sensory load is moderate-high. Consider taking action within the next 15 minutes.";
    feedback.actions = [
      "Step away from screens",
      "Find a quieter environment",
      "Listen to calming music or nature sounds",
      "Do 5-10 minutes of deep breathing",
    ];
  } else {
    feedback.message = "🔴 URGENT: Take action now";
    feedback.reason = "Your sensory load is critically high. Immediate intervention is needed.";
    feedback.actions = [
      "Go to your safe space immediately",
      "Use noise-canceling headphones",
      "Dim lights to minimal level",
      "Do grounding exercise (5-4-3-2-1)",
      "Use fidget tools or stim items",
    ];
  }

  return feedback;
};

/**
 * Log AI suggestions and user actions for analytics
 */
const createHistoryEntry = (type, action, data) => {
  return {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    type, // "suggestion", "action", "alert", "recommendation"
    action,
    data,
  };
};

// ==================== ROUTINE VISUALIZER ====================
function RoutineVisualizer({ routine = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [countdowns, setCountdowns] = useState({});
  const [alerts, setAlerts] = useState([]);

  const defaultRoutine = [
    { id: 1, task: "Morning Routine", duration: 30, status: "now" },
    { id: 2, task: "Breakfast", duration: 20, status: "next" },
    { id: 3, task: "School/Work", duration: 480, status: "later" },
  ];

  const tasks = routine.length > 0 ? routine : defaultRoutine;

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdowns((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          updated[key] = Math.max(0, updated[key] - 1);
          if (updated[key] === 0) {
            setAlerts((a) => [
              ...a,
              { id: key, message: `Time for: ${tasks.find((t) => t.id === parseInt(key))?.task}` },
            ]);
            delete updated[key];
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks]);

  useEffect(() => {
    if (tasks[currentIndex]) {
      setCountdowns((prev) => ({
        ...prev,
        [tasks[currentIndex].id]: tasks[currentIndex].duration * 60,
      }));
    }
  }, [currentIndex, tasks]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleTaskComplete = () => {
    if (currentIndex < tasks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleAddAlert = (task) => {
    setAlerts((a) => [
      ...a,
      { id: task.id, message: `⚠️ Schedule change: ${task.task} has shifted!` },
    ]);
  };

  return (
    <div className="space-y-6">
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <Alert
              key={alert.id}
              className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
              variant="destructive"
            >
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                {alert.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <div className="grid gap-4">
        <Card className="border-l-4 border-l-green-500 bg-green-50 dark:bg-green-900/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-green-700 dark:text-green-300">NOW</CardTitle>
              <Badge className="bg-green-600 text-white">Active</Badge>
            </div>
            <CardDescription className="text-green-600 dark:text-green-400">
              Current Task
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tasks[currentIndex] && (
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {tasks[currentIndex].task}
                </h3>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-mono font-bold text-green-700 dark:text-green-300">
                    {formatTime(countdowns[tasks[currentIndex].id] || tasks[currentIndex].duration * 60)}
                  </span>
                </div>
                <button
                  onClick={handleTaskComplete}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Task Complete
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {currentIndex + 1 < tasks.length && (
          <Card className="border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-blue-700 dark:text-blue-300">NEXT</CardTitle>
                <Badge className="bg-blue-600 text-white">Coming Up</Badge>
              </div>
              <CardDescription className="text-blue-600 dark:text-blue-400">
                Prepare yourself
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  {tasks[currentIndex + 1].task}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Duration: {tasks[currentIndex + 1].duration} minutes
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {currentIndex + 2 < tasks.length && (
          <Card className="border-l-4 border-l-purple-500 bg-purple-50 dark:bg-purple-900/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-purple-700 dark:text-purple-300">
                  LATER
                </CardTitle>
                <Badge className="bg-purple-600 text-white">Upcoming</Badge>
              </div>
              <CardDescription className="text-purple-600 dark:text-purple-400">
                Future tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tasks.slice(currentIndex + 2).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2 rounded bg-white dark:bg-gray-800"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {task.task}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {task.duration}m
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <button
          onClick={() => handleAddAlert(tasks[currentIndex])}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
        >
          Simulate Schedule Change Alert
        </button>
      </div>
    </div>
  );
}

// ==================== SENSORY MONITOR (AI ENHANCED) ====================
function SensoryMonitor({ thresholds = {}, aiEnabled = false }) {
  const defaultThresholds = {
    soundLevel: 70,
    brightness: 80,
    stimulationTime: 120,
  };

  const finalThresholds = { ...defaultThresholds, ...thresholds };

  const [sensoryData, setSensoryData] = useState({
    soundLevel: 45,
    brightness: 60,
    stimulationTime: 30,
  });

  const [sensoryScore, setSensoryScore] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [aiFeedback, setAiFeedback] = useState(null);

  useEffect(() => {
    const soundPercent = (sensoryData.soundLevel / finalThresholds.soundLevel) * 100;
    const brightnessPercent = (sensoryData.brightness / finalThresholds.brightness) * 100;
    const timePercent = (sensoryData.stimulationTime / finalThresholds.stimulationTime) * 100;

    const score = Math.min(100, (soundPercent + brightnessPercent + timePercent) / 3);
    setSensoryScore(Math.round(score));

    const newAlerts = [];
    if (sensoryData.soundLevel > finalThresholds.soundLevel * 0.8) {
      newAlerts.push("🔊 Sound level is high!");
    }
    if (sensoryData.brightness > finalThresholds.brightness * 0.8) {
      newAlerts.push("☀️ Screen brightness is high!");
    }
    if (sensoryData.stimulationTime > finalThresholds.stimulationTime * 0.8) {
      newAlerts.push("⏱️ You've been in high stimulation for too long!");
    }

    setAlerts(newAlerts);

    // AI: Generate adaptive feedback
    if (aiEnabled) {
      const feedback = aiGenerateSensoryFeedback(Math.round(score), sensoryData, finalThresholds);
      setAiFeedback(feedback);
    }
  }, [sensoryData, finalThresholds, aiEnabled]);

  const simulateSensors = () => {
    setSensoryData({
      soundLevel: Math.random() * 90,
      brightness: Math.random() * 100,
      stimulationTime: Math.random() * 180,
    });
  };

  const resetStimulationTime = () => {
    setSensoryData((prev) => ({ ...prev, stimulationTime: 0 }));
  };

  const getScoreColor = () => {
    if (sensoryScore < 40) return "bg-green-500";
    if (sensoryScore < 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreLabel = () => {
    if (sensoryScore < 40) return "Low - Safe Zone";
    if (sensoryScore < 70) return "Moderate - Watch Level";
    return "High - Need Break";
  };

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Sensory Load Score</CardTitle>
          <CardDescription>Real-time sensory environment monitoring</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-gray-800 dark:text-gray-200">
                {sensoryScore}
                <span className="text-xl text-gray-500 dark:text-gray-400">/100</span>
              </p>
              <p className={`text-sm font-semibold mt-1 ${
                sensoryScore < 40
                  ? "text-green-600"
                  : sensoryScore < 70
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}>
                {getScoreLabel()}
              </p>
            </div>
            <div className={`w-24 h-24 rounded-full ${getScoreColor()} flex items-center justify-center text-white text-2xl font-bold`}>
              {sensoryScore}%
            </div>
          </div>

          <Progress value={sensoryScore} className="h-3" />

          {alerts.length > 0 && (
            <div className="space-y-2">
              {alerts.map((alert, idx) => (
                <Alert key={idx} variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-300">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    {alert}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* AI Adaptive Feedback */}
          {aiEnabled && aiFeedback && (
            <Alert className={
              sensoryScore < 40 
                ? "bg-green-50 dark:bg-green-900/20 border-green-300"
                : sensoryScore < 70
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300"
                : "bg-orange-50 dark:bg-orange-900/20 border-orange-300"
            }>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription className={
                sensoryScore < 40 
                  ? "text-green-800 dark:text-green-200"
                  : sensoryScore < 70
                  ? "text-blue-800 dark:text-blue-200"
                  : "text-orange-800 dark:text-orange-200"
              }>
                <strong>{aiFeedback.message}</strong>
                <p className="text-sm mt-1">{aiFeedback.reason}</p>
                {aiFeedback.actions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-semibold">Suggested actions:</p>
                    <ul className="text-xs space-y-1 ml-4">
                      {aiFeedback.actions.map((action, idx) => (
                        <li key={idx} className="list-disc">{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Volume2 className="w-5 h-5" />
              Sound Level
            </CardTitle>
            <CardDescription>Ambient noise</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {Math.round(sensoryData.soundLevel)} dB
            </div>
            <Progress value={(sensoryData.soundLevel / finalThresholds.soundLevel) * 100} />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Threshold: {finalThresholds.soundLevel} dB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sun className="w-5 h-5" />
              Brightness
            </CardTitle>
            <CardDescription>Screen brightness</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {Math.round(sensoryData.brightness)}%
            </div>
            <Progress value={(sensoryData.brightness / finalThresholds.brightness) * 100} />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Threshold: {finalThresholds.brightness}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-5 h-5" />
              Stim Time
            </CardTitle>
            <CardDescription>Time in high stim</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {Math.round(sensoryData.stimulationTime)} m
            </div>
            <Progress value={(sensoryData.stimulationTime / finalThresholds.stimulationTime) * 100} />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Threshold: {finalThresholds.stimulationTime} m
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button onClick={simulateSensors} variant="outline">
          Simulate Sensor Update
        </Button>
        <Button onClick={resetStimulationTime} variant="outline">
          Take a Break (Reset Timer)
        </Button>
      </div>

      {sensoryScore >= 70 && (
        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-300">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            💡 <strong>Suggestion:</strong> Consider taking a sensory break. Try dimming your screen, reducing background noise, or stepping outside for fresh air.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// ==================== SOCIAL STORY BUILDER (AI ENHANCED) ====================
function SocialStoryBuilder({ aiEnabled = false }) {
  const [stories, setStories] = useState([
    {
      id: 1,
      title: "Going to the Grocery Store",
      cards: [
        { id: 1, image: "🏪", text: "We're going to the grocery store" },
        { id: 2, image: "🛒", text: "We'll use a shopping cart" },
        { id: 3, image: "🍎", text: "We'll look for healthy foods" },
        { id: 4, image: "💳", text: "We pay at the checkout" },
        { id: 5, image: "🏠", text: "We go home" },
      ],
    },
  ]);

  const [currentStory, setCurrentStory] = useState(null);
  const [viewingStory, setViewingStory] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newCardImage, setNewCardImage] = useState("");
  const [newCardText, setNewCardText] = useState("");
  const [suggestedTemplate, setSuggestedTemplate] = useState(null);

  const handleCreateStory = () => {
    if (newStoryTitle.trim()) {
      const newStory = {
        id: Date.now(),
        title: newStoryTitle,
        cards: [],
      };
      setStories([...stories, newStory]);
      setCurrentStory(newStory.id);
      setNewStoryTitle("");
    }
  };

  const handleAISuggestTemplate = (scenarioType) => {
    const template = aiSuggestStoryConcepts(scenarioType);
    if (template) {
      setSuggestedTemplate(template);
      setNewStoryTitle(template.title);
    }
  };

  const handleApplyTemplate = () => {
    if (suggestedTemplate && newStoryTitle.trim()) {
      const newStory = {
        id: Date.now(),
        title: newStoryTitle,
        cards: suggestedTemplate.cards.map((card, idx) => ({
          id: Date.now() + idx,
          image: card.emoji,
          text: card.text,
        })),
      };
      setStories([...stories, newStory]);
      setSuggestedTemplate(null);
      setNewStoryTitle("");
    }
  };

  const handleAddCard = () => {
    if (currentStory && newCardImage.trim() && newCardText.trim()) {
      setStories(
        stories.map((story) =>
          story.id === currentStory
            ? {
                ...story,
                cards: [
                  ...story.cards,
                  { id: Date.now(), image: newCardImage, text: newCardText },
                ],
              }
            : story
        )
      );
      setNewCardImage("");
      setNewCardText("");
    }
  };

  const handleDeleteStory = (id) => {
    setStories(stories.filter((s) => s.id !== id));
    if (currentStory === id) setCurrentStory(null);
  };

  const handleDeleteCard = (cardId) => {
    setStories(
      stories.map((story) =>
        story.id === currentStory
          ? {
              ...story,
              cards: story.cards.filter((c) => c.id !== cardId),
            }
          : story
      )
    );
  };

  const handleViewStory = (storyId) => {
    setViewingStory(storyId);
    setCurrentCardIndex(0);
  };

  const handleNextCard = () => {
    const story = stories.find((s) => s.id === viewingStory);
    if (story && currentCardIndex < story.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const editingStory = stories.find((s) => s.id === currentStory);
  const viewingStoryData = stories.find((s) => s.id === viewingStory);
  const currentCard = viewingStoryData?.cards[currentCardIndex];

  if (viewingStoryData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 p-4">
        <Button
          onClick={() => setViewingStory(null)}
          className="mb-8"
          variant="outline"
        >
          ← Back to Stories
        </Button>

        <div className="w-full max-w-2xl">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-200">
            {viewingStoryData.title}
          </h2>

          {currentCard && (
            <Card className="border-4 border-purple-400 dark:border-purple-600 shadow-lg">
              <CardContent className="pt-8">
                <div className="text-center space-y-6">
                  <div className="text-9xl">{currentCard.image}</div>
                  <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                    {currentCard.text}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-8 flex items-center justify-between gap-4">
            <Button
              onClick={handlePrevCard}
              disabled={currentCardIndex === 0}
              className="flex-1"
              variant="secondary"
            >
              ← Previous
            </Button>
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {currentCardIndex + 1} / {viewingStoryData.cards.length}
            </span>
            <Button
              onClick={handleNextCard}
              disabled={currentCardIndex === viewingStoryData.cards.length - 1}
              className="flex-1"
            >
              Next →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Social Story Builder</CardTitle>
          <CardDescription>Create visual stories for social situations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Story title (e.g., 'First Day of School')"
              value={newStoryTitle}
              onChange={(e) => setNewStoryTitle(e.target.value)}
            />
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={handleCreateStory}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Story
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Story Created!</DialogTitle>
                  <DialogDescription>
                    Your new story "{newStoryTitle}" is ready. Start adding cards to tell the story step by step.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>

          {/* AI Story Templates */}
          {aiEnabled && (
            <div className="pt-4 border-t">
              <p className="text-sm font-semibold mb-3">💡 AI Story Templates:</p>
              <div className="grid grid-cols-2 gap-2">
                {["first-day", "doctor-visit", "grocery-shopping"].map((scenario) => (
                  <Button
                    key={scenario}
                    onClick={() => handleAISuggestTemplate(scenario)}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {scenario === "first-day" && "🎓 First Day"}
                    {scenario === "doctor-visit" && "👨‍⚕️ Doctor"}
                    {scenario === "grocery-shopping" && "🛒 Shopping"}
                  </Button>
                ))}
              </div>

              {suggestedTemplate && (
                <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200">
                  <p className="text-sm font-semibold mb-2">Preview: {suggestedTemplate.title}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {suggestedTemplate.cards.length} cards
                  </p>
                  <Button
                    onClick={handleApplyTemplate}
                    size="sm"
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Use This Template
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {stories.map((story) => (
          <Card key={story.id} className={story.id === currentStory ? "border-2 border-blue-500" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>{story.title}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentStory(story.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleViewStory(story.id)}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteStory(story.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                {story.cards.length} card{story.cards.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {editingStory && (
        <Card className="border-2 border-green-500">
          <CardHeader>
            <CardTitle>Editing: {editingStory.title}</CardTitle>
            <CardDescription>Add cards to build your story</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Emoji or Image</label>
              <Input
                placeholder="📍 (emoji) or image URL"
                value={newCardImage}
                onChange={(e) => setNewCardImage(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Card Text</label>
              <Textarea
                placeholder="What happens in this step?"
                value={newCardText}
                onChange={(e) => setNewCardText(e.target.value)}
              />
            </div>
            <Button onClick={handleAddCard} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Card
            </Button>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Story Cards ({editingStory.cards.length})</h4>
              <div className="space-y-2">
                {editingStory.cards.map((card, idx) => (
                  <div
                    key={card.id}
                    className="p-3 bg-gray-100 dark:bg-gray-800 rounded flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-3xl">{card.image}</span>
                      <div>
                        <Badge variant="outline">Step {idx + 1}</Badge>
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                          {card.text}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteCard(card.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ==================== MELTDOWN PREVENTION (AI ENHANCED) ====================
function MeltdownPrevention({ sensoryData = {}, routineData = {}, meltdownPrediction = null }) {
  const defaultSensoryData = {
    soundLevel: 45,
    brightness: 60,
    stimulationTime: 30,
    sensoryScore: 0,
  };

  const defaultRoutineData = {
    currentTask: "Morning Routine",
    isOnSchedule: true,
    delayMinutes: 0,
  };

  const sensory = { ...defaultSensoryData, ...sensoryData };
  const routine = { ...defaultRoutineData, ...routineData };

  const [riskLevel, setRiskLevel] = useState("low");
  const [meltdownWarnings, setMeltdownWarnings] = useState([]);
  const [calmingStrategies, setCalmingStrategies] = useState([]);
  const [safeSpaceActive, setSafeSpaceActive] = useState(false);

  const strategies = [
    { id: 1, name: "Deep Breathing", description: "4-7-8 breathing: Inhale 4s, Hold 7s, Exhale 8s", icon: "🫁", steps: ["Sit comfortably", "Inhale for 4 counts", "Hold for 7 counts", "Exhale for 8 counts", "Repeat 5 times"] },
    { id: 2, name: "Progressive Muscle Relaxation", description: "Tense and relax muscle groups", icon: "💪", steps: ["Start with toes", "Tense for 5 seconds", "Release", "Move up the body", "Repeat until relaxed"] },
    { id: 3, name: "5-4-3-2-1 Grounding", description: "Engage all 5 senses", icon: "🧠", steps: ["5 things you see", "4 things you can touch", "3 things you hear", "2 things you smell", "1 thing you taste"] },
    { id: 4, name: "Dark Room Break", description: "Reduce sensory input", icon: "🌙", steps: ["Go to a quiet room", "Dim the lights or close curtains", "Remove noisy devices", "Sit or lie down", "Spend 5-10 minutes here"] },
    { id: 5, name: "Stim Activity", description: "Channel stimming into calming activity", icon: "🎯", steps: ["Try fidget toys", "Listen to calming music", "Rock back and forth", "Wrap in blanket", "Do repetitive, soothing motions"] },
    { id: 6, name: "Routine Reset", description: "Return to predictable schedule", icon: "📋", steps: ["Check current task", "Review next 2-3 tasks", "Create a mini-schedule", "Set small achievable goals", "Take it one step at a time"] },
  ];

  useEffect(() => {
    const warnings = [];
    let risk = "low";
    const selectedStrategies = [];

    if (sensory.sensoryScore > 75) {
      warnings.push({
        type: "critical",
        title: "🚨 CRITICAL SENSORY OVERLOAD",
        message: `Sensory score is ${sensory.sensoryScore}/100 - immediate intervention needed!`,
        recommendation: "Use calming strategies immediately",
      });
      selectedStrategies.push(strategies[3], strategies[4]);
      risk = "critical";
    } else if (sensory.sensoryScore > 60) {
      warnings.push({
        type: "warning",
        title: "⚠️ HIGH SENSORY LOAD",
        message: `Sensory score is ${sensory.sensoryScore}/100 - monitor closely`,
        recommendation: "Consider preventive strategies",
      });
      selectedStrategies.push(strategies[0], strategies[2]);
      risk = "high";
    }

    if (!routine.isOnSchedule && routine.delayMinutes > 15) {
      warnings.push({
        type: "warning",
        title: "⏰ SCHEDULE DEVIATION DETECTED",
        message: `Current task is ${routine.delayMinutes} minutes behind schedule`,
        recommendation: "Transition to next task or adjust timeline",
      });
      selectedStrategies.push(strategies[5]);
      risk = risk === "critical" ? "critical" : "high";
    }

    if (sensory.sensoryScore > 50 && !routine.isOnSchedule) {
      warnings.push({
        type: "critical",
        title: "🔥 COMBINED OVERLOAD RISK",
        message: "Both sensory and routine stress are elevated - meltdown risk is high!",
        recommendation: "Activate Safe Space and use multiple calming strategies",
      });
      if (!selectedStrategies.includes(strategies[3])) {
        selectedStrategies.push(strategies[3]);
      }
      risk = "critical";
    }

    setRiskLevel(risk);
    setMeltdownWarnings(warnings);
    setCalmingStrategies([...new Set(selectedStrategies)]);
  }, [sensory, routine]);

  const getRiskColor = () => {
    switch (riskLevel) {
      case "critical":
        return "bg-red-600 text-white";
      case "high":
        return "bg-orange-600 text-white";
      default:
        return "bg-green-600 text-white";
    }
  };

  const getRiskBgColor = () => {
    switch (riskLevel) {
      case "critical":
        return "bg-red-50 dark:bg-red-900/20 border-red-300";
      case "high":
        return "bg-orange-50 dark:bg-orange-900/20 border-orange-300";
      default:
        return "bg-green-50 dark:bg-green-900/20 border-green-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Meltdown Prediction */}
      {meltdownPrediction && (
        <Card className={`border-2 ${
          meltdownPrediction.riskScore > 60 
            ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
            : meltdownPrediction.riskScore > 40
            ? "border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20"
            : "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20"
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className={`w-5 h-5 ${
                meltdownPrediction.riskScore > 60 
                  ? "text-red-600"
                  : meltdownPrediction.riskScore > 40
                  ? "text-orange-600"
                  : "text-green-600"
              }`} />
              AI Meltdown Risk Prediction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Predicted Risk Score</span>
              <span className={`text-2xl font-bold ${
                meltdownPrediction.riskScore > 60 
                  ? "text-red-600"
                  : meltdownPrediction.riskScore > 40
                  ? "text-orange-600"
                  : "text-green-600"
              }`}>{meltdownPrediction.riskScore}/100</span>
            </div>
            <Progress value={meltdownPrediction.riskScore} className="h-2" />
            {meltdownPrediction.factors.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Contributing Factors:</p>
                <ul className="text-sm space-y-1 ml-4">
                  {meltdownPrediction.factors.map((factor, idx) => (
                    <li key={idx} className="list-disc">{factor}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className={`border-2 ${getRiskBgColor()}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Meltdown Prevention Status
            </CardTitle>
            <div className={`px-4 py-2 rounded-full font-bold text-sm ${getRiskColor()}`}>
              {riskLevel.toUpperCase()} RISK
            </div>
          </div>
          <CardDescription>Real-time overload analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">Overall Stress Level</span>
              <span className="text-2xl font-bold">{sensory.sensoryScore}%</span>
            </div>
            <Progress value={sensory.sensoryScore} className="h-3" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="p-2 rounded bg-white dark:bg-gray-800">
              <p className="text-gray-600 dark:text-gray-400">Sensory Load</p>
              <p className="font-bold text-gray-900 dark:text-gray-100">
                {sensory.sensoryScore}/100
              </p>
            </div>
            <div className="p-2 rounded bg-white dark:bg-gray-800">
              <p className="text-gray-600 dark:text-gray-400">Schedule Status</p>
              <p className={`font-bold ${routine.isOnSchedule ? "text-green-600" : "text-red-600"}`}>
                {routine.isOnSchedule ? "On Time" : `${routine.delayMinutes}m Late`}
              </p>
            </div>
            <div className="p-2 rounded bg-white dark:bg-gray-800">
              <p className="text-gray-600 dark:text-gray-400">Current Task</p>
              <p className="font-bold text-gray-900 dark:text-gray-100 text-xs">
                {routine.currentTask}
              </p>
            </div>
            <div className="p-2 rounded bg-white dark:bg-gray-800">
              <p className="text-gray-600 dark:text-gray-400">Stim Time</p>
              <p className="font-bold text-gray-900 dark:text-gray-100">
                {sensory.stimulationTime || 0}m
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {meltdownWarnings.length > 0 && (
        <div className="space-y-2">
          {meltdownWarnings.map((warning, idx) => (
            <Alert
              key={idx}
              variant={warning.type === "critical" ? "destructive" : "default"}
              className={warning.type === "critical" ? "bg-red-50 dark:bg-red-900/20 border-red-300" : "bg-orange-50 dark:bg-orange-900/20 border-orange-300"}
            >
              <AlertTriangle className="h-5 w-5" />
              <div className="flex-1">
                <AlertDescription className={warning.type === "critical" ? "text-red-800 dark:text-red-200" : "text-orange-800 dark:text-orange-200"}>
                  <strong>{warning.title}</strong>
                  <p className="text-sm mt-1">{warning.message}</p>
                  <p className="text-xs mt-2 italic">💡 {warning.recommendation}</p>
                </AlertDescription>
              </div>
            </Alert>
          ))}
        </div>
      )}

      <Card className="border-2 border-purple-400 dark:border-purple-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Safe Space
          </CardTitle>
          <CardDescription>
            {safeSpaceActive
              ? "Safe space is active - use calming strategies below"
              : "Activate a calm environment with reduced stimulation"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setSafeSpaceActive(!safeSpaceActive)}
            className={`w-full ${safeSpaceActive ? "bg-green-600 hover:bg-green-700" : "bg-purple-600 hover:bg-purple-700"}`}
          >
            {safeSpaceActive ? "✓ Safe Space Active" : "Activate Safe Space"}
          </Button>
          {safeSpaceActive && (
            <div className="mt-4 p-4 bg-purple-100 dark:bg-purple-900/30 rounded space-y-2">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Tips for Safe Space:</p>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>✓ Dim lights or close curtains</li>
                <li>✓ Wear noise-canceling headphones or earplugs</li>
                <li>✓ Use a weighted blanket if available</li>
                <li>✓ Remove unnecessary stimuli</li>
                <li>✓ Have comfort items nearby (fidget toys, soft items)</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {calmingStrategies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Recommended Calming Strategies
            </CardTitle>
            <CardDescription>
              Based on your current stress level, try these techniques
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {calmingStrategies.map((strategy) => (
                <div
                  key={strategy.id}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-4xl">{strategy.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100">
                        {strategy.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {strategy.description}
                      </p>
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Steps:
                        </p>
                        <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                          {strategy.steps.map((step, i) => (
                            <li key={i} className="list-decimal">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {calmingStrategies.length === 0 && riskLevel === "low" && (
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-300">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-300">
              ✓ You're Doing Well!
            </CardTitle>
            <CardDescription>
              Stress levels are healthy. Here are strategies for future use:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {strategies.map((strategy) => (
                <div
                  key={strategy.id}
                  className="p-3 rounded bg-white dark:bg-gray-800"
                >
                  <p className="font-semibold text-sm">
                    {strategy.icon} {strategy.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {strategy.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ==================== SENSORY PROFILE SETTINGS ====================
function SensoryProfileSettings() {
  const DEFAULT_THRESHOLDS = {
    soundLevel: 70,
    brightness: 80,
    stimulationTime: 120,
    safeZoneStart: 40,
    warningZoneStart: 70,
  };

  const [thresholds, setThresholds] = useState(() => {
    const saved = localStorage.getItem("sensoryProfile");
    return saved ? JSON.parse(saved) : DEFAULT_THRESHOLDS;
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("userProfile");
    return saved
      ? JSON.parse(saved)
      : {
          name: "User",
          age: 0,
          diagnosis: "",
          notes: "",
        };
  });

  const handleThresholdChange = (key, value) => {
    setThresholds((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleProfileChange = (key, value) => {
    setProfile((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSave = () => {
    try {
      localStorage.setItem("sensoryProfile", JSON.stringify(thresholds));
      localStorage.setItem("userProfile", JSON.stringify(profile));
      setSaveSuccess(true);
      setHasChanges(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  };

  const handleReset = () => {
    setThresholds(DEFAULT_THRESHOLDS);
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleExport = () => {
    const data = {
      profile,
      thresholds,
      exportedAt: new Date().toISOString(),
    };
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2))
    );
    element.setAttribute("download", "sensory-profile.json");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result);
        if (data.profile) setProfile(data.profile);
        if (data.thresholds) setThresholds(data.thresholds);
        setHasChanges(true);
        setSaveSuccess(false);
      } catch (err) {
        console.error("Failed to import settings:", err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {saveSuccess && (
        <Alert className="bg-green-50 dark:bg-green-900/20 border-green-300">
          <AlertDescription className="text-green-800 dark:text-green-200">
            ✓ Settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>
                Your basic information for personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => handleProfileChange("name", e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile.age}
                  onChange={(e) =>
                    handleProfileChange("age", parseInt(e.target.value) || 0)
                  }
                  placeholder="Your age"
                  min="0"
                  max="120"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis/Notes</Label>
                <Input
                  id="diagnosis"
                  value={profile.diagnosis}
                  onChange={(e) => handleProfileChange("diagnosis", e.target.value)}
                  placeholder="e.g., ASD Level 2 with anxiety"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <textarea
                  id="notes"
                  value={profile.notes}
                  onChange={(e) => handleProfileChange("notes", e.target.value)}
                  placeholder="Any additional information..."
                  className="w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                  rows="3"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="thresholds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Sound Level Threshold
              </CardTitle>
              <CardDescription>
                Maximum comfortable ambient noise in decibels (dB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Maximum Sound Level</Label>
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {thresholds.soundLevel} dB
                  </span>
                </div>
                <Slider
                  value={[thresholds.soundLevel]}
                  onValueChange={(val) =>
                    handleThresholdChange("soundLevel", val[0])
                  }
                  min={30}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <p>30dB: Whisper | 50dB: Normal conversation</p>
                  <p>70dB: Vacuum cleaner | 100dB: Lawn mower</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="w-5 h-5" />
                Screen Brightness Threshold
              </CardTitle>
              <CardDescription>
                Maximum comfortable screen brightness level
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Maximum Brightness</Label>
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {thresholds.brightness}%
                  </span>
                </div>
                <Slider
                  value={[thresholds.brightness]}
                  onValueChange={(val) =>
                    handleThresholdChange("brightness", val[0])
                  }
                  min={10}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Lower values = less bright, more comfortable for sensitive eyes
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                High Stimulation Time Threshold
              </CardTitle>
              <CardDescription>
                Maximum time before needing a break
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Maximum Time</Label>
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {thresholds.stimulationTime} min
                  </span>
                </div>
                <Slider
                  value={[thresholds.stimulationTime]}
                  onValueChange={(val) =>
                    handleThresholdChange("stimulationTime", val[0])
                  }
                  min={15}
                  max={240}
                  step={5}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  How long you can stay in active/stimulating environments before
                  needing rest
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Zone Thresholds</CardTitle>
              <CardDescription>
                Customize when warnings appear in the Sensory Monitor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Safe Zone Limit (%)</Label>
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {thresholds.safeZoneStart}%
                  </span>
                </div>
                <Slider
                  value={[thresholds.safeZoneStart]}
                  onValueChange={(val) =>
                    handleThresholdChange("safeZoneStart", val[0])
                  }
                  min={20}
                  max={50}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Below this percentage: Safe (green zone)
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Warning Zone Limit (%)</Label>
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {thresholds.warningZoneStart}%
                  </span>
                </div>
                <Slider
                  value={[thresholds.warningZoneStart]}
                  onValueChange={(val) =>
                    handleThresholdChange("warningZoneStart", val[0])
                  }
                  min={50}
                  max={90}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Between safe and warning: Caution (yellow zone) | Above: Critical
                  (red zone)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export and import your settings across devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleExport} variant="outline" className="w-full">
                📥 Export Settings as JSON
              </Button>
              <div>
                <Label htmlFor="import" className="cursor-pointer">
                  <Button variant="outline" className="w-full" asChild>
                    <span>📤 Import Settings from JSON</span>
                  </Button>
                </Label>
                <input
                  id="import"
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  style={{ display: "none" }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reset Options</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full text-orange-600 hover:text-orange-700 border-orange-300"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Default Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="fixed bottom-6 right-6 flex gap-2">
        {hasChanges && (
          <Button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <SaveIcon className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        )}
      </div>

      <Card className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Current Settings Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Sound Threshold</p>
              <p className="font-bold text-gray-900 dark:text-gray-100">
                {thresholds.soundLevel} dB
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Brightness Threshold</p>
              <p className="font-bold text-gray-900 dark:text-gray-100">
                {thresholds.brightness}%
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Stim Time Threshold</p>
              <p className="font-bold text-gray-900 dark:text-gray-100">
                {thresholds.stimulationTime} min
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">User Profile</p>
              <p className="font-bold text-gray-900 dark:text-gray-100">
                {profile.name || "Not set"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== AI SETTINGS PANEL ====================
/**
 * Panel to toggle AI features on/off
 * Users can enable/disable specific AI capabilities
 */
function AISettingsPanel({ aiEnabled, setAiEnabled }) {
  const toggleFeature = (feature) => {
    setAiEnabled((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }));
  };

  const features = [
    {
      key: "routineSuggestions",
      title: "AI Routine Suggestions",
      description: "Suggests optimized daily routines based on sensory trends and past tasks",
      icon: "🤖",
    },
    {
      key: "meltdownPrediction",
      title: "Predictive Meltdown Alerts",
      description: "Predicts high-risk periods and generates real-time notifications",
      icon: "📊",
    },
    {
      key: "sensoryFeedback",
      title: "Adaptive Sensory Feedback",
      description: "Provides AI-generated explanations and environmental adjustment recommendations",
      icon: "🎯",
    },
    {
      key: "storyAssistant",
      title: "Smart Story Builder",
      description: "Suggests story steps and provides templates for common scenarios",
      icon: "📖",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-600" />
          AI Features
        </CardTitle>
        <CardDescription>
          Enable or disable AI-powered recommendations and predictions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {features.map((feature) => (
          <div key={feature.key} className="flex items-start justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{feature.icon}</span>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  {feature.title}
                </h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
            <Button
              onClick={() => toggleFeature(feature.key)}
              size="sm"
              className={`ml-4 ${
                aiEnabled[feature.key]
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 hover:bg-gray-500"
              }`}
            >
              {aiEnabled[feature.key] ? "ON" : "OFF"}
            </Button>
          </div>
        ))}

        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-300 mt-4">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            AI features learn from your patterns over time. The more data you provide, the better the recommendations become.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

// ==================== HISTORY LOG ====================
/**
 * Displays a log of all AI suggestions and system alerts
 * Users can review past recommendations and system actions
 */
function HistoryLog({ historyLog }) {
  const [filterType, setFilterType] = useState("all");

  const filteredLog = filterType === "all" 
    ? historyLog 
    : historyLog.filter((entry) => entry.type === filterType);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "suggestion":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
      case "action":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
      case "alert":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
      case "recommendation":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Activity History
          </CardTitle>
          <CardDescription>
            View all AI suggestions, alerts, and actions {historyLog.length > 0 ? `(${historyLog.length} entries)` : "(No history yet)"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setFilterType("all")}
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
            >
              All
            </Button>
            <Button
              onClick={() => setFilterType("suggestion")}
              variant={filterType === "suggestion" ? "default" : "outline"}
              size="sm"
            >
              Suggestions
            </Button>
            <Button
              onClick={() => setFilterType("alert")}
              variant={filterType === "alert" ? "default" : "outline"}
              size="sm"
            >
              Alerts
            </Button>
            <Button
              onClick={() => setFilterType("recommendation")}
              variant={filterType === "recommendation" ? "default" : "outline"}
              size="sm"
            >
              Recommendations
            </Button>
          </div>

          {filteredLog.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                {filterType === "all"
                  ? "No history entries yet. Start using AI features to build your activity log."
                  : `No ${filterType} entries found.`}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredLog.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-3 rounded-lg border ${getTypeColor(entry.type)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge className="capitalize">
                      {entry.type === "high_meltdown_risk" ? "Meltdown Risk" : entry.type}
                    </Badge>
                    <span className="text-xs opacity-75">
                      {formatDate(entry.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold mb-1">{entry.action}</p>
                  {entry.data && (
                    <div className="text-xs space-y-1">
                      {typeof entry.data === "object" ? (
                        Object.entries(entry.data).map(([key, value]) => (
                          <p key={key} className="opacity-75">
                            <strong>{key}:</strong>{" "}
                            {typeof value === "object"
                              ? JSON.stringify(value)
                              : String(value)}
                          </p>
                        ))
                      ) : (
                        <p className="opacity-75">{entry.data}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {historyLog.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded bg-gray-100 dark:bg-gray-900">
                <p className="text-gray-600 dark:text-gray-400">Total Entries</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {historyLog.length}
                </p>
              </div>
              <div className="p-3 rounded bg-gray-100 dark:bg-gray-900">
                <p className="text-gray-600 dark:text-gray-400">Alerts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {historyLog.filter((e) => e.type === "alert").length}
                </p>
              </div>
              <div className="p-3 rounded bg-gray-100 dark:bg-gray-900">
                <p className="text-gray-600 dark:text-gray-400">Suggestions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {historyLog.filter((e) => e.type === "suggestion").length}
                </p>
              </div>
              <div className="p-3 rounded bg-gray-100 dark:bg-gray-900">
                <p className="text-gray-600 dark:text-gray-400">Last Entry</p>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {historyLog.length > 0
                    ? new Date(historyLog[0].timestamp).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ==================== MAIN ASD PAGE ====================
export default function ASDPage() {
  // Core state
  const [thresholds, setThresholds] = useState(() => {
    const saved = localStorage.getItem("sensoryProfile");
    return saved
      ? JSON.parse(saved)
      : {
          soundLevel: 70,
          brightness: 80,
          stimulationTime: 120,
        };
  });

  const [sensoryData, setSensoryData] = useState({
    soundLevel: 45,
    brightness: 60,
    stimulationTime: 30,
    sensoryScore: 0,
  });

  const [routineData, setRoutineData] = useState({
    currentTask: "Morning Routine",
    isOnSchedule: true,
    delayMinutes: 0,
  });

  // AI Features State
  const [aiEnabled, setAiEnabled] = useState(() => {
    const saved = localStorage.getItem("aiFeatures");
    return saved ? JSON.parse(saved) : {
      routineSuggestions: true,
      meltdownPrediction: true,
      sensoryFeedback: true,
      storyAssistant: true,
    };
  });

  const [sensoryHistory, setSensoryHistory] = useState(() => {
    const saved = localStorage.getItem("sensoryHistory");
    return saved ? JSON.parse(saved) : [];
  });

  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [meltdownPrediction, setMeltdownPrediction] = useState(null);
  const [historyLog, setHistoryLog] = useState(() => {
    const saved = localStorage.getItem("historyLog");
    return saved ? JSON.parse(saved) : [];
  });

  const [currentRoutine, setCurrentRoutine] = useState([
    { id: 1, task: "Morning Routine", duration: 30, status: "now" },
    { id: 2, task: "Breakfast", duration: 20, status: "next" },
    { id: 3, task: "School/Work", duration: 480, status: "later" },
  ]);

  // Update sensory score
  useEffect(() => {
    const soundPercent = (sensoryData.soundLevel / thresholds.soundLevel) * 100;
    const brightnessPercent =
      (sensoryData.brightness / thresholds.brightness) * 100;
    const timePercent =
      (sensoryData.stimulationTime / thresholds.stimulationTime) * 100;

    const score = Math.min(100, (soundPercent + brightnessPercent + timePercent) / 3);
    setSensoryData((prev) => ({
      ...prev,
      sensoryScore: Math.round(score),
    }));

    // Track sensory history for AI analysis
    setSensoryHistory((prev) => {
      const updated = [...prev, Math.round(score)].slice(-20); // Keep last 20 entries
      localStorage.setItem("sensoryHistory", JSON.stringify(updated));
      return updated;
    });
  }, [thresholds]);

  // AI: Generate routine suggestions
  useEffect(() => {
    if (aiEnabled.routineSuggestions && sensoryHistory.length > 2) {
      const suggestions = aiSuggestRoutineOptimizations(sensoryHistory, [], currentRoutine);
      setAiSuggestions(suggestions);
    }
  }, [aiEnabled.routineSuggestions, sensoryHistory, currentRoutine]);

  // AI: Predict meltdown risk
  useEffect(() => {
    if (aiEnabled.meltdownPrediction && sensoryHistory.length > 0) {
      const prediction = aiPredictMeltdownRisk(sensoryHistory, routineData.delayMinutes, new Date().getHours());
      setMeltdownPrediction(prediction);

      if (prediction.riskScore > 60) {
        const entry = createHistoryEntry("alert", "high_meltdown_risk", {
          riskScore: prediction.riskScore,
          riskLevel: prediction.riskLevel,
          factors: prediction.factors,
        });
        setHistoryLog((prev) => {
          const updated = [entry, ...prev].slice(0, 100); // Keep last 100 entries
          localStorage.setItem("historyLog", JSON.stringify(updated));
          return updated;
        });
      }
    }
  }, [aiEnabled.meltdownPrediction, sensoryHistory, routineData.delayMinutes]);

  // Save AI preferences
  useEffect(() => {
    localStorage.setItem("aiFeatures", JSON.stringify(aiEnabled));
  }, [aiEnabled]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2 mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">
              SpectrumSpace
            </h1>
            {aiEnabled.routineSuggestions || aiEnabled.meltdownPrediction || aiEnabled.sensoryFeedback || aiEnabled.storyAssistant ? (
              <Badge className="bg-purple-600 text-white">AI-Powered</Badge>
            ) : null}
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Autism Support Tools: Sensory Regulation, Routine Planning & Meltdown Prevention
          </p>
        </div>

        {/* AI Alerts Section */}
        {meltdownPrediction && meltdownPrediction.riskScore > 40 && (
          <Alert className={meltdownPrediction.riskScore > 60 
            ? "bg-red-50 dark:bg-red-900/20 border-red-300"
            : "bg-orange-50 dark:bg-orange-900/20 border-orange-300"
          }>
            <Zap className={meltdownPrediction.riskScore > 60 ? "h-5 w-5 text-red-600" : "h-5 w-5 text-orange-600"} />
            <AlertDescription className={meltdownPrediction.riskScore > 60 
              ? "text-red-800 dark:text-red-200"
              : "text-orange-800 dark:text-orange-200"
            }>
              <strong>AI Prediction: {meltdownPrediction.riskLevel.toUpperCase()} MELTDOWN RISK</strong>
              <p className="text-sm mt-1">Risk Score: {meltdownPrediction.riskScore}/100</p>
              <p className="text-xs mt-1">Factors: {meltdownPrediction.factors.join(" • ")}</p>
            </AlertDescription>
          </Alert>
        )}

        {/* AI Routine Suggestions */}
        {aiEnabled.routineSuggestions && aiSuggestions.length > 0 && (
          <Card className="border-2 border-purple-300 dark:border-purple-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-purple-600" />
                AI Routine Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-200">{suggestion.title}</h4>
                    <Badge className="bg-purple-600">{Math.round(suggestion.confidence * 100)}% confidence</Badge>
                  </div>
                  <p className="text-sm text-purple-800 dark:text-purple-300 mb-2">{suggestion.description}</p>
                  {suggestion.suggestedTasks && (
                    <div className="flex flex-wrap gap-2">
                      {suggestion.suggestedTasks.map((task, idx) => (
                        <Badge key={idx} variant="outline" className="bg-white dark:bg-gray-900">{task}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="routine" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 gap-2 bg-white dark:bg-gray-900 p-2 rounded-lg border">
            <TabsTrigger value="routine" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Routine</span>
            </TabsTrigger>
            <TabsTrigger value="sensory" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Sensory</span>
            </TabsTrigger>
            <TabsTrigger value="stories" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Stories</span>
            </TabsTrigger>
            <TabsTrigger value="meltdown" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Prevention</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="routine" className="space-y-4 mt-6">
            <RoutineVisualizer routine={currentRoutine} />
          </TabsContent>

          <TabsContent value="sensory" className="space-y-4 mt-6">
            <SensoryMonitor thresholds={thresholds} aiEnabled={aiEnabled.sensoryFeedback} />
          </TabsContent>

          <TabsContent value="stories" className="space-y-4 mt-6">
            <SocialStoryBuilder aiEnabled={aiEnabled.storyAssistant} />
          </TabsContent>

          <TabsContent value="meltdown" className="space-y-4 mt-6">
            <MeltdownPrevention
              sensoryData={sensoryData}
              routineData={routineData}
              meltdownPrediction={meltdownPrediction}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-6">
            <SensoryProfileSettings />
            <AISettingsPanel aiEnabled={aiEnabled} setAiEnabled={setAiEnabled} />
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-6">
            <HistoryLog historyLog={historyLog} />
          </TabsContent>
        </Tabs>

        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              💡 Quick Tips
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>✓ Set your sensory thresholds in Settings</li>
              <li>✓ Use Routine to stay on schedule</li>
              <li>✓ Monitor sensory load in real-time</li>
              <li>✓ Create social stories for new situations</li>
              <li>✓ Enable AI features for personalized recommendations</li>
            </ul>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">
              🛡️ About SpectrumSpace AI
            </h3>
            <p className="text-sm text-purple-800 dark:text-purple-300">
              Uses AI to predict stress patterns, suggest optimized routines, and provide real-time sensory feedback. All AI features are optional and can be toggled on/off in Settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
