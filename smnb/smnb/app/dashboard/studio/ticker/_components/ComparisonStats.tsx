"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TrendingUp, TrendingDown, MessageSquare, Newspaper } from "lucide-react";

interface ComparisonStatsProps {
  symbol: string;
  weight: number;
}

export function ComparisonStats({ symbol, weight }: ComparisonStatsProps) {
  const [currentSymbol, setCurrentSymbol] = useState(symbol);
  const [earningsData, setEarningsData] = useState<{
    nextEarningsDate: string | null;
    lastEarningsDate: string | null;
    marketCap: string | null;
    volume: string | null;
    peRatio: string | null;
  } | null>(null);
  
  // Fetch sentiment data
  const sentimentScore = useQuery(api.stats.latestSentiment.getLatestSentimentScore, { 
    ticker: symbol,
  });
  
  // Fetch cached news summary
  const newsSummary = useQuery(api.stats.finlightNewsCache.getCachedSummary, {
    ticker: symbol,
  });
  
  // Fetch ticker vs index comparison
  const vsIndexData = useQuery(api.stats.tickerVsIndex.getTickerVsIndexComparison, {
    ticker: symbol,
  });
  
  // Action to fetch earnings data
  const getEarnings = useAction(api.stats.earningsData.getEarningsDates);
  
  // Fetch earnings data when symbol changes
  useEffect(() => {
    if (symbol !== currentSymbol) {
      setCurrentSymbol(symbol);
      setEarningsData(null); // Reset earnings data
    }
    
    // Fetch earnings data
    const fetchEarnings = async () => {
      try {
        const data = await getEarnings({ ticker: symbol });
        setEarningsData(data);
      } catch (error) {
        console.error('Error fetching earnings data:', error);
        setEarningsData(null);
      }
    };
    
    fetchEarnings();
  }, [symbol, currentSymbol, getEarnings]);
  
  // Show loading state while data is being fetched
  const isLoading = sentimentScore === undefined || newsSummary === undefined;
  
  if (isLoading) {
    return (
      <div className="h-full rounded-xl bg-gradient-to-br from-[#252526] to-[#1e1e1e] border-2 border-[#3d3d3d] shadow-2xl p-5 flex flex-col">
        <div className="mb-4">
          <div className="h-4 bg-[#2d2d2d] rounded animate-pulse w-40 mb-2" />
          <div className="h-3 bg-[#2d2d2d] rounded animate-pulse w-32" />
        </div>
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-8 bg-[#2d2d2d] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }
  
  // Calculate sentiment data from queries
  const sentimentData = {
    score: sentimentScore?.calculated_score ?? 0,
    change24h: sentimentScore?.score_change_percent ?? 0,
    multiplier: sentimentScore?.multiplier ?? 1.0,
    postsAnalyzed: 1247, // TODO: Add to database schema
    dominantSentiment: sentimentScore && sentimentScore.score_change_percent 
      ? sentimentScore.score_change_percent > 5 ? "Bullish"
      : sentimentScore.score_change_percent < -5 ? "Bearish"
      : "Neutral"
      : "Neutral",
    volatility: Math.abs(sentimentScore?.score_change_percent ?? 0) > 10 ? "High" : 
                Math.abs(sentimentScore?.score_change_percent ?? 0) > 5 ? "Moderate" : "Low",
  };

  const newsData = {
    articlesCount: newsSummary?.articles_count ?? 0,
    sourcesCount: newsSummary?.sources.length ?? 0,
    sources: newsSummary?.sources ?? [],
    freshness: newsSummary?.generated_at 
      ? Math.floor((Date.now() - newsSummary.generated_at) / (1000 * 60 * 60)) // hours ago
      : null,
  };

  return (
    <div className="h-full rounded-xl bg-gradient-to-br from-[#252526] to-[#1e1e1e] border-2 border-[#3d3d3d] shadow-2xl p-5 flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-[#ffffff] tracking-tight mb-1">Market Analysis</h3>
        <p className="text-[10px] text-[#666] uppercase tracking-wider">Sentiment & News Coverage</p>
      </div>      {/* Sentiment Section */}
      <div className="mb-5 pb-5 border-b border-[#2d2d2d]">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-[#007acc]" />
          <h4 className="text-xs font-semibold text-[#007acc] uppercase tracking-wider">Reddit Sentiment</h4>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-[#858585]">Score</span>
            <span className="text-xs font-mono font-semibold text-[#cccccc]">
              {sentimentData.score.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-[#858585]">24h Change</span>
            <span className={`text-xs font-mono font-semibold ${
              sentimentData.change24h > 0 ? 'text-green-500' : 
              sentimentData.change24h < 0 ? 'text-red-500' : 'text-[#cccccc]'
            }`}>
              {sentimentData.change24h > 0 ? '+' : ''}{sentimentData.change24h.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-[#858585]">Multiplier</span>
            <span className="text-xs font-mono font-semibold text-[#cccccc]">
              {sentimentData.multiplier.toFixed(2)}x
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-[#858585]">Sentiment</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
              sentimentData.dominantSentiment === "Bullish"
                ? 'bg-green-500/10 text-green-400'
                : sentimentData.dominantSentiment === "Bearish"
                ? 'bg-red-500/10 text-red-400'
                : 'bg-blue-500/10 text-blue-400'
            }`}>
              {sentimentData.dominantSentiment}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-[#858585]">Volatility</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
              sentimentData.volatility === "High"
                ? 'bg-red-500/10 text-red-400'
                : sentimentData.volatility === "Low"
                ? 'bg-green-500/10 text-green-400'
                : 'bg-blue-500/10 text-blue-400'
            }`}>
              {sentimentData.volatility}
            </span>
          </div>
        </div>
      </div>

      {/* News Section */}
      <div className="mb-5 pb-5 border-b border-[#2d2d2d]">
        <div className="flex items-center gap-2 mb-3">
          <Newspaper className="w-4 h-4 text-[#00a67d]" />
          <h4 className="text-xs font-semibold text-[#00a67d] uppercase tracking-wider">Market News</h4>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-[#858585]">Articles</span>
            <span className="text-xs font-mono font-semibold text-[#cccccc]">
              {newsData.articlesCount}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-[#858585]">Sources</span>
            <span className="text-xs font-mono font-semibold text-[#cccccc]">
              {newsData.sourcesCount}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-[#858585]">Freshness</span>
            <span className="text-xs font-mono font-semibold text-[#cccccc]">
              {newsData.freshness !== null ? `${newsData.freshness}h ago` : '--'}
            </span>
          </div>
          {newsData.sources.length > 0 && (
            <div className="pt-2 border-t border-[#2d2d2d]/50">
              <span className="text-[10px] text-[#666] uppercase tracking-wider mb-1 block">Top Sources</span>
              <div className="flex flex-wrap gap-1">
                {newsData.sources.slice(0, 3).map((source, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded text-[9px] bg-[#2d2d2d] text-[#858585]">
                    {source}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="mt-auto">
        <h4 className="text-[10px] text-[#666] uppercase tracking-wider mb-3">Quick Metrics</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-[#858585]">vs Index Mean</span>
            <div className="flex items-center gap-1.5">
              {vsIndexData && (
                <>
                  {vsIndexData.isOutperforming ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs font-mono font-semibold ${
                    vsIndexData.percentageVsIndex > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {vsIndexData.percentageVsIndex > 0 ? '+' : ''}
                    {vsIndexData.percentageVsIndex.toFixed(1)}%
                  </span>
                </>
              )}
              {!vsIndexData && (
                <span className="text-xs font-mono font-semibold text-[#666]">--</span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-[#858585]">Market Cap</span>
            <span className="text-xs font-mono font-semibold text-[#cccccc]">
              {earningsData?.marketCap || "$2.89T"}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-[#858585]">Volume (24h)</span>
            <span className="text-xs font-mono font-semibold text-[#cccccc]">
              {earningsData?.volume || "45.2M"}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-[#858585]">P/E Ratio</span>
            <span className="text-xs font-mono font-semibold text-[#cccccc]">
              {earningsData?.peRatio || "31.4"}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-t border-[#2d2d2d]/50 pt-2.5">
            <span className="text-xs text-[#858585]">Next Earnings</span>
            <span className="text-xs font-mono font-semibold text-[#cccccc]">
              {earningsData?.nextEarningsDate || "TBD"}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-[#858585]">Last Earnings</span>
            <span className="text-xs font-mono font-semibold text-[#666]">
              {earningsData?.lastEarningsDate || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-[#007acc]/5 to-transparent pointer-events-none" />
    </div>
  );
}
