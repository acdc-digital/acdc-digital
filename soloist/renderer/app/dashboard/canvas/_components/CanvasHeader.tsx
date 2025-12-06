// CANVAS HEADER
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/canvsas/_components/CanvasHeader.tsx

"use client";

import React from "react";
import { PenTool } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CanvasHeaderProps {
  className?: string;
}

export function CanvasHeader({ className }: CanvasHeaderProps) {
  return (
    <div className={className}>
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PenTool className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
          <div>
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              Canvas
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Freeform whiteboard and sketching
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="h-5 text-[10px] rounded-none border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 bg-transparent">
            Beta
          </Badge>
        </div>
      </div>

      {/* Full-width divider - extends beyond padding to touch edges */}
      <div className="-mx-4 h-px bg-neutral-200 dark:bg-neutral-700 mt-3" />
    </div>
  );
}

export default CanvasHeader;
