"use client";

import React, { useEffect, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { RefreshCw, Newspaper } from "lucide-react";

interface FinlightNewsSummaryProps {
  symbol: string;
  weight: number;
}

export function FinlightNewsSummary({ symbol, weight }: FinlightNewsSummaryProps) {
  const generateSummary = useAction(api.stats.finlightNews.generateNewsSummary);
  // Check for cached version first
  const cachedSummary = useQuery(
    api.stats.finlightNewsCache.getCachedSummary,
    { ticker: symbol }
  );
  const [summary, setSummary] = useState<string | null>(null);
  const [sources, setSources] = useState<string[]>([]);
  const [articlesCount, setArticlesCount] = useState<number>(0);
  const [currentTicker, setCurrentTicker] = useState<string>(symbol);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forceRefresh, setForceRefresh] = useState(false);

  // Reset state when ticker changes
  useEffect(() => {
    if (symbol !== currentTicker) {
      setCurrentTicker(symbol);
      setSummary(null);
      setSources([]);
      setArticlesCount(0);
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
      const result = await generateSummary({ ticker: symbol, weight });
      
      if (result) {
        setSummary(result.summary);
        setSources(result.sources);
        setArticlesCount(result.articles_count);
        setHasGenerated(true);
      } else {
        setError("No news articles available");
      }
    } catch (err) {
      setError("Failed to fetch news");
      console.error("Error fetching Finlight news:", err);
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

    // If we have a cached summary, use it
    if (cachedSummary && cachedSummary.summary) {
      setSummary(cachedSummary.summary);
      setSources(cachedSummary.sources);
      setArticlesCount(cachedSummary.articles_count);
      setIsLoading(false);
      setHasGenerated(true);
      return;
    }

    // Only generate if no cache and haven't generated yet
    if (cachedSummary === null && !hasGenerated && !isLoading) {
      const fetchSummary = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          const result = await generateSummary({ ticker: symbol, weight });
          
          if (isMounted) {
            if (result) {
              setSummary(result.summary);
              setSources(result.sources);
              setArticlesCount(result.articles_count);
              setHasGenerated(true);
            } else {
              setError("No news articles available");
            }
          }
        } catch (err) {
          if (isMounted) {
            setError("Failed to fetch news");
            console.error("Error fetching Finlight news:", err);
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

      fetchSummary();
    }

    return () => {
      isMounted = false;
    };
  }, [symbol, weight, cachedSummary, generateSummary, hasGenerated, isLoading, forceRefresh]);

  if (isLoading) {
    return (
      <div className="mt-6 pt-6 border-t border-[#3d3d3d]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-[#858585]" />
            <h3 className="text-xs uppercase tracking-wider text-[#858585] font-medium">
              Market News
            </h3>
          </div>
          <button
            disabled
            className="p-1.5 rounded hover:bg-[#2d2d2d] transition-colors disabled:opacity-50"
            title="Loading..."
            aria-label="Loading news"
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
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-[#858585]" />
            <h3 className="text-xs uppercase tracking-wider text-[#858585] font-medium">
              Market News
            </h3>
          </div>
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded hover:bg-[#2d2d2d] transition-colors"
            title="Retry fetching news"
            aria-label="Retry fetching news"
          >
            <RefreshCw className="w-4 h-4 text-[#858585] hover:text-[#cccccc]" />
          </button>
        </div>
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="mt-6 pt-6 border-t border-[#3d3d3d]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-[#858585]" />
          <h3 className="text-xs uppercase tracking-wider text-[#858585] font-medium">
            Market News
          </h3>
          {articlesCount > 0 && (
            <span className="text-[10px] text-[#666] bg-[#2d2d2d] px-1.5 py-0.5 rounded">
              {articlesCount} articles
            </span>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-1.5 rounded hover:bg-[#2d2d2d] transition-colors disabled:opacity-50"
          title="Refresh news"
        >
          <RefreshCw className={`w-4 h-4 text-[#858585] hover:text-[#cccccc] ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="text-sm text-[#cccccc] leading-relaxed space-y-3">
        {summary.split('\n\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      {sources.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#2d2d2d]/50">
          <p className="text-[10px] text-[#666] uppercase tracking-wider mb-1">Sources</p>
          <div className="flex flex-wrap gap-1.5">
            {sources.map((source, index) => (
              <span key={index} className="text-[10px] text-[#858585] bg-[#2d2d2d] px-2 py-0.5 rounded">
                {source}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
