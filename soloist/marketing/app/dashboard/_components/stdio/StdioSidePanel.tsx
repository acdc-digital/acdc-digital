"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ComponentStorage } from "./canvas/ComponentStorage";
import { Id } from "@/convex/_generated/dataModel";

interface StdioSidePanelProps {
  onSelectComponent?: (component: {
    _id: Id<"generatedComponents">;
    code: string;
    title: string;
    framework: "react";
  }) => void;
}

export function StdioSidePanel({ onSelectComponent }: StdioSidePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`bg-card border-r border-border shrink-0 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-10' : 'w-60'}`}>
      <div className="h-[35px] bg-muted border-b border-border flex items-center justify-between px-3">
        <span className="text-xs text-muted-foreground">{isCollapsed ? '' : 'Components'}</span>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
      {!isCollapsed && (
        <div className="overflow-auto h-[calc(100%-35px)]">
          <div className="flex flex-col h-full">
            {onSelectComponent && <ComponentStorage onSelectComponent={onSelectComponent} />}
          </div>
        </div>
      )}
    </div>
  );
}
