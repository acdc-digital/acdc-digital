'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface SubredditMemberStat {
  subreddit: string;
  subscribers: number;
  description?: string;
  isActive: boolean;
  postCount: number;
  storyCount: number;
  totalContent: number;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K';
  }
  return num.toString();
}

export function SubredditMemberStatsWidget() {
  const data = useQuery(api.stats.subredditStats.getSubredditMemberStats);

  if (!data) {
    return (
      <Card className="bg-card border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Users className="w-4 h-4" />
            Subreddit Members
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
          <Users className="w-4 h-4 text-muted-foreground" />
          Subreddit Members
        </CardTitle>
        <CardDescription className="text-xs">
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            {data.totalContent}
          </Badge>
          {' '}total pieces from{' '}
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            {data.totalSubreddits}
          </Badge>
          {' '}subreddits
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <div className="space-y-2 p-4">
            {data.subredditMemberStats.map((stat: SubredditMemberStat, index: number) => (
              <div key={stat.subreddit} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-muted-foreground font-mono text-[10px] w-6 text-right">
                    #{index + 1}
                  </span>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-medium text-foreground truncate">
                      r/{stat.subreddit}
                    </span>
                    {stat.description && (
                      <span className="text-[10px] text-muted-foreground truncate">
                        {stat.description}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="px-1 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                      {stat.postCount}p
                    </span>
                    <span className="px-1 py-0.5 bg-orange-500/20 text-orange-400 rounded">
                      {stat.storyCount}s
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-emerald-400 text-xs">
                      {formatNumber(stat.subscribers)}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {stat.totalContent} pieces
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