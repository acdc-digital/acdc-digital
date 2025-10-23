// CONFIG PANEL COMPONENT
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/app/dashboard/studio/controls/_components/ConfigPanel.tsx

'use client';

import React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Settings } from 'lucide-react';
import { Switch } from "../../../../components/ui/switch";
import { StudioMode } from '../../Studio';

interface ConfigPanelProps {
  // Counters
  enabledDefaultsCount: number;
  customSubredditsCount: number;
  hostStats: {
    totalNarrations: number;
  };
  mode: StudioMode;
  
  // UI Options
  showHeaders?: boolean;
  
  // Feed/Queue data (moved from system column)
  postsCount?: number;
  queueLength?: number;
}

export default function ConfigPanel({
  enabledDefaultsCount,
  customSubredditsCount,
  hostStats,
  mode,
  showHeaders = true,
  postsCount = 0,
  queueLength = 0,
}: ConfigPanelProps) {
  const totalSources = enabledDefaultsCount + customSubredditsCount;

  return (
    <div className="space-y-2 min-w-0">
      {showHeaders && (
        <div className="text-xs text-muted-foreground/70 uppercase tracking-wider">Config</div>
      )}
      <div className="rounded-sm px-0 space-y-0">
        {/* Row 1: Feed */}
        <div className="flex items-center justify-between px-2 py-1.25 text-xs rounded-sm border border-border/40">
          <span className="text-muted-foreground/70">Feed</span>
          <span className="font-mono text-muted-foreground">{postsCount}</span>
        </div>

        {/* Row 2: Queue */}
        <div className="flex items-center justify-between px-2 py-1.25 text-xs rounded-sm border border-border/40">
          <span className="text-muted-foreground/70">Queue</span>
          <span className="font-mono text-muted-foreground">{queueLength}</span>
        </div>

        {/* Row 3: Sources */}
        <div className="flex items-center justify-between px-2 py-1.25 text-xs rounded-sm border border-border/40">
          <span className="text-muted-foreground/70">Sources</span>
          <span className="font-mono text-muted-foreground">{totalSources}</span>
        </div>

        {/* Row 4: Stories */}
        <div className="flex items-center justify-between px-2 py-1.25 text-xs rounded-sm border border-border/40">
          <span className="text-muted-foreground/70">Stories</span>
          <span className="font-mono text-muted-foreground">{hostStats.totalNarrations}</span>
        </div>

        {/* Row 5: Mode */}
        <div className="flex items-center justify-between px-2 py-1.25 text-xs rounded-sm border border-border/40">
          <span className="text-muted-foreground/70">Mode</span>
          <span className="font-mono text-muted-foreground">{mode.toUpperCase()}</span>
        </div>

        {/* Row 6: Empty spacer */}
        <div className="flex items-center justify-between px-2 py-1.25 text-xs rounded-sm border border-border/40">
          <div className='pt-2.5'></div>
        </div>

        {/* Row 7: Status Indicators (moved to bottom) */}
        <div className="px-2 py-1.25 text-xs">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-muted-foreground/70">Col:</span>
            <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"></div>
            <span className="text-muted-foreground/70">Content:</span>
            <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"></div>
            <span className="text-muted-foreground/70">Status:</span>
            <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"></div>
          </div>
        </div>
      </div>
    </div>
  );
}