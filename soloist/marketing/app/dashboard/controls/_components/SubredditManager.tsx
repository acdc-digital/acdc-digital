// SUBREDDIT MANAGER COMPONENT
// /Users/matthewsimon/Projects/acdc-digital/soloist/marketing/app/dashboard/controls/_components/SubredditManager.tsx

'use client';

import React from 'react';

interface SubredditManagerProps {
  // Subreddit state
  selectedSubreddits: string[];
  availableSubreddits: string[];
  
  // UI Options
  showHeaders?: boolean;
  
  // Actions
  onToggleSubreddit: (subreddit: string) => void;
}

export default function SubredditManager({
  selectedSubreddits,
  availableSubreddits,
  showHeaders = true,
  onToggleSubreddit,
}: SubredditManagerProps) {
  
  const renderSubredditItem = (subreddit: string) => {
    const isSelected = selectedSubreddits.includes(subreddit);
    
    if (isSelected) {
      return (
        <button
          key={subreddit}
          onClick={() => onToggleSubreddit(subreddit)}
          className="w-full px-2 py-1.25 text-xs rounded transition-all duration-200 bg-green-500/15 text-green-400 flex items-center gap-2 group relative hover:bg-green-500/20"
        >
          <div className="w-2 h-2 rounded-full bg-green-400 shadow-sm" />
          <span className="truncate font-medium">{subreddit}</span>
        </button>
      );
    }
    
    return (
      <button
        key={subreddit}
        onClick={() => onToggleSubreddit(subreddit)}
        className="w-full px-2 py-1.25 text-xs rounded transition-all duration-200 flex items-center gap-2 bg-card/50 text-muted-foreground/50 hover:text-muted-foreground/80 hover:bg-card/70 group relative border border-border hover:border-border"
      >
        <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
        <span className="truncate">{subreddit}</span>
      </button>
    );
  };

  // Split subreddits between two columns (7 in each column for consistency)
  const firstColumnSubreddits = availableSubreddits.slice(0, 7);
  const secondColumnSubreddits = availableSubreddits.slice(7);
  
  return (
    <>
      {/* Column 1: 7 Subreddit rows */}
      <div className="space-y-2 min-w-0">
        {showHeaders && (
          <div className="text-xs text-muted-foreground/70 uppercase tracking-wider font-medium">Subreddits</div>
        )}
        <div className="rounded-sm px-0 space-y-1">
          {[0, 1, 2, 3, 4, 5, 6].map((index) => {
            const subreddit = firstColumnSubreddits[index];
            return subreddit ? (
              renderSubredditItem(subreddit)
            ) : (
              <div
                key={`empty-1-${index}`}
                className="w-full px-2 py-1.25 text-xs rounded border border-border text-muted-foreground/30 italic flex items-center"
              >
                subreddit...
              </div>
            );
          })}
        </div>
      </div>

      {/* Column 2: Remaining subreddits (scrollable) */}
      <div className="space-y-2 min-w-0 flex flex-col">
        {showHeaders && (
          <div className="text-xs text-muted-foreground/70 uppercase tracking-wider invisible">Subreddits</div>
        )}
        <div className="rounded-sm px-0 flex-1 overflow-hidden">
          {/* Scrollable container for all remaining subreddits */}
          <div className="space-y-1 max-h-[calc(7*2rem)] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border/40 scrollbar-track-transparent">
            {secondColumnSubreddits.length > 0 ? (
              secondColumnSubreddits.map((subreddit) => renderSubredditItem(subreddit))
            ) : (
              [0, 1, 2, 3, 4, 5, 6].map((index) => (
                <div
                  key={`empty-2-${index}`}
                  className="w-full px-2 py-1.25 text-xs rounded border border-border text-muted-foreground/30 italic flex items-center"
                >
                  subreddit...
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
