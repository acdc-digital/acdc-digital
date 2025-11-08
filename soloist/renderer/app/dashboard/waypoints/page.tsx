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
  
  // Get latest baseline answers to persist chat on refresh
  const latestBaselineAnswers = useQuery(api.baseline.getLatestBaselineAnswers);
  
  // Set baseline answer ID when component mounts or when new answers are saved
  React.useEffect(() => {
    if (latestBaselineAnswers?._id && !currentBaselineAnswerId) {
      setCurrentBaselineAnswerId(latestBaselineAnswers._id);
    }
  }, [latestBaselineAnswers, currentBaselineAnswerId]);

  return (
    <div className="flex w-full h-full overflow-hidden bg-[#1e1e1e]">
      {/* Left Panel - Form */}
      <div className="flex-1 border-r border-[#2d2d30] flex flex-col overflow-hidden">
        <BaselineSelfAnalysisForm
          onBaselineComputed={setCurrentBaselineAnswerId}
          onAnalysisStateChange={setIsGeneratingAnalysis}
        />
      </div>
      
      {/* Right Panel - Chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <BaselineChatPanel
          userId={user?._id as Id<"users">}
          baselineAnswerId={currentBaselineAnswerId}
          isGeneratingAnalysis={isGeneratingAnalysis}
        />
      </div>
    </div>
  );
}
