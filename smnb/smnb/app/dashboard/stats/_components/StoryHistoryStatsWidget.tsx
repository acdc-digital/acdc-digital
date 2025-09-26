'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';

interface StorySubredditStat {
  subreddit: string;
  storyCount: number;
  percentage: number;
}

export function StoryHistoryStatsWidget() {
  const data = useQuery(api.stats.subredditStats.getStoryHistorySubredditStats);

  if (!data) {
    return (
      <Card className="bg-card border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <BookOpen className="w-4 h-4" />
            Story History Distribution
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
          Story History Distribution
        </CardTitle>
        <CardDescription className="text-xs">
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            {data.totalStories}
          </Badge>
          {' '}stories from{' '}
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            {data.totalSubreddits}
          </Badge>
          {' '}subreddits
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <div className="space-y-2 p-4">
            {data.subredditStats.length > 0 ? (
              data.subredditStats.map((stat: StorySubredditStat, index: number) => (
                <div key={stat.subreddit} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-muted-foreground font-mono text-[10px] w-6 text-right">
                      #{index + 1}
                    </span>
                    <span className="font-medium text-foreground truncate">
                      r/{stat.subreddit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 transition-all duration-300"
                        style={{ width: `${Math.max(stat.percentage, 2)}%` }}
                      />
                    </div>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 min-w-[2rem] text-center">
                      {stat.storyCount}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground text-xs py-8">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No stories with subreddit data found</p>
                <p className="text-[10px] mt-1">Stories will appear here as they are generated</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}