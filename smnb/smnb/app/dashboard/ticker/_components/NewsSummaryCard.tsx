"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Newspaper, RefreshCw } from "lucide-react";
import { Response } from "../../../components/ai/response";
import { useTickerContext } from "../_context/TickerContext";

interface NewsSummaryCardProps {
  symbol: string;
  weight: number;
}

export function NewsSummaryCard({ symbol, weight }: NewsSummaryCardProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { hasAttemptedGeneration, markGenerationAttempted } = useTickerContext();
  
  const newsSummary = useQuery(api.stats.finlightNewsCache.getCachedSummary, {
    ticker: symbol,
  });

  // Action to regenerate news summary
  const generateNews = useAction(api.stats.finlightNews.generateNewsSummary);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await generateNews({ ticker: symbol, weight });
    } catch (error) {
      // Connection errors are expected with long-running actions - treat as warnings
      if (error instanceof Error && error.message.includes('Connection lost')) {
        console.warn(`⚠️ News generation for ${symbol} may still be processing (connection timeout)`);
      } else {
        console.error("Error regenerating news:", error);
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  // Auto-generate on first load if no cached data and haven't attempted this ticker yet
  useEffect(() => {
    if (!newsSummary && !isRegenerating && !hasAttemptedGeneration(symbol, 'news')) {
      markGenerationAttempted(symbol, 'news');
      handleRegenerate();
    }
  }, [newsSummary, isRegenerating, symbol]);

  if (!newsSummary) {
    return (
      <div className="h-full rounded-xl bg-gradient-to-br from-[#252526] to-[#1e1e1e] border-2 border-[#3d3d3d] shadow-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-[#00a67d]" />
            <h4 className="text-sm font-semibold text-[#00a67d] uppercase tracking-wider">News Summary</h4>
          </div>
        </div>
        <div className="h-20 bg-[#2d2d2d] rounded animate-pulse" />
      </div>
    );
  }

  // Extract the full summary
  const fullSummary = newsSummary.summary;
  
  // Calculate freshness
  const hoursAgo = Math.floor((Date.now() - newsSummary.generated_at) / (1000 * 60 * 60));
  const freshness = hoursAgo < 1 ? "just now" :
                    hoursAgo === 1 ? "1 hour ago" :
                    hoursAgo < 24 ? `${hoursAgo} hours ago` :
                    `${Math.floor(hoursAgo / 24)} days ago`;

  return (
    <div className="h-full flex flex-col rounded-xl bg-gradient-to-br from-[#252526] to-[#1e1e1e] border-2 border-[#3d3d3d] shadow-xl p-4 relative overflow-hidden">
      <div className="flex-shrink-0 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-[#00a67d]" />
          <h4 className="text-sm font-semibold text-[#00a67d] uppercase tracking-wider">News Summary</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#666] bg-[#2d2d2d] px-2 py-0.5 rounded">
            {newsSummary.articles_count} articles · {freshness}
          </span>
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="p-1.5 rounded-md hover:bg-[#2d2d2d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Regenerate summary"
          >
            <RefreshCw 
              className={`w-3.5 h-3.5 text-[#00a67d] ${isRegenerating ? 'animate-spin' : ''}`} 
            />
          </button>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-[#3d3d3d] scrollbar-track-transparent">
        <Response className="text-sm text-[#cccccc] leading-relaxed prose prose-invert max-w-none prose-headings:text-[#00a67d] prose-headings:font-semibold prose-p:my-2">
          {fullSummary}
        </Response>
      </div>

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-[#00a67d]/5 to-transparent pointer-events-none" />
    </div>
  );
}
