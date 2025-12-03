// KEY INSIGHTS COMPONENT
// Displays natural language insights about the forecast
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/soloist/_components/KeyInsights.tsx

"use client";

import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWeekData, useSelectedDay } from "@/store/soloistStore";

interface KeyInsightsProps {
  className?: string;
}

interface InsightItem {
  id: string;
  text: string;
}

export function KeyInsights({ className }: KeyInsightsProps) {
  const weekData = useWeekData();
  const selectedDay = useSelectedDay();

  // Generate insights based on the week data
  // In a real implementation, these would come from AI analysis
  const insights: InsightItem[] = React.useMemo(() => {
    // Placeholder insights - these would be generated based on actual data
    return [
      {
        id: "1",
        text: "Your emotional state tends to peak midweek (Wednesday) and on weekends",
      },
      {
        id: "2",
        text: "Thursday consistently shows lower emotional scores - consider additional self-care",
      },
      {
        id: "3",
        text: "Evening periods generally show higher wellbeing than mornings",
      },
      {
        id: "4",
        text: "Your recovery pattern is strong, with quick rebounds after challenging days",
      },
    ];
  }, [weekData]);

  return (
    <div className={cn("h-[325px] flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          Key Insights
        </h3>
      </div>

      {/* Insights List */}
      <div className="flex-1 px-4 pb-4">
        <div className="flex flex-col gap-2">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="flex items-start gap-2 py-2"
            >
              <ArrowRight className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {insight.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default KeyInsights;
