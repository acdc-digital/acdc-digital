// TICKER ICON CACHE
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/convex/ticker/iconCache.ts

/**
 * Ticker Icon Caching System
 * 
 * Provides fast, persistent caching of ticker icons to eliminate slow loading times
 * Icons are stored in Convex database with optional Convex storage backup
 */

import { v } from "convex/values";
import { query, mutation, action, internalMutation, internalAction } from "../_generated/server";
import { internal } from "../_generated/api";

// Base URL for ticker icons
const ICON_BASE_URL = "https://raw.githubusercontent.com/nvstly/icons/refs/heads/main/ticker_icons";

/**
 * Get cached icon data for a ticker symbol
 */
export const getIcon = query({
  args: { symbol: v.string() },
  returns: v.union(
    v.object({
      symbol: v.string(),
      iconUrl: v.string(),
      storageId: v.optional(v.id("_storage")),
      cached: v.boolean(),
      lastUpdated: v.number(),
      fallbackUsed: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const icon = await ctx.db
      .query("ticker_icon_cache")
      .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
      .unique();

    return icon;
  },
});

/**
 * Get all cached icons (for bulk loading)
 */
export const getAllIcons = query({
  args: {},
  returns: v.array(
    v.object({
      symbol: v.string(),
      iconUrl: v.string(),
      storageId: v.optional(v.id("_storage")),
      cached: v.boolean(),
      lastUpdated: v.number(),
      fallbackUsed: v.boolean(),
    })
  ),
  handler: async (ctx) => {
    const icons = await ctx.db
      .query("ticker_icon_cache")
      .withIndex("by_cached", (q) => q.eq("cached", true))
      .collect();

    return icons.map((icon) => ({
      symbol: icon.symbol,
      iconUrl: icon.iconUrl,
      storageId: icon.storageId,
      cached: icon.cached,
      lastUpdated: icon.lastUpdated,
      fallbackUsed: icon.fallbackUsed,
    }));
  },
});

/**
 * Cache an icon URL for a ticker symbol
 */
export const cacheIcon = internalMutation({
  args: {
    symbol: v.string(),
    iconUrl: v.string(),
    storageId: v.optional(v.id("_storage")),
    fallbackUsed: v.boolean(),
  },
  returns: v.id("ticker_icon_cache"),
  handler: async (ctx, args) => {
    // Check if icon already exists
    const existing = await ctx.db
      .query("ticker_icon_cache")
      .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
      .unique();

    const now = Date.now();

    if (existing) {
      // Update existing cache entry
      await ctx.db.patch(existing._id, {
        iconUrl: args.iconUrl,
        storageId: args.storageId,
        cached: true,
        lastUpdated: now,
        fallbackUsed: args.fallbackUsed,
      });
      return existing._id;
    } else {
      // Create new cache entry
      return await ctx.db.insert("ticker_icon_cache", {
        symbol: args.symbol,
        iconUrl: args.iconUrl,
        storageId: args.storageId,
        cached: true,
        lastUpdated: now,
        fallbackUsed: args.fallbackUsed,
      });
    }
  },
});

/**
 * Download and cache a ticker icon
 */
export const downloadAndCacheIcon = internalAction({
  args: { symbol: v.string() },
  returns: v.object({
    success: v.boolean(),
    iconUrl: v.string(),
    cached: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    try {
      const iconUrl = `${ICON_BASE_URL}/${args.symbol}.png`;

      // Try to download the icon
      const response = await fetch(iconUrl);

      if (!response.ok) {
        // Icon doesn't exist, mark as fallback
        await ctx.runMutation(internal.ticker.iconCache.cacheIcon, {
          symbol: args.symbol,
          iconUrl,
          fallbackUsed: true,
        });

        return {
          success: false,
          iconUrl,
          cached: true,
          error: `Icon not found (${response.status})`,
        };
      }

      // Successfully downloaded - cache the URL
      await ctx.runMutation(internal.ticker.iconCache.cacheIcon, {
        symbol: args.symbol,
        iconUrl,
        fallbackUsed: false,
      });

      return {
        success: true,
        iconUrl,
        cached: true,
      };
    } catch (error) {
      console.error(`Failed to download icon for ${args.symbol}:`, error);

      // Cache as failed with fallback
      const iconUrl = `${ICON_BASE_URL}/${args.symbol}.png`;
      await ctx.runMutation(internal.ticker.iconCache.cacheIcon, {
        symbol: args.symbol,
        iconUrl,
        fallbackUsed: true,
      });

      return {
        success: false,
        iconUrl,
        cached: true,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

/**
 * Batch cache multiple ticker icons (public action for frontend use)
 */
export const batchCacheIcons = action({
  args: { symbols: v.array(v.string()) },
  returns: v.object({
    total: v.number(),
    successful: v.number(),
    failed: v.number(),
    results: v.array(
      v.object({
        symbol: v.string(),
        success: v.boolean(),
        error: v.optional(v.string()),
      })
    ),
  }),
  handler: async (ctx, args): Promise<{
    total: number;
    successful: number;
    failed: number;
    results: Array<{
      symbol: string;
      success: boolean;
      error?: string;
    }>;
  }> => {
    const results: Array<{
      symbol: string;
      success: boolean;
      error?: string;
    }> = [];
    let successful = 0;
    let failed = 0;

    for (const symbol of args.symbols) {
      const result: {
        success: boolean;
        iconUrl: string;
        cached: boolean;
        error?: string;
      } = await ctx.runAction(internal.ticker.iconCache.downloadAndCacheIcon, {
        symbol,
      });

      if (result.success) {
        successful++;
      } else {
        failed++;
      }

      results.push({
        symbol,
        success: result.success,
        error: result.error,
      });

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return {
      total: args.symbols.length,
      successful,
      failed,
      results,
    };
  },
});

/**
 * Cache an icon URL for a ticker symbol (public mutation for frontend use)
 */
export const cacheIconPublic = mutation({
  args: {
    symbol: v.string(),
    iconUrl: v.string(),
    fallbackUsed: v.boolean(),
  },
  returns: v.id("ticker_icon_cache"),
  handler: async (ctx, args) => {
    // Check if icon already exists
    const existing = await ctx.db
      .query("ticker_icon_cache")
      .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
      .unique();

    const now = Date.now();

    if (existing) {
      // Update existing cache entry
      await ctx.db.patch(existing._id, {
        iconUrl: args.iconUrl,
        cached: true,
        lastUpdated: now,
        fallbackUsed: args.fallbackUsed,
      });
      return existing._id;
    } else {
      // Create new cache entry
      return await ctx.db.insert("ticker_icon_cache", {
        symbol: args.symbol,
        iconUrl: args.iconUrl,
        cached: true,
        lastUpdated: now,
        fallbackUsed: args.fallbackUsed,
      });
    }
  },
});

/**
 * Get cache statistics
 */
export const getCacheStats = query({
  args: {},
  returns: v.object({
    total: v.number(),
    cached: v.number(),
    withFallback: v.number(),
    successfullyLoaded: v.number(),
  }),
  handler: async (ctx) => {
    const allIcons = await ctx.db.query("ticker_icon_cache").collect();

    const total = allIcons.length;
    const cached = allIcons.filter((icon) => icon.cached).length;
    const withFallback = allIcons.filter((icon) => icon.fallbackUsed).length;
    const successfullyLoaded = allIcons.filter(
      (icon) => icon.cached && !icon.fallbackUsed
    ).length;

    return {
      total,
      cached,
      withFallback,
      successfullyLoaded,
    };
  },
});

/**
 * Clear cache for a specific symbol or all symbols
 */
export const clearCache = mutation({
  args: { symbol: v.optional(v.string()) },
  returns: v.number(),
  handler: async (ctx, args) => {
    if (args.symbol) {
      // Clear specific symbol
      const icon = await ctx.db
        .query("ticker_icon_cache")
        .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol!))
        .unique();

      if (icon) {
        await ctx.db.delete(icon._id);
        return 1;
      }
      return 0;
    } else {
      // Clear all cache
      const allIcons = await ctx.db.query("ticker_icon_cache").collect();
      for (const icon of allIcons) {
        await ctx.db.delete(icon._id);
      }
      return allIcons.length;
    }
  },
});
