"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MessageSquare, RefreshCw } from "lucide-react";
import { Response } from "@/components/ai/response";
import { useTickerContext } from "../_context/TickerContext";

interface SentimentAnalysisCardProps {
  symbol: string;
  weight: number;
}

export function SentimentAnalysisCard({ symbol, weight }: SentimentAnalysisCardProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { hasAttemptedGeneration, markGenerationAttempted } = useTickerContext();
  
  // Fetch the Claude-generated sentiment excerpt
  const sentimentExcerpt = useQuery(api.stats.sentimentExcerptCache.getCachedExcerpt, {
    ticker: symbol,
  });

  // Action to regenerate sentiment excerpt
  const generateSentiment = useAction(api.stats.sentimentAnalysis.generateSentimentExcerpt);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await generateSentiment({ ticker: symbol, weight });
    } catch (error) {
      // Connection errors are expected with long-running actions - treat as warnings
      if (error instanceof Error && error.message.includes('Connection lost')) {
        console.warn(`⚠️ Sentiment generation for ${symbol} may still be processing (connection timeout)`);
      } else {
        console.error("Error regenerating sentiment:", error);
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  // Auto-generate on first load if no cached data and haven't attempted this ticker yet
  useEffect(() => {
    if (!sentimentExcerpt && !isRegenerating && !hasAttemptedGeneration(symbol, 'sentiment')) {
      markGenerationAttempted(symbol, 'sentiment');
      handleRegenerate();
    }
  }, [sentimentExcerpt, isRegenerating, symbol]);

  if (!sentimentExcerpt) {
    return (
      <div className="h-full rounded-xl bg-gradient-to-br from-[#252526] to-[#1e1e1e] border-2 border-[#3d3d3d] shadow-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#007acc]" />
            <h4 className="text-sm font-semibold text-[#007acc] uppercase tracking-wider">Sentiment Analysis</h4>
          </div>
        </div>
        <div className="h-20 bg-[#2d2d2d] rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col rounded-xl bg-gradient-to-br from-[#252526] to-[#1e1e1e] border-2 border-[#3d3d3d] shadow-xl p-4 relative overflow-hidden">
      <div className="flex-shrink-0 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#007acc]" />
          <h4 className="text-sm font-semibold text-[#007acc] uppercase tracking-wider">Sentiment Analysis</h4>
        </div>
        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="p-1.5 rounded-md hover:bg-[#2d2d2d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Regenerate analysis"
        >
          <RefreshCw 
            className={`w-3.5 h-3.5 text-[#007acc] ${isRegenerating ? 'animate-spin' : ''}`} 
          />
        </button>
      </div>
      
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-[#3d3d3d] scrollbar-track-transparent">
        <Response className="text-sm text-[#cccccc] leading-relaxed prose prose-invert max-w-none prose-headings:text-[#007acc] prose-headings:font-semibold prose-p:my-2">
          {sentimentExcerpt.excerpt}
        </Response>
      </div>

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-[#007acc]/5 to-transparent pointer-events-none" />
    </div>
  );
}
