// TESTING ENVIRONMENT FOR FORECAST FUNCTIONALITY - REDESIGNED
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/testing/page.tsx

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Info, ChevronLeft, ChevronRight, ArrowRight, TrendingUp, TrendingDown, Sparkles, Loader2, ThumbsUp, ThumbsDown, Calendar, BarChart3, FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/hooks/useConvexUser";
import WeeklyPatterns from "./_components/WeeklyPatterns";
import Navigation from "./_components/Navigation";
import Consult from "./_components/Consult";
import Insights from "./_components/Insights";
import { getColorClass } from "@/lib/scoreColors";
import { useTestingStore } from "../../../store/Testingstore";
import { format, addDays } from 'date-fns';

// Types for forecast data
interface ForecastDay {
  date: string;
  day: string;  // Make required to match WeeklyPatterns component
  shortDay?: string;
  formattedDate?: string;
  emotionScore: number | null;
  isFuture: boolean;
  isPast?: boolean;
  isToday?: boolean;
  description?: string;
  details?: string;
  recommendation?: string;
  trend?: string | null;
  confidence?: number;
}

// Define the expected return type from the getTestSevenDayForecast query
interface SevenDayForecastResult {
  sevenDayData: ForecastDay[]; // Using existing ForecastDay interface
  historicalForecasts: { date: string; emotionScore: number | null }[];
}

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
            Testing...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-3 w-3" />
            Run Test
          </>
        )}
      </Button>
    )}
    {error && (
      <div className="mt-3 p-2 w-full max-w-md bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs">
        Test Error: {error}
      </div>
    )}
  </div>
);

// Helper functions - using standardized color scale
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

// Helper to get the key for a date range
function getRangeKey(start: Date | null, end: Date | null) {
  if (!start || !end) return "";
  return `${formatDateString(start)}_to_${formatDateString(end)}`;
}

// Helper to format date as YYYY-MM-DD
function formatDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

// Helper to parse ISO date string with timezone consistency
function parseISODate(dateString: string): Date {
  // Force noon UTC to avoid timezone shifting problems
  return new Date(`${dateString}T12:00:00Z`);
}

// Helper to get day name (Monday, Tuesday, etc.)
function getDayName(date: Date): string {
  return format(date, 'EEEE');
}

// Helper to get short day name (Mon, Tue, etc.)
function getShortDayName(date: Date): string {
  return format(date, 'EEE');
}

// Helper to get formatted date (Apr 10)
function getFormattedMonthDay(date: Date): string {
  return format(date, 'MMM d');
}

export default function TestingPage() {
  const { isAuthenticated, isLoading: userLoading, userId } = useConvexUser();
  
  console.log("Testing Page - User ID:", userId, "Loading:", userLoading, "Authenticated:", isAuthenticated);

  const [selectedDayIndex, setSelectedDayIndex] = useState(3);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<{ [date: string]: "up" | "down" | undefined }>({});
  
  // Use the testing store
  const { 
    selectedDateRange, 
    setSelectedDateRange,
    isGeneratingForecast, 
    setIsGeneratingForecast,
    setForecastGenerated 
  } = useTestingStore();

  // Set default date range to current week (last 4 days including today) on first load
  useEffect(() => {
    // Only set default if not already set
    if (!selectedDateRange.start || !selectedDateRange.end) {
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - 3);
      setSelectedDateRange({ start, end: today });
    }
  }, [setSelectedDateRange]);

  // When the date range changes, update forecastGenerated flag
  useEffect(() => {
    const key = getRangeKey(selectedDateRange.start, selectedDateRange.end);
    if (key) {
      const map = JSON.parse(localStorage.getItem('forecastGeneratedMap') || '{}');
      setForecastGenerated(!!map[key]);
    } else {
      setForecastGenerated(false);
    }
    
    // Clear any previous errors when date range changes
    setForecastError(null);
  }, [selectedDateRange.start, selectedDateRange.end, setForecastGenerated]);

  // Debug logs
  console.log("userId", userId);
  console.log("selectedDateRange", selectedDateRange);

  // Fetch the main 7-day data (includes historical logs + future forecasts)
  const sevenDayResult = useQuery(
    api.testing.getTestSevenDayForecast,
    userId && selectedDateRange.start && selectedDateRange.end
      ? {
          userId: userId as string,
          startDate: formatDateString(selectedDateRange.start),
          endDate: formatDateString(selectedDateRange.end),
        }
      : "skip"
  ) as SevenDayForecastResult | null | undefined;

  // Use the results for display data and historical forecasts
  const formattedDisplayData = useMemo(() => sevenDayResult?.sevenDayData || [], [sevenDayResult]);
  const historicalForecasts = useMemo(() => sevenDayResult?.historicalForecasts || [], [sevenDayResult]);

  // Log query params and raw API response for debugging
  useEffect(() => {
    if (userId && selectedDateRange.start && selectedDateRange.end) {
      console.log("Query params:", {
        userId,
        startDate: formatDateString(selectedDateRange.start),
        endDate: formatDateString(selectedDateRange.end),
        startDateObj: selectedDateRange.start,
        endDateObj: selectedDateRange.end,
      });
    }
    
    if (sevenDayResult) {
      console.log("RAW testingApi.testing.getTestSevenDayForecast RESULT:", JSON.stringify(sevenDayResult, null, 2));
    }
     if (historicalForecasts.length > 0) {
      console.log("Parsed Historical Forecasts for chart:", historicalForecasts);
    }
  }, [sevenDayResult, userId, selectedDateRange, historicalForecasts]);

  // Fetch raw historical logs (might be redundant if already in sevenDayResult, but kept for now)
  const historicalLogs = useQuery(
    api.dailyLogs.getLogsByDateRange,
    userId && selectedDateRange.start && selectedDateRange.end
      ? {
          userId,
          startDate: formatDateString(selectedDateRange.start),
          endDate: formatDateString(selectedDateRange.end),
        }
      : "skip"
  ) as { date: string; emotionScore: number; description?: string; details?: string }[] | undefined;

  // Simplified display data variable
  const displayData = formattedDisplayData;

  // Generate test forecast mutation
  const generateForecast = useAction(api.forecast.generateForecast);

  const handleGenerateForecast = async () => {
    if (!userId || !selectedDateRange.start || !selectedDateRange.end) {
      setForecastError("Please select a valid date range and ensure you're logged in");
      return;
    }

    setIsGeneratingForecast(true);
    setForecastError(null);
    // Clear stale synthetic data / cache
    const key = getRangeKey(selectedDateRange.start, selectedDateRange.end);
    const map = JSON.parse(localStorage.getItem('forecastGeneratedMap') || '{}');
    delete map[key];
    localStorage.setItem('forecastGeneratedMap', JSON.stringify(map));
    localStorage.removeItem(`forecast_attempt_${key}`);

    // Format dates for API
    const startDateStr = formatDateString(selectedDateRange.start);
    const endDateStr = formatDateString(selectedDateRange.end);
    
    try {
      // Generate forecast with standard parameters
      console.log(`Generating forecast for range: ${startDateStr} to ${endDateStr}`);
      
      // First, attempt to force refresh by clearing localStorage cache for this range
      // (Already cleared above)
      
      // If we've tried before and got a missing logs error, we'll generate mock data
      let attemptCount = parseInt(localStorage.getItem(`forecast_attempt_${key}`) || '0');
      attemptCount++;
      localStorage.setItem(`forecast_attempt_${key}`, attemptCount.toString());
      
      // First try normal generation
      const result = await generateForecast({
        userId: userId as string,
        startDate: startDateStr,
        endDate: endDateStr,
      });
      
      if (!result.success) {
        console.error("Forecast generation failed:", result.error);
        
        // If we have missing logs error and tried multiple times, let's create synthetic data
        if (result.error && result.error.includes("Missing logs") && attemptCount >= 2) {
          console.log("Creating synthetic forecast data after multiple attempts");
          
          // Create complete synthetic forecast data
          const today = new Date(selectedDateRange.start);
          const syntheticData = [];
          
          // Generate 7 days of data starting from selected start date
          for (let i = 0; i < 7; i++) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);
            const isFuture = i >= 4;
            
            syntheticData.push({
              date: formatDateString(currentDate),
              day: getDayName(currentDate),
              shortDay: getShortDayName(currentDate),
              formattedDate: getFormattedMonthDay(currentDate),
              emotionScore: isFuture ? 50 : null,
              isFuture: isFuture,
              isPast: !isFuture,
              isToday: i === 0,
              description: isFuture ? "Forecasted Day" : "Historical Data",
              details: isFuture ? 
                "Test forecast with synthetic data" : 
                "Historical emotion data (synthetic)",
              trend: Math.random() > 0.5 ? "up" : "down",
              confidence: isFuture ? 75 : undefined
            });
          }
          
          // Use the synthetic data instead of API data
          console.log("Using synthetic data:", syntheticData);
          
          // Update state and local storage
          setForecastGenerated(true);
          const localStorageMap = JSON.parse(localStorage.getItem('forecastGeneratedMap') || '{}');
          localStorage.setItem('forecastGeneratedMap', JSON.stringify({...localStorageMap, [key]: true}));
          
          // Set a special flag for synthetic data
          localStorage.setItem(`synthetic_data_${key}`, JSON.stringify(syntheticData));
          
          setForecastError(null);
          setIsGeneratingForecast(false);
          return;
        }
        
        setForecastError(result.error || "Failed to generate forecast");
        
        // If the error mentions missing logs, let's update the error message
        if (result.error && result.error.includes("Missing logs")) {
          setForecastError(
            "A log may not be available within the selected date range. Please add logs for the missing days."
          );
        }
      } else {
        console.log("Forecast generated successfully");
        setForecastGenerated(true);
        // Persist this range as generated
        const key = getRangeKey(selectedDateRange.start, selectedDateRange.end);
        const map = JSON.parse(localStorage.getItem('forecastGeneratedMap') || '{}');
        map[key] = true;
        localStorage.setItem('forecastGeneratedMap', JSON.stringify(map));
      }
    } catch (error) {
      console.error("Error generating forecast:", error);
      setForecastError(error instanceof Error ? error.message : "Failed to generate forecast");
    } finally {
      setIsGeneratingForecast(false);
    }
  };

  // Calculate average score safely
  const averageScore = useMemo(() => {
    if (!displayData || !Array.isArray(displayData)) return null;
    const scores = displayData
      .filter((day) => day.emotionScore !== null)
      .map((day) => day.emotionScore as number);
    return scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;
  }, [displayData]);

  // Effect to set default selected day
  useEffect(() => {
    if (Array.isArray(displayData) && displayData.length > 0) {
      const todayIndex = displayData.findIndex(day => day.isToday);
      const defaultIndex = todayIndex !== -1 ? todayIndex : Math.min(3, displayData.length - 1);
      setSelectedDayIndex(defaultIndex);
    }
    // Only run when forecastData changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayData]);

  // Navigation handlers
  const navigatePrevDay = () => setSelectedDayIndex(prev => Math.max(0, prev - 1));
  const navigateNextDay = () => {
    const maxIndex = Array.isArray(displayData) ? displayData.length - 1 : 0;
    setSelectedDayIndex(prev => Math.min(maxIndex, prev + 1));
  };

  // Fetch feedback for the forecast dates
  const feedbackMap = useQuery(
    api.forecast.getForecastFeedback,
    userId && displayData && Array.isArray(displayData)
      ? {
          userId: userId!, // non-null assertion since we guard for userId elsewhere
          forecastDates: displayData
            .filter((day) => day.isFuture)
            .map((day) => day.date),
        }
      : "skip"
  );

  // Update feedback state when feedback map changes
  useEffect(() => {
    if (feedbackMap) {
      setFeedbackState(feedbackMap);
    }
  }, [feedbackMap]);

  // Submit feedback handler
  const submitFeedback = useMutation(api.forecast.submitForecastFeedback);
  const handleFeedback = (date: string, feedback: "up" | "down") => {
    if (!userId) {
      setForecastError("Please ensure you're logged in to submit feedback");
      return;
    }
    submitFeedback({ userId: userId!, forecastDate: date, feedback });
    setFeedbackState((prev) => ({ ...prev, [date]: feedback }));
  };

  // Check if we need forecasts (only if data is an array)
  const needsForecasts = Array.isArray(displayData) && displayData.some(day => 
    day.isFuture &&
    (day.emotionScore === 0 || 
     day.emotionScore === null || 
     day.emotionScore === undefined ||
     day.description === "Forecast Needed" ||
     day.description === "Forecast needed" ||
     !day.description)
  );

  // Loading guard for user
  if (userLoading || !userId) {
    return <LoadingState message="Loading user…" />;
  }

  // CORRECTED: Wait for the main query result
  if (sevenDayResult === undefined) {
    return <LoadingState message="Loading forecast data..." />;
  }

  // CORRECTED: Handle error case where the query returned null
  if (sevenDayResult === null) {
    return <EmptyState
            title="Test Forecast Not Available"
            description="Error retrieving test forecast data."
            onGenerate={() => handleGenerateForecast()} // Keep using handleGenerateForecast for the button
            isGenerating={isGeneratingForecast}
            error={forecastError || "Query returned null"} /> // Show specific error if available
  }

  // CORRECTED: Handle empty data case using the parsed array
  if (Array.isArray(formattedDisplayData) && formattedDisplayData.length === 0) {
    return <EmptyState
            title="No Test Forecast Data Available"
            description="You need to generate a test forecast or ensure logs exist for the selected period."
            onGenerate={() => handleGenerateForecast()}
            isGenerating={isGeneratingForecast}
            error={forecastError} />;
  }

  // --- Main Render - Compact data playground layout ---
  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-neutral-100 dark:bg-[#2b2b2b]">
      <div className="flex-1 overflow-auto">
        <div className="w-full p-3 flex flex-col gap-2">

          {/* Top Row: Navigation (constrained) + Header + Badges */}
          <div className="grid grid-cols-12 gap-3">
            {/* Navigation Component - constrained to left side */}
            <div className="col-span-12 lg:col-span-7">
              <Navigation onGenerateForecast={handleGenerateForecast} />
            </div>
            
            {/* Header + Badges - right side on large screens */}
            <div className="col-span-12 lg:col-span-5 flex flex-col justify-center">
              <div className="flex items-center justify-between lg:justify-end gap-3">
                <div className="flex items-center gap-2 lg:hidden">
                  <FlaskConical className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                  <h1 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">7-Day Test Forecast</h1>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge className="h-5 text-[10px] rounded-none border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 bg-transparent">
                    Test Mode
                  </Badge>
                  <Badge className="h-5 text-[10px] rounded-none border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 bg-transparent">
                    Avg: {averageScore !== null ? averageScore.toFixed(1) : "N/A"}
                  </Badge>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          <Info className="h-3 w-3 text-neutral-500 dark:text-neutral-400" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-neutral-800 border-neutral-700 text-neutral-200 text-xs">
                        Testing environment for forecast functionality
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>

          {/* Error display - compact */}
          {forecastError && (
            <div className="p-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-[11px]">
              {forecastError === "Not enough data for forecast"
                ? "You need daily logs for all 4 days in the selected range."
                : forecastError.includes("Missing logs")
                ? (
                    <div className="flex items-center gap-2">
                      <span>{forecastError}</span>
                      <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                        size="sm"
                        className="h-4 text-[9px] px-1.5 rounded-none"
                      >
                        Refresh
                      </Button>
                    </div>
                  )
                : `Error: ${forecastError}`}
            </div>
          )}

          {/* Main Content Grid - 7-day grid + chart side by side */}
          <div className="grid grid-cols-12 gap-2">
            
            {/* Left Column: 7-Day Grid + Feedback */}
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-1">
              {/* 7-Day Forecast Grid - compact */}
              <div className="grid grid-cols-7 gap-0.5">
                {[...Array(7)].map((_, idx: number) => {
                  const day: ForecastDay | undefined = formattedDisplayData[idx];
                  if (!day) {
                    return (
                      <div key={idx} className="flex flex-col items-center justify-between p-1 border aspect-square bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 opacity-60">
                        <div className="text-[9px] font-medium text-neutral-400">—</div>
                        <span className="text-lg font-bold text-neutral-400">?</span>
                      </div>
                    );
                  }
                  const score = day.emotionScore;
                  const colorClass = getColorClass(score);
                  const borderColorClass = getBorderColorClass(score);
                  const textColorClass = getTextColorClass(score);
                  const isFutureDay = day.isFuture;
                  const needsGen = isFutureDay && ((score === null || score === 0 || score === undefined) || (day.description === "Forecast Needed" || day.description === "Forecast needed"));
                  const isSelected = selectedDayIndex === idx;

                  return (
                    <div
                      key={day.date || idx}
                      title={`${day.date}: ${score ?? 'N/A'}`}
                      className={`
                        flex flex-col items-center justify-between p-1 border aspect-square cursor-pointer
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
                        <div className={`text-[9px] font-semibold ${needsGen ? 'text-neutral-400' : textColorClass}`}>
                          {day.shortDay || format(parseISODate(day.date), 'EEE')}
                        </div>
                        <div className={`text-[7px] ${needsGen ? 'text-neutral-500' : textColorClass} opacity-75 hidden sm:block`}>
                          {day.formattedDate || format(parseISODate(day.date), 'MMM d')}
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <span className={`text-lg font-bold ${needsGen ? 'text-neutral-400' : textColorClass}`}>
                          {score !== null && score !== undefined && score > 0 ? score : (needsGen ? '?' : '—')}
                        </span>
                        {score !== null && score > 0 && !needsGen && day.trend && <TrendIcon trend={day.trend} />}
                      </div>
                      {day.isToday && <div className="absolute top-0.5 right-0.5 h-1 w-1 rounded-full bg-white/80" />}
                    </div>
                  );
                })}
              </div>

              {/* Feedback Row - compact */}
              {formattedDisplayData.length >= 7 && (
                <div className="grid grid-cols-7 gap-0.5">
                  {formattedDisplayData.map((day, idx) => {
                    const isFutureDay = day.isFuture;
                    const feedback = feedbackState[day.date];
                    return (
                      <div key={day.date || idx} className="flex justify-center items-center h-5">
                        {isFutureDay && (
                          <div className="flex gap-0.5">
                            <button
                              className="p-0.5"
                              onClick={() => handleFeedback(day.date, "up")}
                              aria-label="Forecast was correct"
                              type="button"
                            >
                              <ThumbsUp className={`h-3 w-3 transition-colors ${feedback === "up" ? "text-green-500" : "text-neutral-400 hover:text-neutral-500"}`} />
                            </button>
                            <button
                              className="p-0.5"
                              onClick={() => handleFeedback(day.date, "down")}
                              aria-label="Forecast was incorrect"
                              type="button"
                            >
                              <ThumbsDown className={`h-3 w-3 transition-colors ${feedback === "down" ? "text-rose-500" : "text-neutral-400 hover:text-neutral-500"}`} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Weekly Pattern Chart */}
            <div className="col-span-12 lg:col-span-7 flex flex-col">
              <div className="flex items-center gap-1.5 mb-1">
                <BarChart3 className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                <h3 className="text-xs font-medium text-neutral-900 dark:text-neutral-50">Weekly Pattern</h3>
              </div>
              <div className="flex-1 border border-neutral-300 dark:border-neutral-600 bg-white/50 dark:bg-neutral-800/30 p-1.5 min-h-[140px]">
                {Array.isArray(formattedDisplayData) && formattedDisplayData.length > 0 ? (
                  <WeeklyPatterns data={formattedDisplayData} historicalForecastData={historicalForecasts} />
                ) : (
                  <div className="text-center text-neutral-500 text-xs py-8">No data available</div>
                )}
              </div>
            </div>
          </div>

          {/* Thin divider */}
          <div className="-ml-3 w-[calc(50%+0.75rem)] h-px bg-neutral-300 dark:bg-white/30" />

          {/* Bottom Row: Details + Insights side by side */}
          {selectedDayIndex >= 0 && selectedDayIndex < formattedDisplayData.length && formattedDisplayData[selectedDayIndex] && (
            <div className="grid grid-cols-12 gap-2">
              
              {/* Selected Day Details */}
              <div className="col-span-12 lg:col-span-6 flex flex-col">
                {/* Navigation */}
                <div className="flex items-center justify-between mb-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={selectedDayIndex === 0}
                    onClick={navigatePrevDay}
                    className="h-5 px-1.5 text-[10px] text-neutral-600 dark:text-neutral-300 rounded-none hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  >
                    <ChevronLeft className="h-3 w-3" /> Prev
                  </Button>
                  <h3 className="text-xs font-medium text-neutral-900 dark:text-neutral-50">
                    {formattedDisplayData[selectedDayIndex]?.day || getDayName(parseISODate(formattedDisplayData[selectedDayIndex]?.date || ''))} - {formattedDisplayData[selectedDayIndex]?.formattedDate || getFormattedMonthDay(parseISODate(formattedDisplayData[selectedDayIndex]?.date || ''))}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={selectedDayIndex >= formattedDisplayData.length - 1}
                    onClick={navigateNextDay}
                    className="h-5 px-1.5 text-[10px] text-neutral-600 dark:text-neutral-300 rounded-none hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  >
                    Next <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>

                {/* Details content */}
                {(() => {
                  const selectedDay = formattedDisplayData[selectedDayIndex];
                  if (!selectedDay) return null;

                  const score = selectedDay.emotionScore;
                  const isFutureDay = selectedDay.isFuture;
                  const needsGen = isFutureDay && (score === 0 || score === null || selectedDay.description === "Forecast Needed");

                  return (
                    <div className="flex gap-2 p-2 border border-neutral-300 dark:border-neutral-600 bg-white/50 dark:bg-neutral-800/30">
                      {/* Score Box - compact */}
                      <div className={`
                        flex-shrink-0 w-12 h-12 flex flex-col items-center justify-center border
                        ${getColorClass(score)} ${getBorderColorClass(score)}
                        ${needsGen ? 'border-dashed border-neutral-500' : ''}
                      `}>
                        <span className={`text-lg font-bold ${needsGen ? 'text-neutral-400' : getTextColorClass(score)}`}>
                          {score !== null ? (needsGen ? '?' : score) : '—'}
                        </span>
                        {score !== null && score > 0 && !needsGen && selectedDay.trend && (
                          <TrendIcon trend={selectedDay.trend} />
                        )}
                      </div>

                      {/* Consult Component */}
                      <div className="flex-1 min-w-0 text-[11px]">
                        {userId && selectedDay && selectedDateRange.start && selectedDateRange.end ? (
                          <Consult
                            userId={userId}
                            selectedDay={selectedDay}
                            selectedDateRange={selectedDateRange}
                            sevenDayData={formattedDisplayData}
                          />
                        ) : (
                          <div className="text-xs text-neutral-500">Select a day to see details.</div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Key Insights Section - compact, side by side */}
              <div className="col-span-12 lg:col-span-6 flex flex-col">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                  <h3 className="text-xs font-medium text-neutral-900 dark:text-neutral-50">Key Insights</h3>
                </div>
                <div className="flex-1 border border-neutral-300 dark:border-neutral-600 bg-white/50 dark:bg-neutral-800/30 p-2">
                  {userId && Array.isArray(formattedDisplayData) && formattedDisplayData.length > 0 && selectedDateRange.start && selectedDateRange.end ? (
                    <Insights
                      userId={userId}
                      sevenDayData={formattedDisplayData}
                      selectedDateRange={selectedDateRange}
                    />
                  ) : (
                    <div className="space-y-1">
                      {mockInsights.slice(0, 3).map((insight, index) => (
                        <div key={index} className="flex items-start gap-1 text-[10px] text-neutral-600 dark:text-neutral-400">
                          <ArrowRight className="h-2.5 w-2.5 mt-0.5 text-blue-500 flex-shrink-0" />
                          <span className="line-clamp-2">{insight}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}