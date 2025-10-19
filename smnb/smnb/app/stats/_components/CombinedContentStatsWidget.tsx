'use client';

import React from 'react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers3 } from 'lucide-react';
import { useCachedQuery } from '@/lib/hooks/useStatsCache';

interface CombinedContentStat {
  subreddit: string;
  postCount: number;
  storyCount: number;
  totalContent: number;
  percentage: number;
  mentions: number;
  uniqueTickers: number;
  avgImpactScore: number;
  tradingRelevance: number;
  overallSentiment: string;
}

export function CombinedContentStatsWidget() {
  const data = useCachedQuery(
    api.stats.tradingEnhanced.getTradingCombinedContentStats,
    {},
    "combined-content-stats"
  );

  if (!data) {
    return (
      <Card className="bg-card border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Layers3 className="w-4 h-4" />
            Total Content Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="animate-pulse space-y-2">
            <div className="h-3 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-card-foreground">
          <Layers3 className="w-4 h-4 text-muted-foreground" />
          Trading Content Distribution
        </CardTitle>
        <CardDescription className="text-xs">
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            {data.totalContent}
          </Badge>
          {' '}pieces •{' '}
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            {data.totalMentions}
          </Badge>
          {' '}mentions from{' '}
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            {data.totalSubreddits}
          </Badge>
          {' '}subreddits
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <div className="space-y-2 p-4">
            {data.contentStats.map((stat: CombinedContentStat, index: number) => (
              <div key={stat.subreddit} className="flex items-center justify-between text-xs p-2 hover:bg-muted/20 rounded transition-colors">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-muted-foreground font-mono text-[10px] w-6 text-right">
                    #{index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground truncate">
                      r/{stat.subreddit}
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground mt-0.5">
                      <span className="px-1 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                        {stat.postCount}p
                      </span>
                      <span className="px-1 py-0.5 bg-orange-500/20 text-orange-400 rounded">
                        {stat.storyCount}s
                      </span>
                      <span className="px-1 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                        {stat.mentions}m
                      </span>
                      {stat.overallSentiment !== 'neutral' && (
                        <Badge
                          variant={stat.overallSentiment === 'bullish' ? 'default' : 'destructive'}
                          className="text-[8px] px-1 py-0"
                        >
                          {stat.overallSentiment}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 min-w-[2.5rem] text-center">
                    {stat.percentage.toFixed(1)}%
                  </Badge>
                  <div className="flex flex-col items-end text-[8px] text-muted-foreground">
                    <span>TR: {stat.tradingRelevance.toFixed(0)}</span>
                    <span>{stat.uniqueTickers}t</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}