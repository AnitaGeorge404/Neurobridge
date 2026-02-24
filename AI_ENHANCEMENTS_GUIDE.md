# SpectrumSpace AI Enhancements Guide

## Overview
Your ASD support module has been enhanced with comprehensive AI-driven capabilities. All features are **modular and toggleable** via the new AI Settings panel.

---

## ✨ New Features Added

### 1. **AI Routine Suggestions** (Lines 50-94)
**Function**: `aiSuggestRoutineOptimizations()`

- Analyzes sensory history to suggest task breaks
- Identifies potentially stressful tasks and recommends modifications
- Suggests optimal task ordering for energy management
- Confidence scores show reliability of each suggestion

**Usage**: Enable in Settings > AI Features > "AI Routine Suggestions"

**Location in UI**: Appears as cards below page header when enabled

---

### 2. **Predictive Meltdown Alerts** (Lines 96-146)
**Functions**:
- `aiPredictMeltdownRisk()` - Calculates meltdown probability
- `generateMeltdownRecommendations()` - Tailored intervention strategies

**Capabilities**:
- Tracks sensory trends (increasing/decreasing patterns)
- Analyzes schedule deviations vs. time of day
- Generates risk scores (0-100) with contributing factors
- Recommends specific strategies based on risk level

**Real-time Updates**: Automatically logs high-risk alerts to history

**Location in UI**: 
- Alert banner near top of page
- Detailed prediction card in Meltdown Prevention tab

---

### 3. **Smart Social Story Builder** (Lines 148-161)
**Function**: `aiSuggestStoryConcepts()`

- Pre-built templates for common scenarios:
  - 🎓 First Day of School
  - 👨‍⚕️ Doctor Visit
  - 🛒 Grocery Shopping
- Auto-generates story cards with emoji + text
- One-click template application

**Location in UI**: Story Builder tab > "AI Story Templates" buttons

---

### 4. **Adaptive Sensory Feedback** (Lines 163-193)
**Function**: `aiGenerateSensoryFeedback()`

- Context-aware messages based on sensory score ranges
- AI-generated explanations for why levels are concerning
- Smart action recommendations (specific to detected issues)
- Escalating urgency as sensory load increases

**Location in UI**: Sensory Monitor tab > "AI Adaptive Feedback" alert

---

### 5. **Activity History & Analytics** (Lines 195-199)
**Function**: `createHistoryEntry()`

- Logs all AI suggestions, alerts, and system actions
- Persists to localStorage for session continuity
- Keeps last 100 entries for performance
- Queryable by type (suggestion, action, alert, recommendation)

**Location in UI**: New "History" tab at bottom of navigation

---

### 6. **AI Settings Panel** (Lines 953-1041)
**Component**: `AISettingsPanel()`

**Toggle Controls**:
- Routine Suggestions on/off
- Meltdown Prediction on/off
- Sensory Feedback on/off
- Story Assistant on/off

**Persistence**: Settings auto-save to localStorage

**Location in UI**: Settings tab > "AI Features" section

---

## 🔄 State Management

### New State Variables (in main `ASDPage` component):

```javascript
// AI Toggle Settings
const [aiEnabled, setAiEnabled] = useState({
  routineSuggestions: true,
  meltdownPrediction: true,
  sensoryFeedback: true,
  storyAssistant: true,
});

// Sensory Data History (last 20 readings)
const [sensoryHistory, setSensoryHistory] = useState([]);

// AI-Generated Suggestions
const [aiSuggestions, setAiSuggestions] = useState([]);

// Meltdown Risk Prediction
const [meltdownPrediction, setMeltdownPrediction] = useState(null);

// Activity Log (last 100 entries)
const [historyLog, setHistoryLog] = useState([]);
```

---

## 🎯 How AI Features Work

### **Routine Suggestions Algorithm**
1. Collects last 20 sensory scores
2. Calculates average and trend
3. Identifies stressful tasks (keywords: "meeting", "social", "new", etc.)
4. Generates 1-3 suggestions with confidence scores (0-1)

### **Meltdown Risk Prediction**
1. Tracks sensory trends (comparing recent avg vs. previous avg)
2. Analyzes schedule delays and time-of-day factors
3. Combines sensory + routine stress for "combined overload" detection
4. Returns:
   - Risk score (0-100)
   - Risk level (low/moderate/high)
   - Contributing factors
   - Tailored recommendations

### **Sensory Feedback System**
1. Monitors sensory score (0-100)
2. Identifies which sensors are elevated
3. Generates context-specific message
4. Provides 2-5 actionable steps
5. Color codes alerts (green/yellow/red/critical)

### **Story Builder AI**
1. Pre-loaded templates for 3 common scenarios
2. Each template has pre-built cards with emojis + text
3. Users click button → preview → apply template
4. Saves time on creating social stories from scratch

---

## 💾 Data Persistence

All AI data is stored in localStorage under these keys:

| Key | Purpose | Limit |
|-----|---------|-------|
| `sensoryProfile` | User sensory thresholds | N/A |
| `userProfile` | User details (name, age, diagnosis) | N/A |
| `aiFeatures` | AI toggle settings | JSON object |
| `sensoryHistory` | Last 20 sensory scores | 20 entries |
| `historyLog` | Activity log | 100 entries |

**Auto-save**: All state changes auto-save via `useEffect` hooks

---

## 🎨 UI Integration

### New Icons Added:
- `<Zap />` - AI features section
- `<TrendingUp />` - Meltdown prediction
- `<Lightbulb />` - Suggestions
- `<History />` - Activity log

### New Tab Added:
- **History Tab** - View activity log, filter by type, view statistics

### Color Coding:
- **Green** (safe zone): <30 sensory score
- **Yellow** (caution): 30-70 sensory score
- **Orange** (warning): 70+ sensory score
- **Red** (critical): 80+ sensory score

---

## 🔧 How to Enable/Disable Features

1. Navigate to **Settings** tab
2. Scroll to **AI Features** section
3. Click ON/OFF buttons for each feature
4. Changes persist automatically

### Individual Feature Controls:

```javascript
// Example: Disable meltdown prediction
setAiEnabled(prev => ({
  ...prev,
  meltdownPrediction: false,
}));
```

---

## 📊 History Log Features

### Filtering:
- View all entries
- Filter by "Suggestions"
- Filter by "Alerts"
- Filter by "Recommendations"

### Statistics:
- Total entries count
- Alerts count
- Suggestions count
- Last entry date

### Entry Format:
```javascript
{
  id: 1708627200000,
  timestamp: "2025-02-23T10:00:00.000Z",
  type: "alert",
  action: "high_meltdown_risk",
  data: {
    riskScore: 72,
    riskLevel: "high",
    factors: ["Sensory load rising rapidly", "Late in day"]
  }
}
```

---

## 🔌 Integration Points

### Enhanced Components:

1. **SensoryMonitor** (Lines 200-450)
   - Added `aiEnabled` prop
   - Displays AI feedback alert when enabled
   - Tracks sensory trends

2. **SocialStoryBuilder** (Lines 452-750)
   - Added `aiEnabled` prop
   - Shows template buttons when enabled
   - Auto-apply templates with one click

3. **MeltdownPrevention** (Lines 752-1050)
   - Added `meltdownPrediction` prop
   - Shows AI risk card at top
   - Integrates prediction factors into warnings

4. **ASDPage (Main)** (Lines 1052-1250)
   - Added AI state management
   - Added AI alerts banner
   - Added AI suggestions cards
   - Added new History tab
   - Integrated all sub-components

---

## 🚀 Future Enhancement Ideas

1. **Backend API Integration**
   - Replace local AI functions with API calls
   - Enable cross-device sync
   - Machine learning model refinement

2. **Advanced Analytics**
   - Weekly/monthly reports
   - Trend visualization charts
   - Personalized insights

3. **Threshold Adaptation**
   - Auto-adjust thresholds based on patterns
   - Learn user's unique sensory baseline

4. **Export Reports**
   - Generate PDF activity reports
   - Share with therapists/doctors
   - Track progress over time

5. **Notifications**
   - Browser push notifications for high-risk alerts
   - Scheduled reminder notifications
   - Custom alert sounds

---

## 🧪 Testing Checklist

- [ ] Enable all AI features and verify they appear
- [ ] Disable features individually and verify they hide
- [ ] Simulate high sensory score (use "Simulate Sensor Update" button)
- [ ] Check that Meltdown Prevention shows AI prediction
- [ ] Create story using AI template
- [ ] View Activity History and filter by type
- [ ] Clear localStorage and verify defaults load
- [ ] Check dark mode styling on all new components

---

## 📝 Notes

- All AI functions are **synchronous** (no API calls)
- AI features work **offline** (no internet required)
- Data is **completely private** (stays in browser localStorage)
- Features can be **disabled independently**
- History is **limited to 100 entries** for performance
- Sensory data history is **limited to 20 entries** for trend analysis

---

## 📧 Support

For questions about the AI enhancements:
1. Check History log for past patterns
2. Review Settings to ensure features are enabled
3. Verify localStorage isn't full (clear old data if needed)
4. All data is local - check browser DevTools > Application > LocalStorage

