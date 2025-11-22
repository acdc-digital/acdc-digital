"use client";

import { RefreshCw, Monitor, Smartphone, Tablet, Loader2, Save, Code2 } from "lucide-react";

type DeviceMode = "desktop" | "tablet" | "mobile";

interface CanvasControlsProps {
  onRefresh: () => void;
  deviceMode: DeviceMode;
  onDeviceModeChange: (mode: DeviceMode) => void;
  isGenerating?: boolean;
  title: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function CanvasControls({
  onRefresh,
  deviceMode,
  onDeviceModeChange,
  isGenerating = false,
  title,
  onTitleChange,
  onSave,
  isSaving,
}: CanvasControlsProps) {
  return (
    <div className="h-[35px] bg-[#252526] border-b border-[#3e3e42] flex items-center justify-between px-3">
      {/* Left: React badge, icon, title, and device mode toggles */}
      <div className="flex items-center gap-2">
        <span className="px-2 py-1 bg-[#1e1e1e] text-xs text-[#cccccc] border border-[#3e3e42] rounded font-medium">
          React
        </span>
        <Code2 className="w-4 h-4 text-[#858585]" />
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="bg-transparent text-xs text-[#cccccc] border-none outline-none focus:outline-none w-48"
          placeholder="Component title"
        />
        <div className="w-px h-4 bg-[#3e3e42] mx-1" />
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
      </div>

      {/* Right: Save and Refresh buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white text-xs rounded transition-colors"
        >
          <Save className="w-3 h-3" />
          {isSaving ? "Saving..." : "Save"}
        </button>
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
    </div>
  );
}
