// HEATMAP & JOURNAL DEMO FEATURE
// /Users/matthewsimon/Projects/acdc-digital/soloist/website/components/features/HeatmapJournalDemo.tsx

"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

export function HeatmapJournalDemo() {
  // Realistic sample data showing natural mood variation
  // Showing only 143 days (11 rows × 13 days) to fit without scrolling
  const totalDaysToShow = 143; // 11 rows visible without scrolling
  
  // Generate days with varied data
  const sampleDays = Array.from({ length: totalDaysToShow }, (_, index) => {
    const dayOfYear = index + 1;
    
    // Days 122-143 are future (last 3 rows = 21-22 days) - grayed out
    if (dayOfYear > 121) {
      return { day: dayOfYear, score: null, isFuture: true };
    }
    
    // Scattered empty days (no logs) throughout the year - about 20% empty
    const emptyDays = [5, 12, 19, 28, 35, 44, 53, 61, 70, 79, 88, 96, 105, 114];
    if (emptyDays.includes(dayOfYear)) {
      return { day: dayOfYear, score: null, isFuture: false };
    }
    
    // Assign realistic scores with natural variation
    // Create waves of highs and lows throughout the period
    let score: number;
    
    if (dayOfYear <= 31) { // First month
      if (dayOfYear <= 3) score = 85;
      else if (dayOfYear === 9) score = 38;
      else if (dayOfYear <= 11) score = 55;
      else if (dayOfYear === 17) score = 42;
      else if (dayOfYear <= 24) score = 78;
      else score = 82;
    } else if (dayOfYear <= 59) { // Second month
      if (dayOfYear === 37) score = 35;
      else if (dayOfYear <= 41) score = 48;
      else if (dayOfYear <= 45) score = 78;
      else score = 82;
    } else if (dayOfYear <= 90) { // Third month
      if (dayOfYear <= 64) score = 88;
      else if (dayOfYear === 65) score = 44;
      else if (dayOfYear <= 72) score = 75;
      else score = 91;
    } else { // Fourth month (up to day 121)
      if (dayOfYear <= 97) score = 85;
      else if (dayOfYear === 100) score = 73; // Current day
      else score = 82;
    }
    
    return { day: dayOfYear, score, isFuture: false };
  });

  // Color mapping with increased contrast
  const getColorClass = (score: number | null, isFuture: boolean) => {
    if (isFuture) return "bg-zinc-600/40 border border-zinc-500/50";
    if (score === null) return "bg-zinc-800/20 border border-zinc-700/40";
    if (score >= 90) return "bg-indigo-400";
    if (score >= 80) return "bg-blue-400";
    if (score >= 70) return "bg-sky-400";
    if (score >= 60) return "bg-teal-400";
    if (score >= 50) return "bg-green-400";
    if (score >= 40) return "bg-cyan-400";
    if (score >= 30) return "bg-yellow-400";
    if (score >= 20) return "bg-amber-500";
    if (score >= 10) return "bg-orange-500";
    return "bg-rose-600";
  };

  return (
    <div className="absolute inset-0 p-3 flex flex-col">
      {/* Header Text */}
      <div className="mb-3 px-2 flex items-start gap-3 flex-shrink-0">
        {/* Number */}
        <div className="flex-shrink-0">
          <span className="text-5xl font-bold text-neutral-700">2</span>
        </div>
        
        {/* Text Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-300 mb-1">
            Track & Reflect
          </h3>
          <p className="text-sm text-neutral-400">
            Immediately begin logging your days and reviewing a daily summary dedicated to help you reflect and make adjustments for tomorrow.
          </p>
        </div>
      </div>
      
      <Card className="w-full flex-1 min-h-0 bg-zinc-900 border-zinc-800 rounded-xl overflow-hidden flex">
        {/* Left Side - Heatmap Calendar (60%) */}
        <div className="w-[60%] p-3 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="border-zinc-700 text-zinc-300 text-xs">
                72 Logs
              </Badge>
              <Badge variant="outline" className="border-zinc-700 text-zinc-300 text-xs">
                Avg: 73.4
              </Badge>
            </div>
            <Info className="h-4 w-4 text-zinc-400" />
          </div>

          {/* Calendar Grid Container - matching exact styling */}
          <div className="flex-1 min-h-0 border border-zinc-700 bg-zinc-900/50 rounded-md">
            <div className="h-full overflow-hidden">
              <div className="flex flex-wrap gap-1 pl-3 pt-2">
                {sampleDays.map((item) => {
                  const isToday = item.day === 100; // Highlighting day 100 as "today"
                  const isEmptyDay = item.score === null && !item.isFuture;
                  
                  return (
                    <div
                      key={item.day}
                      className={`
                        flex items-center justify-center
                        w-8 h-8 rounded-sm ${item.isFuture ? 'cursor-not-allowed' : 'cursor-pointer'}
                        text-[10px] font-medium transition-all duration-150
                        ${getColorClass(item.score, item.isFuture)}
                        ${isEmptyDay ? "text-zinc-100" : "text-zinc-300/90"}
                        [outline:0.5px_solid_rgba(0,0,0,0.1)]
                      `}
                    >
                      {item.day}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Legend - matching exact styling */}
          <div className="flex-shrink-0 mt-2 text-xs text-zinc-400">
            <div className="mb-2">Score legend:</div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded-sm bg-indigo-400" />
                <span className="text-zinc-400">90-100</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded-sm bg-blue-400" />
                <span className="text-zinc-400">80-89</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded-sm bg-sky-400" />
                <span className="text-zinc-400">70-79</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded-sm bg-zinc-800/30 border border-zinc-700/50" />
                <span className="text-zinc-400">No Log</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Daily Log Form (40%) */}
        <div className="w-[40%] bg-gradient-to-br from-zinc-800 to-zinc-900 p-4 flex flex-col min-h-0 border-l border-zinc-800">
          {/* Form Header */}
          <div className="mb-3 flex-shrink-0">
            <h4 className="text-sm font-semibold text-zinc-100 mb-1">Daily Log Form</h4>
            <p className="text-xs text-zinc-400">Nov 22, 2025</p>
          </div>

          {/* Form Fields - Scrollable */}
          <div className="flex-1 space-y-3 overflow-y-auto min-h-0">
            {/* Rate Your Day Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300">Overall Mood</label>
                <span className="text-xs text-blue-400 font-semibold">5/10</span>
              </div>
              <div className="relative h-2 bg-zinc-800 rounded-full">
                <div className="absolute h-full w-1/2 bg-blue-500 rounded-full"></div>
                <div className="absolute right-1/2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-blue-500"></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300">Work Satisfaction</label>
                <span className="text-xs text-blue-400 font-semibold">5/10</span>
              </div>
              <div className="relative h-2 bg-zinc-800 rounded-full">
                <div className="absolute h-full w-1/2 bg-blue-500 rounded-full"></div>
                <div className="absolute right-1/2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-blue-500"></div>
              </div>
            </div>

            {/* Basic Wellness */}
            <div className="pt-1">
              <label className="text-xs font-medium text-zinc-300 mb-2 block">Basic Wellness</label>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-zinc-800/50 rounded-lg px-2 py-1.5">
                  <span className="text-xs text-zinc-300">Hours of sleep</span>
                  <span className="w-10 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0 text-xs text-zinc-100 text-right inline-block">
                    7
                  </span>
                </div>
                <div className="flex items-center justify-between bg-zinc-800/50 rounded-lg px-2 py-1.5">
                  <span className="text-xs text-zinc-300">Exercise today?</span>
                  <div className="flex gap-1.5">
                    <button className="px-2 py-0.5 text-xs rounded bg-blue-500 text-white">Yes</button>
                    <button className="px-2 py-0.5 text-xs rounded bg-zinc-700 text-zinc-400">No</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Areas */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Highlights</label>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-400 min-h-[2rem]">
                Had a productive morning session...
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3 mt-2 border-t border-zinc-800 flex-shrink-0">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 rounded-lg transition-colors">
              Save Log
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
