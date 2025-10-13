"use client";

import { ChevronUp, ChevronDown, X } from "lucide-react";

interface TerminalProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Terminal({ isCollapsed, onToggle }: TerminalProps) {
  return (
    <div 
      className={`
        bg-[#1e1e1e] border-t border-[#2d2d2d]
        transition-all duration-200
        ${isCollapsed ? "h-[35px]" : "h-[250px]"}
      `}
    >
      {/* Terminal Header */}
      <div className="h-[35px] flex items-center justify-between px-4 border-b border-[#2d2d2d]">
        <span className="text-xs text-[#cccccc]">TERMINAL</span>
        <div className="flex gap-2">
          <button
            onClick={onToggle}
            className="text-[#858585] hover:text-[#cccccc] transition-colors"
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onToggle}
            className="text-[#858585] hover:text-[#cccccc] transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      {!isCollapsed && (
        <div className="p-4 font-mono text-xs text-[#cccccc] overflow-auto" style={{ height: "calc(100% - 35px)" }}>
          <div className="mb-2">
            <span className="text-[#007acc]">$</span> on-the-go status
          </div>
          <div className="text-[#858585] mb-4">
            ✅ Connected to Convex<br />
            ✅ Twilio webhook ready<br />
            ✅ Real-time updates active
          </div>
          <div className="text-[#858585]">
            Ready to receive SMS notes...
          </div>
        </div>
      )}
    </div>
  );
}
