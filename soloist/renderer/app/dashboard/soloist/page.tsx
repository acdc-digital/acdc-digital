// SOLOIST INSIGHTS PAGE
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/soloist/page.tsx

"use client";

import React, { useEffect } from "react";
import { useSoloistStore } from "@/store/soloistStore";
import { Header } from "./_components/Header";
import { PageSidebar } from "./_components/PageSidebar";
import { StatsPanel } from "./_components/StatsPanel";
import { ForecastChart } from "./_components/ForecastChart";

export default function SoloistPage() {
  const { isInitialized, initialize } = useSoloistStore();

  // Initialize the store on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      {/* <div className="flex-shrink-0 p-4 pb-0">
        <Header />
      </div> */}

      {/* Content area with sidebar */}
      <div className="flex-1 flex">
        {/* Page Sidebar - 20% width */}
        <PageSidebar />

        {/* Stats Panel - 20% width, next to sidebar */}
        <StatsPanel />

        {/* Main content area - remaining width */}
        <main className="flex-1 overflow-auto p-4">
          <ForecastChart />
        </main>
      </div>
    </div>
  );
}
