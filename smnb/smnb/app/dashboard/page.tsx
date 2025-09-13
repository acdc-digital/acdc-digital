// DASHBOARD PAGE
// /Users/matthewsimon/Projects/SMNB/smnb/app/dashboard/page.tsx

'use client';

import React from "react";
import FeedSidebar from "./feed/FeedSidebar";
import Studio from "./studio/Studio";
import { useDashboard } from "./DashboardContext";
import StatsPage from "../stats/page";

export default function DashboardPage() {
  const { activePanel } = useDashboard();

  console.log('📊 Dashboard Page: Current active panel is', activePanel);

  return (
    <>
      {/* Always render FeedSidebar and Studio to keep services running */}
      {/* Hide them when stats is active, but keep them mounted */}
      <div 
        className={`flex flex-1 overflow-hidden ${
          activePanel === "stats" ? "absolute -z-10 opacity-0 pointer-events-none" : ""
        }`}
      >
        {/* Feed Sidebar */}
        <FeedSidebar />
        
        {/* Studio */}
        <Studio />
      </div>

      {/* Stats panel when stats is active */}
      {activePanel === "stats" && (
        <div className="flex flex-1 overflow-hidden">
          <StatsPage />
        </div>
      )}
    </>
  );
}
