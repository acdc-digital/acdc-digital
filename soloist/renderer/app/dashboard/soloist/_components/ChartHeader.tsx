// CHART HEADER COMPONENT
// Header with series toggles and display controls
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/soloist/_components/ChartHeader.tsx

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  BarChart3,
  Layers,
  Eye,
  EyeOff,
  RotateCcw,
} from "lucide-react";

interface ChartHeaderProps {
  className?: string;
  // Series visibility
  showActual: boolean;
  showForecast: boolean;
  showHistorical: boolean;
  // Display options
  showArea: boolean;
  showGrid: boolean;
  showAverage: boolean;
  averageScore: number;
  // Callbacks
  onToggleActual: () => void;
  onToggleForecast: () => void;
  onToggleHistorical: () => void;
  onToggleArea: () => void;
  onToggleGrid: () => void;
  onToggleAverage: () => void;
  onReset: () => void;
}

// Toggle button component
interface ToggleButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color?: string;
}

function ToggleButton({ active, onClick, icon, label, color }: ToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-sm transition-colors",
        active
          ? "bg-neutral-700 text-neutral-100"
          : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
      )}
    >
      <span className={cn("flex-shrink-0", color)}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export function ChartHeader({
  className,
  showActual,
  showForecast,
  showHistorical,
  showArea,
  showGrid,
  showAverage,
  averageScore,
  onToggleActual,
  onToggleForecast,
  onToggleHistorical,
  onToggleArea,
  onToggleGrid,
  onToggleAverage,
  onReset,
}: ChartHeaderProps) {
  return (
    <div className={cn("flex-shrink-0 py-3 px-4", className)}>
      <div className="flex items-center justify-between">
        {/* Left: Data Series Toggles */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-neutral-500 dark:text-neutral-400 mr-2">
            Series:
          </span>
          <ToggleButton
            active={showActual}
            onClick={onToggleActual}
            icon={showActual ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            label="Actual"
            color="text-indigo-400"
          />
          <ToggleButton
            active={showForecast}
            onClick={onToggleForecast}
            icon={showForecast ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            label="Forecast"
            color="text-amber-400"
          />
          <ToggleButton
            active={showHistorical}
            onClick={onToggleHistorical}
            icon={showHistorical ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            label="Historical"
            color="text-green-400"
          />
        </div>

        {/* Center: Display Options */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-neutral-500 dark:text-neutral-400 mr-2">
            Display:
          </span>
          <ToggleButton
            active={showArea}
            onClick={onToggleArea}
            icon={<Layers className="h-3.5 w-3.5" />}
            label="Area Fill"
          />
          <ToggleButton
            active={showGrid}
            onClick={onToggleGrid}
            icon={<BarChart3 className="h-3.5 w-3.5" />}
            label="Grid"
          />
          <ToggleButton
            active={showAverage}
            onClick={onToggleAverage}
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            label={`Avg (${averageScore})`}
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-sm transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChartHeader;
