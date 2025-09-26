// STATS PAGE - WITH WIDGETS
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/app/dashboard/stats/Stats.tsx

"use client";

import React from 'react';
import { 
  SubredditStatsWidget, 
  StoryHistoryStatsWidget, 
  CombinedContentStatsWidget, 
  SubredditMemberStatsWidget,
  ContentCorrelationWidget,
  PostRankingsWidget,
  MetricScoringWidget,
  TopPostsBySubredditWidget
} from './_components';

// Stats Page with Analytics Widgets
export default function StatsPage() {
  return (
    <main className="relative flex-1 flex flex-col bg-[#1a1a1a] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6">
        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <SubredditStatsWidget />
          <StoryHistoryStatsWidget />
          <CombinedContentStatsWidget />
          <SubredditMemberStatsWidget />
          <ContentCorrelationWidget />
          <PostRankingsWidget />
          <MetricScoringWidget />
          <TopPostsBySubredditWidget />
        </div>
      </div>
    </main>
  );
}