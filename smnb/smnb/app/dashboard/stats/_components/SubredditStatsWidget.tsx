'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface SubredditStat {
  subreddit: string;
  postCount: number;
  mentionCount: number;
  uniqueTickers: string[];
  avgSentiment: number;
  topMentions: Array<{ ticker: string; count: number; sentiment: number }>;
  mentionDensity: number;
  sentimentStrength: string;
  avgImpactScore: number;
  percentage: number;
}

export function SubredditStatsWidget() {
  const data = useQuery(api.stats.tradingEnhanced.getSubredditsByNasdaqMentions, { timeRange: "7d" });

  if (!data) {
    return (
      <Card className="bg-card border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            NASDAQ-100 Subreddit Activity
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
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          NASDAQ-100 Subreddit Activity
        </CardTitle>
        <CardDescription className="text-xs">
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            {data.totalMentions}
          </Badge>
          {' '}company mentions from{' '}
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            {data.totalSubreddits}
          </Badge>
          {' '}subreddits
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <div className="space-y-2 p-4">
            {data.subredditStats.map((stat: SubredditStat, index: number) => (
              <div key={stat.subreddit} className="flex items-center justify-between text-xs p-2 hover:bg-muted/20 rounded">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-muted-foreground font-mono text-[10px] w-6 text-right">
                    #{index + 1}
                  </span>
                  <div>
                    <div className="font-medium text-foreground truncate">
                      r/{stat.subreddit}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {stat.uniqueTickers.length} tickers • {stat.mentionDensity.toFixed(1)} mentions/post
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {stat.sentimentStrength !== "neutral" && (
                    <Badge 
                      variant={stat.sentimentStrength === "bullish" ? "default" : "destructive"}
                      className="text-[8px] px-1 py-0"
                    >
                      {stat.sentimentStrength}
                    </Badge>
                  )}
                  <div className="text-right">
                    <div className="font-bold text-emerald-400">
                      {stat.mentionCount}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      mentions
                    </div>
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