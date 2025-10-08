// KEYWORD GRAPH BUILDER
// Co-occurrence relationship detection and graph construction

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { calculatePMI, calculateJaccard } from "./utils";

/**
 * Build co-occurrence graph edges for a time window
 */
export const buildCoOccurrenceGraph = mutation({
  args: {
    windowStart: v.number(),
    windowLengthMs: v.number(),
    minCoOccurrence: v.optional(v.number()),
    maxEdgesPerNode: v.optional(v.number())
  },
  returns: v.object({
    edgesCreated: v.number(),
    keywordsProcesed: v.number()
  }),
  handler: async (ctx, args) => {
    const { windowStart, windowLengthMs } = args;
    const minCoOccurrence = args.minCoOccurrence || 2;
    const maxEdgesPerNode = args.maxEdgesPerNode || 50;
    const windowEnd = windowStart + windowLengthMs;
    const now = Date.now();
    
    // Get all occurrences in this window
    const occurrences = await ctx.db
      .query("keyword_occurrences")
      .withIndex("by_time")
      .filter(q => 
        q.and(
          q.gte(q.field("occurrence_time"), windowStart),
          q.lt(q.field("occurrence_time"), windowEnd)
        )
      )
      .collect();
    
    // Group by post_id to find co-occurrences
    const postKeywords = new Map<string, Set<string>>();
    const keywordCounts = new Map<string, number>();
    const keywordTickers = new Map<string, Set<string>>();
    
    for (const occ of occurrences) {
      const postId = occ.post_id;
      const keyword = occ.keyword_id;
      
      if (!postKeywords.has(postId)) {
        postKeywords.set(postId, new Set());
      }
      postKeywords.get(postId)!.add(keyword);
      
      // Count keyword occurrences
      keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
      
      // Track tickers for this keyword
      if (occ.mapped_tickers.length > 0) {
        if (!keywordTickers.has(keyword)) {
          keywordTickers.set(keyword, new Set());
        }
        for (const ticker of occ.mapped_tickers) {
          keywordTickers.get(keyword)!.add(ticker);
        }
      }
    }
    
    // Build co-occurrence matrix
    const coOccurrenceMap = new Map<string, Map<string, number>>();
    
    for (const [postId, keywords] of postKeywords.entries()) {
      const keywordArray = Array.from(keywords);
      
      // For each pair of keywords in this post
      for (let i = 0; i < keywordArray.length; i++) {
        for (let j = i + 1; j < keywordArray.length; j++) {
          const k1 = keywordArray[i];
          const k2 = keywordArray[j];
          
          // Use consistent ordering for edges
          const [source, target] = k1 < k2 ? [k1, k2] : [k2, k1];
          
          if (!coOccurrenceMap.has(source)) {
            coOccurrenceMap.set(source, new Map());
          }
          
          const targetMap = coOccurrenceMap.get(source)!;
          targetMap.set(target, (targetMap.get(target) || 0) + 1);
        }
      }
    }
    
    // Create or update edges
    let edgesCreated = 0;
    const totalDocuments = postKeywords.size;
    
    for (const [source, targetMap] of coOccurrenceMap.entries()) {
      const sourceCount = keywordCounts.get(source) || 0;
      const sourceTickers = keywordTickers.get(source);
      
      // Sort targets by co-occurrence count and limit
      const sortedTargets = Array.from(targetMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxEdgesPerNode);
      
      for (const [target, coOccCount] of sortedTargets) {
        if (coOccCount < minCoOccurrence) continue;
        
        const targetCount = keywordCounts.get(target) || 0;
        const targetTickers = keywordTickers.get(target);
        
        // Calculate strength metrics
        const pmiScore = calculatePMI(coOccCount, sourceCount, targetCount, totalDocuments);
        const jaccardScore = calculateJaccard(coOccCount, sourceCount, targetCount);
        
        // Use Jaccard as primary strength metric
        const strength = jaccardScore;
        
        // Calculate finance relevance
        let financeRelevanceScore = 0;
        let sharedTickers: string[] = [];
        
        if (sourceTickers && targetTickers) {
          // Find shared tickers
          const shared = new Set(
            Array.from(sourceTickers).filter(t => targetTickers.has(t))
          );
          sharedTickers = Array.from(shared);
          
          // Both have tickers
          financeRelevanceScore = 0.8;
          
          // Bonus if they share tickers (same company/sector)
          if (sharedTickers.length > 0) {
            financeRelevanceScore = 1.0;
          }
        } else if (sourceTickers || targetTickers) {
          // Only one has tickers
          financeRelevanceScore = 0.5;
        }
        
        // Check if edge already exists
        const existing = await ctx.db
          .query("keyword_graph_edges")
          .withIndex("by_source")
          .filter(q => 
            q.and(
              q.eq(q.field("source_keyword"), source),
              q.eq(q.field("target_keyword"), target),
              q.eq(q.field("window_start"), windowStart)
            )
          )
          .first();
        
        if (existing) {
          // Update existing edge
          await ctx.db.patch(existing._id, {
            co_occurrence_count: coOccCount,
            source_total_count: sourceCount,
            target_total_count: targetCount,
            strength,
            pmi_score: pmiScore,
            jaccard_score: jaccardScore,
            finance_relevance_score: financeRelevanceScore > 0 ? financeRelevanceScore : undefined,
            shared_tickers: sharedTickers.length > 0 ? sharedTickers : undefined,
            updated_at: now
          });
        } else {
          // Create new edge
          await ctx.db.insert("keyword_graph_edges", {
            source_keyword: source,
            target_keyword: target,
            window_start: windowStart,
            window_length: windowLengthMs,
            
            co_occurrence_count: coOccCount,
            source_total_count: sourceCount,
            target_total_count: targetCount,
            
            strength,
            pmi_score: pmiScore,
            jaccard_score: jaccardScore,
            
            finance_relevance_score: financeRelevanceScore > 0 ? financeRelevanceScore : undefined,
            shared_tickers: sharedTickers.length > 0 ? sharedTickers : undefined,
            
            created_at: now,
            updated_at: now
          });
          
          edgesCreated++;
        }
      }
    }
    
    return {
      edgesCreated,
      keywordsProcesed: keywordCounts.size
    };
  }
});

/**
 * Prune weak edges from the graph
 */
export const pruneGraphEdges = mutation({
  args: {
    minStrength: v.number(),
    minCoOccurrence: v.number(),
    olderThanMs: v.optional(v.number())
  },
  returns: v.object({
    edgesDeleted: v.number()
  }),
  handler: async (ctx, args) => {
    const { minStrength, minCoOccurrence } = args;
    const now = Date.now();
    const cutoff = args.olderThanMs ? now - args.olderThanMs : 0;
    
    // Find weak edges
    const edges = await ctx.db
      .query("keyword_graph_edges")
      .withIndex("by_strength")
      .filter(q => 
        q.or(
          q.lt(q.field("strength"), minStrength),
          q.lt(q.field("co_occurrence_count"), minCoOccurrence)
        )
      )
      .collect();
    
    let deleted = 0;
    for (const edge of edges) {
      // Additional check for age if specified
      if (cutoff > 0 && edge.window_start > cutoff) {
        continue;
      }
      
      await ctx.db.delete(edge._id);
      deleted++;
    }
    
    return {
      edgesDeleted: deleted
    };
  }
});

/**
 * Get finance subgraph statistics
 */
export const getFinanceSubgraphStats = mutation({
  args: {
    windowStart: v.number(),
    minFinanceRelevance: v.optional(v.number())
  },
  returns: v.object({
    financeEdges: v.number(),
    financeKeywords: v.number()
  }),
  handler: async (ctx, args) => {
    const minFinanceRelevance = args.minFinanceRelevance || 0.5;
    
    // Count finance-relevant edges for this window
    const financeEdges = await ctx.db
      .query("keyword_graph_edges")
      .withIndex("by_finance_relevance")
      .filter(q => 
        q.and(
          q.gte(q.field("finance_relevance_score"), minFinanceRelevance),
          q.eq(q.field("window_start"), args.windowStart)
        )
      )
      .collect();
    
    // Get unique finance keywords
    const financeKeywords = new Set<string>();
    for (const edge of financeEdges) {
      financeKeywords.add(edge.source_keyword);
      financeKeywords.add(edge.target_keyword);
    }
    
    return {
      financeEdges: financeEdges.length,
      financeKeywords: financeKeywords.size
    };
  }
});
