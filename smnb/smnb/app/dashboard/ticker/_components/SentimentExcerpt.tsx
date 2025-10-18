"use client";

import React, { useEffect, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { RefreshCw } from "lucide-react";

interface SentimentExcerptProps {
  symbol: string;
  weight: number;
}

export function SentimentExcerpt({ symbol, weight }: SentimentExcerptProps) {
  const generateExcerpt = useAction(api.stats.sentimentAnalysis.generateSentimentExcerpt);
  // Check for cached version first
  const cachedExcerpt = useQuery(
    api.stats.sentimentExcerptCache.getCachedExcerpt,
    { ticker: symbol }
  );
  const [excerpt, setExcerpt] = useState<string | null>(null);
  const [currentTicker, setCurrentTicker] = useState<string>(symbol);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forceRefresh, setForceRefresh] = useState(false);

  // Reset state when ticker changes
  useEffect(() => {
    if (symbol !== currentTicker) {
      setCurrentTicker(symbol);
      setExcerpt(null);
      setHasGenerated(false);
      setIsLoading(false);
      setError(null);
      setForceRefresh(false);
    }
  }, [symbol, currentTicker]);

  const handleRefresh = async () => {
    setForceRefresh(true);
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await generateExcerpt({ ticker: symbol, weight });
      
      if (result) {
        setExcerpt(result.excerpt);
        setHasGenerated(true);
      } else {
        setError("No sentiment data available");
      }
    } catch (err) {
      setError("Failed to generate analysis");
      console.error("Error fetching sentiment excerpt:", err);
    } finally {
      setIsLoading(false);
      setForceRefresh(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Skip if force refresh is active (handled by button)
    if (forceRefresh) {
      return;
    }

    // If we have a cached excerpt, use it
    if (cachedExcerpt && cachedExcerpt.excerpt) {
      setExcerpt(cachedExcerpt.excerpt);
      setIsLoading(false);
      setHasGenerated(true); // Mark as generated so we don't trigger again
      return;
    }

    // Only generate if:
    // 1. cachedExcerpt is null (not undefined, which means still loading)
    // 2. We haven't already generated one for this ticker
    // 3. Not currently loading
    if (cachedExcerpt === null && !hasGenerated && !isLoading) {
      const fetchExcerpt = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          const result = await generateExcerpt({ ticker: symbol, weight });
          
          if (isMounted) {
            if (result) {
              setExcerpt(result.excerpt);
              setHasGenerated(true);
            } else {
              setError("No sentiment data available");
            }
          }
        } catch (err) {
          if (isMounted) {
            setError("Failed to generate analysis");
            console.error("Error fetching sentiment excerpt:", err);
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

      fetchExcerpt();
    }

    return () => {
      isMounted = false;
    };
  }, [symbol, weight, cachedExcerpt, generateExcerpt, hasGenerated, isLoading, forceRefresh]);

  if (isLoading) {
    return (
      <div className="mt-6 pt-6 border-t border-[#3d3d3d]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs uppercase tracking-wider text-[#858585] font-medium">
            Sentiment Analysis
          </h3>
          <button
            disabled
            className="p-1.5 rounded hover:bg-[#2d2d2d] transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4 text-[#858585] animate-spin" />
          </button>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-[#2d2d2d] rounded animate-pulse" />
          <div className="h-3 bg-[#2d2d2d] rounded animate-pulse w-11/12" />
          <div className="h-3 bg-[#2d2d2d] rounded animate-pulse w-10/12" />
          <div className="h-3 bg-[#2d2d2d] rounded animate-pulse" />
          <div className="h-3 bg-[#2d2d2d] rounded animate-pulse w-9/12" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 pt-6 border-t border-[#3d3d3d]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs uppercase tracking-wider text-[#858585] font-medium">
            Sentiment Analysis
          </h3>
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded hover:bg-[#2d2d2d] transition-colors"
            title="Regenerate analysis"
          >
            <RefreshCw className="w-4 h-4 text-[#858585] hover:text-[#cccccc]" />
          </button>
        </div>
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!excerpt) {
    return null;
  }

  return (
    <div className="mt-6 pt-6 border-t border-[#3d3d3d]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs uppercase tracking-wider text-[#858585] font-medium">
          Sentiment Analysis
        </h3>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-1.5 rounded hover:bg-[#2d2d2d] transition-colors disabled:opacity-50"
          title="Regenerate analysis"
        >
          <RefreshCw className={`w-4 h-4 text-[#858585] hover:text-[#cccccc] ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="text-sm text-[#cccccc] leading-relaxed space-y-3">
        {excerpt.split('\n\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
