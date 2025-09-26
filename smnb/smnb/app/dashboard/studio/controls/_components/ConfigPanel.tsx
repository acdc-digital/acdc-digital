// CONFIG PANEL COMPONENT
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/app/dashboard/studio/controls/_components/ConfigPanel.tsx

'use client';

import React from 'react';
import { Switch } from "@/components/ui/switch";
import { StudioMode } from '../../Studio';

interface ConfigPanelProps {
  // Counters
  enabledDefaultsCount: number;
  customSubredditsCount: number;
  hostStats: {
    totalNarrations: number;
  };
  mode: StudioMode;
  
  // API Key management
  useUserApiKey: boolean;
  setUseUserApiKey: (value: boolean) => void;
  hasValidApiKey: () => boolean;
}

export default function ConfigPanel({
  enabledDefaultsCount,
  customSubredditsCount,
  hostStats,
  mode,
  useUserApiKey,
  setUseUserApiKey,
  hasValidApiKey,
}: ConfigPanelProps) {
  const totalSources = enabledDefaultsCount + customSubredditsCount;

  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground/70 uppercase tracking-wider">Config</div>
      <div className="space-y-2">
        {/* Stats Panel */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground/70">Sources</span>
            <span className="text-xs font-mono text-muted-foreground">{totalSources}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground/70">Stories</span>
            <span className="text-xs font-mono text-muted-foreground">
              {hostStats.totalNarrations}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground/70">Mode</span>
            <span className="text-xs font-mono text-muted-foreground">
              {mode.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground/70">API</span>
            <div className="flex items-center gap-1">
              <Switch
                checked={useUserApiKey}
                onCheckedChange={setUseUserApiKey}
                className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-600"
                style={{ transform: 'scale(0.7)' }}
              />
              <span className={`text-xs font-mono ${
                useUserApiKey 
                  ? (hasValidApiKey() ? 'text-green-400' : 'text-red-400')
                  : 'text-muted-foreground'
              }`}>
                {useUserApiKey 
                  ? (hasValidApiKey() ? 'USER' : 'ERR')
                  : 'ENV'
                }
              </span>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="border-t border-border/20 pt-2 mt-2 space-y-1">
            <div className="flex items-center gap-1 text-xs font-mono">
              <span className="text-muted-foreground/70">Col:</span>
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="text-muted-foreground/50">|</span>
              <span className="text-muted-foreground/70">Content:</span>
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="text-muted-foreground/50">|</span>
              <span className="text-muted-foreground/70">Status:</span>
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}