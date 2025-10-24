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

    // Nasdaq-100 tickers
    const tickers = [
      "AAPL", "MSFT", "NVDA", "AMZN", "META", "GOOGL", "GOOG", "TSLA", "AVGO", "COST",
      "NFLX", "ADBE", "PEP", "CSCO", "CMCSA", "TMUS", "INTC", "AMD", "INTU", "QCOM",
      "AMGN", "HON", "TXN", "SBUX", "AMAT", "ISRG", "BKNG", "MDLZ", "ADP", "GILD",
      "VRTX", "REGN", "ADI", "LRCX", "PANW", "PYPL", "MU", "KLAC", "SNPS", "CDNS",
      "MRVL", "ASML", "NXPI", "ORLY", "CSX", "ABNB", "CTAS", "ADSK", "CHTR", "MNST",
      "PCAR", "AEP", "PAYX", "ROST", "FAST", "ODFL", "KDP", "EA", "VRSK", "DXCM",
      "CTSH", "EXC", "KHC", "GEHC", "TEAM", "CSGP", "LULU", "IDXX", "ANSS", "DDOG",
      "XEL", "BKR", "MCHP", "WBD", "ON", "FANG", "BIIB", "CCEP", "CDW", "ILMN",
      "GFS", "MRNA", "CRWD", "MDB", "WBA", "FTNT", "ZS", "DASH", "WDAY", "TTWO",
      "TTD", "ZM", "PDD", "CPRT", "DLTR", "ENPH", "SGEN", "ALGN", "SIRI", "SMCI"
    ];

    const weights = {
      AAPL: 9.0, MSFT: 8.5, AMZN: 3.8, NVDA: 7.5, GOOGL: 3.2, GOOG: 3.0, META: 2.8, TSLA: 2.5,
      AVGO: 2.3, COST: 1.8, NFLX: 1.7, ADBE: 1.5, PEP: 1.4, CSCO: 1.3, CMCSA: 1.2, TMUS: 1.2,
      INTC: 1.1, AMD: 1.1, INTU: 1.0, QCOM: 1.0, AMGN: 0.9, HON: 0.9, TXN: 0.9, SBUX: 0.8,
      AMAT: 0.8, ISRG: 0.8, BKNG: 0.8, MDLZ: 0.7, ADP: 0.7, GILD: 0.7, VRTX: 0.7, REGN: 0.7,
      ADI: 0.6, LRCX: 0.6, PANW: 0.6, PYPL: 0.6, MU: 0.6, KLAC: 0.6, SNPS: 0.6, CDNS: 0.5,
      MRVL: 0.5, ASML: 0.5, NXPI: 0.5, ORLY: 0.5, CSX: 0.5, ABNB: 0.5, CTAS: 0.5, ADSK: 0.5,
      CHTR: 0.4, MNST: 0.4, PCAR: 0.4, AEP: 0.4, PAYX: 0.4, ROST: 0.4, FAST: 0.4, ODFL: 0.4,
      KDP: 0.4, EA: 0.4, VRSK: 0.3, DXCM: 0.3, CTSH: 0.3, EXC: 0.3, KHC: 0.3, GEHC: 0.3,
      TEAM: 0.3, CSGP: 0.3, LULU: 0.3, IDXX: 0.3, ANSS: 0.3, DDOG: 0.3, XEL: 0.2, BKR: 0.2,
      MCHP: 0.2, WBD: 0.2, ON: 0.2, FANG: 0.2, BIIB: 0.2, CCEP: 0.2, CDW: 0.2, ILMN: 0.2,
      GFS: 0.2, MRNA: 0.2, CRWD: 0.2, MDB: 0.2, WBA: 0.2, FTNT: 0.2, ZS: 0.2, DASH: 0.2,
      WDAY: 0.2, TTWO: 0.2, TTD: 0.2, ZM: 0.2, PDD: 0.2, CPRT: 0.2, DLTR: 0.2, ENPH: 0.2,
      SGEN: 0.2, ALGN: 0.2, SIRI: 0.1, SMCI: 0.2
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


