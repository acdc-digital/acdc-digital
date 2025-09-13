/**
 * Live Feed Stats Component
 * Displays producer stats and trends in the live feed sidebar
 */

'use client';

import React from 'react';
import { useFeedStatsData } from '@/lib/stores/livefeed/feedStatsStore';
import { Activity, Search, Copy, RefreshCw, Clock } from 'lucide-react';

export default function LiveFeedStats() {
  const { stats, trends, currentSearches, isProducerActive } = useFeedStatsData();

  const formatUptime = (uptime: number) => {
    const minutes = Math.floor(uptime / 60);
    const seconds = uptime % 60;
    return `${minutes}m ${seconds}s`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div className="bg-[#1a1a1a] border border-border/30 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border/20">
        <Activity className={`w-4 h-4 ${isProducerActive ? 'text-green-500' : 'text-gray-500'}`} />
        <h3 className="text-sm font-medium text-foreground">Producer Analytics</h3>
        <div className={`ml-auto w-2 h-2 rounded-full ${isProducerActive ? 'bg-green-500' : 'bg-gray-500'}`} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Searches Performed */}
        <div className="bg-[#252525] rounded-md p-3 border border-border/20">
          <div className="flex items-center gap-2 mb-1">
            <Search className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-muted-foreground">Searches</span>
          </div>
          <div className="text-lg font-semibold text-foreground">
            {formatNumber(stats.searchesPerformed)}
          </div>
        </div>

        {/* Duplicates Analyzed */}
        <div className="bg-[#252525] rounded-md p-3 border border-border/20">
          <div className="flex items-center gap-2 mb-1">
            <Copy className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-muted-foreground">Duplicates</span>
          </div>
          <div className="text-lg font-semibold text-foreground">
            {formatNumber(stats.duplicatesAnalyzed)}
          </div>
        </div>

        {/* Context Updates */}
        <div className="bg-[#252525] rounded-md p-3 border border-border/20">
          <div className="flex items-center gap-2 mb-1">
            <RefreshCw className="w-3 h-3 text-green-400" />
            <span className="text-xs text-muted-foreground">Updates</span>
          </div>
          <div className="text-lg font-semibold text-foreground">
            {formatNumber(stats.contextUpdatesProvided)}
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-[#252525] rounded-md p-3 border border-border/20">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3 h-3 text-purple-400" />
            <span className="text-xs text-muted-foreground">Uptime</span>
          </div>
          <div className="text-sm font-semibold text-foreground">
            {formatUptime(stats.uptime)}
          </div>
        </div>
      </div>

      {/* Current Searches */}
      {currentSearches.size > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Active Searches
          </h4>
          <div className="space-y-1">
            {Array.from(currentSearches.entries()).map(([query, result]) => (
              <div key={query} className="flex items-center justify-between text-xs bg-[#252525] rounded px-2 py-1 border border-border/20">
                <span className="text-foreground truncate max-w-[120px]">{query}</span>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span>{result.totalResults}</span>
                  {result.duplicatesFound > 0 && (
                    <span className="text-yellow-400">({result.duplicatesFound} dupes)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trends */}
      {trends.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Trending Keywords
          </h4>
          <div className="flex flex-wrap gap-1">
            {trends.slice(0, 6).map((trend, index) => (
              <div
                key={`${trend.keyword}-${index}`}
                className="text-xs bg-[#252525] text-foreground px-2 py-1 rounded border border-border/20"
              >
                {trend.keyword}
                <span className="ml-1 text-muted-foreground">({trend.frequency})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Message */}
      {!isProducerActive && (
        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/20">
          Producer service is inactive
        </div>
      )}
    </div>
  );
}