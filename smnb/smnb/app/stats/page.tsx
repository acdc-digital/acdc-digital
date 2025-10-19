// STATS PAGE - WITH WIDGETS
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/app/dashboard/stats/Stats.tsx

"use client";

import React from 'react';
import { StatsCacheProvider } from '@/lib/hooks/useStatsCache';
import { 
  SubredditStatsWidget, 
  StoryHistoryStatsWidget, 
  CombinedContentStatsWidget, 
  SubredditMemberStatsWidget,
  ContentCorrelationWidget,
  PostRankingsWidget,
  MetricScoringWidget,
  TopPostsBySubredditWidget,
  // Trading Metrics
  MarketSentimentWidget,
  MomentumWidget,
  VolatilityWidget,
  TradingSignalsWidget
} from './_components';

// Stats Page with Analytics Widgets
export default function StatsPage() {
  return (
    <StatsCacheProvider>
      <main className="relative flex-1 flex flex-col bg-[#1a1a1a] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Trading Metrics Row - Day Trader Focus */}
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                📈 Trading Analytics <span className="text-xs text-muted-foreground/60 font-normal normal-case">(MQN1 NASDAQ-100)</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <MarketSentimentWidget />
                <MomentumWidget />
                <VolatilityWidget />
                <TradingSignalsWidget />
              </div>
            </section>

            {/* Content Analytics */}
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                📊 Content Analytics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                <SubredditStatsWidget />
                <StoryHistoryStatsWidget />
                <CombinedContentStatsWidget />
                <SubredditMemberStatsWidget />
                <ContentCorrelationWidget />
                <PostRankingsWidget />
                <MetricScoringWidget />
                <TopPostsBySubredditWidget />
              </div>
            </section>
          </div>
        </div>
      </main>
    </StatsCacheProvider>
  );
}