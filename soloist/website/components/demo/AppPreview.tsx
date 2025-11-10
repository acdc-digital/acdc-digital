"use client";

import { Card } from "@/components/ui/card";
import { Calendar, TrendingUp, Sparkles, Moon, Sun, Cloud } from "lucide-react";

export function AppPreview() {
  const moods = [
    { emoji: "😊", label: "Great", value: 8, color: "bg-green-500" },
    { emoji: "😌", label: "Good", value: 7, color: "bg-emerald-500" },
    { emoji: "😐", label: "Okay", value: 5, color: "bg-yellow-500" },
    { emoji: "😔", label: "Low", value: 3, color: "bg-orange-500" },
  ];

  return (
    <Card className="relative w-full max-w-[420px] h-[575px] bg-zinc-950 border border-zinc-800 overflow-hidden rounded-2xl shadow-2xl">
      {/* TOP BAR */}
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/95 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-zinc-400">Soloist</span>
        </div>
        <div className="flex items-center gap-1">
          <Sun className="w-3.5 h-3.5 text-zinc-600" />
          <Moon className="w-3.5 h-3.5 text-zinc-400" />
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-col h-[calc(100%-48px)] overflow-hidden">
        {/* Header Section */}
        <div className="px-5 py-4 border-b border-zinc-800/50 bg-gradient-to-b from-zinc-900 to-zinc-950">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-zinc-300">Today's Check-in</span>
            </div>
            <span className="text-xs text-zinc-500">Jan 30, 2026</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">How are you feeling?</span>
          </div>
        </div>

        {/* Mood Selection Grid */}
        <div className="px-5 py-6 space-y-3">
          {moods.map((mood, idx) => (
            <div
              key={idx}
              className={`group relative bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:bg-zinc-800/50 transition-all duration-200 cursor-pointer ${
                idx === 0 ? "ring-2 ring-blue-500/50" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{mood.emoji}</div>
                  <div>
                    <div className="text-sm font-medium text-zinc-200">{mood.label}</div>
                    <div className="text-xs text-zinc-500">Feeling {mood.label.toLowerCase()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${mood.color} transition-all duration-500 ${
                        mood.value >= 8 ? "w-[80%]" :
                        mood.value >= 7 ? "w-[70%]" :
                        mood.value >= 5 ? "w-[50%]" :
                        "w-[30%]"
                      }`}
                    />
                  </div>
                  <span className="text-xs text-zinc-500 w-6 text-right">{mood.value}/10</span>
                </div>
              </div>
              {idx === 0 && (
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="px-5 py-4 border-t border-zinc-800/50 bg-zinc-950 mt-auto">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-green-400" />
              </div>
              <div className="text-xs text-zinc-500">Streak</div>
              <div className="text-lg font-bold text-zinc-200">7d</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center mb-1">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="text-xs text-zinc-500">This Week</div>
              <div className="text-lg font-bold text-zinc-200">6.8</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center mb-1">
                <Cloud className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-xs text-zinc-500">Avg Mood</div>
              <div className="text-lg font-bold text-zinc-200">7.2</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
