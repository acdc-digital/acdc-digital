// SUBREDDIT MANAGER COMPONENT
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/app/dashboard/studio/controls/_components/SubredditManager.tsx

'use client';

import React from 'react';
import { FeedbackState } from './types';



interface SubredditManagerProps {
  // Subreddit state
  enabledDefaults: string[];
  customSubreddits: string[];
  primarySubreddits: string[];
  secondarySubreddits: string[];
  
  // UI state
  selectionError: string | null;
  isLoadingControls: boolean;
  
  // UI Options
  showHeaders?: boolean; // Optional header display control
  
  // Actions
  handleToggleDefaultSubreddit: (subreddit: string) => void;
  handleRemoveSubreddit: (subreddit: string) => void;
}

export default function SubredditManager({
  enabledDefaults,
  primarySubreddits,
  secondarySubreddits,
  selectionError,
  isLoadingControls,
  showHeaders = true, // Default to showing headers for backward compatibility
  handleToggleDefaultSubreddit,
  handleRemoveSubreddit,
}: SubredditManagerProps) {
  
  const renderSubredditItem = (subreddit: string, showRemoveButton = true) => {
    const isEnabled = enabledDefaults.includes(subreddit);
    
    if (isEnabled) {
      return (
        <div
          key={subreddit}
          className="w-full px-2 py-1.25 text-xs rounded-sm bg-green-500/20 text-green-400 flex items-center gap-2 group relative"
        >
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="truncate">{subreddit}</span>
          {showRemoveButton && (
            <button
              onClick={() => handleRemoveSubreddit(subreddit)}
              className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4 flex items-center justify-center text-red-400 hover:text-red-300 text-xs"
            >
              ×
            </button>
          )}
        </div>
      );
    }
    
    return (
      <div
        key={subreddit}
        className="w-full px-2 py-1.25 text-xs rounded-sm transition-colors cursor-move flex items-center gap-2 bg-[#0d0d0d] text-muted-foreground/50 hover:text-muted-foreground/70 group relative"
        onClick={() => handleToggleDefaultSubreddit(subreddit)}
      >
        <div className="w-2 h-2 rounded-full bg-gray-400" />
        <span className="truncate">{subreddit}</span>
        {showRemoveButton && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveSubreddit(subreddit);
            }}
            className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4 flex items-center justify-center text-red-400 hover:text-red-300 text-xs"
          >
            ×
          </button>
        )}
      </div>
    );
  };

  // Split subreddits between two columns (7 in each column for 14 total visible)
  const allSubreddits = [...primarySubreddits, ...secondarySubreddits];
  const firstColumnSubreddits = allSubreddits.slice(0, 7);
  const secondColumnSubreddits = allSubreddits.slice(7);
  
  return (
    <>
      {/* Column 1: 7 Subreddit rows */}
      <div className="space-y-2 min-w-0">
        {showHeaders && (
          <div className="text-xs text-muted-foreground/70 uppercase tracking-wider">Subreddits</div>
        )}
        {selectionError && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-sm px-2 py-1">
            {selectionError}
          </div>
        )}
        <div className="rounded-sm px-0 space-y-1">
          {[0, 1, 2, 3, 4, 5, 6].map((index) => {
            const subreddit = firstColumnSubreddits[index];
            return subreddit ? (
              renderSubredditItem(subreddit)
            ) : (
              <div
                key={`empty-1-${index}`}
                className="w-full px-2 py-1.25 text-xs rounded-sm border border-border/40 text-muted-foreground/30 italic flex items-center"
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
                  className="w-full px-2 py-1.25 text-xs rounded-sm border border-border/40 text-muted-foreground/30 italic flex items-center"
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