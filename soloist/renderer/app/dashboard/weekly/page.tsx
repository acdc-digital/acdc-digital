// SOLOIST (FORECAST) - REDESIGNED
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/soloist/page.tsx

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { 
  Loader2, 
  Sparkles,
  Info,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Calendar,
  BarChart3
} from "lucide-react";
import { useConvexUser } from "@/hooks/useConvexUser";
import { useFeedStore } from "@/store/feedStore";
import WeeklyPatterns from "./_components/WeeklyPatterns";
import { format, subDays } from 'date-fns';

// Helper component for Loading State
const LoadingState = ({ message = "Loading..." }: { message?: string }) => (
  <div className="flex-1 h-full flex flex-col items-center justify-center bg-neutral-100 dark:bg-[#2b2b2b]">
    <Loader2 className="h-6 w-6 animate-spin text-neutral-500 dark:text-neutral-400 mb-3" />
    <div className="text-sm text-neutral-600 dark:text-neutral-400">{message}</div>
  </div>
);

// Helper component for Empty/Error State
const EmptyState = ({ title, description, onGenerate, isGenerating, error }: {
  title: string;
  description: string;
  onGenerate?: () => void;
  isGenerating?: boolean;
  error?: string | null;
}) => (
  <div className="flex-1 h-full flex flex-col items-center justify-center bg-neutral-100 dark:bg-[#2b2b2b] text-center px-4">
    <div className="text-neutral-600 dark:text-neutral-400 mb-3 text-sm">{title}</div>
    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">{description}</p>
    {onGenerate && (
      <Button
        variant="outline"
        size="sm"
        onClick={onGenerate}
        disabled={isGenerating}
        className="h-7 text-xs rounded-none border-neutral-300 dark:border-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-700"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-3 w-3" />
            Generate Forecast
          </>
        )}
      </Button>
    )}
    {error && (
      <div className="mt-3 p-2 w-full max-w-md bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs rounded-none">
        Error: {error}
      </div>
    )}
  </div>
);

// Helper functions - using standardized color scale
function getColorClass(score: number | null | undefined): string {
  if (score == null) return "bg-neutral-700/20";
  if (score >= 90) return "bg-indigo-400/80";
  if (score >= 80) return "bg-blue-400/80";
  if (score >= 70) return "bg-sky-400/80";
  if (score >= 60) return "bg-teal-400/80";
  if (score >= 50) return "bg-green-400/80";
  if (score >= 40) return "bg-lime-400/80";
  if (score >= 30) return "bg-yellow-400/80";
  if (score >= 20) return "bg-amber-500/80";
  if (score >= 10) return "bg-orange-500/80";
  return "bg-rose-600/80";
}

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

const mockInsights = [
  "Your emotional state tends to peak midweek (Wednesday) and on weekends",
  "Thursday consistently shows lower emotional scores - consider additional self-care",
  "Evening periods generally show higher wellbeing than mornings",
  "Your recovery pattern is strong, with quick rebounds after challenging days"
];

export default function SoloistPage() {
  const { isAuthenticated, isLoading: userLoading, userId } = useConvexUser();
  const [selectedDayIndex, setSelectedDayIndex] = useState(3);
  const [isGeneratingForecast, setIsGeneratingForecast] = useState(false);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const [lastForecastDate, setLastForecastDate] = useState<string | null>(null);

  // Feed store for opening daily log form
  const { setSelectedDate, setActiveTab, setSidebarOpen } = useFeedStore();
  
  // Get user's local today string
  const localToday = format(new Date(), 'yyyy-MM-dd');

  // Fetch forecast data - will run even with empty userId
  const forecastData = useQuery(
    api.forecast.getSevenDayForecast,
    userId
      ? {
          userId,
          today: localToday,
        }
      : "skip"
  );

  // Generate forecast mutation
  const generateForecast = useAction(api.forecast.generateForecast);

  // Calculate average score safely
  const averageScore = (Array.isArray(forecastData) && forecastData.length > 0)
    ? ((forecastData.reduce((sum, day) => sum + (day.emotionScore ?? 0), 0)) /
       (forecastData.filter(day => day.emotionScore !== null && day.emotionScore > 0).length || 1)).toFixed(1)
    : "N/A";

  // Effect to set default selected day (today is always at index 3)
  useEffect(() => {
    setSelectedDayIndex(3); // Today is always at index 3 in our 7-day structure
  }, []); // Only run once on mount

  // Navigation handlers
  const navigatePrevDay = () => setSelectedDayIndex(prev => Math.max(0, prev - 1));
  const navigateNextDay = () => {
    setSelectedDayIndex(prev => Math.min(6, prev + 1)); // Always 7 days (indices 0-6)
  };

  // Check if forecast was already generated today
  const forecastGeneratedToday = lastForecastDate === localToday;
  
  // Ensure we always have a consistent 7-day view: 3 past + today + 3 future
  const processedForecastData = useMemo(() => {
    const today = new Date();
    const sevenDayStructure = [];
    
    // Generate the 7-day structure (3 past, today, 3 future)
    for (let i = -3; i <= 3; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      const dateString = format(targetDate, 'yyyy-MM-dd');
      
      // Try to find existing data for this date
      const existingData = Array.isArray(forecastData) 
        ? forecastData.find(day => day.date === dateString)
        : null;
      
      // Determine day type
      const isPast = i < 0;
      const isToday = i === 0;
      const isFuture = i > 0;
      
      // Create day object with existing data or placeholder
      const dayObject = existingData || {
        date: dateString,
        day: isToday ? 'Today' : format(targetDate, 'EEEE'),
        shortDay: format(targetDate, 'EEE'),
        formattedDate: format(targetDate, 'MMM d'),
        emotionScore: null,
        description: isPast 
          ? 'No log recorded' 
          : isToday 
            ? 'No log for today' 
            : 'Forecast needed',
        trend: null,
        details: isPast
          ? `No entry recorded for ${format(targetDate, 'EEEE, MMMM d')}. Past logs help improve future forecasts.`
          : isToday
            ? 'No entry for today. Log your day to see your real score.'
            : 'Generate forecast for predictions about this day.',
        recommendation: isPast
          ? 'Consider logging past experiences when possible for better insights.'
          : isToday
            ? 'Log your day to update your forecast.'
            : 'Complete recent logs to generate forecasts.',
        isPast,
        isToday,
        isFuture,
        canGenerateForecast: false,
        confidence: existingData?.confidence || 0,
      };
      
      sevenDayStructure.push(dayObject);
    }
    
    return sevenDayStructure;
  }, [forecastData, localToday]);

  // Check if we need forecasts (based on our consistent 7-day structure)
  const needsForecasts = processedForecastData.some(day =>
    day.isFuture &&
    (day.emotionScore === 0 || day.emotionScore === null || 
     day.description === "Forecast needed" || day.description?.toLowerCase().includes('forecast needed'))
  );

  // Check if user needs to submit logs (has no data for past days or today)
  const needsLogs = processedForecastData.some(day =>
    !day.isFuture &&
    (day.emotionScore === 0 || day.emotionScore === null)
  );

  // Forecast generation handler
  const handleGenerateForecast = () => {
    setForecastError(null);
    setIsGeneratingForecast(true);
    const today = new Date();
    const endDate = format(today, 'yyyy-MM-dd');
    const startDate = format(subDays(today, 3), 'yyyy-MM-dd');
    generateForecast({ userId, startDate, endDate })
      .then(result => {
        console.log("[SoloistPage] Generation result:", result);
        if (result && !result.success) {
          setForecastError(result.error || "Failed to generate forecast");
        } else {
          // Update last forecast date on successful generation
          setLastForecastDate(localToday);
        }
      })
      .catch(error => {
        console.error("[SoloistPage] Error during forecast generation:", error);
        setForecastError(error.message || "An error occurred during forecast generation");
      })
      .finally(() => {
        setIsGeneratingForecast(false);
      });
  };

  // Loading guard for user
  if (userLoading || !userId) {
    return <LoadingState message="Loading user…" />;
  }

  // Wait for forecast data
  if (forecastData === undefined) {
    return <LoadingState message="Loading forecast data..." />;
  }

  // Handle empty data case - but don't block on authentication
  if (forecastData === null) {
    return <EmptyState
            title="Forecast Not Available"
            description="Error retrieving forecast data."
            onGenerate={handleGenerateForecast}
            isGenerating={isGeneratingForecast}
            error={forecastError} />;
  }

  if (Array.isArray(forecastData) && forecastData.length === 0) {
    return <EmptyState
            title="No Forecast Data Available"
            description="You need to generate a forecast."
            onGenerate={handleGenerateForecast}
            isGenerating={isGeneratingForecast}
            error={forecastError} />;
  }

  // --- Main Render - Redesigned single-viewport layout ---
  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-neutral-100 dark:bg-[#2b2b2b]">
      {/* Fixed viewport container - no page scroll */}
      <div className="flex-1 flex flex-col min-h-0 p-4 gap-3">
        
        {/* Header Section - compact */}
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
              <div>
                <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">7-Day Emotional Forecast</h1>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Predictions based on your past log patterns</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-5 text-[10px] rounded-none border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300">
                7 Days
              </Badge>
              <Badge variant="outline" className="h-5 text-[10px] rounded-none border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300">
                Avg: {averageScore}
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <Info className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-neutral-800 border-neutral-700 text-neutral-200 text-xs">
                    Forecasts are generated automatically when you log 4 consecutive days.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {/* Asymmetric section divider */}
          <div className="-ml-4 w-[calc(65%+1rem)] h-px bg-neutral-300 dark:bg-white/40 mt-2" />
        </div>

        {/* Error display if any */}
        {forecastError && (
          <div className="flex-shrink-0 p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs rounded-none">
            Error: {forecastError}
          </div>
        )}

        {/* Generate Forecast Row - compact */}
        <div className="flex-shrink-0 flex justify-between items-center">
          {needsLogs ? (
            <span className="text-xs text-neutral-400">Submit a log to start your forecast.</span>
          ) : <div />}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateForecast}
                    disabled={isGeneratingForecast || forecastGeneratedToday || !needsForecasts}
                    className="h-6 text-[10px] rounded-none border-neutral-400 dark:border-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  >
                    {isGeneratingForecast ? "Generating..." : "Generate Forecast"}
                  </Button>
                </div>
              </TooltipTrigger>
              {(isGeneratingForecast || forecastGeneratedToday || !needsForecasts) && (
                <TooltipContent className="bg-neutral-800 border-neutral-700 text-neutral-200 text-xs">
                  Forecast has already been generated
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* 7-Day Forecast Grid - compact */}
        <div className="flex-shrink-0 grid grid-cols-7 gap-1">
          {processedForecastData.map((day, idx) => {
            if (!day) return <div key={idx} className="bg-neutral-700/10 aspect-square" />;

            const score = day.emotionScore;
            const colorClass = getColorClass(score);
            const borderColorClass = getBorderColorClass(score);
            const textColorClass = getTextColorClass(score);
            const isFutureDay = day.isFuture;
            const needsGen = isFutureDay && (score === 0 || score === null || day.description === "Forecast Needed");
            const isSelected = selectedDayIndex === idx;

            return (
              <div
                key={day.date || idx}
                title={`${day.date}: ${score ?? 'N/A'}`}
                className={`
                  flex flex-col items-center justify-between p-1.5 border aspect-square cursor-pointer
                  ${colorClass} ${borderColorClass}
                  ${isSelected ? 'ring-2 ring-indigo-400 ring-offset-1 ring-offset-neutral-900' : ''}
                  ${day.isPast ? 'opacity-75 hover:opacity-100' : ''}
                  ${day.isToday ? 'relative ring-1 ring-inset ring-white/50' : ''}
                  ${needsGen ? 'border-dashed border-neutral-500 bg-neutral-700/30' : ''}
                  transition-all duration-100
                `}
                onClick={() => setSelectedDayIndex(idx)}
              >
                <div className="text-center">
                  <div className={`text-[10px] font-semibold ${needsGen ? 'text-neutral-400' : textColorClass}`}>
                    {day.shortDay}
                  </div>
                  <div className={`text-[8px] ${needsGen ? 'text-neutral-500' : textColorClass} opacity-75 hidden sm:block`}>
                    {day.formattedDate}
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  <span className={`text-xl font-bold ${needsGen ? 'text-neutral-400' : textColorClass}`}>
                    {score !== null ? (needsGen ? '?' : score) : '—'}
                  </span>
                  {score !== null && score > 0 && !needsGen && day.trend && <TrendIcon trend={day.trend} />}
                </div>
                {day.isToday && <div className="absolute top-0.5 right-0.5 h-1 w-1 rounded-full bg-white/80" />}
              </div>
            );
          })}
        </div>

        {/* Asymmetric divider after grid */}
        <div className="-ml-4 w-[calc(45%+1rem)] h-px bg-neutral-300 dark:bg-white/30" />

        {/* Middle Section: Details + Chart side by side */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3">

          {/* Selected Day Details - scrollable if needed */}
          <div className="min-h-0 flex flex-col">
            {/* Navigation */}
            <div className="flex-shrink-0 flex items-center justify-between mb-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={selectedDayIndex === 0}
                onClick={navigatePrevDay}
                className="h-6 px-2 text-xs text-neutral-600 dark:text-neutral-300 rounded-none hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                <ChevronLeft className="h-3 w-3 mr-0.5" /> Prev
              </Button>
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                {processedForecastData[selectedDayIndex]?.day} - {processedForecastData[selectedDayIndex]?.formattedDate}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                disabled={selectedDayIndex >= 6}
                onClick={navigateNextDay}
                className="h-6 px-2 text-xs text-neutral-600 dark:text-neutral-300 rounded-none hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                Next <ChevronRight className="h-3 w-3 ml-0.5" />
              </Button>
            </div>

            {/* Details content - scrollable */}
            <div className="flex-1 min-h-0 overflow-auto border border-neutral-300 dark:border-neutral-600 bg-white/50 dark:bg-neutral-800/30 p-3">
              {(() => {
                const selectedDay = processedForecastData[selectedDayIndex];
                if (!selectedDay) return null;

                const score = selectedDay.emotionScore;
                const isFutureDay = selectedDay.isFuture;
                const needsGen = isFutureDay && (score === 0 || score === null || selectedDay.description === "Forecast Needed");
                const needsLog = !isFutureDay && (score === null || score === 0);

                return (
                  <div className="flex gap-3">
                    {/* Score Box - compact */}
                    <div className={`
                      flex-shrink-0 w-16 h-16 flex flex-col items-center justify-center border
                      ${getColorClass(score)} ${getBorderColorClass(score)}
                      ${(needsGen || needsLog) ? 'border-dashed border-neutral-500' : ''}
                    `}>
                      <span className={`text-2xl font-bold ${(needsGen || needsLog) ? 'text-neutral-400' : getTextColorClass(score)}`}>
                        {score !== null && score > 0 ? score : needsGen ? '?' : '—'}
                      </span>
                      <div className="flex items-center">
                        {score !== null && score > 0 && !needsGen && !needsLog && selectedDay.trend && (
                          <TrendIcon trend={selectedDay.trend} />
                        )}
                      </div>
                    </div>
                    
                    {/* Text Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-50 mb-1 truncate">
                        {selectedDay.description || "No description"}
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2 line-clamp-2">
                        {selectedDay.details || (needsGen ? "Generate forecast for details." : needsLog ? "No log entry found." : "No details available.")}
                      </p>
                      {needsGen && (
                        <p className="text-[10px] text-blue-500 dark:text-blue-400">
                          Click &quot;Generate Forecast&quot; above to create predictions.
                        </p>
                      )}
                      {needsLog && (
                        <p className="text-[10px] text-emerald-500 dark:text-emerald-400">
                          {selectedDay.isToday ? 'Log your day to see your emotional score.' : 'Consider logging this day.'}
                        </p>
                      )}
                      {selectedDay.recommendation && selectedDay.recommendation !== "Check back later for recommendations" && (
                        <div className="mt-2 p-1.5 bg-neutral-100 dark:bg-neutral-700/50">
                          <div className="flex items-center gap-1 text-[10px] font-medium text-neutral-900 dark:text-neutral-50 mb-0.5">
                            <Sparkles className="h-3 w-3 text-blue-500" />
                            Recommendation
                          </div>
                          <p className="text-[10px] text-neutral-600 dark:text-neutral-400">
                            {selectedDay.recommendation}
                          </p>
                        </div>
                      )}
                      {isFutureDay && selectedDay.confidence != null && selectedDay.confidence > 0 && (
                        <div className="mt-1 text-[10px] text-neutral-500 flex items-center gap-1">
                          <Info className="h-2.5 w-2.5" />
                          Confidence: {selectedDay.confidence}%
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Weekly Pattern Chart - compact */}
          <div className="min-h-0 flex flex-col">
            <div className="flex-shrink-0 flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-50">Weekly Pattern</h3>
            </div>
            <div className="flex-1 min-h-0 border border-neutral-300 dark:border-neutral-600 bg-white/50 dark:bg-neutral-800/30 p-2">
              <WeeklyPatterns data={processedForecastData} />
            </div>
          </div>
        </div>

        {/* Asymmetric divider before insights */}
        <div className="flex-shrink-0 -ml-4 w-[calc(55%+1rem)] h-px bg-neutral-300 dark:bg-white/30" />

        {/* Key Insights - compact horizontal layout */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-50">Key Insights</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {mockInsights.map((insight, index) => (
              <div key={index} className="flex items-start gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-400 p-1.5 bg-white/30 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-700">
                <ArrowRight className="h-3 w-3 mt-0.5 text-blue-500 flex-shrink-0" />
                <span className="line-clamp-2">{insight}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}