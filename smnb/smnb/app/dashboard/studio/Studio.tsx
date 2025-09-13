// STUDIO
// /Users/matthewsimon/Projects/SMNB/smnb/app/dashboard/studio/Studio.tsx

'use client';

import React, { useState } from 'react';
import Host from './host/Host';
import Producer from './producer/Producer';
import Controls from './controls/Controls';

export type StudioMode = 'host';

export default function Studio() {
  const [mode, setMode] = useState<StudioMode>('host');

  return (
    <main className="relative flex-1 flex flex-col bg-white/70 dark:bg-[#191919] backdrop-blur supports-[backdrop-filter]:bg-white/40">
      <div className="flex-1 flex flex-col p-2 min-h-0">
        
        {/* Two Column Layout - Takes remaining space above controls */}
        <div className="flex-1 flex gap-2 mb-2 min-h-0">
          {/* Column 1 - Host */}
          <div className="flex-[35] flex flex-col min-h-0">
            <Host />
          </div>
          
          {/* Column 2 - Producer */}
          <div className="flex-[65] flex flex-col min-h-0">
            <Producer onModeChange={setMode} />
          </div>
        </div>

        {/* Controls Panel - Pinned to bottom */}
        <div className="flex-shrink-0 max-h-70 overflow-y-auto pb-0">
          <Controls mode={mode} onModeChange={setMode} />
        </div>
        
      </div>
    </main>
  );
}


