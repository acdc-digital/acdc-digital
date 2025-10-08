// FINANCE DATA INITIALIZATION
// Populate finance_entities table with Nasdaq-100 data

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { NASDAQ_100_TICKERS } from "./financeKnowledgeBase";

/**
 * Initialize finance entities from the knowledge base
 */
export const initializeFinanceEntities = mutation({
  args: {
    overwrite: v.optional(v.boolean())
  },
  returns: v.object({
    entitiesCreated: v.number(),
    entitiesUpdated: v.number(),
    errors: v.array(v.string())
  }),
  handler: async (ctx, args) => {
    const overwrite = args.overwrite || false;
    const now = Date.now();
    const kbVersion = "v1.0";
    
    let created = 0;
    let updated = 0;
    const errors: string[] = [];
    
    for (const ticker of NASDAQ_100_TICKERS) {
      try {
        // Check if entity exists
        const existing = await ctx.db
          .query("finance_entities")
          .withIndex("by_symbol")
          .filter(q => q.eq(q.field("canonical_symbol"), ticker.symbol))
          .first();
        
        if (existing && !overwrite) {
          // Skip if exists and not overwriting
          continue;
        }
        
        const entityData = {
          entity_id: ticker.symbol,
          entity_type: "ticker" as const,
          canonical_symbol: ticker.symbol,
          name: ticker.name,
          aliases: [...ticker.aliases], // Convert readonly to mutable array
          sector: ticker.sector,
          industry: ticker.industry,
          active: true,
          kb_version: kbVersion,
          updated_at: now
        };
        
        if (existing) {
          // Update existing
          await ctx.db.patch(existing._id, entityData);
          updated++;
        } else {
          // Create new
          await ctx.db.insert("finance_entities", {
            ...entityData,
            created_at: now
          });
          created++;
        }
      } catch (error) {
        errors.push(`Error processing ${ticker.symbol}: ${error}`);
      }
    }
    
    return {
      entitiesCreated: created,
      entitiesUpdated: updated,
      errors
    };
  }
});

/**
 * Quick test mutation to verify extraction works
 */
export const testFinanceExtraction = mutation({
  args: {
    text: v.string()
  },
  returns: v.array(v.object({
    ticker: v.string(),
    matchedText: v.string(),
    confidence: v.number()
  })),
  handler: async (ctx, args) => {
    const { resolveFinanceEntities } = await import("./financeKnowledgeBase");
    const matches = resolveFinanceEntities(args.text);
    
    return matches.map(m => ({
      ticker: m.ticker,
      matchedText: m.matchedText,
      confidence: m.confidence
    }));
  }
});

/**
 * Get statistics about finance entities
 */
export const getFinanceEntityStats = mutation({
  args: {},
  returns: v.object({
    totalEntities: v.number(),
    activeEntities: v.number(),
    bySector: v.array(v.object({
      sector: v.string(),
      count: v.number()
    })),
    byType: v.array(v.object({
      type: v.string(),
      count: v.number()
    }))
  }),
  handler: async (ctx) => {
    const entities = await ctx.db.query("finance_entities").collect();
    
    const activeCount = entities.filter(e => e.active).length;
    
    // Group by sector
    const sectorCounts = new Map<string, number>();
    for (const entity of entities) {
      if (entity.sector) {
        sectorCounts.set(entity.sector, (sectorCounts.get(entity.sector) || 0) + 1);
      }
    }
    
    // Group by type
    const typeCounts = new Map<string, number>();
    for (const entity of entities) {
      typeCounts.set(entity.entity_type, (typeCounts.get(entity.entity_type) || 0) + 1);
    }
    
    return {
      totalEntities: entities.length,
      activeEntities: activeCount,
      bySector: Array.from(sectorCounts.entries()).map(([sector, count]) => ({ sector, count })),
      byType: Array.from(typeCounts.entries()).map(([type, count]) => ({ type, count }))
    };
  }
});
