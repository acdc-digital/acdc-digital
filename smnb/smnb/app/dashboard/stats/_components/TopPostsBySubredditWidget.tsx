'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, ExternalLink, Star } from 'lucide-react';

interface TopPostBySubreddit {
  subreddit: string;
  subredditRank: number;
  overallScore: number;
  tier: "Tier 1" | "Tier 2" | "Tier 3" | "Tier 4";
  topPost?: {
    id: string;
    title: string;
    author: string;
    url: string;
    permalink: string;
    score: number;
    num_comments: number;
    overallScore: number;
    postRank: number;
    mentionCount: number;
    topTickers: string[];
  };
  totalPosts: number;
  totalStories: number;
  totalMentions: number;
}

function truncateTitle(title: string, maxLength: number = 45): string {
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength) + '...';
}

function getTierColor(tier: string): string {
  switch (tier) {
    case "Tier 1": return "text-green-400 border-green-400/50";
    case "Tier 2": return "text-blue-400 border-blue-400/50";
    case "Tier 3": return "text-yellow-400 border-yellow-400/50";
    case "Tier 4": return "text-red-400 border-red-400/50";
    default: return "text-muted-foreground border-muted-foreground/50";
  }
}

function getTierIcon(tier: string) {
  const starCount = tier === "Tier 1" ? 4 : tier === "Tier 2" ? 3 : tier === "Tier 3" ? 2 : 1;
  
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: starCount }).map((_, i) => (
        <Star key={i} className="w-2 h-2 text-yellow-400 fill-yellow-400" />
      ))}
    </div>
  );
}

export function TopPostsBySubredditWidget() {
  const data = useQuery(api.stats.tradingEnhanced.getTopTradingPostsBySubreddit);

  if (!data) {
    return (
      <Card className="bg-card border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Crown className="w-4 h-4" />
            Top Posts by Subreddit
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
          <Crown className="w-4 h-4 text-muted-foreground" />
          Top Trading Posts by Subreddit
        </CardTitle>
        <CardDescription className="text-xs">
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            {data.totalSubreddits}
          </Badge>
          {' '}subreddits with top NASDAQ-100 mention posts
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <div className="space-y-1 p-4">
            {data.topPostsBySubreddit.map((item: TopPostBySubreddit) => (
              <div key={item.subreddit} className="text-xs">
                {/* Subreddit Header */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-muted-foreground font-mono text-[10px] w-6 text-right">
                      #{item.subredditRank}
                    </span>
                    <span className="font-medium text-purple-400 text-[11px]">
                      r/{item.subreddit}
                    </span>
                    {getTierIcon(item.tier)}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge 
                      variant="outline" 
                      className={`text-[9px] px-1 py-0 ${getTierColor(item.tier)}`}
                    >
                      {item.overallScore.toFixed(1)}
                    </Badge>
                  </div>
                </div>
                
                {/* Top Post */}
                {item.topPost ? (
                  <div className="ml-8 bg-muted/20 rounded px-2 py-1">
                    <div className="flex items-start gap-1">
                      <span className="text-[9px] text-muted-foreground font-mono min-w-fit">
                        #{item.topPost.postRank}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <a 
                            href={item.topPost.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground hover:text-blue-400 transition-colors text-[10px] font-medium leading-tight"
                            title={item.topPost.title}
                          >
                            {truncateTitle(item.topPost.title)}
                          </a>
                          <ExternalLink className="w-2 h-2 text-muted-foreground flex-shrink-0" />
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[8px] text-muted-foreground">
                            u/{item.topPost.author}
                          </span>
                          <span className="text-[8px] text-muted-foreground">•</span>
                          <span className="text-[8px] text-muted-foreground">
                            {item.topPost.score} pts • {item.topPost.num_comments} comments
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                          {item.topPost.topTickers?.slice(0, 5).map((ticker, idx) => (
                            <Badge key={`${item.topPost?.id}-${ticker}-${idx}`} variant="secondary" className="text-[7px] px-1 py-0">
                              ${ticker}
                            </Badge>
                          ))}
                          {(item.topPost.topTickers?.length || 0) > 5 && (
                            <span className="text-[7px] text-muted-foreground">+{(item.topPost.topTickers?.length || 0) - 5}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Badge variant="secondary" className="text-[8px] px-1 py-0">
                          {item.topPost.overallScore.toFixed(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="ml-8 text-[10px] text-muted-foreground italic">
                    No posts available
                  </div>
                )}
                
                {/* Trading Stats */}
                <div className="ml-8 mt-1 flex items-center gap-2 text-[8px] text-muted-foreground">
                  <span>{item.totalPosts}p • {item.totalStories}s</span>
                  <span>•</span>
                  <span>{item.totalMentions} mentions</span>
                  {item.topPost?.topTickers && item.topPost.topTickers.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-purple-400">Top: ${item.topPost.topTickers[0]}</span>
                    </>
                  )}
                </div>
                
                {/* Separator */}
                <div className="border-b border-border/20 mt-2"></div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}