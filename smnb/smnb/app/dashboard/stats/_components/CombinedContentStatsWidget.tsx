'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers3 } from 'lucide-react';

interface CombinedContentStat {
  subreddit: string;
  postCount: number;
  storyCount: number;
  totalContent: number;
  percentage: number;
}

export function CombinedContentStatsWidget() {
  const data = useQuery(api.stats.subredditStats.getCombinedContentStats);

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
          Total Content Distribution
        </CardTitle>
        <CardDescription className="text-xs">
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            {data.totalContent}
          </Badge>
          {' '}pieces from{' '}
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
              <div key={stat.subreddit} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-muted-foreground font-mono text-[10px] w-6 text-right">
                    #{index + 1}
                  </span>
                  <span className="font-medium text-foreground truncate">
                    r/{stat.subreddit}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="px-1 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                      {stat.postCount}p
                    </span>
                    <span className="px-1 py-0.5 bg-orange-500/20 text-orange-400 rounded">
                      {stat.storyCount}s
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 transition-all duration-300"
                      style={{ width: `${Math.max(stat.percentage, 2)}%` }}
                    />
                  </div>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 min-w-[2rem] text-center">
                    {stat.percentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}