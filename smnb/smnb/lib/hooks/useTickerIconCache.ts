// TICKER ICON CACHE HOOK
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/lib/hooks/useTickerIconCache.ts

/**
 * React hook for accessing cached ticker icons
 * Provides instant loading from Convex cache with automatic fallback
 */

'use client';

import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useEffect, useState } from 'react';

const ICON_BASE_URL = "https://raw.githubusercontent.com/nvstly/icons/refs/heads/main/ticker_icons";

/**
 * Hook to get a single cached ticker icon
 */
export function useTickerIcon(symbol: string) {
  const cachedIcon = useQuery(api.ticker.iconCache.getIcon, { symbol });
  const cacheIconPublic = useMutation(api.ticker.iconCache.cacheIconPublic);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-cache icon if not found
  useEffect(() => {
    if (cachedIcon === undefined) return; // Still loading from Convex
    if (cachedIcon !== null) return; // Already cached
    if (isLoading) return; // Already attempting to cache

    // Icon not cached yet, attempt to cache it
    setIsLoading(true);
    const iconUrl = `${ICON_BASE_URL}/${symbol}.png`;

    // Test if the icon exists
    fetch(iconUrl, { method: 'HEAD' })
      .then((response) => {
        const fallbackUsed = !response.ok;
        return cacheIconPublic({
          symbol,
          iconUrl,
          fallbackUsed,
        });
      })
      .catch(() => {
        // Failed to fetch, cache with fallback
        return cacheIconPublic({
          symbol,
          iconUrl,
          fallbackUsed: true,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [cachedIcon, symbol, cacheIconPublic, isLoading]);

  return {
    iconUrl: cachedIcon?.iconUrl || `${ICON_BASE_URL}/${symbol}.png`,
    useFallback: cachedIcon?.fallbackUsed ?? true,
    isCached: cachedIcon !== null && cachedIcon !== undefined,
    isLoading: cachedIcon === undefined || isLoading,
  };
}

/**
 * Hook to preload all icons for a list of symbols
 */
export function usePreloadTickerIcons(symbols: string[]) {
  const allIcons = useQuery(api.ticker.iconCache.getAllIcons);
  const batchCache = useAction(api.ticker.iconCache.batchCacheIcons);
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState({ loaded: 0, total: 0 });

  useEffect(() => {
    if (!allIcons || isPreloading) return;
    if (symbols.length === 0) return;

    // Find symbols that aren't cached yet
    const cachedSymbols = new Set(allIcons.map((icon) => icon.symbol));
    const uncachedSymbols = symbols.filter((symbol) => !cachedSymbols.has(symbol));

    if (uncachedSymbols.length === 0) return;

    // Batch cache the uncached symbols
    setIsPreloading(true);
    setPreloadProgress({ loaded: 0, total: uncachedSymbols.length });

    batchCache({ symbols: uncachedSymbols })
      .then((result) => {
        setPreloadProgress({ loaded: result.successful, total: result.total });
        console.log(
          `✅ Preloaded ${result.successful}/${result.total} ticker icons (${result.failed} failed)`
        );
      })
      .catch((error) => {
        console.error('Failed to preload ticker icons:', error);
      })
      .finally(() => {
        setIsPreloading(false);
      });
  }, [allIcons, symbols, batchCache, isPreloading]);

  return {
    isPreloading,
    progress: preloadProgress,
    cachedCount: allIcons?.length ?? 0,
  };
}

/**
 * Hook to get cache statistics
 */
export function useTickerIconCacheStats() {
  const stats = useQuery(api.ticker.iconCache.getCacheStats);

  return {
    stats: stats ?? { total: 0, cached: 0, withFallback: 0, successfullyLoaded: 0 },
    isLoading: stats === undefined,
  };
}
