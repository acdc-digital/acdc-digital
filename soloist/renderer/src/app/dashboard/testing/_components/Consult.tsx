// DAILY CONSULTATION COMPONENT
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/testing/_components/Consult.tsx

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Sparkles, RefreshCw, AlertCircle, Loader2, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { format, addDays } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { useTestingStore } from "../../../../store/Testingstore";

// Define a more specific type for the items in sevenDayData, aligning with ForecastDay from testing/page.tsx
interface SevenDayDataItem {
  date: string; // YYYY-MM-DD
  day: string; // Full day name e.g. "Monday"
  shortDay?: string;
  formattedDate?: string; // e.g., "May 4"
  emotionScore: number | null;
  isFuture: boolean;
  isPast?: boolean;
  isToday?: boolean;
  description?: string; // This might be AI generated description for forecast days
  details?: string;     // This might be AI generated details for forecast days
  answers?: any;      // Raw answers, typically for past/logged days
}
interface ConsultProps {
  userId: string;
  selectedDay: SevenDayDataItem; // Use the more specific type
  // selectedDateRange is still useful for initially fetching historical logs if needed,
  // but sevenDayData becomes the primary source for context display and AI input.
  selectedDateRange: {
    start: Date | null; 
    end: Date | null;   
  };
  sevenDayData: SevenDayDataItem[]; // The full 7-day data array
}

// Helper to format log answers into a string for context
const formatLogAnswersForContext = (answers: any): string => {
  if (!answers) return "No specific details logged.";
  if (typeof answers === 'string' && answers.trim()) return answers;
  
  if (typeof answers === 'object' && answers !== null) {
    let notes = [];
    
    // Try common field names that might contain user input
    const possibleFields = ['mood', 'notes', 'activities', 'workSatisfaction', 'personalSatisfaction', 'energy', 'sleep', 'reflection', 'summary'];
    
    for (const field of possibleFields) {
      const value = answers[field];
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value) && value.length > 0) {
          notes.push(`${field}: ${value.join(", ")}`);
        } else if (typeof value === 'string' && value.trim()) {
          notes.push(`${field}: ${value}`);
        } else if (typeof value === 'number') {
          notes.push(`${field}: ${value}/10`);
        }
      }
    }
    
    // If no standard fields, try to extract any meaningful content
    if (notes.length === 0) {
      const meaningfulEntries = Object.entries(answers)
        .filter(([key, value]) => 
          value !== null && 
          value !== undefined && 
          value !== '' &&
          !(Array.isArray(value) && value.length === 0)
        )
        .slice(0, 5); // Limit to first 5 meaningful entries
      
      notes = meaningfulEntries.map(([key, value]) => {
        if (Array.isArray(value)) return `${key}: ${value.join(", ")}`;
        return `${key}: ${value}`;
      });
    }
    
    return notes.length > 0 ? notes.join("; ") : "Basic log entry recorded.";
  }
  
  return "Basic log entry recorded.";
};

// Helper to check if a day has actual user logs (not just forecast data)
const dayHasUserLogs = (day: SevenDayDataItem): boolean => {
  // For future days, they don't have user logs
  if (day.isFuture) return false;
  
  // If there's a score, assume there are logs (even if minimal)
  if (day.emotionScore !== null && day.emotionScore !== undefined) return true;
  
  // Check if answers contains any meaningful data
  if (!day.answers) return false;
  
  if (typeof day.answers === 'string' && day.answers.trim().length > 0) return true;
  if (typeof day.answers === 'object' && day.answers !== null) {
    // Check for any populated fields that indicate user input
    const hasContent = day.answers.mood || 
                      day.answers.notes || 
                      (day.answers.activities && Array.isArray(day.answers.activities) && day.answers.activities.length > 0) ||
                      day.answers.workSatisfaction ||
                      day.answers.personalSatisfaction ||
                      day.answers.energy ||
                      day.answers.sleep ||
                      // More generic check for any property with meaningful content
                      Object.values(day.answers).some((value: any) => 
                        value !== null && value !== undefined && value !== '' && 
                        !(Array.isArray(value) && value.length === 0)
                      );
    return !!hasContent;
  }
  
  return false;
};

export default function Consult({ userId, selectedDay, selectedDateRange, sevenDayData }: ConsultProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDetail, setCurrentDetail] = useState<string | null>(null);

  // Fixed: Select state and actions individually from Zustand store
  const dailyDetailsCache = useTestingStore((state) => state.dailyDetailsCache);
  const setDailyDetail = useTestingStore((state) => state.setDailyDetail);

  // Format the date range for display in the UI using the full sevenDayData
  const formatDateRangeForUI = useCallback(() => {
    if (!sevenDayData || sevenDayData.length === 0) {
        if (selectedDateRange.start && selectedDateRange.end) {
            // Corrected: Use selectedDateRange.end directly
            const historicalEndDate = selectedDateRange.end; 
            const estimatedForecastEnd = addDays(historicalEndDate, 3);             
            return `${selectedDateRange.start.toLocaleDateString()} - ${estimatedForecastEnd.toLocaleDateString()}`;
        }
        return "Selected period";
    }
    const firstDay = sevenDayData[0];
    const lastDay = sevenDayData[sevenDayData.length - 1];
    const startDateStr = firstDay.formattedDate || new Date(`${firstDay.date}T12:00:00Z`).toLocaleDateString();
    const endDateStr = lastDay.formattedDate || new Date(`${lastDay.date}T12:00:00Z`).toLocaleDateString();
    
    return `${startDateStr} - ${endDateStr}`;
  }, [sevenDayData, selectedDateRange.start, selectedDateRange.end]);
  
  // The weeklyLogsData based on selectedDateRange is primarily for historical logs.
  // We will now combine this with forecast data from sevenDayData for the AI.
  const historicalLogsData = useQuery(
    api.dailyLogs.getLogsByDateRange,
    userId && selectedDateRange.start && selectedDateRange.end
      ? {
          userId,
          startDate: selectedDateRange.start.toISOString().split('T')[0],
          endDate: selectedDateRange.end.toISOString().split('T')[0],
        }
      : "skip"
  );

  // Prepare the full 7-day context for the AI action
  const sevenDayContextForAI = useMemo(() => {
    if (!sevenDayData || sevenDayData.length === 0) return [];
    return sevenDayData.map(day => ({
      date: day.date, // YYYY-MM-DD
      score: day.emotionScore ?? undefined,
      // For historical days, try to get notes from answers. 
      // For future (forecasted) days, use its existing description/details if available.
      notes: day.isFuture ? (day.description || day.details || "Forecasted day") : formatLogAnswersForContext(day.answers),
      isFuture: day.isFuture,
      // description: day.description, // We can pass more fields if the AI action is designed for them
    }));
  }, [sevenDayData]);
  
  const performAIConsultation = useAction(api.generator.generateDailyConsultation);

  const handleGenerateConsultation = useCallback(async (forceRegenerate = false) => {
    const dateKey = selectedDay?.date;
    if (!userId || !dateKey) {
      setError("User ID or selected day is missing. Cannot generate details.");
      setCurrentDetail(null); // Clear detail if no valid day
      return;
    }

    // Check if the selected day has user logs (for past days)
    if (!selectedDay.isFuture && !dayHasUserLogs(selectedDay)) {
      setError("No logs found for this day. Please log your daily activities first.");
      setCurrentDetail(null);
      setIsGenerating(false);
      return;
    }

    // 1. Check Cache First (unless forcing regeneration)
    if (!forceRegenerate && dailyDetailsCache[dateKey]) {
      console.log(`[Consult] Cache hit for ${dateKey}`);
      setCurrentDetail(dailyDetailsCache[dateKey]);
      setError(null); // Clear any previous error
      setIsGenerating(false); // Ensure loading state is off
      return;
    }

    // 2. If not in cache or forcing, proceed to generate
    console.log(`[Consult] Cache miss or forcing regeneration for ${dateKey}. Generating...`);
    setIsGenerating(true);
    setError(null);
    setCurrentDetail(null); // Clear previous detail while generating

    if (sevenDayContextForAI.length === 0) {
      console.warn("7-day context data is not available, details might be less specific.");
    }

    try {
      const selectedDayDataForAI = {
        date: selectedDay.date,
        dayName: selectedDay.day,
        emotionScore: selectedDay.emotionScore ?? undefined,
        notesForSelectedDay: selectedDay.isFuture ? (selectedDay.description || selectedDay.details) : formatLogAnswersForContext(selectedDay.answers),
        isFuture: selectedDay.isFuture
      };

      const result = await performAIConsultation({
        userId: userId,
        selectedDayData: selectedDayDataForAI,
        sevenDayContextData: sevenDayContextForAI,
      });

      if (result.success && result.consultationText) {
        const generatedText = result.consultationText;
        setCurrentDetail(generatedText); // Update local display state
        setDailyDetail(dateKey, generatedText); // Store in Zustand cache
      } else {
        // @ts-ignore
        setError(result.error || "Failed to generate details from AI action.");
        setCurrentDetail(null); // Clear detail on error
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while generating details.");
      setCurrentDetail(null); // Clear detail on error
      console.error("Error calling generateDailyConsultation action:", err);
    } finally {
      setIsGenerating(false);
    }
    // Don't add dailyDetailsCache to dependencies here, it causes loops
  }, [userId, selectedDay, sevenDayContextForAI, performAIConsultation, setDailyDetail]);

  // Effect to load from cache or generate when selected day changes
  useEffect(() => {
    const dateKey = selectedDay?.date;
    if (dateKey && userId) {
      // Check if this is a past day without logs
      if (!selectedDay.isFuture && !dayHasUserLogs(selectedDay)) {
        setError("No logs found for this day. Please log your daily activities first.");
        setCurrentDetail(null);
        setIsGenerating(false);
        return;
      }

      if (dailyDetailsCache[dateKey]) {
        // Load from cache immediately if available
        console.log(`[Consult useEffect] Loading from cache for ${dateKey}`);
        setCurrentDetail(dailyDetailsCache[dateKey]);
        setError(null);
        setIsGenerating(false); 
      } else {
        // Generate if not in cache
        console.log(`[Consult useEffect] Not in cache for ${dateKey}. Triggering generation.`);
        handleGenerateConsultation(); 
      }
    } else {
      // Clear details if no valid day selected
      setCurrentDetail(null);
      setError(null);
      setIsGenerating(false);
    }
    // Trigger only when the selected day *date* changes, or userId changes
    // handleGenerateConsultation is memoized and has its own dependencies
  }, [selectedDay?.date, userId, dailyDetailsCache, handleGenerateConsultation]); 

  // Render loading state
  if (isGenerating) {
    return (
      <Card className="p-4 min-h-[200px] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Generating Daily Details...
          </p>
          <Skeleton className="h-4 w-3/4 my-1" />
          <Skeleton className="h-4 w-1/2 my-1" />
          <Skeleton className="h-4 w-5/6 my-1" />
        </div>
      </Card>
    );
  }

  // Render error state
  if (error) {
    const isNoLogsError = error.includes("No logs found");
    
    return (
      <Card className="p-4 min-h-[200px]">
        <div className="flex flex-col items-center gap-2 text-center">
          {isNoLogsError ? (
            <CalendarX className="h-8 w-8 text-amber-500" />
          ) : (
            <AlertCircle className="h-8 w-8 text-rose-500" />
          )}
          <h3 className="text-base font-medium">
            {isNoLogsError ? "No Daily Log Found" : "Unable to Generate Details"}
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-3">{error}</p>
          {!isNoLogsError && (
            <Button onClick={() => handleGenerateConsultation(true)} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" /> Try Again
            </Button>
          )}
        </div>
      </Card>
    );
  }

  // Render empty state (if no valid day selected initially)
  if (!selectedDay?.date) {
     return (
      <Card className="p-4 min-h-[200px] flex flex-col items-center justify-center">
        <Sparkles className="h-8 w-8 text-blue-400 mb-2" />
        <p className="text-zinc-500 dark:text-zinc-400 text-sm text-center">
          Select a day to view its details.
        </p>
      </Card>
    );
  }
  
  // Render the actual detail (uses currentDetail state)
  if (currentDetail) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-base font-medium">Daily Details</h3>
          </div>
        </div>
        
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="my-2 leading-relaxed">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{children}</strong>,
              em: ({ children }) => <em className="italic text-zinc-700 dark:text-zinc-300">{children}</em>,
              ul: ({ children }) => <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>,
            }}
          >
            {currentDetail}
          </ReactMarkdown>
        </div>
        
        <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 dark:text-zinc-400">
          Details for: {selectedDay.day}, {selectedDay.date} <br/>
          Context based on data from: {formatDateRangeForUI()} 
        </div>
      </Card>
    );
  }
  
  // Fallback / Initial state before loading/generation/error for a valid selected day
  // This might show briefly before the useEffect triggers generation
  return (
    <Card className="p-4 min-h-[200px]">
      <div className="flex flex-col items-center gap-2 text-center">
        <Sparkles className="h-8 w-8 text-blue-400" />
        <h3 className="text-base font-medium">Daily Details</h3>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-3">
          Ready to generate insights for {selectedDay.day}.
        </p>
        <Button 
          onClick={() => handleGenerateConsultation()} 
          variant="outline" 
          size="sm" 
          disabled={!selectedDay?.date || !userId || isGenerating || (!selectedDay.isFuture && !dayHasUserLogs(selectedDay))}
        >
          {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Get Details
        </Button>
        {!selectedDay.isFuture && !dayHasUserLogs(selectedDay) && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            Please log your daily activities first
          </p>
        )}
      </div>
    </Card>
  );
}

