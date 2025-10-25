import { internalAction, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

/**
 * INCREMENTAL sentiment score update - only processes new posts
 * Uses running totals instead of recalculating from scratch
 * Runs frequently (every 5-10 minutes) to keep scores current
 */
export const updateAllSentimentScores = internalAction({
  args: {},
  returns: v.object({
    success: v.boolean(),
    scoresUpdated: v.number(),
    newPostsProcessed: v.number(),
    totalScore: v.number(),
    avgMultiplier: v.number(),
  }),
  handler: async (ctx) => {
    console.log("[Sentiment] Starting INCREMENTAL sentiment score update...");

    // Get the last processed timestamp from the most recent sentiment score
    const lastProcessed: number | null = await ctx.runQuery(internal.stats.sentimentQueries.getLastProcessedTimestamp, {});
    const newPostsOnly = lastProcessed !== null;

    if (newPostsOnly) {
      console.log(`[Sentiment] Incremental mode: Processing posts since ${new Date(lastProcessed).toISOString()}`);
    } else {
      console.log("[Sentiment] Initial mode: Processing all historical posts (this will take longer)");
    }

    // Nasdaq-100 tickers (as of May 2025)
    const tickers = [
      "AAPL", "MSFT", "NVDA", "AMZN", "META", "GOOGL", "GOOG", "TSLA", "AVGO", "COST",
      "NFLX", "ADBE", "PEP", "CSCO", "CMCSA", "TMUS", "INTC", "AMD", "INTU", "QCOM",
      "AMGN", "HON", "TXN", "SBUX", "AMAT", "ISRG", "BKNG", "MDLZ", "ADP", "GILD",
      "VRTX", "REGN", "ADI", "LRCX", "PANW", "PYPL", "MU", "KLAC", "SNPS", "CDNS",
      "MRVL", "ASML", "NXPI", "ORLY", "CSX", "ABNB", "CTAS", "ADSK", "CHTR", "MNST",
      "PCAR", "AEP", "PAYX", "ROST", "FAST", "ODFL", "KDP", "EA", "VRSK", "DXCM",
      "CTSH", "EXC", "KHC", "GEHC", "TEAM", "CSGP", "LULU", "IDXX", "ANSS", "DDOG",
      "XEL", "BKR", "MCHP", "WBD", "ON", "FANG", "BIIB", "CCEP", "CDW", "GFS",
      "MRNA", "CRWD", "MDB", "FTNT", "ZS", "DASH", "WDAY", "TTWO", "TTD", "PDD",
      "CPRT", "CEG", "MAR", "AXON", "ROP", "SHOP", "PLTR", "APP", "ARM", "TRI",
      "AZN", "MSTR", "MELI", "LIN"
    ];

    const weights = {
      AAPL: 10.63, MSFT: 8.79, NVDA: 8.45, AMZN: 5.54, META: 4.89, AVGO: 4.76, GOOGL: 2.67, GOOG: 2.59, 
      TSLA: 2.51, COST: 2.49, NFLX: 2.34, AMD: 1.48, PEP: 1.43, TMUS: 1.41, ADBE: 1.41, CSCO: 1.39, 
      LIN: 1.34, QCOM: 1.26, CMCSA: 1.18, INTU: 1.13, TXN: 1.11, AMGN: 1.06, INTC: 1.04, AMAT: 1.02, 
      HON: 0.99, ISRG: 0.97, BKNG: 0.94, VRTX: 0.93, ADP: 0.91, PANW: 0.88, SBUX: 0.86, GILD: 0.84, 
      MU: 0.83, ADI: 0.82, REGN: 0.79, LRCX: 0.77, MDLZ: 0.76, KLAC: 0.74, SNPS: 0.73, PYPL: 0.71, 
      CDNS: 0.70, ASML: 0.69, MRVL: 0.68, CRWD: 0.66, ABNB: 0.66, NXPI: 0.65, ORLY: 0.65, CTAS: 0.64, 
      ADSK: 0.63, CSX: 0.62, WDAY: 0.60, PCAR: 0.59, CHTR: 0.58, MNST: 0.58, AEP: 0.57, PAYX: 0.56, 
      ROST: 0.55, LULU: 0.54, ODFL: 0.54, FAST: 0.53, KDP: 0.52, DXCM: 0.52, CTSH: 0.51, EA: 0.50, 
      GEHC: 0.49, VRSK: 0.49, EXC: 0.48, IDXX: 0.48, KHC: 0.47, TEAM: 0.46, CSGP: 0.45, TTWO: 0.44, 
      ANSS: 0.44, DDOG: 0.43, ZS: 0.43, ON: 0.42, BIIB: 0.41, XEL: 0.41, BKR: 0.40, MCHP: 0.39, 
      FANG: 0.39, WBD: 0.38, FTNT: 0.38, CDW: 0.37, CCEP: 0.36, MDB: 0.35, GFS: 0.34, DASH: 0.33, 
      MRNA: 0.32, TTD: 0.30, PDD: 0.28, CPRT: 0.27, CEG: 0.26, MAR: 0.25, AXON: 0.24, ROP: 0.23, 
      SHOP: 0.22, PLTR: 0.21, APP: 0.20, ARM: 0.19, TRI: 0.18, AZN: 0.17, MSTR: 0.16, MELI: 0.15
    } as const;

    try {
      const timestamp = Date.now();

      // Use incremental update that only processes new posts
      const result: {
        tickersUpdated: number;
        newPostsProcessed: number;
        totalScore: number;
        avgMultiplier: number;
        topScores: Array<string>;
      } = await ctx.runMutation(internal.stats.sentimentActions.incrementalUpdateScores, {
        tickers,
        weights: Object.fromEntries(Object.entries(weights)),
        lastProcessedTimestamp: lastProcessed,
        currentTimestamp: timestamp,
      });

      console.log(`[Sentiment] Successfully updated ${result.tickersUpdated} sentiment scores`);
      console.log(`[Sentiment] Processed ${result.newPostsProcessed} new posts`);
      console.log(`[Sentiment] Total score: ${result.totalScore.toFixed(2)}`);
      console.log(`[Sentiment] Avg multiplier: ${result.avgMultiplier.toFixed(3)}`);
      console.log(`[Sentiment] Top 5: ${result.topScores.join(", ")}`);

      return {
        success: true,
        scoresUpdated: result.tickersUpdated,
        newPostsProcessed: result.newPostsProcessed,
        totalScore: result.totalScore,
        avgMultiplier: result.avgMultiplier
      };
    } catch (error) {
      console.error("[Sentiment] Error updating sentiment scores:", error);
      throw error;
    }
  },
});

/**
 * Incremental mutation that updates running totals
 * Only processes new posts since last update
 */
export const incrementalUpdateScores = internalMutation({
  args: {
    tickers: v.array(v.string()),
    weights: v.any(), // Record<string, number>
    lastProcessedTimestamp: v.union(v.number(), v.null()),
    currentTimestamp: v.number(),
  },
  returns: v.object({
    tickersUpdated: v.number(),
    newPostsProcessed: v.number(),
    totalScore: v.number(),
    avgMultiplier: v.number(),
    topScores: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const { tickers, weights, lastProcessedTimestamp, currentTimestamp } = args;
    const TOTAL_POOL = 288878;
    const TIME_WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
    const cutoffTime = (currentTimestamp - TIME_WINDOW_MS) / 1000; // Convert to seconds for Reddit timestamps

    // Get new posts since last update (or all posts if first run)
    const newPostsQuery = lastProcessedTimestamp !== null
      ? ctx.db
          .query("live_feed_posts")
          .withIndex("by_created_utc")
          .filter(q =>
            q.and(
              q.gte(q.field("created_utc"), lastProcessedTimestamp / 1000),
              q.gte(q.field("created_utc"), cutoffTime)
            )
          )
      : ctx.db
          .query("live_feed_posts")
          .withIndex("by_created_utc")
          .filter(q => q.gte(q.field("created_utc"), cutoffTime));

    const newPosts = await newPostsQuery.collect();
    console.log(`[Sentiment] Found ${newPosts.length} new posts to process`);

    // Build ticker mention map from new posts
    const tickerMentions: Record<string, Array<typeof newPosts[0]>> = {};
    for (const ticker of tickers) {
      tickerMentions[ticker] = [];
    }

    // Categorize posts by ticker mentions
    for (const post of newPosts) {
      const text = `${post.title} ${post.selftext}`.toLowerCase();
      for (const ticker of tickers) {
        if (text.includes(`$${ticker.toLowerCase()}`) || text.includes(ticker.toLowerCase())) {
          tickerMentions[ticker].push(post);
        }
      }
    }

    // Update scores for each ticker
    const updatedScores: Array<{
      ticker: string;
      calculatedScore: number;
    }> = [];

    for (const ticker of tickers) {
      // Get current (most recent) score for this ticker
      const currentScore = await ctx.db
        .query("sentiment_scores")
        .withIndex("by_ticker_and_calculated_at", q => q.eq("ticker", ticker))
        .order("desc")
        .first();

      const newMentions = tickerMentions[ticker];
      const weight = (weights as Record<string, number>)[ticker] || 0.1;
      
      // If no new mentions and we have a current score, keep it
      if (newMentions.length === 0 && currentScore) {
        // Just refresh the timestamp to show it's still current
        await ctx.db.insert("sentiment_scores", {
          ticker,
          weight,
          mention_count: currentScore.mention_count,
          average_sentiment: currentScore.average_sentiment,
          total_engagement: currentScore.total_engagement,
          momentum: currentScore.momentum,
          calculated_score: currentScore.calculated_score,
          multiplier: currentScore.multiplier,
          previous_score: currentScore.calculated_score,
          score_change_percent: 0,
          calculated_at: currentTimestamp,
        });
        updatedScores.push({ ticker, calculatedScore: currentScore.calculated_score });
        continue;
      }

      // Calculate new incremental stats from new mentions
      const newMentionCount = newMentions.length;
      const newTotalSentiment = newMentions.reduce((sum, p) => sum + p.upvote_ratio, 0);
      const newTotalEngagement = newMentions.reduce(
        (sum, p) => sum + (p.score ?? 0) + (p.num_comments ?? 0) * 2,
        0
      );

      // Combine with running totals
      const totalMentionCount = (currentScore?.mention_count ?? 0) + newMentionCount;
      const totalSentiment = (currentScore ? currentScore.average_sentiment * currentScore.mention_count : 0) + newTotalSentiment;
      const averageSentiment = totalMentionCount > 0 ? totalSentiment / totalMentionCount : 0.5;
      const totalEngagement = (currentScore?.total_engagement ?? 0) + newTotalEngagement;

      // Calculate momentum (simplified for incremental updates)
      const momentum = currentScore?.momentum ?? 0; // Keep previous momentum for now

      // Calculate score with multiplier
      const baseAllocation = (weight / 100) * TOTAL_POOL;
      const mentionScore = Math.min(totalMentionCount / 100, 1) * 0.2;
      const sentimentScore = averageSentiment * 0.4;
      const engagementScore = Math.min(totalEngagement / 10000, 1) * 0.2;
      const momentumScore = ((Math.max(-100, Math.min(100, momentum)) + 100) / 200) * 0.2;
      const multiplier = 0.5 + mentionScore + sentimentScore + engagementScore + momentumScore;
      const calculatedScore = baseAllocation * multiplier;

      // Calculate change
      const previousScoreValue = currentScore?.calculated_score;
      const scoreChangePercent = previousScoreValue
        ? ((calculatedScore - previousScoreValue) / previousScoreValue) * 100
        : undefined;

      // Insert new score record
      await ctx.db.insert("sentiment_scores", {
        ticker,
        weight,
        mention_count: totalMentionCount,
        average_sentiment: averageSentiment,
        total_engagement: totalEngagement,
        momentum,
        calculated_score: calculatedScore,
        multiplier,
        previous_score: previousScoreValue,
        score_change_percent: scoreChangePercent,
        calculated_at: currentTimestamp,
      });

      updatedScores.push({ ticker, calculatedScore });
    }

    // Calculate summary stats
    const totalScore = updatedScores.reduce((sum, s) => sum + s.calculatedScore, 0);
    const avgMultiplier = updatedScores.length > 0
      ? updatedScores.reduce((sum, s) => sum + (s.calculatedScore / totalScore), 0) / updatedScores.length
      : 0;
    const topScores = updatedScores
      .sort((a, b) => b.calculatedScore - a.calculatedScore)
      .slice(0, 5)
      .map(s => `${s.ticker}: ${s.calculatedScore.toFixed(2)}`);

    return {
      tickersUpdated: updatedScores.length,
      newPostsProcessed: newPosts.length,
      totalScore,
      avgMultiplier,
      topScores,
    };
  },
});


