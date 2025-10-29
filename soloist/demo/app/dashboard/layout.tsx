// DASHBOARD LAYOUT (DEMO VERSION)
// Simplified layout for demo - no authentication required

"use client";

import React from "react";
import { useBrowserEnvironment } from "@/utils/environment";
import DraggableHeader from "./_components/DraggableHeader";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const isBrowser = useBrowserEnvironment();

  // Demo mode - no authentication required, render immediately
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-zinc-950">
      {/* Header - fixed height - Only show in Electron mode */}
      {!isBrowser && (
        <div className="flex-shrink-0 border-b border-zinc-200 dark:border-zinc-800">
          <DraggableHeader />
        </div>
      )}

      {/* Main content area - takes remaining height */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
