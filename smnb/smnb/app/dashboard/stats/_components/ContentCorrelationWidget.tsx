'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface SubredditCorrelation {
  subreddit: string;
  postCount: number;
  storyCount: number;
  mentionCount: number;
  uniqueTickers: number;
  conversionRate: number;
  tradingRelevance: number;
  avgImpactScore: number;
  sentimentStrength: string;
}

export function ContentCorrelationWidget() {
  const data = useQuery(api.stats.tradingEnhanced.getTradingContentCorrelation);

  if (!data) {
    return (
      <Card className="bg-card border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            Trading Correlation
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
          Trading Correlation
        </CardTitle>
        <CardDescription className="text-xs">
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            {data.tradingRelevanceRate.toFixed(1)}%
          </Badge>
          {' '}posts have NASDAQ-100 mentions
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <div className="space-y-2 p-4">
            {data.subredditCorrelations.map((stat: SubredditCorrelation, index: number) => (
              <div key={stat.subreddit} className="flex items-center justify-between text-xs p-2 hover:bg-muted/20 rounded">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-muted-foreground font-mono text-[10px] w-6 text-right">
                    #{index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground truncate">
                      r/{stat.subreddit}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                      <span>{stat.postCount} posts → {stat.storyCount} stories</span>
                      <span className="text-[8px]">•</span>
                      <span>{stat.uniqueTickers} tickers</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {stat.sentimentStrength !== "neutral" && (
                    <Badge 
                      variant={stat.sentimentStrength === "bullish" ? "default" : "destructive"}
                      className="text-[8px] px-1 py-0"
                    >
                      {stat.sentimentStrength}
                    </Badge>
                  )}
                  <div className="flex items-center gap-1 text-[9px]">
                    <span className="text-muted-foreground">TR:</span>
                    <Badge 
                      variant="outline" 
                      className={`text-[9px] px-1 py-0 ${
                        stat.tradingRelevance >= 70 ? 'text-green-400 border-green-400/50' :
                        stat.tradingRelevance >= 50 ? 'text-yellow-400 border-yellow-400/50' :
                        stat.tradingRelevance >= 30 ? 'text-orange-400 border-orange-400/50' :
                        'text-red-400 border-red-400/50'
                      }`}
                    >
                      {stat.tradingRelevance.toFixed(0)}
                    </Badge>
                  </div>
                  <div className="text-[9px] text-muted-foreground">
                    Impact: {stat.avgImpactScore.toFixed(0)}
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