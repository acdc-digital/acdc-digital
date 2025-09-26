// SUBREDDIT MANAGER COMPONENT
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/app/dashboard/studio/controls/_components/SubredditManager.tsx

'use client';

import React from 'react';
import { FeedbackState } from './types';

interface DefaultGroup {
  id: string;
  label: string;
  subreddits: string[];
}

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
  isSavingSelection: boolean;
  
  // Selection state
  hasCustomSelection: boolean;
  activeFilter: string | null;
  showPresetButtons: boolean;
  defaultGroups: DefaultGroup[];
  presetRows: DefaultGroup[][];
  defaultPreset?: DefaultGroup;
  
  // Actions
  handleAddSubreddit: () => void;
  handleToggleDefaultSubreddit: (subreddit: string) => void;
  handleRemoveSubreddit: (subreddit: string) => void;
  handleToggleFilter: (groupId: string) => void;
  handleResetPresets: () => void;
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
  isSavingSelection,
  hasCustomSelection,
  activeFilter,
  showPresetButtons,
  presetRows,
  defaultPreset,
  handleAddSubreddit,
  handleToggleDefaultSubreddit,
  handleRemoveSubreddit,
  handleToggleFilter,
  handleResetPresets,
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

  return (
    <>
      {/* Column 2: Add Subreddits */}
      <div className="space-y-2 min-w-0">
        <div className="text-xs text-muted-foreground/70 uppercase tracking-wider">Add Subreddits</div>
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
          
          {/* Primary Subreddits - Fixed 3 rows */}
          <div className="space-y-1">
            {[0, 1, 2].map((index) => {
              const subreddit = primarySubreddits[index];
              return subreddit ? (
                renderSubredditItem(subreddit)
              ) : (
                <div
                  key={`empty-${index}`}
                  className="w-full px-2 py-1.25 text-xs rounded-sm border border-border/20 text-muted-foreground/30 italic flex items-center"
                >
                  subreddit...
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Preset Groups Row */}
        {showPresetButtons ? (
          <div className="flex gap-1">
            {presetRows[0].map((group) => (
              <button
                key={group.id}
                onClick={() => handleToggleFilter(group.id)}
                disabled={isSavingSelection || isLoadingControls}
                className={`flex-1 px-1 py-1 text-xs rounded-sm transition-colors cursor-pointer disabled:cursor-not-allowed ${
                  !hasCustomSelection && activeFilter === group.id
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-[#1a1a1a] text-muted-foreground/50 hover:text-muted-foreground/70'
                }`}
              >
                {group.label}
              </button>
            ))}
            {presetRows[0].length === 0 && (
              <div className="flex-1 px-1 py-1 text-xs text-muted-foreground/40 border border-border/20 rounded-sm">
                No presets
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between text-[11px] text-muted-foreground/60 px-1 py-1">
            <span>Custom selection active</span>
            {defaultPreset && (
              <button
                onClick={handleResetPresets}
                disabled={isSavingSelection || isLoadingControls}
                className="text-blue-400 hover:text-blue-300 disabled:text-muted-foreground/40"
              >
                Reset presets
              </button>
            )}
          </div>
        )}
      </div>

      {/* Column 3: Secondary Sources */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground/70 uppercase tracking-wider">&nbsp;</div>
        <div className={`rounded-sm px-0 space-y-1 ${
          secondarySubreddits.length > 4 
            ? 'max-h-[120px] overflow-y-auto custom-scrollbar' 
            : ''
        }`}>
          {secondarySubreddits.length > 0 ? (
            <>
              {secondarySubreddits.map((subreddit) => renderSubredditItem(subreddit))}
              {/* Scroll indicator - show expanded mode when using full height */}
              {secondarySubreddits.length > 4 && (
                <div className="text-xs text-muted-foreground/50 italic text-center pt-1">
                  {!showPresetButtons 
                    ? `${secondarySubreddits.length} overflow • expanded ↕` 
                    : `+${secondarySubreddits.length} more • scroll ↕`
                  }
                </div>
              )}
            </>
          ) : (
            // Show empty placeholders only when no secondary subreddits exist
            [0, 1, 2, 3].map((index) => (
              <div
                key={`empty-${index}`}
                className="w-full px-2 py-1.25 text-xs rounded-sm border border-border/20 text-muted-foreground/30 italic flex items-center"
              >
                subreddit...
              </div>
            ))
          )}
        </div>
        
        {showPresetButtons && presetRows[1].length > 0 && (
          <div className="flex gap-1">
            {presetRows[1].map((group) => (
              <button
                key={group.id}
                onClick={() => handleToggleFilter(group.id)}
                disabled={isSavingSelection || isLoadingControls}
                className={`flex-1 px-1 py-1 text-xs rounded-sm transition-colors cursor-pointer disabled:cursor-not-allowed ${
                  !hasCustomSelection && activeFilter === group.id
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-[#1a1a1a] text-muted-foreground/50 hover:text-muted-foreground/70'
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}