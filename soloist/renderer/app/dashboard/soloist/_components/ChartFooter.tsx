// CHART FOOTER COMPONENT
// Fixed footer with chart type selector controls
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/soloist/_components/ChartFooter.tsx

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  BarChart3,
  Activity,
  ScatterChart,
  Radar,
  GitBranch,
  Columns3,
} from "lucide-react";

interface ChartFooterProps {
  className?: string;
}

// Chart type button component
interface ChartTypeButtonProps {
  icon: React.ReactNode;
  active: boolean;
  tooltip: string;
  onClick?: () => void;
}

function ChartTypeButton({ icon, active, tooltip, onClick }: ChartTypeButtonProps) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={cn(
        "p-2 border rounded-sm transition-colors",
        active
          ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
          : "border-neutral-600 text-neutral-400 hover:border-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
      )}
    >
      {icon}
    </button>
  );
}

export function ChartFooter({ className }: ChartFooterProps) {
  return (
    <div className={cn(
      "flex-shrink-0 py-3 px-4",
      className
    )}>
      <div className="flex items-center justify-start gap-2">
        <ChartTypeButton
          icon={<LineChartIcon className="h-4 w-4" />}
          active={true}
          tooltip="Line Chart"
        />
        <ChartTypeButton
          icon={<AreaChartIcon className="h-4 w-4" />}
          active={false}
          tooltip="Area Chart"
        />
        <ChartTypeButton
          icon={<BarChart3 className="h-4 w-4" />}
          active={false}
          tooltip="Bar Chart"
        />
        <ChartTypeButton
          icon={<Activity className="h-4 w-4" />}
          active={false}
          tooltip="Step Chart"
        />
        <ChartTypeButton
          icon={<ScatterChart className="h-4 w-4" />}
          active={false}
          tooltip="Scatter Plot"
        />
        <ChartTypeButton
          icon={<Radar className="h-4 w-4" />}
          active={false}
          tooltip="Radar Chart"
        />
        <ChartTypeButton
          icon={<GitBranch className="h-4 w-4" />}
          active={false}
          tooltip="Deviation Chart"
        />
        <ChartTypeButton
          icon={<Columns3 className="h-4 w-4" />}
          active={false}
          tooltip="Comparison View"
        />
      </div>
    </div>
  );
}

export default ChartFooter;
