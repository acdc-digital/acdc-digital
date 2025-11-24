// PLACEHOLDER PANEL COMPONENT
// /Users/matthewsimon/Projects/acdc-digital/soloist/marketing/app/dashboard/controls/_components/PlaceholderPanel.tsx

'use client';

import React from 'react';

interface PlaceholderPanelProps {
  title: string;
  showHeaders?: boolean;
}

export default function PlaceholderPanel({
  title,
  showHeaders = true,
}: PlaceholderPanelProps) {
  return (
    <div className="space-y-2 min-w-0">
      {showHeaders && (
        <div className="text-xs text-muted-foreground/70 uppercase tracking-wider font-medium">{title}</div>
      )}
      <div className="rounded-sm px-0 space-y-0">
        {/* 7 rows to match subreddit columns */}
        {[0, 1, 2, 3, 4, 5, 6].map((index) => (
          <div
            key={`placeholder-${index}`}
            className="flex items-center justify-between px-2 py-1.25 text-xs rounded border border-border"
          >
            <span className="text-muted-foreground/30 italic">coming soon...</span>
          </div>
        ))}
      </div>
    </div>
  );
}
