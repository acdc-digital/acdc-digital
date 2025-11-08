// WAYPOINTS PAGE
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/waypoints/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useBrowserEnvironment } from "@/utils/environment";
import { BaselineSelfAnalysisForm } from "./_components/BaselineSelfAnalysisForm";
import { BaselineChatPanel } from "./_components/BaselineChatPanel";

export default function WaypointsPage() {
  const [currentBaselineAnswerId, setCurrentBaselineAnswerId] = useState<Id<"baseline_answers"> | null>(null);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const isBrowser = useBrowserEnvironment();

  // Get current user
  const user = useQuery(api.users.viewer);

  return (
    <div className="flex h-full w-full bg-[#1e1e1e]">
      {/* Left Panel - Form */}
      <div className="flex-1 border-r border-[#2d2d30] flex flex-col h-full">
        <BaselineSelfAnalysisForm
          onBaselineComputed={setCurrentBaselineAnswerId}
          onAnalysisStateChange={setIsGeneratingAnalysis}
        />
      </div>
      
      {/* Right Panel - Chat */}
      <div className="flex-1 flex flex-col h-full">
        <BaselineChatPanel
          userId={user?._id as Id<"users">}
          baselineAnswerId={currentBaselineAnswerId}
          isGeneratingAnalysis={isGeneratingAnalysis}
        />
      </div>
    </div>
  );
}
