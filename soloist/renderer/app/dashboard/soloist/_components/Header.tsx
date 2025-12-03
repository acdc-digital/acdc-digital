// SOLOIST INSIGHTS DASHBOARD HEADER
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/soloist/_components/Header.tsx

"use client";

import React from "react";
import { Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <div className={className}>
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lightbulb className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
          <div>
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              Insights Dashboard
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Personalized analytics and recommendations
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

export default Header;
