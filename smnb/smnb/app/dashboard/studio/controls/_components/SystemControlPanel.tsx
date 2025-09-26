// SYSTEM CONTROL PANEL COMPONENT
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/app/dashboard/studio/controls/_components/SystemControlPanel.tsx

'use client';

import React from 'react';
import { Play, Pause, Mic } from 'lucide-react';

interface SystemControlPanelProps {
  // Live feed state
  isLive: boolean;
  setIsLive: (live: boolean) => void;
  postsCount: number;
  // Host agent state
  isHostActive: boolean;
  hostStats: {
    queueLength: number;
    totalNarrations: number;
  };
  handleBroadcastToggle: () => void;
}

export default function SystemControlPanel({
  isLive,
  setIsLive,
  postsCount,
  isHostActive,
  hostStats,
  handleBroadcastToggle,
}: SystemControlPanelProps) {
  const isSystemActive = isLive && isHostActive;

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground/70 uppercase tracking-wider">System</div>
      <div 
        className={`bg-[#1a1a1a] rounded-sm px-1 py-3 border border-border/20 text-center space-y-2 ${
          !isSystemActive ? 'cursor-pointer hover:bg-[#1f1f1f] transition-colors' : ''
        }`}
        onClick={() => {
          // Only handle click if not active (big button to start)
          if (!isSystemActive) {
            if (!isLive) setIsLive(true);
            if (!isHostActive) handleBroadcastToggle();
          }
        }}
      >
        <div className={`w-4 h-4 rounded-full mx-auto ${isSystemActive ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground/50">Feed: {postsCount}</div>
          <div className="text-xs text-muted-foreground/50">Queue: {hostStats.queueLength}</div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent container click
            if (isSystemActive) {
              // Stop when active
              setIsLive(false);
              handleBroadcastToggle();
            } else {
              // Start when inactive
              if (!isLive) setIsLive(true);
              if (!isHostActive) handleBroadcastToggle();
            }
          }}
          className={`px-2 py-1 text-xs rounded-sm transition-colors cursor-pointer relative ${
            isSystemActive
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-card text-muted-foreground border border-border hover:bg-card/80'
          }`}
        >
          {isSystemActive ? (
            <>
              <Pause className="w-3 h-3 absolute left-1 top-1/2 transform -translate-y-1/2" />
              <span className="text-center w-full pl-4">Stop</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 absolute left-1 top-1/2 transform -translate-y-1/2" />
              <span className="text-center w-full pl-4">Live</span>
            </>
          )}
        </button>
      </div>
      
      {/* Studio Mode - Host Only */}
      <div className="flex gap-1">
        <button
          title="Host Mode - Producer statistics and story preview"
          className="flex-1 px-1 py-1 text-xs rounded-sm transition-colors bg-blue-500/20 text-blue-400"
          disabled
        >
          <Mic className="w-3 h-3 mx-auto" />
        </button>
      </div>
    </div>
  );
}