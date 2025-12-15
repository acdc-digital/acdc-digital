// SOLOIST INSIGHTS PAGE
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/soloist/page.tsx

"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useConvexUser } from "@/hooks/useConvexUser";
import { useSoloistStore, type DayData } from "@/store/soloistStore";
import { format, addDays } from "date-fns";
import { Header } from "./_components/Header";
import { PageSidebar } from "./_components/PageSidebar";
import { StatsPanel } from "./_components/StatsPanel";
import { WeekGrid } from "./_components/WeekGrid";
import { ForecastChart } from "./_components/ForecastChart";
import { ChartHeader } from "./_components/ChartHeader";
import { ChartFooter } from "./_components/ChartFooter";

export default function SoloistPage() {
  const { isInitialized, initialize, selectedDateRange, setWeekData } = useSoloistStore();
  const { userId, isAuthenticated } = useConvexUser();
  
  // Get the selected end date as the "today" reference for the query
  // This allows the user to view historical date ranges
  const selectedEndDate = selectedDateRange.end 
    ? format(selectedDateRange.end, 'yyyy-MM-dd') 
    : format(new Date(), 'yyyy-MM-dd');
  
  // Fetch 7-day forecast data (4 historical + 3 forecast) based on selected date range
  const forecastData = useQuery(
    api.renderer.soloist.forecast.getSevenDayForecast,
    userId && isAuthenticated && selectedDateRange.end
      ? {
          userId: userId as Id<"users">,
          today: selectedEndDate, // Use selected end date as the reference point
        }
      : "skip"
  );
  
  // Forecast generation action
  const generateForecast = useAction(api.renderer.soloist.forecast.generateForecast);
  const [forecastError, setForecastError] = useState<string | null>(null);

  // Chart control state (lifted to page level)
  const [showActual, setShowActual] = useState(true);
  const [showForecast, setShowForecast] = useState(true);
  const [showHistorical, setShowHistorical] = useState(true);
  const [showArea, setShowArea] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showAverage, setShowAverage] = useState(false);

  // Reset all controls
  const handleReset = () => {
    setShowActual(true);
    setShowForecast(true);
    setShowHistorical(true);
    setShowArea(false);
    setShowGrid(true);
    setShowAverage(false);
  };

  // Handle forecast generation
  const handleGenerateForecast = useCallback(async () => {
    if (!userId || !isAuthenticated) {
      console.error("[SoloistPage] User not authenticated");
      setForecastError("Please sign in to generate forecasts");
      return;
    }

    if (!selectedDateRange.start || !selectedDateRange.end) {
      console.error("[SoloistPage] No date range selected");
      setForecastError("Please select a date range");
      return;
    }

    setForecastError(null);

    try {
      const startDateStr = format(selectedDateRange.start, 'yyyy-MM-dd');
      const endDateStr = format(selectedDateRange.end, 'yyyy-MM-dd');
      
      console.log(`[SoloistPage] Generating forecast for range: ${startDateStr} to ${endDateStr}`);
      
      const result = await generateForecast({
        userId: userId as Id<"users">,
        startDate: startDateStr,
        endDate: endDateStr,
      });

      if (!result.success) {
        console.error("[SoloistPage] Forecast generation failed:", result.error);
        setForecastError(result.error || "Failed to generate forecast");
      } else {
        console.log("[SoloistPage] Forecast generated successfully for dates:", result.forecastDates);
      }
    } catch (error) {
      console.error("[SoloistPage] Error generating forecast:", error);
      setForecastError(error instanceof Error ? error.message : "Failed to generate forecast");
    }
  }, [userId, isAuthenticated, selectedDateRange, generateForecast]);

  // Initialize the store on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Update weekData when forecastData is fetched
  useEffect(() => {
    if (forecastData && Array.isArray(forecastData) && forecastData.length > 0) {
      console.log("[SoloistPage] Updating weekData with forecast data:", forecastData.length, "days");
      
      // Transform the Convex data to match the DayData interface
      const weekData: DayData[] = forecastData.map((day: any) => ({
        date: day.date,
        day: day.day || "",
        shortDay: day.shortDay || "",
        formattedDate: day.formattedDate || "",
        emotionScore: day.emotionScore,
        actualLogScore: day.actualLogScore ?? null,
        isFuture: day.isFuture || false,
        isPast: day.isPast || false,
        isToday: day.isToday || false,
        trend: day.trend || null,
        description: day.description || "",
        details: day.details || "",
        answers: day.answers,
        historicalForecastScore: day.historicalForecastScore ?? null,
      }));
      
      setWeekData(weekData);
    }
  }, [forecastData, setWeekData]);

  return (
    <div className="h-full flex flex-col min-h-0 bg-[#2b2b2b]">
      {/* Content area with sidebar */}
      <div className="flex-1 flex min-h-0">
        {/* Page Sidebar - 25% width with all controls and insights */}
        <PageSidebar 
          onGenerateForecast={handleGenerateForecast} 
          error={forecastError}
          onDismissError={() => setForecastError(null)}
        />

        {/* Week Grid - Vertical column of 7 days - fixed width */}
        <div className="w-[104px] max-w-[104px] h-full flex-shrink-0 min-h-0 bg-[#2b2b2b] overflow-y-auto py-2 px-3">
          <WeekGrid />
        </div>

        {/* Main content area - remaining width */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#2b2b2b]">
          {/* Chart Header - No borders */}
          <ChartHeader
            showActual={showActual}
            showForecast={showForecast}
            showHistorical={showHistorical}
            showArea={showArea}
            showGrid={showGrid}
            showAverage={showAverage}
            averageScore={0}
            onToggleActual={() => setShowActual(!showActual)}
            onToggleForecast={() => setShowForecast(!showForecast)}
            onToggleHistorical={() => setShowHistorical(!showHistorical)}
            onToggleArea={() => setShowArea(!showArea)}
            onToggleGrid={() => setShowGrid(!showGrid)}
            onToggleAverage={() => setShowAverage(!showAverage)}
            onReset={handleReset}
          />

          {/* Chart in rounded container */}
          <main className="flex-1 min-h-0 px-4">
            <ForecastChart
              showActual={showActual}
              showForecast={showForecast}
              showHistorical={showHistorical}
              showArea={showArea}
              showGrid={showGrid}
              showAverage={showAverage}
            />
          </main>

          {/* Chart Footer - No borders */}
          <ChartFooter />
        </div>
      </div>
    </div>
  );
}
