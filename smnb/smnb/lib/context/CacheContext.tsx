"use client";

import React, { createContext, useContext, useRef, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { FunctionReference } from 'convex/server';

/**
 * Universal Caching Context for Dashboard
 * 
 * Provides a single source of truth for frequently accessed data:
 * - Sessions list
 * - Broadcast state
 * - User preferences
 * - System state
 * 
 * Benefits:
 * - Reduces redundant Convex queries
 * - Shares data across components
 * - Faster tab switching (cached data available immediately)
 * - Lower backend load
 */

interface CacheContextValue {
  // Cached query results
  cache: Map<string, unknown>;
  
  // Cache management
  set: (key: string, value: unknown) => void;
  get: (key: string) => unknown;
  has: (key: string) => boolean;
  invalidate: (key: string) => void;
  clear: () => void;
}

const CacheContext = createContext<CacheContextValue | null>(null);

export function CacheProvider({ children }: { children: React.ReactNode }) {
  const cacheRef = useRef(new Map<string, unknown>());
  
  const value: CacheContextValue = {
    cache: cacheRef.current,

    set: (key: string, value: unknown) => {
      cacheRef.current.set(key, value);
    },    get: (key: string) => {
      return cacheRef.current.get(key);
    },
    
    has: (key: string) => {
      return cacheRef.current.has(key);
    },
    
    invalidate: (key: string) => {
      cacheRef.current.delete(key);
    },
    
    clear: () => {
      cacheRef.current.clear();
    },
  };
  
  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  );
}

export function useCache() {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within CacheProvider');
  }
  return context;
}

/**
 * Cached version of useQuery that checks context cache first
 * 
 * Usage:
 * ```tsx
 * const sessions = useCachedQuery('sessions', api.users.sessions.list, {});
 * ```
 */
export function useCachedQuery<T>(
  cacheKey: string,
  query: FunctionReference<"query">,
  args: Record<string, unknown>
): T | undefined {
  const cache = useCache();
  
  // Use Convex query (already optimized with built-in caching)
  const data = useQuery(query, args) as T | undefined;
  
  // Update cache when data changes
  useEffect(() => {
    if (data !== undefined) {
      cache.set(cacheKey, data);
    }
  }, [data, cacheKey, cache]);
  
  // Return cached data immediately if available, otherwise return query result
  // This ensures instant rendering on mount with stale data while fresh data loads
  if (data !== undefined) {
    return data;
  }
  
  // Return cached data if available (for instant rendering)
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as T;
  }
  
  return undefined;
}
