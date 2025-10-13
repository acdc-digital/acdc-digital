// TRADING ANALYTICS QUERIES
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/convex/stats/trading.ts

import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get aggregated market sentiment metrics
 */
export const getMarketSentimentMetrics = query({
  args: {},
  returns: v.object({
    overall_sentiment: v.number(), // -100 to 100 scale
    sentiment_trend: v.string(), // "bullish", "bearish", "neutral"
    sentiment_change_24h: v.number(),
    sentiment_strength: v.string(), // "strong", "moderate", "weak"
    bullish_signals: v.number(),
    bearish_signals: v.number(),
    neutral_signals: v.number(),
  }),
  handler: async (ctx) => {
    const signals = await ctx.db.query("trading_signals").collect();
    
    if (signals.length === 0) {
      return {
        overall_sentiment: 0,
        sentiment_trend: "neutral",
        sentiment_change_24h: 0,
        sentiment_strength: "weak",
        bullish_signals: 0,
        bearish_signals: 0,
        neutral_signals: 0,
      };
    }

    // Calculate weighted sentiment average
    const totalWeight = signals.reduce((sum, s) => sum + s.total_mentions, 0);
    const weightedSentiment = signals.reduce((sum, s) => 
      sum + (s.weighted_sentiment * s.total_mentions), 0
    ) / totalWeight;

    // Count signal types
    const bullish = signals.filter(s => 
      s.signal_action === "buy" || s.signal_action === "strong_buy"
    ).length;
    const bearish = signals.filter(s => 
      s.signal_action === "sell" || s.signal_action === "strong_sell"
    ).length;
    const neutral = signals.filter(s => s.signal_action === "hold").length;

    // Determine trend
    let trend: "bullish" | "bearish" | "neutral";
    if (weightedSentiment > 0.3) trend = "bullish";
    else if (weightedSentiment < -0.3) trend = "bearish";
    else trend = "neutral";

    // Calculate sentiment strength
    const avgConfidence = signals.reduce((sum, s) => sum + s.signal_confidence, 0) / signals.length;
    let strength: "strong" | "moderate" | "weak";
    if (avgConfidence > 0.7) strength = "strong";
    else if (avgConfidence > 0.4) strength = "moderate";
    else strength = "weak";

    // Get 24h change (compare recent vs older signals)
    const now = Date.now();
    const oneDayAgo = now - 86400000;
    const recentSignals = signals.filter(s => s.calculated_at > oneDayAgo);
    const oldSignals = signals.filter(s => s.calculated_at <= oneDayAgo);
    
    const recentSentiment = recentSignals.length > 0
      ? recentSignals.reduce((sum, s) => sum + s.weighted_sentiment, 0) / recentSignals.length
      : weightedSentiment;
    const oldSentiment = oldSignals.length > 0
      ? oldSignals.reduce((sum, s) => sum + s.weighted_sentiment, 0) / oldSignals.length
      : weightedSentiment;
    
    const change24h = ((recentSentiment - oldSentiment) / Math.abs(oldSentiment || 1)) * 100;

    return {
      overall_sentiment: Number((weightedSentiment * 100).toFixed(1)),
      sentiment_trend: trend,
      sentiment_change_24h: Number(change24h.toFixed(1)),
      sentiment_strength: strength,
      bullish_signals: bullish,
      bearish_signals: bearish,
      neutral_signals: neutral,
    };
  },
});

/**
 * Get momentum indicators
 */
export const getMomentumIndicators = query({
  args: {},
  returns: v.object({
    avg_momentum_score: v.number(),
    momentum_trend: v.string(), // "accelerating", "decelerating", "stable"
    high_momentum_tickers: v.number(),
    low_momentum_tickers: v.number(),
    momentum_change_24h: v.number(),
  }),
  handler: async (ctx) => {
    const signals = await ctx.db.query("trading_signals").collect();
    
    if (signals.length === 0) {
      return {
        avg_momentum_score: 0,
        momentum_trend: "stable",
        high_momentum_tickers: 0,
        low_momentum_tickers: 0,
        momentum_change_24h: 0,
      };
    }

    const avgMomentum = signals.reduce((sum, s) => sum + s.momentum_score, 0) / signals.length;
    
    const high = signals.filter(s => s.momentum_score > 0.6).length;
    const low = signals.filter(s => s.momentum_score < 0.4).length;

    // Calculate 24h change
    const now = Date.now();
    const oneDayAgo = now - 86400000;
    const recentSignals = signals.filter(s => s.calculated_at > oneDayAgo);
    const oldSignals = signals.filter(s => s.calculated_at <= oneDayAgo);
    
    const recentMomentum = recentSignals.length > 0
      ? recentSignals.reduce((sum, s) => sum + s.momentum_score, 0) / recentSignals.length
      : avgMomentum;
    const oldMomentum = oldSignals.length > 0
      ? oldSignals.reduce((sum, s) => sum + s.momentum_score, 0) / oldSignals.length
      : avgMomentum;
    
    const change24h = ((recentMomentum - oldMomentum) / (oldMomentum || 1)) * 100;

    let trend: "accelerating" | "decelerating" | "stable";
    if (change24h > 10) trend = "accelerating";
    else if (change24h < -10) trend = "decelerating";
    else trend = "stable";

    return {
      avg_momentum_score: Number((avgMomentum * 100).toFixed(1)),
      momentum_trend: trend,
      high_momentum_tickers: high,
      low_momentum_tickers: low,
      momentum_change_24h: Number(change24h.toFixed(1)),
    };
  },
});

/**
 * Get volatility metrics
 */
export const getVolatilityMetrics = query({
  args: {},
  returns: v.object({
    avg_volatility_index: v.number(),
    volatility_level: v.string(), // "high", "moderate", "low"
    high_volatility_tickers: v.number(),
    stable_tickers: v.number(),
    volatility_trend: v.string(), // "increasing", "decreasing", "stable"
  }),
  handler: async (ctx) => {
    const signals = await ctx.db.query("trading_signals").collect();
    
    if (signals.length === 0) {
      return {
        avg_volatility_index: 0,
        volatility_level: "low",
        high_volatility_tickers: 0,
        stable_tickers: 0,
        volatility_trend: "stable",
      };
    }

    const avgVolatility = signals.reduce((sum, s) => sum + s.volatility_index, 0) / signals.length;
    
    const high = signals.filter(s => s.volatility_index > 0.6).length;
    const stable = signals.filter(s => s.volatility_index < 0.3).length;

    let level: "high" | "moderate" | "low";
    if (avgVolatility > 0.6) level = "high";
    else if (avgVolatility > 0.3) level = "moderate";
    else level = "low";

    // Calculate trend
    const now = Date.now();
    const oneDayAgo = now - 86400000;
    const recentSignals = signals.filter(s => s.calculated_at > oneDayAgo);
    const oldSignals = signals.filter(s => s.calculated_at <= oneDayAgo);
    
    const recentVolatility = recentSignals.length > 0
      ? recentSignals.reduce((sum, s) => sum + s.volatility_index, 0) / recentSignals.length
      : avgVolatility;
    const oldVolatility = oldSignals.length > 0
      ? oldSignals.reduce((sum, s) => sum + s.volatility_index, 0) / oldSignals.length
      : avgVolatility;
    
    const change = recentVolatility - oldVolatility;
    let trend: "increasing" | "decreasing" | "stable";
    if (change > 0.1) trend = "increasing";
    else if (change < -0.1) trend = "decreasing";
    else trend = "stable";

    return {
      avg_volatility_index: Number((avgVolatility * 100).toFixed(1)),
      volatility_level: level,
      high_volatility_tickers: high,
      stable_tickers: stable,
      volatility_trend: trend,
    };
  },
});

/**
 * Get trading signals summary
 */
export const getTradingSignalsSummary = query({
  args: {},
  returns: v.object({
    total_signals: v.number(),
    strong_buy: v.number(),
    buy: v.number(),
    hold: v.number(),
    sell: v.number(),
    strong_sell: v.number(),
    avg_confidence: v.number(),
    high_confidence_signals: v.number(),
  }),
  handler: async (ctx) => {
    const signals = await ctx.db.query("trading_signals").collect();
    
    if (signals.length === 0) {
      return {
        total_signals: 0,
        strong_buy: 0,
        buy: 0,
        hold: 0,
        sell: 0,
        strong_sell: 0,
        avg_confidence: 0,
        high_confidence_signals: 0,
      };
    }

    const counts = {
      strong_buy: signals.filter(s => s.signal_action === "strong_buy").length,
      buy: signals.filter(s => s.signal_action === "buy").length,
      hold: signals.filter(s => s.signal_action === "hold").length,
      sell: signals.filter(s => s.signal_action === "sell").length,
      strong_sell: signals.filter(s => s.signal_action === "strong_sell").length,
    };

    const avgConfidence = signals.reduce((sum, s) => sum + s.signal_confidence, 0) / signals.length;
    const highConfidence = signals.filter(s => s.signal_confidence > 0.7).length;

    return {
      total_signals: signals.length,
      ...counts,
      avg_confidence: Number((avgConfidence * 100).toFixed(1)),
      high_confidence_signals: highConfidence,
    };
  },
});
