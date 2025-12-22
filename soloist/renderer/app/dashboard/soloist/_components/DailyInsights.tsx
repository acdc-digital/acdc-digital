// DAILY INSIGHTS COMPONENT
// Displays the selected day's insights at the top of the StatsPanel
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/soloist/_components/DailyInsights.tsx

"use client";

import React, { useMemo } from "react";
import { Sparkles, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { getColorClass } from "@/lib/scoreColors";
import { 
  useSelectedDay, 
  useSelectedDateRange,
  useWeekData,
  type DayData 
} from "@/store/soloistStore";

interface DailyInsightsProps {
  className?: string;
}

// Helper to get border color based on score
function getBorderColorClass(score: number | null | undefined): string {
  if (score == null) return "border-neutral-600/50";
  if (score >= 90) return "border-indigo-500";
  if (score >= 80) return "border-blue-500";
  if (score >= 70) return "border-sky-500";
  if (score >= 60) return "border-teal-500";
  if (score >= 50) return "border-green-500";
  if (score >= 40) return "border-lime-500";
  if (score >= 30) return "border-yellow-500";
  if (score >= 20) return "border-amber-600";
  if (score >= 10) return "border-orange-600";
  return "border-rose-700";
}

export function DailyInsights({ className }: DailyInsightsProps) {
  const selectedDay = useSelectedDay();
  const selectedDateRange = useSelectedDateRange();
  const weekData = useWeekData();

  // Check if the selected day is actually today (current calendar date)
  const isActuallyToday = useMemo(() => {
    if (!selectedDay) return false;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return selectedDay.date === todayStr;
  }, [selectedDay]);

  // Calculate average score for the week (only from days with scores)
  const averageScore = useMemo(() => {
    if (!weekData || weekData.length === 0) return null;
    const scoresWithValues = weekData
      .filter(day => day.emotionScore !== null && day.emotionScore !== undefined && day.emotionScore > 0)
      .map(day => day.emotionScore as number);
    if (scoresWithValues.length === 0) return null;
    const sum = scoresWithValues.reduce((acc, score) => acc + score, 0);
    return Math.round(sum / scoresWithValues.length);
  }, [weekData]);

  // No day selected state
  if (!selectedDay) {
    return (
      <div className={cn("p-4", className)}>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-neutral-400" />
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            No day selected
          </span>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Select a day from the calendar to view insights.
        </p>
      </div>
    );
  }

  // Determine what to display: Today's score or Average
  const showAverage = !isActuallyToday;
  const displayScore = showAverage ? averageScore : selectedDay.emotionScore;
  const displayLabel = showAverage ? "Average" : "Today";
  
  const score = selectedDay.emotionScore;
  const hasScore = displayScore !== null && displayScore !== undefined && displayScore > 0;
  const isNoLog = !selectedDay.isFuture && !hasScore;
  const isForecast = selectedDay.isFuture;
  const colorClass = getColorClass(displayScore);
  const borderColorClass = getBorderColorClass(displayScore);

  return (
    <div className={cn("", className)}>
      {/* Header with day info */}
      <div className="flex items-start gap-4 p-4">
        {/* Score box preview - square with equal dimensions */}
        <div className="flex flex-col flex-shrink-0">
          <div 
            className={cn(
              "w-[4rem] h-[4rem] flex items-center justify-center rounded-lg",
              hasScore ? colorClass : "bg-neutral-200 dark:bg-neutral-700"
            )}
          >
            {hasScore ? (
              <span className={cn(
                "text-lg font-bold",
                displayScore !== null && displayScore >= 60 ? "text-neutral-900" : "text-neutral-100"
              )}>
                {displayScore}
              </span>
            ) : (
              <span className="text-2xl font-medium text-neutral-400 dark:text-neutral-500">—</span>
            )}
          </div>
          {/* Selected date below the box */}
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1.5 text-center">
            {selectedDay.formattedDate}
          </p>
        </div>

        {/* Day details */}
        <div className="flex-1">
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {displayLabel}
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
            {showAverage 
              ? selectedDay.formattedDate
              : selectedDay.formattedDate
            }
          </p>
          
          {!showAverage && isNoLog && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1 cursor-pointer hover:underline">
              Log your day to see your emotional score.
            </p>
          )}

          {isForecast && !hasScore && (
            <p className="text-sm text-blue-500 dark:text-blue-400 mt-1">
              Forecast pending...
            </p>
          )}
        </div>
      </div>

      {/* Recommendation section - commented out for now */}
      {/* <div className="px-4 pb-4">
        <div className="bg-neutral-100 dark:bg-neutral-800/60 rounded-sm p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Recommendation
            </span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            {isNoLog 
              ? "Log your day to update your forecast."
              : isForecast
                ? "This is a forecasted day. Check back after living through it!"
                : "View your daily insights and emotional patterns here."
            }
          </p>
        </div>
      </div> */}
    </div>
  );
}

export default DailyInsights;
