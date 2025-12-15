// SOLOIST WEEK GRID
// Displays 7 day boxes in a 2-2-2-1 vertical layout for the sidebar
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/soloist/_components/WeekGrid.tsx

"use client";

import React, { useEffect } from "react";
import { ThumbsUp, ThumbsDown, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getColorClass } from "@/lib/scoreColors";
import { 
  useSoloistStore, 
  useWeekData, 
  useSelectedDayIndex,
  type DayData 
} from "@/store/soloistStore";

interface WeekGridProps {
  className?: string;
}

// Helper functions
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

function getTextColorClass(score: number | null | undefined): string {
  if (score == null) return "text-neutral-400";
  if (score >= 60) return "text-neutral-900";
  return "text-neutral-100";
}

const TrendIcon = ({ trend }: { trend?: string | null }) => {
  if (trend === "up") return <TrendingUp className="h-3 w-3 text-green-500" />;
  if (trend === "down") return <TrendingDown className="h-3 w-3 text-rose-500" />;
  return <Sparkles className="h-3 w-3 text-blue-400 opacity-70" />;
};

export function WeekGrid({ className }: WeekGridProps) {
  // Get data and actions from store
  const weekData = useWeekData();
  const selectedDayIndex = useSelectedDayIndex();
  const setSelectedDayIndex = useSoloistStore((state) => state.setSelectedDayIndex);
  const initialize = useSoloistStore((state) => state.initialize);
  const isInitialized = useSoloistStore((state) => state.isInitialized);

  // Initialize store if not already done
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  const handleDayClick = (index: number) => {
    setSelectedDayIndex(index);
  };

  // Render a single day box
  const renderDayBox = (day: DayData | undefined, idx: number) => {
    if (!day) {
      return (
        <div 
          key={idx} 
          className="flex flex-col items-center justify-between py-0.5 px-0.5 border h-[80px] bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 opacity-60 rounded-md"
        >
          <div className="text-[12px] font-medium text-neutral-400">—</div>
          <span className="text-xl font-bold text-neutral-400">?</span>
        </div>
      );
    }

    const score = day.emotionScore;
    const colorClass = getColorClass(score);
    const borderColorClass = getBorderColorClass(score);
    const textColorClass = getTextColorClass(score);
    const isFutureDay = day.isFuture;
    const needsGen = isFutureDay && (score === null || score === 0 || score === undefined);
    const isSelected = selectedDayIndex === idx;

    return (
      <div
        key={day.date || idx}
        title={`${day.date}: ${score ?? 'N/A'}`}
        className={cn(
          "flex flex-col items-center justify-between cursor-pointer transition-all duration-100 rounded-md",
          isFutureDay ? "h-[84px] py-0.5 px-0.5 pb-1" : "h-[80px] py-0.5 px-0.5",
          colorClass,
          isSelected && "ring-2 ring-indigo-400 ring-offset-1 ring-offset-neutral-900",
          day.isPast && "opacity-75 hover:opacity-100",
          day.isToday && "relative ring-1 ring-inset ring-white/50",
          needsGen && "border border-dashed border-neutral-500 bg-neutral-700/30"
        )}
        onClick={() => handleDayClick(idx)}
      >
        <div className="text-center">
          <div className={cn("text-xs font-semibold", needsGen ? "text-neutral-400" : textColorClass)}>
            {day.shortDay}
          </div>
          <div className={cn("text-[10px] opacity-75", needsGen ? "text-neutral-500" : textColorClass)}>
            {day.formattedDate}
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <span className={cn("text-2xl font-bold", needsGen ? "text-neutral-400" : textColorClass)}>
            {score !== null && score !== undefined && score > 0 ? score : (needsGen ? '?' : '—')}
          </span>
          {score !== null && score > 0 && !needsGen && day.trend && <TrendIcon trend={day.trend} />}
        </div>
        {/* White dot indicator for current day - disabled
        {day.isToday && <div className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-white/80" />}
        */}
        
        {/* Feedback buttons for future days */}
        {/* {isFutureDay && (
          <div className="flex gap-2">
            <button className="p-0.5" type="button" aria-label="Forecast was correct">
              <ThumbsUp className="h-4 w-4 text-neutral-400 hover:text-green-500 transition-colors" />
            </button>
            <button className="p-0.5" type="button" aria-label="Forecast was incorrect">
              <ThumbsDown className="h-4 w-4 text-neutral-400 hover:text-rose-500 transition-colors" />
            </button>
          </div>
        )} */}
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {/* All 7 days in vertical column */}
      {weekData.map((day, idx) => renderDayBox(day, idx))}
    </div>
  );
}

export default WeekGrid;
