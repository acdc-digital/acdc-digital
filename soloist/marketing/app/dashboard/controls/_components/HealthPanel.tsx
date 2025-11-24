// HEALTH PANEL COMPONENT
// /Users/matthewsimon/Projects/acdc-digital/soloist/marketing/app/dashboard/controls/_components/HealthPanel.tsx

'use client';

import React from 'react';

interface HealthPanelProps {
  // Counters
  insightsCount: number;
  filterCount?: number;
  sourcesCount?: number;
  
  // UI Options
  showHeaders?: boolean;
}

export default function HealthPanel({
  insightsCount,
  filterCount = 0,
  sourcesCount = 0,
  showHeaders = true,
}: HealthPanelProps) {
  return (
    <div className="space-y-2 min-w-0">
      {showHeaders && (
        <div className="text-xs text-muted-foreground/70 uppercase tracking-wider font-medium">Health</div>
      )}
      <div className="rounded-sm px-0 space-y-0">
        {/* Row 1: Insights */}
        <div className="flex items-center justify-between px-2 py-1.25 text-xs rounded border border-border">
          <span className="text-muted-foreground/70">Insights</span>
          <span className="font-mono text-muted-foreground font-medium">{insightsCount}</span>
        </div>

        {/* Row 2: Filter */}
        <div className="flex items-center justify-between px-2 py-1.25 text-xs rounded border border-border">
          <span className="text-muted-foreground/70">Filter</span>
          <span className="font-mono text-muted-foreground font-medium">{filterCount}</span>
        </div>

        {/* Row 3: Sources */}
        <div className="flex items-center justify-between px-2 py-1.25 text-xs rounded border border-border">
          <span className="text-muted-foreground/70">Sources</span>
          <span className="font-mono text-muted-foreground font-medium">{sourcesCount}</span>
        </div>

        {/* Row 4: Empty placeholder */}
        <div className="flex items-center justify-between px-2 py-1.25 text-xs rounded border border-border">
          <div className='pt-2.5'></div>
        </div>

        {/* Row 5: Empty placeholder */}
        <div className="flex items-center justify-between px-2 py-1.25 text-xs rounded border border-border">
          <div className='pt-2.5'></div>
        </div>

        {/* Row 6: Empty placeholder */}
        <div className="flex items-center justify-between px-2 py-1.25 text-xs rounded border border-border">
          <div className='pt-2.5'></div>
        </div>

        {/* Row 7: Status Indicators */}
        <div className="px-2 py-1.25 text-xs">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-muted-foreground/70">Col:</span>
            <div className="w-2 h-2 rounded-full bg-green-400 shrink-0 shadow-sm"></div>
            <span className="text-muted-foreground/70">Content:</span>
            <div className="w-2 h-2 rounded-full bg-green-400 shrink-0 shadow-sm"></div>
            <span className="text-muted-foreground/70">Status:</span>
            <div className="w-2 h-2 rounded-full bg-green-400 shrink-0 shadow-sm"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
