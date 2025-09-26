'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SubredditScore {
  subreddit: string;
  storyYield: number;
  feedContribution: number;
  engagementPotential: number;
  relevanceConsistency: number;
  noveltyIndex: number;
  trendPropagation: number;
  volumeReliability: number;
  signalDensity: number;
  conversionMomentum: number;
  overallScore: number;
  tier: "Tier 1" | "Tier 2" | "Tier 3" | "Tier 4";
  posts: number;
  stories: number;
}

function getTierIcon(tier: string) {
  const starCount = tier === "Tier 1" ? 4 : tier === "Tier 2" ? 3 : tier === "Tier 3" ? 2 : 1;
  
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <Star 
          key={i} 
          className={`w-2.5 h-2.5 ${i < starCount ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`} 
        />
      ))}
    </div>
  );
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

function getMomentumIcon(momentum: number) {
  if (momentum > 55) return <TrendingUp className="w-3 h-3 text-green-400" />;
  if (momentum < 45) return <TrendingDown className="w-3 h-3 text-red-400" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-blue-400";
  if (score >= 40) return "text-yellow-400";
  if (score >= 20) return "text-orange-400";
  return "text-red-400";
}

export function MetricScoringWidget() {
  const data = useQuery(api.stats.subredditStats.getMetricScoringMatrix);

  if (!data) {
    return (
      <Card className="bg-card border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Calculator className="w-4 h-4" />
            Metric Scoring Matrix
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
          <Calculator className="w-4 h-4 text-muted-foreground" />
          Metric Scoring Matrix
        </CardTitle>
        <CardDescription className="text-xs">
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            9 metrics
          </Badge>
          {' '}performance analysis per subreddit
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <div className="space-y-2 p-4">
            {data.subredditScores.map((score: SubredditScore, index: number) => (
              <div key={score.subreddit} className="text-xs">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-muted-foreground font-mono text-[10px] w-6 text-right">
                      #{index + 1}
                    </span>
                    <span className="font-medium text-foreground truncate">
                      r/{score.subreddit}
                    </span>
                    {getTierIcon(score.tier)}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getMomentumIcon(score.conversionMomentum)}
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] px-1.5 py-0 ${getTierColor(score.tier)}`}
                    >
                      {score.overallScore.toFixed(1)}
                    </Badge>
                  </div>
                </div>
                
                {/* Key Metrics Row */}
                <div className="grid grid-cols-3 gap-2 text-[9px] text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>SY</span>
                    <span className={getScoreColor(score.storyYield)}>{score.storyYield.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>RC</span>
                    <span className={getScoreColor(score.relevanceConsistency)}>{score.relevanceConsistency.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>EP</span>
                    <span className={getScoreColor(score.engagementPotential)}>{score.engagementPotential.toFixed(1)}</span>
                  </div>
                </div>
                
                {/* Progress Bars */}
                {/* Metric Indicators */}
                <div className="mt-1">
                  <div className="flex items-center gap-1 text-[8px]">
                    <div className="flex items-center gap-0.5">
                      <div className={`w-1 h-1 rounded-full ${score.storyYield > 50 ? 'bg-purple-500' : 'bg-muted'}`} />
                      <span>SY</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <div className={`w-1 h-1 rounded-full ${score.relevanceConsistency > 50 ? 'bg-blue-500' : 'bg-muted'}`} />
                      <span>RC</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <div className={`w-1 h-1 rounded-full ${score.engagementPotential > 50 ? 'bg-green-500' : 'bg-muted'}`} />
                      <span>EP</span>
                    </div>
                  </div>
                </div>                {/* Stats Summary */}
                <div className="flex items-center justify-between mt-1 text-[8px] text-muted-foreground">
                  <span>{score.posts}p → {score.stories}s</span>
                  <span>FC:{score.feedContribution.toFixed(1)}% • NI:{score.noveltyIndex.toFixed(1)}%</span>
                </div>
                
                {/* Separator */}
                {index < data.subredditScores.length - 1 && (
                  <div className="border-b border-border/30 mt-2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}