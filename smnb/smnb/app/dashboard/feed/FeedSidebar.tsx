// FEED SIDEBAR
// /Users/matthewsimon/Projects/SMNB/smnb/app/dashboard/feed/FeedSidebar.tsx

'use client';

import React from "react";
import LiveFeed from "@/components/livefeed/liveFeed";
import Aggregator from "@/components/aggregator/aggregator";
import { useLastSessionId } from "@/lib/stores/orchestrator/broadcastOrchestrator";

export default function FeedSidebar() {
  // Use lastSessionId instead of currentConvexSessionId
  // This persists the session even after stopping broadcast,
  // allowing users to see story history from the last session
  const sessionId = useLastSessionId();

  return (
    <aside className="relative basis-1/4 min-w-[280px] max-w-[380px] border-r border-black/10 dark:border-white/10 flex flex-col min-h-0 bg-[#181818] overflow-hidden">
      {/* Background Aggregator - runs Reddit processing pipeline */}
      <Aggregator />
      
      {/* Content Area - Always show LiveFeed (handles header + content switching) */}
      <div className="flex-1 overflow-auto pt-0 pb-0">
        <LiveFeed
          className="h-full"
          sessionId={sessionId}
        />
      </div>
    </aside>
  );
}
