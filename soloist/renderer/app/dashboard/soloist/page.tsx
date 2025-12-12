// SOLOIST INSIGHTS PAGE
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/soloist/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useSoloistStore } from "@/store/soloistStore";
import { Header } from "./_components/Header";
import { PageSidebar } from "./_components/PageSidebar";
import { StatsPanel } from "./_components/StatsPanel";
import { WeekGrid } from "./_components/WeekGrid";
import { ForecastChart } from "./_components/ForecastChart";
import { ChartHeader } from "./_components/ChartHeader";
import { ChartFooter } from "./_components/ChartFooter";

export default function SoloistPage() {
  const { isInitialized, initialize } = useSoloistStore();

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

  // Initialize the store on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Content area with sidebar */}
      <div className="flex-1 flex min-h-0">
        {/* Page Sidebar - 25% width with all controls and insights */}
        <PageSidebar />

        {/* Week Grid - Vertical column of 7 days - no right border */}
        <div className="w-[5.5rem] lg:w-[6rem] h-full flex-shrink-0 min-h-0 bg-neutral-50 dark:bg-neutral-800/50 overflow-y-auto py-2 px-1.5">
          <WeekGrid />
        </div>

        {/* Main content area - remaining width */}
        <div className="flex-1 flex flex-col min-h-0">
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
