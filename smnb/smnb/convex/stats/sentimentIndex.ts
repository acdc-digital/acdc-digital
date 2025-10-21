/**
 * SENTIMENT INDEX CALCULATION
 * 
 * Calculates an aggregate sentiment index score across all NASDAQ-100 companies.
 * 
 * Formula: Δ = ((P + M) / 2) - B
 * Where:
 * - P = Performance Score (mean calculated_score across all companies)
 * - M = Momentum Score (rate of change in sentiment)
 * - B = Baseline (expected neutral sentiment - calculated from weights)
 * - Δ = Sentiment Index Differential
 * 
 * The final sentiment index score represents the actual sentiment score with deviation applied.
 */

import { internalAction, internalMutation, internalQuery, query } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

// No constants needed - using actual calculated_score values

/**
 * Calculate the mean sentiment score across all 100 companies for a specific time period
 */
export const calculateSentimentIndex = internalQuery({
  args: {
    startTime: v.number(), // Unix timestamp
    endTime: v.number(), // Unix timestamp
  },
  returns: v.object({
    sentimentIndex: v.number(), // Mean sentiment score across all companies
    performanceScore: v.number(), // P component (same as sentimentIndex for simplicity)
    momentumScore: v.number(), // M component
    baseline: v.number(), // B component
    metadata: v.object({
      companiesAnalyzed: v.number(),
      totalMentions: v.number(),
      avgSentiment: v.number(),
      avgMomentum: v.number(),
      timestamp: v.number(),
    }),
  }),
  handler: async (ctx, args) => {
    // Get the most recent score for each company that was calculated before endTime
    const allScores = await ctx.db
      .query("sentiment_scores")
      .withIndex("by_calculated_at")
      .order("desc")
      .collect();
    
    // Filter to only include scores calculated before endTime and group by ticker
    const latestScoresByTicker = new Map<string, typeof allScores[0]>();
    
    for (const score of allScores) {
      if (score.calculated_at <= args.endTime && !latestScoresByTicker.has(score.ticker)) {
        latestScoresByTicker.set(score.ticker, score);
      }
    }
    
    const sentimentScores = Array.from(latestScoresByTicker.values());

    if (sentimentScores.length === 0) {
      // Calculate baseline for 0 companies
      const baseline = 0;
      return {
        sentimentIndex: baseline,
        performanceScore: baseline,
        momentumScore: 0,
        baseline,
        metadata: {
          companiesAnalyzed: 0,
          totalMentions: 0,
          avgSentiment: 0,
          avgMomentum: 0,
          timestamp: Date.now(),
        },
      };
    }

    // Calculate mean calculated_score across all companies (P)
    let totalCalculatedScore = 0;
    let totalMentions = 0;
    let totalMomentum = 0;
    let companiesWithData = 0;

    for (const score of sentimentScores) {
      totalCalculatedScore += score.calculated_score;
      totalMentions += score.mention_count;
      totalMomentum += score.momentum;
      companiesWithData++;
    }

    // P = Mean calculated score across all companies
    const performanceScore = companiesWithData > 0 ? totalCalculatedScore / companiesWithData : 0;
    
    // M = Mean momentum, normalized to score scale
    const avgMomentum = companiesWithData > 0 ? totalMomentum / companiesWithData : 0;
    // Convert momentum (-100 to +100) to a percentage adjustment
    const momentumAdjustment = (avgMomentum / 100) * (performanceScore * 0.1); // ±10% adjustment based on momentum

    // B = Baseline (mean of all scores without momentum adjustment)
    const baseline = performanceScore;

    // Calculate deviation using the formula: Δ = ((P + M) / 2) - B
    const deviation = ((performanceScore + momentumAdjustment) / 2) - baseline;
    
    // Final sentiment index score = baseline + deviation
    const sentimentIndex = baseline + deviation;

    return {
      sentimentIndex,
      performanceScore,
      momentumScore: momentumAdjustment,
      baseline,
      metadata: {
        companiesAnalyzed: companiesWithData,
        totalMentions,
        avgSentiment: performanceScore, // Using calculated_score mean
        avgMomentum,
        timestamp: Date.now(),
      },
    };
  },
});

/**
 * Generate and store hourly sentiment index scores
 * This should be run every hour to track real-time sentiment changes
 */
export const generateHourlySentimentIndex = internalAction({
  args: {},
  returns: v.object({
    success: v.boolean(),
    sentimentIndex: v.number(),
    hour: v.number(),
  }),
  handler: async (ctx): Promise<{ success: boolean; sentimentIndex: number; hour: number }> => {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    console.log("[Sentiment Index] Calculating hourly sentiment index...");

    // Calculate sentiment index for the past hour
    const indexData: {
      sentimentIndex: number;
      performanceScore: number;
      momentumScore: number;
      baseline: number;
      metadata: {
        companiesAnalyzed: number;
        totalMentions: number;
        avgSentiment: number;
        avgMomentum: number;
        timestamp: number;
      };
    } = await ctx.runQuery(
      internal.stats.sentimentIndex.calculateSentimentIndex,
      {
        startTime: oneHourAgo,
        endTime: now,
      }
    );

    // Store the hourly index score
    await ctx.runMutation(
      internal.stats.sentimentIndex.storeSentimentIndexScore,
      {
        sentimentIndex: indexData.sentimentIndex,
        performanceScore: indexData.performanceScore,
        momentumScore: indexData.momentumScore,
        baseline: indexData.baseline,
        companiesAnalyzed: indexData.metadata.companiesAnalyzed,
        totalMentions: indexData.metadata.totalMentions,
        avgSentiment: indexData.metadata.avgSentiment,
        avgMomentum: indexData.metadata.avgMomentum,
        timestamp: now,
        periodType: "hour",
      }
    );

    console.log(
      `[Sentiment Index] Hourly index: ${indexData.sentimentIndex.toFixed(4)} ` +
      `(P: ${indexData.performanceScore.toFixed(3)}, M: ${indexData.momentumScore.toFixed(3)}, B: ${indexData.baseline.toFixed(3)})`
    );

    return {
      success: true,
      sentimentIndex: indexData.sentimentIndex,
      hour: now,
    };
  },
});

/**
 * Backfill historical sentiment index data for the last 24 hours
 */
export const backfillHistoricalSentimentIndex = internalAction({
  args: {
    hoursBack: v.optional(v.number()), // How many hours to backfill (default: 24)
  },
  returns: v.object({
    success: v.boolean(),
    hoursProcessed: v.number(),
    scores: v.array(v.object({
      hour: v.number(),
      sentimentIndex: v.number(),
    })),
  }),
  handler: async (ctx, args) => {
    const hoursBack = args.hoursBack || 24;
    const now = Date.now();
    const scores: Array<{ hour: number; sentimentIndex: number }> = [];

    console.log(`[Sentiment Index] Backfilling ${hoursBack} hours of sentiment index data...`);

    // Process each hour
    for (let i = 0; i < hoursBack; i++) {
      const hourEnd = now - (i * 60 * 60 * 1000);
      const hourStart = hourEnd - (60 * 60 * 1000);

      console.log(`[Sentiment Index] Processing hour ${i + 1}/${hoursBack}...`);

      // Calculate sentiment index for this hour
      const indexData = await ctx.runQuery(
        internal.stats.sentimentIndex.calculateSentimentIndex,
        {
          startTime: hourStart,
          endTime: hourEnd,
        }
      );

      // Store the hourly index score
      await ctx.runMutation(
        internal.stats.sentimentIndex.storeSentimentIndexScore,
        {
          sentimentIndex: indexData.sentimentIndex,
          performanceScore: indexData.performanceScore,
          momentumScore: indexData.momentumScore,
          baseline: indexData.baseline,
          companiesAnalyzed: indexData.metadata.companiesAnalyzed,
          totalMentions: indexData.metadata.totalMentions,
          avgSentiment: indexData.metadata.avgSentiment,
          avgMomentum: indexData.metadata.avgMomentum,
          timestamp: hourEnd,
          periodType: "hour",
        }
      );

      scores.push({
        hour: hourEnd,
        sentimentIndex: indexData.sentimentIndex,
      });

      console.log(
        `[Sentiment Index] Hour ${i + 1}: ${indexData.sentimentIndex.toFixed(4)} ` +
        `(${indexData.metadata.companiesAnalyzed} companies, ${indexData.metadata.totalMentions} mentions)`
      );
    }

    console.log(`[Sentiment Index] Backfill complete! Processed ${scores.length} hours.`);

    return {
      success: true,
      hoursProcessed: scores.length,
      scores,
    };
  },
});

/**
 * Store a sentiment index score in the database
 */
export const storeSentimentIndexScore = internalMutation({
  args: {
    sentimentIndex: v.number(),
    performanceScore: v.number(),
    momentumScore: v.number(),
    baseline: v.number(),
    companiesAnalyzed: v.number(),
    totalMentions: v.number(),
    avgSentiment: v.number(),
    avgMomentum: v.number(),
    timestamp: v.number(),
    periodType: v.string(), // "hour", "day", etc.
  },
  returns: v.id("sentiment_index_history"),
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("sentiment_index_history", {
      sentiment_index: args.sentimentIndex,
      performance_score: args.performanceScore,
      momentum_score: args.momentumScore,
      baseline: args.baseline,
      companies_analyzed: args.companiesAnalyzed,
      total_mentions: args.totalMentions,
      avg_sentiment: args.avgSentiment,
      avg_momentum: args.avgMomentum,
      timestamp: args.timestamp,
      period_type: args.periodType,
    });

    return id;
  },
});

/**
 * Get the last 24 hours of sentiment index data for charting
 */
export const getLast24HoursSentimentIndex = query({
  args: {},
  returns: v.array(
    v.object({
      hour: v.number(),
      sentimentIndex: v.number(),
      performanceScore: v.number(),
      momentumScore: v.number(),
      baseline: v.number(),
      timestamp: v.string(),
    })
  ),
  handler: async (ctx) => {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    const data = await ctx.db
      .query("sentiment_index_history")
      .withIndex("by_timestamp")
      .filter((q) =>
        q.and(
          q.gte(q.field("timestamp"), twentyFourHoursAgo),
          q.eq(q.field("period_type"), "hour")
        )
      )
      .order("asc")
      .collect();

    // Transform to chart format
    return data.map((point, index) => ({
      hour: index + 1,
      sentimentIndex: point.sentiment_index,
      performanceScore: point.performance_score,
      momentumScore: point.momentum_score,
      baseline: point.baseline,
      timestamp: new Date(point.timestamp).toISOString(),
    }));
  },
});
