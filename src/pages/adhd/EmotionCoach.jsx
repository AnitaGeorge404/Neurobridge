'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Compass, 
  Wind, 
  Brain, 
  AlertTriangle, 
  Zap, 
  Moon, 
  Coffee,
  Sparkles,
  ChevronRight,
  BarChart2,
  History,
  Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const moods = [
  { id: 'calm', label: 'Calm', icon: Wind, color: 'from-emerald-400/20 to-emerald-500/20', border: 'border-emerald-200/50', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  { id: 'focused', label: 'Focused', icon: Brain, color: 'from-blue-400/20 to-blue-500/20', border: 'border-blue-200/50', text: 'text-blue-700', bg: 'bg-blue-50' },
  { id: 'stressed', label: 'Stressed', icon: AlertTriangle, color: 'from-amber-400/20 to-amber-500/20', border: 'border-amber-200/50', text: 'text-amber-700', bg: 'bg-amber-50' },
  { id: 'overwhelmed', label: 'Overwhelmed', icon: Zap, color: 'from-red-400/20 to-red-500/20', border: 'border-red-200/50', text: 'text-red-700', bg: 'bg-red-50' },
  { id: 'bored', label: 'Bored', icon: Moon, color: 'from-slate-400/20 to-slate-500/20', border: 'border-slate-200/50', text: 'text-slate-700', bg: 'bg-slate-50' },
];

const suggestionsByMood = {
  calm: [
    { title: 'Lock In', text: 'Start a 25-minute focus block on one clear task while the mental waters are still.', icon: Brain },
    { title: 'Anchor It', text: 'Note down one sensory detail of this calm to recall it when stressed.', icon: Lightbulb },
  ],
  focused: [
    { title: 'Shield Mode', text: 'Silence all non-urgent notifications. This state is fragile; protect it.', icon: Zap },
    { title: 'Deep Work', text: 'Avoid task-switching for the next 20 minutes. Pick ONE specific output.', icon: Compass },
  ],
  stressed: [
    { title: 'Reset Breath', text: 'Try 4-7-8 breathing: Inhale 4s, Hold 7s, Exhale 8s. Repeat 3 times.', icon: Wind },
    { title: 'Externalize', text: 'Brain dump every stressor into a list. Get them out of your head.', icon: BarChart2 },
  ],
  overwhelmed: [
    { title: 'The 5-Min Rule', text: 'Pick a task so small it takes 5 mins. Ignore everything else for now.', icon: Zap },
    { title: 'Micro-Goal', text: 'Ask: "What is the single next physical action?" Do only that.', icon: Coffee },
  ],
  bored: [
    { title: 'Dopamine Race', text: 'Set a timer for 10 minutes. Can you finish the task before it beeps?', icon: Zap },
    { title: 'Remix Surroundings', text: 'Switch to a high-tempo soundscape or move to a different chair.', icon: Sparkles },
  ],
};

const EmotionCoach = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [isExpanding, setIsExpanding] = useState(false);

  const moodData = selectedMood ? moods.find(m => m.id === selectedMood) : null;
  const suggestions = selectedMood ? suggestionsByMood[selectedMood] : [];

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-8">
      {/* Header Section */}
      <div className="space-y-2 text-center md:text-left">
        <h2 className="text-3xl font-extrabold tracking-tight flex items-center justify-center md:justify-start gap-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          <Compass className="text-purple-600 h-8 w-8" />
          Emotion Navigator
        </h2>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto md:mx-0">
          Spot "emotional drift" before it becomes a crash. Get ADHD-specific intervention strategies tailored to your current state.
        </p>
      </div>

      {/* Mood Matrix - Differentiator: Visual Gradient Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {moods.map((m) => (
          <motion.button
            key={m.id}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedMood(m.id)}
            className={`relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
              selectedMood === m.id
                ? `${m.border} ${m.bg} shadow-lg ring-2 ring-primary/20`
                : 'border-transparent bg-secondary/30 hover:bg-secondary/50'
            }`}
          >
            <div className={`p-3 rounded-xl bg-gradient-to-br ${m.color}`}>
              <m.icon className={`h-6 w-6 ${m.text}`} />
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider ${selectedMood === m.id ? m.text : 'text-muted-foreground'}`}>
              {m.label}
            </span>
            {selectedMood === m.id && (
              <motion.div 
                layoutId="active-indicator"
                className="absolute -bottom-1 w-8 h-1 bg-primary rounded-full" 
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Intervention Engine - Differentiator: Interactive Action Cards */}
      <AnimatePresence mode="wait">
        {selectedMood ? (
          <motion.div
            key={selectedMood}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 px-1">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Tactical Interventions
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.map((s, idx) => (
                <Card key={idx} className="group overflow-hidden border-none bg-card/50 backdrop-blur-sm hover-elevate transition-all duration-300">
                  <div className="p-5 flex gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm">{s.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {s.text}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-32 flex items-center justify-center border-2 border-dashed border-border rounded-3xl text-muted-foreground/40 text-sm font-medium italic"
          >
            Select your current state to generate interventions
          </motion.div>
        )}
      </AnimatePresence>

      {/* The "Pattern Spotter" - Differentiator: Context-Aware Journaling */}
      <Card className="border-2 border-primary/5 bg-gradient-to-br from-background to-secondary/20 overflow-hidden shadow-xl">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
              <History className="h-4 w-4" />
              Pattern Spotter
            </h3>
            <Badge variant="outline" className="text-[10px] font-bold opacity-60">
              30s Ritual
            </Badge>
          </div>
          
          <div className="relative">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Context: Slept 4h, noise outside, high caffeine..."
              className="min-h-[80px] rounded-2xl border-2 border-border focus:border-primary/40 bg-background/50 transition-all resize-none p-4 text-sm"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary">
                <Lightbulb className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="pt-2 flex items-center justify-between text-[10px] text-muted-foreground/70 font-medium">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <BarChart2 className="h-3 w-3" />
                Data-driven tracking
              </span>
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Dopamine-aligned
              </span>
            </div>
            <Button variant="link" className="h-auto p-0 text-[10px] font-bold text-primary">
              View Analytics <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Footer Differentiator Info */}
      <p className="text-center text-[10px] text-muted-foreground/60 font-medium px-8 leading-relaxed max-w-lg mx-auto">
        Standard ADHD apps wait for you to fail. Emotion Navigator uses "Proactive Interception" to help you adjust your strategy 
        to match your biological state in real-time.
      </p>
    </div>
  );
};

export default EmotionCoach;
