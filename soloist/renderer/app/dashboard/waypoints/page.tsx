// WAYPOINTS PAGE
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/waypoints/page.tsx

"use client";

import React, { useState, useRef, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useBrowserEnvironment } from "@/utils/environment";
import { RefreshCcw, Loader2, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaselineSelfAnalysisForm, BaselineSelfAnalysisFormRef, FormState } from "./_components/BaselineSelfAnalysisForm";
import { BaselineChatPanel } from "./_components/BaselineChatPanel";

export default function WaypointsPage() {
  const [currentBaselineAnswerId, setCurrentBaselineAnswerId] = useState<Id<"baseline_answers"> | null>(null);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    isSubmitting: false,
    isComputing: false,
    saveStatus: "idle",
    computedBaseline: null,
  });
  const formRef = useRef<BaselineSelfAnalysisFormRef>(null);
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

  // Callback for form state changes
  const handleFormStateChange = useCallback((state: FormState) => {
    setFormState(state);
  }, []);

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-[#f9f9f9] dark:bg-neutral-900">
      {/* Full-width Header */}
      <div className="flex-shrink-0 px-5 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-300 dark:border-neutral-600">
        <div className="pb-2 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              {/* Solo Dot - inverted colors (red background, white dot) */}
              <div className="mt-1 w-7 h-7 rounded-full bg-[#EF4444] flex items-center justify-center pr-2.5 pb-2">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
                  Your Baseline
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-0s">
                  Discover your rhythm. Understand your patterns.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => formRef.current?.resetForm()}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-md text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                title="Start Over"
              >
                <RefreshCcw className="h-4 w-4" />
                <span className="text-[10px]">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Panels */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Form */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <BaselineSelfAnalysisForm
            ref={formRef}
            onBaselineComputed={setCurrentBaselineAnswerId}
            onAnalysisStateChange={setIsGeneratingAnalysis}
            onStateChange={handleFormStateChange}
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

      {/* Full-width Footer */}
      <div className="flex-shrink-0 px-5 py-3 bg-neutral-100 dark:bg-neutral-800 border-t border-neutral-300 dark:border-neutral-600 flex items-center justify-between">
        <Button
          type="button"
          onClick={() => formRef.current?.submitForm()}
          disabled={formState.isSubmitting || formState.isComputing}
          className="h-8 px-6 text-sm border border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700/75 text-neutral-600 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500 font-medium rounded-none transition-all"
        >
          {formState.isComputing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finding your rhythm...
            </>
          ) : formState.isSubmitting ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              Saving...
            </>
          ) : formState.computedBaseline ? (
            <>
              Recompute Baseline
            </>
          ) : (
            <>
              Discover Your Baseline
            </>
          )}
        </Button>
        <div className="flex items-center gap-3">
          {formState.saveStatus === "saving" && (
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Saving...</span>
            </div>
          )}
          {formState.saveStatus === "saved" && (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Saved</span>
            </div>
          )}
          {formState.computedBaseline && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 dark:text-neutral-400">Index</span>
                <span className="text-[#3B82F6] font-mono font-semibold">{formState.computedBaseline.scores.baseline_index}</span>
              </div>
              <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-600" />
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 dark:text-neutral-400">Confidence</span>
                <span className="text-emerald-600 font-mono font-semibold">{formState.computedBaseline.scores.confidence}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
