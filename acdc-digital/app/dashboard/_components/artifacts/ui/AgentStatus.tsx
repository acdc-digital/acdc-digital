"use client";

import { Brain, Zap, FileText } from "lucide-react";

interface AgentStatusProps {
  isActive: boolean;
  documentsProcessed?: number;
  className?: string;
}

export function AgentStatus({ 
  isActive, 
  documentsProcessed = 0,
  className = "" 
}: AgentStatusProps) {
  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      {/* Agent Active Indicator */}
      <div className="flex items-center gap-1.5">
        <div className={`w-2 h-2 rounded-full ${
          isActive ? "bg-green-500 animate-pulse" : "bg-gray-500"
        }`} />
        <Brain className="w-3 h-3 text-[#858585]" />
        <span className="text-[#858585]">
          AI Agent {isActive ? "Active" : "Standby"}
        </span>
      </div>

      {/* Capabilities Indicator */}
      <div className="flex items-center gap-1 text-[#858585]">
        <Zap className="w-3 h-3" />
        <span>Smart Editing</span>
      </div>

      {/* Documents Processed */}
      {documentsProcessed > 0 && (
        <div className="flex items-center gap-1 text-[#858585]">
          <FileText className="w-3 h-3" />
          <span>{documentsProcessed} docs</span>
        </div>
      )}
    </div>
  );
}