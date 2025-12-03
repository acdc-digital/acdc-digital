// FORECAST METRICS COMPONENT
// Displays forecast accuracy metrics
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/soloist/_components/ForecastMetrics.tsx

"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ForecastMetricsProps {
  className?: string;
}

interface MetricItem {
  id: string;
  label: string;
  value: string;
  subtext?: string;
}

export function ForecastMetrics({ className }: ForecastMetricsProps) {
  // Placeholder metrics - these would come from actual forecast data
  const metrics: MetricItem[] = React.useMemo(() => {
    return [
      {
        id: "accuracy",
        label: "Overall Accuracy",
        value: "78%",
        subtext: "Last 30 days",
      },
      {
        id: "predictions",
        label: "Predictions Made",
        value: "24",
        subtext: "This month",
      },
      {
        id: "correct",
        label: "Correct Forecasts",
        value: "19",
        subtext: "Within ±10 pts",
      },
      {
        id: "missed",
        label: "Missed Forecasts",
        value: "5",
        subtext: "Outside range",
      },
    ];
  }, []);

  return (
    <div className={cn("border-t border-neutral-200 dark:border-neutral-700", className)}>
      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          Forecast Accuracy Metrics
        </h3>
      </div>

      {/* Metrics Grid - 2x2 */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="flex flex-col p-1"
            >
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                {metric.label}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {metric.value}
                </span>
                {metric.subtext && (
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    {metric.subtext}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ForecastMetrics;
