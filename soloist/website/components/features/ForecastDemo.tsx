// FORECAST DEMO FEATURE
// /Users/matthewsimon/Projects/acdc-digital/soloist/website/components/features/ForecastDemo.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, TrendingUp, TrendingDown, Sparkles } from "lucide-react";

// Helper to get color class based on score
function getColorClass(score: number | null, isFuture: boolean): string {
  if (score === null) return "bg-zinc-800/20 border border-zinc-700/40";
  if (isFuture) {
    // Brighter styling for predictions
    if (score >= 90) return "bg-indigo-400/85";
    if (score >= 80) return "bg-blue-400/85";
    if (score >= 70) return "bg-sky-400/85";
    if (score >= 60) return "bg-teal-400/85";
    if (score >= 50) return "bg-green-400/85";
    if (score >= 40) return "bg-cyan-400/85";
    if (score >= 30) return "bg-yellow-400/85";
    return "bg-amber-500/85";
  }
  // Past/logged days - more vibrant
  if (score >= 90) return "bg-indigo-400";
  if (score >= 80) return "bg-blue-400";
  if (score >= 70) return "bg-sky-400";
  if (score >= 60) return "bg-teal-400";
  if (score >= 50) return "bg-green-400";
  if (score >= 40) return "bg-cyan-400";
  if (score >= 30) return "bg-yellow-400";
  return "bg-amber-500";
}

function getTextColor(score: number | null): string {
  if (score === null) return "text-zinc-100";
  if (score >= 40) return "text-zinc-900";
  return "text-zinc-100";
}

export function ForecastDemo() {
  const [selectedDay, setSelectedDay] = useState(3); // Today (index 3)
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Demo data: 4 days of logs + today (logged) + 3 days of predictions
  const forecastDays = [
    { 
      day: "Wed", 
      date: "Nov 19", 
      score: 78, 
      isFuture: false, 
      trend: "up",
      summary: "Productive day with good energy levels. Morning workout helped set a positive tone.",
      highlights: "Completed project milestone, had meaningful conversation with friend",
      difficulties: "Concentration wavered mid-afternoon, needed extra coffee",
      challenges: "Felt rushed in the afternoon"
    },
    { 
      day: "Thu", 
      date: "Nov 20", 
      score: 42, 
      isFuture: false, 
      trend: "down",
      summary: "Challenging day with low energy. Sleep quality was poor the night before.",
      highlights: "Managed to complete essential tasks despite feeling low",
      difficulties: "Brain fog throughout the day, hard to focus on complex problems",
      challenges: "Stressful meeting, poor sleep, felt overwhelmed"
    },
    { 
      day: "Fri", 
      date: "Nov 21", 
      score: 75, 
      isFuture: false, 
      trend: "up",
      summary: "Recovery day with improved mood. Focused on self-care and lighter tasks.",
      highlights: "Good work-life balance, evening walk helped clear mind",
      difficulties: "Morning started slow, took time to get motivated",
      challenges: "Still felt some lingering stress from Thursday"
    },
    { 
      day: "Sat", 
      date: "Nov 22", 
      score: 82, 
      isFuture: false, 
      trend: "up", 
      isToday: true,
      summary: "Strong weekend start with positive energy. Morning routine went well.",
      highlights: "Quality time with family, finished book, cooked healthy meal",
      difficulties: "Brief afternoon fatigue after lunch",
      challenges: "None significant",
      recommendation: "Continue the momentum! Your pattern shows weekend days tend to be positive. You have a stressful workday ahead on Monday, consider prepping this evening to prepare."
    },
    { 
      day: "Sun", 
      date: "Nov 23", 
      score: 72, 
      isFuture: true, 
      trend: "down",
      summary: "Based on your patterns, Sunday may bring some pre-week anxiety. Score likely around 72.",
      recommendation: "Prepare for the week ahead without overplanning. Sunday evening tends to show dips in your emotional state. Consider light exercise and early bedtime.",
      confidence: 78
    },
    { 
      day: "Mon", 
      date: "Nov 24", 
      score: 68, 
      isFuture: true, 
      trend: "down",
      summary: "Monday typically shows moderate stress in your pattern. Expect score around 68.",
      recommendation: "Start with easier tasks to build momentum. Your Monday mornings tend to be challenging. Schedule important meetings for afternoon when your energy peaks.",
      confidence: 82
    },
    { 
      day: "Tue", 
      date: "Nov 25", 
      score: 85, 
      isFuture: true, 
      trend: "up",
      summary: "Strong recovery predicted. Your pattern shows Tuesday is typically your best weekday at 85.",
      recommendation: "Great day for important tasks and decisions! Schedule challenging work or important conversations. Your energy and focus peak on Tuesdays.",
      confidence: 85
    },
  ];

  const selected = forecastDays[selectedDay];
  const avgScore = 71.7;

  // Calculate point difference for today
  const getPreviousDayScore = () => {
    if (selectedDay > 0 && forecastDays[selectedDay - 1]?.score !== null) {
      return forecastDays[selectedDay - 1].score;
    }
    return null;
  };

  const previousScore = getPreviousDayScore();
  const pointDifference = previousScore !== null && selected.score !== null 
    ? selected.score - previousScore 
    : null;

  // Prevent hydration mismatch - show placeholder until mounted
  if (!mounted) {
    return (
      <div className="absolute inset-0 p-3 flex flex-col">
        <div className="mb-3 px-2 flex items-start gap-3 flex-shrink-0">
          <div className="flex-shrink-0">
            <span className="text-4xl font-bold text-neutral-700">3</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-300 mb-1">
              Mood Forecasting
            </h3>
            <p className="text-sm text-neutral-400">
              Research backed predictions to help you understand and plan ahead.
            </p>
          </div>
        </div>
        <Card className="w-full flex-1 min-h-0 bg-zinc-900 border-zinc-800 rounded-xl overflow-hidden flex flex-col p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-zinc-800 rounded w-1/2"></div>
            <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
            <div className="grid grid-cols-7 gap-1.5">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-16 bg-zinc-800 rounded-md"></div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 p-3 flex flex-col">
      {/* Header Text */}
      <div className="mb-3 px-2 flex items-start gap-3 flex-shrink-0">
        {/* Number */}
        <div className="flex-shrink-0">
          <span className="text-4xl font-bold text-neutral-700">3</span>
        </div>
        
        {/* Text Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-300 mb-1">
            Mood Forecasting
          </h3>
          <p className="text-sm text-neutral-400">
            Research backed predictions to help you understand and plan ahead.
          </p>
        </div>
      </div>
      
      <Card className="w-full flex-1 min-h-0 bg-zinc-900 border-zinc-800 rounded-xl overflow-hidden flex flex-col p-4">
        {/* Header with badges */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div>
            <h4 className="text-base font-semibold text-zinc-100 mb-1">7-Day Emotional Forecast</h4>
            <p className="text-xs text-zinc-400">Predictions based on your past log patterns</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-zinc-700 text-zinc-300 text-xs">
              7 Days
            </Badge>
            <Badge variant="outline" className="border-zinc-700 text-zinc-300 text-xs">
              Avg: {avgScore}
            </Badge>
            <Info className="h-4 w-4 text-zinc-400" />
          </div>
        </div>

        {/* 7-Day Strip */}
        <div className="grid grid-cols-7 gap-1.5 mb-3 flex-shrink-0">
          {forecastDays.map((day, idx) => {
            const isSelected = selectedDay === idx;
            const colorClass = getColorClass(day.score, day.isFuture);
            const textColor = getTextColor(day.score);
            
            return (
              <button
                key={idx}
                onClick={() => setSelectedDay(idx)}
                className={`
                  flex flex-col items-center justify-between p-1.5 rounded-md
                  ${colorClass}
                  ${isSelected ? 'ring-2 ring-blue-400' : ''}
                  ${day.isToday ? 'ring-1 ring-white/50' : ''}
                  ${day.isFuture ? 'border-2 border-white/80' : ''}
                  cursor-pointer transition-all duration-150
                  hover:scale-105 relative
                `}
              >
                <div className="text-[10px] font-medium text-center">
                  <div className={`${textColor} font-semibold`}>{day.day}</div>
                  <div className={`${textColor} opacity-70 text-[9px]`}>{day.date}</div>
                </div>
                
                <div className="flex items-center gap-0.5 mt-1">
                  <span className={`text-xl font-bold ${textColor}`}>
                    {day.score !== null ? day.score : '—'}
                  </span>
                  {day.trend === 'up' && (
                    <div className="bg-green-500 rounded-sm p-0.5">
                      <TrendingUp className="h-3 w-3 text-white" />
                    </div>
                  )}
                  {day.trend === 'down' && (
                    <div className="bg-rose-500 rounded-sm p-0.5">
                      <TrendingDown className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                
                {day.isToday && (
                  <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-white/80"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Day Details */}
        <div className="flex-1 min-h-0 border-t border-zinc-800 pt-3">
          <div className="flex gap-3 items-start">
            {/* Score Box */}
            <div className={`
              flex-shrink-0 w-20 h-20 rounded-md flex flex-col items-center justify-center
              ${getColorClass(selected.score, selected.isFuture)}
              ${selected.isFuture ? 'border border-white/60' : ''}
            `}>
              <span className={`text-3xl font-bold ${getTextColor(selected.score)}`}>
                {selected.score !== null ? selected.score : '—'}
              </span>
              {selected.trend && (
                <div className="flex items-center gap-2 mt-0.5">
                  {selected.trend === 'up' && (
                    <div className="bg-green-500 rounded-sm p-1">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                  )}
                  {selected.trend === 'down' && (
                    <div className="bg-rose-500 rounded-sm p-1">
                      <TrendingDown className="h-4 w-4 text-white" />
                    </div>
                  )}
                  {selected.trend === 'stable' && (
                    <div className="bg-blue-500 rounded-sm p-1">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  )}
                  {pointDifference !== null && (
                    <span className="text-sm font-medium text-zinc-100">
                      {pointDifference > 0 ? '+' : ''}{pointDifference}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Details Text */}
            <div className="flex-1 min-h-0">
              <h4 className="text-sm font-semibold text-zinc-100 mb-1">
                {selected.isToday
                  ? `Today - ${selected.date}`
                  : selected.isFuture
                  ? `Predicted: ${selected.day}, ${selected.date}`
                  : `Logged: ${selected.day}, ${selected.date}`}
              </h4>
              
              <p className="text-xs text-zinc-300 mb-2">
                {selected.summary}
              </p>

              {/* Highlights, Difficulties, and Challenges for logged days */}
              {!selected.isFuture && selected.highlights && (
                <div className="mb-2 space-y-1">
                  <div className="text-xs">
                    <span className="text-green-400 font-medium">Highlights: </span>
                    <span className="text-zinc-400">{selected.highlights}</span>
                  </div>
                  {selected.difficulties && (
                    <div className="text-xs">
                      <span className="text-orange-400 font-medium">Difficulties: </span>
                      <span className="text-zinc-400">{selected.difficulties}</span>
                    </div>
                  )}
                  {selected.challenges && selected.challenges !== "None significant" && (
                    <div className="text-xs">
                      <span className="text-amber-400 font-medium">Challenges: </span>
                      <span className="text-zinc-400">{selected.challenges}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Recommendation */}
              {selected.recommendation && (
                <div className="bg-zinc-800/70 p-2 rounded-md border border-zinc-700/50">
                  <h5 className="text-xs font-medium text-zinc-200 mb-1 flex items-center">
                    <Sparkles className="h-3 w-3 mr-1 text-blue-400" />
                    Recommendation:
                  </h5>
                  <p className="text-xs text-zinc-400">
                    {selected.recommendation}
                  </p>
                </div>
              )}
              
              {/* Confidence for predictions */}
              {selected.isFuture && selected.confidence && (
                <div className="mt-2 text-xs text-zinc-500 flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  Forecast confidence: {selected.confidence}%
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
