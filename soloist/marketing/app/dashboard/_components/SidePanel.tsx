"use client";

import LiveFeed from "./livefeed/LiveFeed";

export function SidePanel() {
  return (
    <div className="w-[310px] bg-card/50 border-r border-border flex-shrink-0 overflow-hidden">
      <LiveFeed />
    </div>
  );
}
