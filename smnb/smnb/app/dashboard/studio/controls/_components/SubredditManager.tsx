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
  newSubreddit: string;
  setNewSubreddit: (value: string) => void;
  subredditFeedback: FeedbackState;
  selectionError: string | null;
  isLoadingControls: boolean;
  
  // UI Options
  showHeaders?: boolean; // Optional header display control
  
  // Actions
  handleAddSubreddit: () => void;
  handleToggleDefaultSubreddit: (subreddit: string) => void;
  handleRemoveSubreddit: (subreddit: string) => void;
}

export default function SubredditManager({
  enabledDefaults,
  primarySubreddits,
  secondarySubreddits,
  newSubreddit,
  setNewSubreddit,
  subredditFeedback,
  selectionError,
  isLoadingControls,
  showHeaders = true, // Default to showing headers for backward compatibility
  handleAddSubreddit,
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
        className="w-full px-2 py-1.25 text-xs rounded-sm transition-colors cursor-pointer flex items-center gap-2 bg-[#0d0d0d] text-muted-foreground/50 hover:text-muted-foreground/70 group relative"
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

  // Split subreddits between two columns (6 in first column, rest in second)
  const allSubreddits = [...primarySubreddits, ...secondarySubreddits];
  const firstColumnSubreddits = allSubreddits.slice(0, 6);
  const secondColumnSubreddits = allSubreddits.slice(6);
  
  return (
    <>
      {/* Column 1: Input + 6 Subreddit rows (7 total) */}
      <div className="space-y-2 min-w-0">
        {showHeaders && (
          <div className="text-xs text-muted-foreground/70 uppercase tracking-wider">Add Subreddits</div>
        )}
        {selectionError && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-sm px-2 py-1">
            {selectionError}
          </div>
        )}
        <div className="rounded-sm px-0 space-y-1">
          {/* Add Subreddit Input */}
          <div className="flex flex-col gap-1">
            <div className="flex gap-1">
              <input
                type="text"
                placeholder="add (supports comma-separated list)"
                value={newSubreddit}
                onChange={(event) => setNewSubreddit(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleAddSubreddit();
                  }
                }}
                disabled={isLoadingControls || subredditFeedback.status === 'working'}
                className="flex-1 px-1 py-1 text-xs bg-[#1a1a1a] border border-border/20 rounded-sm text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-0 disabled:opacity-50"
              />
              <button
                onClick={handleAddSubreddit}
                disabled={
                  isLoadingControls ||
                  subredditFeedback.status === 'working' ||
                  newSubreddit.trim().length === 0
                }
                className="px-1 py-1 text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:text-muted-foreground/40"
              >
                {subredditFeedback.status === 'working' ? '…' : '+'}
              </button>
            </div>
            {subredditFeedback.status === 'error' && (
              <div className="text-xs text-red-400">{subredditFeedback.message}</div>
            )}
            {subredditFeedback.status === 'success' && (
              <div className="text-xs text-green-400">{subredditFeedback.message}</div>
            )}
          </div>
          
          {/* First 6 Subreddits */}
          <div className="space-y-1">
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const subreddit = firstColumnSubreddits[index];
              return subreddit ? (
                renderSubredditItem(subreddit)
              ) : (
                <div
                  key={`empty-1-${index}`}
                  className="w-full px-2 py-1.25 text-xs rounded-sm border border-border/20 text-muted-foreground/30 italic flex items-center"
                >
                  subreddit...
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Column 2: 7 Subreddit rows (aligned with input) */}
      <div className="space-y-2 min-w-0">
        {showHeaders && (
          <div className="text-xs text-muted-foreground/70 uppercase tracking-wider invisible">Add Subreddits</div>
        )}
        <div className="rounded-sm px-0 space-y-1">
          {/* 7 Subreddits (7-13) - starts at top level with input */}
          <div className="space-y-1">
            {[0, 1, 2, 3, 4, 5, 6].map((index) => {
              const subreddit = secondColumnSubreddits[index];
              return subreddit ? (
                renderSubredditItem(subreddit)
              ) : (
                <div
                  key={`empty-2-${index}`}
                  className="w-full px-2 py-1.25 text-xs rounded-sm border border-border/20 text-muted-foreground/30 italic flex items-center"
                >
                  subreddit...
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}