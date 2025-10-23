'use client';

import React from 'react';
import { api } from '@/convex/_generated/api';
import { useCachedQuery } from '@/lib/hooks/useStatsCache';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { TrendingUp, TrendingDown, Minus, BarChart3, ExternalLink } from 'lucide-react';

interface PostRanking {
  id: string;
  title: string;
  subreddit: string;
  author: string;
  url: string;
  permalink: string;
  score: number;
  num_comments: number;
  created_utc: number;
  mentionedTickers: Array<{ ticker: string; sentiment: string; confidence: number; impactScore: number }>;
  tradingRelevance: number;
  marketImpact: string;
  overallSentiment: string;
  overallScore: number;
  rank: number;
  rankChange: "up" | "down" | "stable";
}

function truncateTitle(title: string, maxLength: number = 60): string {
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength) + '...';
}

function getRankChangeIcon(change: "up" | "down" | "stable") {
  switch (change) {
    case "up":
      return <TrendingUp className="w-3 h-3 text-green-400" />;
    case "down":
      return <TrendingDown className="w-3 h-3 text-red-400" />;
    case "stable":
      return <Minus className="w-3 h-3 text-muted-foreground" />;
  }
}

function getScoreColor(score: number, maxScore: number, minScore: number): string {
  const normalizedScore = (score - minScore) / (maxScore - minScore);
  if (normalizedScore > 0.8) return 'text-green-400 border-green-400/50';
  if (normalizedScore > 0.6) return 'text-blue-400 border-blue-400/50';
  if (normalizedScore > 0.4) return 'text-yellow-400 border-yellow-400/50';
  if (normalizedScore > 0.2) return 'text-orange-400 border-orange-400/50';
  return 'text-red-400 border-red-400/50';
}

function getMarketImpactColor(impact: string): string {
  if (impact === "high") return 'text-red-400 border-red-400/50';
  if (impact === "medium") return 'text-yellow-400 border-yellow-400/50';
  return 'text-blue-400 border-blue-400/50';
}

export function PostRankingsWidget() {
  const data = useCachedQuery(
    api.stats.tradingEnhanced.getTradingPostRankings,
    {},
    "post-rankings"
  );

  if (!data) {
    return (
      <Card className="bg-card border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <BarChart3 className="w-4 h-4" />
            Post Rankings
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

  const maxScore = Math.max(...data.posts.map(p => p.overallScore));
  const minScore = Math.min(...data.posts.map(p => p.overallScore));

  return (
    <Card className="bg-card border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-card-foreground">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          Trading Post Rankings
        </CardTitle>
        <CardDescription className="text-xs">
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            {data.totalPosts}
          </Badge>
          {' '}posts ranked by trading relevance & sentiment
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <div className="space-y-1 p-4">
            {/* Header Row */}
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium border-b border-border/50 pb-2 mb-2">
              <div className="w-8 text-center">Rank</div>
              <div className="w-4"></div> {/* Trend icon */}
              <div className="flex-1 min-w-0">Subreddit / Post Title / Tickers</div>
              <div className="w-24 text-right">Trading / Impact</div>
            </div>
            
            {/* Post Rows */}
            {data.posts.map((post: PostRanking) => (
              <div key={post.id} className="flex items-center gap-2 text-xs hover:bg-muted/20 rounded px-1 py-1.5">
                {/* Rank */}
                <div className="w-8 text-center">
                  <span className="text-muted-foreground font-mono text-[10px]">
                    #{post.rank}
                  </span>
                </div>
                
                {/* Trend Indicator */}
                <div className="w-4 flex justify-center">
                  {getRankChangeIcon(post.rankChange)}
                </div>
                
                {/* Subreddit & Post Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 text-[10px] font-medium">
                      r/{post.subreddit}
                    </span>
                    <span className="text-muted-foreground text-[8px]">•</span>
                    <span className="text-muted-foreground text-[10px]">
                      u/{post.author}
                    </span>
                    {post.overallSentiment !== "neutral" && (
                      <Badge 
                        variant={post.overallSentiment === "bullish" ? "default" : "destructive"}
                        className="text-[8px] px-1 py-0"
                      >
                        {post.overallSentiment}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <a 
                      href={post.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground hover:text-blue-400 transition-colors truncate max-w-[400px] text-[11px] font-medium"
                      title={post.title}
                    >
                      {truncateTitle(post.title)}
                    </a>
                    <ExternalLink className="w-2.5 h-2.5 text-muted-foreground flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-muted-foreground">
                      {post.score} pts • {post.num_comments} comments
                    </span>
                    {post.mentionedTickers.length > 0 && (
                      <>
                        <span className="text-muted-foreground text-[8px]">|</span>
                        <div className="flex gap-1">
                          {post.mentionedTickers.slice(0, 3).map((ticker, idx) => (
                            <Badge key={`${post.id}-${ticker.ticker}-${idx}`} variant="outline" className="text-[8px] px-1 py-0">
                              ${ticker.ticker}
                            </Badge>
                          ))}
                          {post.mentionedTickers.length > 3 && (
                            <span className="text-[8px] text-muted-foreground">+{post.mentionedTickers.length - 3}</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Trading Metrics */}
                <div className="w-24 text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] px-1.5 py-0 ${getScoreColor(post.overallScore, maxScore, minScore)}`}
                    >
                      {post.overallScore.toFixed(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 justify-end mt-0.5">
                    <span className="text-[8px] text-muted-foreground">TR:</span>
                    <Badge 
                      variant="outline" 
                      className={`text-[8px] px-1 py-0 ${getMarketImpactColor(post.marketImpact)}`}
                    >
                      {post.tradingRelevance.toFixed(0)}
                    </Badge>
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