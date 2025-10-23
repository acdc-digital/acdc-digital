'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Radio, RadioIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBroadcastSessionStore, useIsBroadcastActive, useCurrentBroadcastDuration, useTotalBroadcastTime } from '@/lib/stores/session/broadcastSessionStore';

interface RuntimeCounterProps {
  className?: string;
  showTotalTime?: boolean;
}

export function RuntimeCounter({ className, showTotalTime = false }: RuntimeCounterProps) {
  const isBroadcastActive = useIsBroadcastActive();
  const [currentDuration, setCurrentDuration] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  const getCurrentBroadcastDuration = useBroadcastSessionStore(state => state.getCurrentSessionDuration);
  const getTotalBroadcastTime = useBroadcastSessionStore(state => state.getTotalBroadcastTime);
  const currentSession = useBroadcastSessionStore(state => state.currentSession);

  // Update time every second - always keep total time current
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDuration(getCurrentBroadcastDuration());
      setTotalTime(getTotalBroadcastTime());
    }, 1000);

    // Also update immediately
    setCurrentDuration(getCurrentBroadcastDuration());
    setTotalTime(getTotalBroadcastTime());

    return () => clearInterval(interval);
  }, [getCurrentBroadcastDuration, getTotalBroadcastTime]);

  // Add a subtle pulse animation when broadcasting
  useEffect(() => {
    let pulseInterval: NodeJS.Timeout | undefined;
    
    if (isBroadcastActive) {
      pulseInterval = setInterval(() => {
        setIsVisible(false);
        setTimeout(() => setIsVisible(true), 100);
      }, 2000); // Pulse every 2 seconds when active
    } else {
      setIsVisible(true);
    }

    return () => {
      if (pulseInterval) clearInterval(pulseInterval);
    };
  }, [isBroadcastActive]);

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Show current session time when live, total time when not broadcasting (includes paused time)
  const displayTime = showTotalTime ? totalTime : 
                      isBroadcastActive ? currentDuration : totalTime;
  
  const timeLabel = showTotalTime ? 'Total broadcast time' : 
                    isBroadcastActive ? `Live ${currentSession?.type || 'broadcast'} session` :
                    totalTime > 0 ? `Total broadcast time (paused)` : 'Ready to broadcast';

  // Always show the counter - don't hide it when not broadcasting

  return (
    <div 
      className={cn('flex items-center gap-1.5 group', className)}
      title={`${timeLabel}${currentSession?.startTime ? `\nStarted at ${new Date(currentSession.startTime).toLocaleTimeString()}` : ''}`}
    >
      <Clock className="h-3 w-3 text-foreground/40" />
      <span className="font-mono text-foreground/60 group-hover:text-foreground/80">
        {formatTime(displayTime)}
      </span>
    </div>
  );
}
