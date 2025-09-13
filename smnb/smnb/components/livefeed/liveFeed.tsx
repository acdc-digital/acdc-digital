// LIVE FEED - STORY DISPLAY
// /Users/matthewsimon/Projects/SMNB/smnb/components/livefeed/liveFeed.tsx

'use client';

import { useEffect, useState } from 'react';
import React from 'react';
import { useSimpleLiveFeedStore } from '@/lib/stores/livefeed/simpleLiveFeedStore';
import { useFeedStatsDisplay, useFeedStatsActions } from '@/lib/stores/livefeed/feedStatsStore';
import { Trash2, ChartNoAxesCombined, List } from 'lucide-react';
import StoryCard from './StoryCard';
import LiveFeedStats from './LiveFeedStats';

interface LiveFeedProps {
  className?: string;
}

export default function LiveFeed({ className }: LiveFeedProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  const {
    storyHistory,
    clearStoryHistory,
    loadStoriesFromConvex,
  } = useSimpleLiveFeedStore();

  // Stats state for toggle button
  const showStats = useFeedStatsDisplay();
  const { toggleStats } = useFeedStatsActions();

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Load stories from Convex on mount
  useEffect(() => {
    console.log('📚 Loading stories from Convex for live feed display');
    loadStoriesFromConvex();
  }, [loadStoriesFromConvex]);

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-[#191919] backdrop-blur-sm border-b border-border/20 flex items-center justify-between px-4 py-2">
        <div className="text-sm font-light text-muted-foreground font-sans">
          {showStats ? 'Producer Analytics' : (storyHistory.length > 0 ? `${storyHistory.length} Stories` : 'Live Stories')}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (showStats) {
                toggleStats();
                console.log('� Switched to Live Feed');
              }
            }}
            title="Show Live Feed"
            className={`p-1 hover:bg-[#2d2d2d] rounded transition-colors border cursor-pointer ${
              !showStats 
                ? 'border-muted-foreground text-muted-foreground' 
                : 'border-muted-foreground/70 text-muted-foreground/70'
            }`}
          >
            <List className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              if (!showStats) {
                toggleStats();
                console.log('📊 Switched to Analytics');
              }
            }}
            title="Show Analytics"
            className={`p-1 hover:bg-[#2d2d2d] rounded transition-colors border cursor-pointer ${
              showStats 
                ? 'border-muted-foreground text-muted-foreground' 
                : 'border-muted-foreground/70 text-muted-foreground/70'
            }`}
          >
            <ChartNoAxesCombined className="w-3 h-3" />
          </button>
          <button
            onClick={clearStoryHistory}
            title="Clear Stories"
            className="p-1 hover:bg-[#2d2d2d] rounded transition-colors border border-muted-foreground/70 text-muted-foreground/70 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto relative">
        {showStats ? (
          /* Stats View */
          <div className="p-4">
            <LiveFeedStats />
          </div>
        ) : (
          /* Stories View */
          <>
            {/* Absolute positioned background text */}
            <div className="absolute top-2 left-3 pointer-events-none z-0">
              <p className="text-gray-500 dark:text-slate-500/20 font-work-sans font-semibold text-7xl break-words leading-tight">
                Demo-
                cratizing AI.
              </p>
            </div>
            
            <div className="space-y-4 px-2 pt-2 relative z-10">
              {/* Stories */}
              <div className="space-y-3">
                {storyHistory.map((story, index) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    isFirst={false}
                    showActions={false}
                    className={reducedMotion ? '' : 'animate-slide-in-top'}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
