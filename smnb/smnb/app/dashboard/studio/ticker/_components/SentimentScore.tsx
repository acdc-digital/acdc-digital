"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface SentimentScoreProps {
  symbol: string;
  weight: number; // Percentage weight in the index (0-100)
  className?: string;
  isActive?: boolean; // Only query when parent component is active
}

// Total sentiment pool = 288,878 points to distribute
// Apple (9% weight) gets ~25,999 at baseline (1.0x multiplier)
// Based on 30-day Reddit sentiment analysis (calculated once per day)
const TOTAL_SENTIMENT_POOL = 288878;

export function SentimentScore({ symbol, weight, className = "", isActive = true }: SentimentScoreProps) {
  // Fetch stored sentiment score from database (updated once per day by cron job)
  // Only query when component is active to prevent concurrent query overload
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storedScore = useQuery(
    (api as any)["stats/latestSentiment"].getLatestSentimentScore,
    isActive ? { ticker: symbol } : "skip"
  );
  
  const calculateSentimentScore = React.useMemo(() => {
    // Use the stored calculated_score from the database
    if (!storedScore) return null;
    return storedScore.calculated_score;
  }, [storedScore]);
  
  const formatSentimentScore = (score: number | null) => {
    if (score === null) return "—";
    
    // Format as xx,xxx.xx
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(score);
  };
  
  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-[#858585]";
    
    // Calculate performance relative to base allocation
    const baseAllocation = (weight / 100) * TOTAL_SENTIMENT_POOL;
    const performance = score / baseAllocation;
    
    if (performance >= 1.2) return "text-green-500"; // Outperforming by 20%+
    if (performance >= 1.05) return "text-green-400"; // Slightly outperforming
    if (performance >= 0.95) return "text-[#cccccc]"; // Neutral
    if (performance >= 0.8) return "text-orange-400"; // Slightly underperforming
    return "text-red-500"; // Significantly underperforming
  };
  
  return (
    <span className={`font-sans text-xs ${getScoreColor(calculateSentimentScore)} ${className}`}>
      {formatSentimentScore(calculateSentimentScore)}
    </span>
  );
}

// Hook to get all sentiment scores for validation
export function useAllSentimentScores(stocks: Array<{ symbol: string; weight: number }>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allStats = useQuery((api as any)["stats/sentimentQueries"].getAllTickerStats, {
    tickers: stocks.map((s) => s.symbol),
    timeRange: 8760, // 365 days * 24 hours
  });
  
  return React.useMemo(() => {
    if (!allStats) return null;
    
    // Define the stat type
    type TickerStat = {
      ticker: string;
      mentionCount: number;
      averageSentiment: number;
      totalEngagement: number;
      momentum: number;
      lastUpdated: number;
    };
    
    // Create a map for faster lookup
    const statsMap = new Map<string, TickerStat>(
      allStats.map((stat: TickerStat) => [stat.ticker, stat])
    );
    
    const scores = stocks.map(stock => {
      const stats = statsMap.get(stock.symbol);
      
      if (!stats) {
        return {
          symbol: stock.symbol,
          score: (stock.weight / 100) * TOTAL_SENTIMENT_POOL, // Base allocation if no data
          weight: stock.weight,
        };
      }
      
      const baseAllocation = (stock.weight / 100) * TOTAL_SENTIMENT_POOL;
      
      // Same calculation logic as above
      const mentionScore = Math.min(stats.mentionCount / 100, 1) * 0.2;
      const sentimentScore = stats.averageSentiment * 0.4;
      const engagementScore = Math.min(stats.totalEngagement / 10000, 1) * 0.2;
      const momentumScore = ((Math.max(-100, Math.min(100, stats.momentum)) + 100) / 200) * 0.2;
      
      const multiplier = 0.5 + mentionScore + sentimentScore + engagementScore + momentumScore;
      const finalScore = baseAllocation * multiplier;
      
      return {
        symbol: stock.symbol,
        score: finalScore,
        weight: stock.weight,
      };
    });
    
    const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
    
    return {
      scores,
      total: totalScore,
      targetTotal: TOTAL_SENTIMENT_POOL,
      variance: ((totalScore - TOTAL_SENTIMENT_POOL) / TOTAL_SENTIMENT_POOL * 100).toFixed(2),
    };
  }, [stocks, allStats]);
}
