// DASHBOARD LAYOUT
// /Users/matthewsimon/Projects/SMNB/smnb/app/dashboard/layout.tsx

'use client';

import React from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { TokenCounter } from "@/components/ui/TokenCounter";
import { RuntimeCounter } from "@/components/ui/RuntimeCounter";
import { ApiKeyInput } from "@/components/ui/ApiKeyInput";
import ActivityBar from "./activityBar/ActivityBar";
import { Fingerprint } from "lucide-react";
import { DashboardProvider, useDashboard } from "./DashboardContext";
import FeedSidebar from "./feed/FeedSidebar";
import Studio from "./studio/Studio";
import StatsPage from "./stats/Stats";
import Heatmap from "./studio/heatmap/Heatmap";
import Generator from "./studio/generator/Generator";
import Wiki from "./studio/wiki/Wiki";
import { Sessions } from "./studio/sessions/Sessions";
import Settings from "./studio/settings/Settings";
import Users from "./studio/user/Users";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardContent({}: DashboardLayoutProps) {
  const { activePanel, setActivePanel } = useDashboard();

  return (
    <div className="flex flex-col h-screen font-sf text-xs overflow-hidden">
      {/* Top thin border / bar */}
      <div className="w-full h-12 flex items-center gap-3 px-3 text-foreground/60 border-b border-black/10 dark:border-white/10 bg-[#181818]">
        <Fingerprint className="h-5.25 w-5.25 text-[#858585] border-1 border-[#858585] rounded-xs p-0.5" />
        <span className="text-[#858585] font-light text-base font-sans">SMNB Terminal</span>
        <div className="w-2 h-2 rounded-full bg-green-600"></div>
        
        <div className="ml-auto flex items-center gap-4">
          <ApiKeyInput compact />
          <ThemeToggle />
        </div>
      </div>

      {/* Main content area with panel switching */}
      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <ActivityBar 
          activePanel={activePanel}
          onPanelChange={setActivePanel}
        />
        
        {/* Panel Content */}
        <div className="flex flex-1 overflow-hidden">
          {activePanel === "archive" ? (
            <Sessions />
          ) : activePanel === "stats" ? (
            <StatsPage />
          ) : activePanel === "heatmap" ? (
            <Heatmap />
          ) : activePanel === "network" ? (
            <Generator />
          ) : activePanel === "docs" ? (
            <Wiki />
          ) : activePanel === "settings" ? (
            <Settings />
          ) : activePanel === "account" ? (
            <Users />
          ) : (
            <>
              {/* Default Dashboard Content */}
              <FeedSidebar />
              <Studio />
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="h-[32px] shrink-0 flex items-center justify-between px-4 text-xs border-t border-black/10 dark:border-white/10 bg-[#181818]">
        <div className="flex items-center gap-2 text-foreground/90">
          <span>© built by ACDC.digital</span>
        </div>
        <div className="flex items-center gap-4 text-foreground/50">
          <span>Status: <span className="text-green-500">Ready</span></span>
          <span className="hidden sm:inline">v0.1.0</span>
          <TokenCounter className="hidden md:flex" />
          <RuntimeCounter className="flex" />
        </div>
      </footer>
    </div>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DashboardProvider>
      <DashboardContent>{children}</DashboardContent>
    </DashboardProvider>
  );
}
