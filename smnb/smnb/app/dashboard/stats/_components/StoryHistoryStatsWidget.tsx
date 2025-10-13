'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, TrendingUp } from 'lucide-react';

interface StorySubredditStat {
  subreddit: string;
  storyCount: number;
  mentionedTickers: string[];
  avgImpactScore: number;
  sentiment: string;
  viralityPotential: number;
  percentage: number;
}

export function StoryHistoryStatsWidget() {
  const data = useQuery(api.stats.tradingEnhanced.getStoryHistoryByNasdaqMentions);

  if (!data) {
    return (
      <Card className="bg-card border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <BookOpen className="w-4 h-4" />
            NASDAQ-100 Story Distribution
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
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          NASDAQ-100 Story Distribution
        </CardTitle>
        <CardDescription className="text-xs">
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            {data.storiesWithMentions}
          </Badge>
          {' '}stories with ticker mentions •{' '}
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            {data.correlationRate.toFixed(1)}%
          </Badge>
          {' '}correlation rate
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <div className="space-y-2 p-4">
            {data.subredditStats.length > 0 ? (
              data.subredditStats.map((stat: StorySubredditStat, index: number) => (
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
                        {stat.mentionedTickers.length} tickers • Impact: {stat.avgImpactScore.toFixed(0)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge 
                      variant={stat.sentiment === "bullish" ? "default" : 
                              stat.sentiment === "bearish" ? "destructive" : "outline"}
                      className="text-[10px] px-1.5 py-0.5"
                    >
                      {stat.sentiment}
                    </Badge>
                    <div className="text-right">
                      <div className="font-bold text-orange-400 flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        {stat.viralityPotential.toFixed(0)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {stat.storyCount} stories
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground text-xs py-8">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No stories with NASDAQ-100 mentions found</p>
                <p className="text-[10px] mt-1">Stories will appear here as they are generated</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}