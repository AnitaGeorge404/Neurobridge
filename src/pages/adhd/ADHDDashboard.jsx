'use client';

import React from 'react';
import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const tools = [
  { to: '/adhd/timeline', title: '🕐 Visual Timeline', desc: 'Icon schedules beat time blindness' },
  { to: '/adhd/breakdown', title: '✨ Task Breakdown', desc: 'AI splits overwhelming tasks' },
  { to: '/adhd/focus', title: '🌳 Focus Sessions', desc: 'Gamified Pomodoro with rewards' },
  { to: '/adhd/sounds', title: '🎧 Soundscapes', desc: 'Adaptive audio for focus/sleep' },
  { to: '/adhd/doubling', title: '👥 Body Doubling', desc: 'Accountability timers' },
  { to: '/adhd/emotion-coach', title: '🧭 Emotion Coach', desc: 'Mood check-ins with tiny coping steps' },
];

export default function ADHDDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <Zap className="w-20 h-20 text-purple-600 mx-auto mb-6" />
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          FocusForge ADHD Hub
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          6 neurodivergent supertools for executive function, focus, sleep, emotion, and motivation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map(({ to, title, desc }) => (
          <Link
            key={to}
            to={to}
            className="group bg-white/70 backdrop-blur-md hover:bg-white hover:shadow-2xl border border-white/50 rounded-3xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]"
          >
            <div className="text-4xl mb-4">{title.split(' ')[0]}</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-purple-600">
              {title.split(' ').slice(1).join(' ')}
            </h3>
            <p className="text-gray-600 mb-6">{desc}</p>
            <span className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-full font-medium text-sm tracking-wide">
              Launch Tool →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
