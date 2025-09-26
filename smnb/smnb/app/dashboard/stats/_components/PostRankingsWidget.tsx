'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  qualityScore?: number;
  engagementScore?: number;
  priorityScore?: number;
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

export function PostRankingsWidget() {
  const data = useQuery(api.stats.subredditStats.getPostRankings);

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
          Post Rankings
        </CardTitle>
        <CardDescription className="text-xs">
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            {data.totalPosts}
          </Badge>
          {' '}posts ranked by performance score
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <div className="space-y-1 p-4">
            {/* Header Row */}
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium border-b border-border/50 pb-2 mb-2">
              <div className="w-8 text-center">Rank</div>
              <div className="w-4"></div> {/* Trend icon */}
              <div className="flex-1 min-w-0">Subreddit / Post Title</div>
              <div className="w-16 text-right">Score</div>
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
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <a 
                      href={post.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground hover:text-blue-400 transition-colors truncate max-w-[500px] text-[11px] font-medium"
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
                  </div>
                </div>
                
                {/* Performance Score */}
                <div className="w-16 text-right">
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] px-1.5 py-0 ${getScoreColor(post.overallScore, maxScore, minScore)}`}
                  >
                    {post.overallScore.toFixed(1)}
                  </Badge>
                  {post.qualityScore !== undefined && (
                    <div className="text-[8px] text-muted-foreground mt-0.5">
                      Q:{post.qualityScore.toFixed(0)} E:{post.engagementScore?.toFixed(0) || 0}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}