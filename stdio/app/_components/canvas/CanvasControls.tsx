"use client";

import { useState } from "react";
import { RefreshCw, Monitor, Smartphone, Tablet, Loader2 } from "lucide-react";

type DeviceMode = "desktop" | "tablet" | "mobile";

interface CanvasControlsProps {
  onRefresh: () => void;
  deviceMode: DeviceMode;
  onDeviceModeChange: (mode: DeviceMode) => void;
  isGenerating?: boolean;
}

export function CanvasControls({
  onRefresh,
  deviceMode,
  onDeviceModeChange,
  isGenerating = false,
}: CanvasControlsProps) {
  return (
    <div className="h-[35px] bg-[#252526] border-b border-[#3e3e42] flex items-center justify-between px-3">
      {/* Left: Device mode toggles */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onDeviceModeChange("desktop")}
          className={`p-1.5 rounded transition-colors ${
            deviceMode === "desktop"
              ? "bg-blue-600/20 text-blue-400"
              : "text-[#858585] hover:bg-[#2d2d2d] hover:text-[#cccccc]"
          }`}
          title="Desktop view"
        >
          <Monitor className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDeviceModeChange("tablet")}
          className={`p-1.5 rounded transition-colors ${
            deviceMode === "tablet"
              ? "bg-blue-600/20 text-blue-400"
              : "text-[#858585] hover:bg-[#2d2d2d] hover:text-[#cccccc]"
          }`}
          title="Tablet view"
        >
          <Tablet className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDeviceModeChange("mobile")}
          className={`p-1.5 rounded transition-colors ${
            deviceMode === "mobile"
              ? "bg-blue-600/20 text-blue-400"
              : "text-[#858585] hover:bg-[#2d2d2d] hover:text-[#cccccc]"
          }`}
          title="Mobile view"
        >
          <Smartphone className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Refresh button */}
      <button
        onClick={onRefresh}
        disabled={isGenerating}
        className="p-1.5 rounded text-[#858585] hover:bg-[#2d2d2d] hover:text-[#cccccc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={isGenerating ? "Generating component..." : "Refresh preview"}
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
