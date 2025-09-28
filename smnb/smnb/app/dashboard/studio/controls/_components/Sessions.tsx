// SESSIONS COMPONENT
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/app/dashboard/studio/controls/_components/Sessions.tsx

'use client';

import React from 'react';

interface SessionsProps {
  showHeaders?: boolean;
}

export default function Sessions({
  showHeaders = true,
}: SessionsProps) {
  
  return (
    <div className="space-y-2 min-w-0">
      {showHeaders && (
        <div className="text-xs text-muted-foreground/70 uppercase tracking-wider">Sessions</div>
      )}
      <div className="rounded-sm px-0 space-y-1">
        {/* 7 Session rows */}
        <div className="space-y-1">
          {[0, 1, 2, 3, 4, 5, 6].map((index) => (
            <div
              key={`session-${index}`}
              className="w-full px-2 py-1.25 text-xs rounded-sm border border-border/20 text-muted-foreground/30 italic flex items-center"
            >
              session...
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}