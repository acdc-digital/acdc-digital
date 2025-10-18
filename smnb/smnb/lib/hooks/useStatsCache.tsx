"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useQuery } from "convex/react";
import type { FunctionReference } from "convex/server";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface StatsCacheContextType {
  getCachedData: <T>(key: string) => T | null;
  setCachedData: <T>(key: string, data: T) => void;
  clearCache: () => void;
}

const StatsCacheContext = createContext<StatsCacheContextType | null>(null);

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY_PREFIX = "smnb_stats_cache_";

export function StatsCacheProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<Map<string, CacheEntry<unknown>>>(new Map());

  // Load cache from localStorage on mount
  useEffect(() => {
    try {
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith(CACHE_KEY_PREFIX)
      );
      const newCache = new Map<string, CacheEntry<unknown>>();

      keys.forEach((key) => {
        const cacheKey = key.replace(CACHE_KEY_PREFIX, "");
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const entry = JSON.parse(item) as CacheEntry<unknown>;
            // Check if cache is still valid
            if (Date.now() - entry.timestamp < CACHE_DURATION) {
              newCache.set(cacheKey, entry);
            } else {
              // Remove expired cache
              localStorage.removeItem(key);
            }
          } catch {
            // Invalid JSON, remove it
            localStorage.removeItem(key);
          }
        }
      });

      setCache(newCache);
    } catch (error) {
      console.error("Failed to load stats cache:", error);
    }
  }, []);

  const getCachedData = useCallback(<T,>(key: string): T | null => {
    const entry = cache.get(key);
    if (!entry) return null;

    // Check if cache is still valid
    if (Date.now() - entry.timestamp < CACHE_DURATION) {
      return entry.data as T;
    }

    // Cache expired, remove it
    setCache((prev) => {
      const newCache = new Map(prev);
      newCache.delete(key);
      return newCache;
    });
    localStorage.removeItem(CACHE_KEY_PREFIX + key);
    return null;
  }, [cache]);

  const setCachedData = useCallback(<T,>(key: string, data: T) => {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };

    setCache((prev) => {
      const newCache = new Map(prev);
      newCache.set(key, entry);
      return newCache;
    });

    try {
      localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(entry));
    } catch (error) {
      console.error("Failed to save to cache:", error);
    }
  }, []);

  const clearCache = useCallback(() => {
    setCache(new Map());
    try {
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith(CACHE_KEY_PREFIX)
      );
      keys.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error("Failed to clear cache:", error);
    }
  }, []);

  return (
    <StatsCacheContext.Provider value={{ getCachedData, setCachedData, clearCache }}>
      {children}
    </StatsCacheContext.Provider>
  );
}

export function useStatsCacheContext() {
  const context = useContext(StatsCacheContext);
  if (!context) {
    throw new Error("useStatsCacheContext must be used within StatsCacheProvider");
  }
  return context;
}

/**
 * Custom hook that wraps useQuery with caching
 * @param query - Convex query function reference
 * @param args - Query arguments
 * @param cacheKey - Unique cache key for this query
 * @returns Cached or fresh data
 */
export function useCachedQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: Query["_args"],
  cacheKey: string
) {
  const { getCachedData, setCachedData } = useStatsCacheContext();
  
  // Try to get cached data first
  const cachedData = getCachedData<Query["_returnType"]>(cacheKey);
  
  // Fetch fresh data
  const freshData = useQuery(query, args);
  
  // Update cache when fresh data arrives
  useEffect(() => {
    if (freshData !== undefined && freshData !== null) {
      setCachedData(cacheKey, freshData);
    }
  }, [freshData, cacheKey, setCachedData]);
  
  // Return cached data immediately if available, otherwise return fresh data
  return cachedData !== null ? cachedData : freshData;
}
