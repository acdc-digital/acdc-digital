import { internalAction, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

/**
 * Scheduled action to update all sentiment scores
 /**
 * Runs once per day to analyze Reddit data from the past year
 */
export const updateAllSentimentScores = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("[Sentiment] Starting scheduled sentiment score update...");
    
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
      const scores: Array<{
        ticker: string;
        weight: number;
        mentionCount: number;
        averageSentiment: number;
        totalEngagement: number;
        momentum: number;
        calculatedScore: number;
        multiplier: number;
        timestamp: number;
      }> = [];

      // Process tickers in parallel batches to avoid timeout
      const BATCH_SIZE = 20; // Process 20 tickers at a time
      const timestamp = Date.now();
      
      for (let i = 0; i < tickers.length; i += BATCH_SIZE) {
        const batch = tickers.slice(i, i + BATCH_SIZE);
        console.log(`[Sentiment] Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(tickers.length / BATCH_SIZE)} (${batch.length} tickers)...`);
        
        // Process batch in parallel
        const batchResults = await Promise.all(
          batch.map(async (ticker) => {
            try {
              // Run the query to get stats for this ticker
              const stats = await ctx.runQuery(internal.stats.sentimentQueries.getPostStatsByTickerInternal, {
                ticker,
                timeRange: 720, // 30 days * 24 hours
              });

              // Calculate the sentiment score
              const weight = weights[ticker as keyof typeof weights] || 0.1;
              const TOTAL_POOL = 288878;
              const baseAllocation = (weight / 100) * TOTAL_POOL;

              // Calculate multiplier components
              const mentionScore = Math.min(stats.mentionCount / 100, 1) * 0.2;
              const sentimentScore = stats.averageSentiment * 0.4;
              const engagementScore = Math.min(stats.totalEngagement / 10000, 1) * 0.2;
              const momentumScore = ((Math.max(-100, Math.min(100, stats.momentum)) + 100) / 200) * 0.2;
              const multiplier = 0.5 + mentionScore + sentimentScore + engagementScore + momentumScore;

              const calculatedScore = baseAllocation * multiplier;

              return {
                ticker,
                weight,
                mentionCount: stats.mentionCount,
                averageSentiment: stats.averageSentiment,
                totalEngagement: stats.totalEngagement,
                momentum: stats.momentum,
                calculatedScore,
                multiplier,
                timestamp,
              };
            } catch (error) {
              console.error(`[Sentiment] Error processing ${ticker}:`, error);
              // Return zero values for failed tickers to not block entire batch
              const weight = weights[ticker as keyof typeof weights] || 0.1;
              return {
                ticker,
                weight,
                mentionCount: 0,
                averageSentiment: 0,
                totalEngagement: 0,
                momentum: 0,
                calculatedScore: 0,
                multiplier: 0.5,
                timestamp,
              };
            }
          })
        );
        
        scores.push(...batchResults);
      }

      // Store the calculated scores in the database
      await ctx.runMutation(internal.stats.sentimentActions.storeSentimentScores, {
        scores,
      });

      console.log(`[Sentiment] Successfully updated ${scores.length} sentiment scores`);
      
      // Log summary statistics
      const totalScore = scores.reduce((sum, s) => sum + s.calculatedScore, 0);
      const avgMultiplier = scores.reduce((sum, s) => sum + s.multiplier, 0) / scores.length;
      const topScores = scores
        .sort((a, b) => b.calculatedScore - a.calculatedScore)
        .slice(0, 5)
        .map(s => `${s.ticker}: ${s.calculatedScore.toFixed(2)}`);

      console.log(`[Sentiment] Total score: ${totalScore.toFixed(2)}`);
      console.log(`[Sentiment] Avg multiplier: ${avgMultiplier.toFixed(3)}`);
      console.log(`[Sentiment] Top 5: ${topScores.join(", ")}`);

      return { success: true, scoresUpdated: scores.length, totalScore, avgMultiplier };
    } catch (error) {
      console.error("[Sentiment] Error updating sentiment scores:", error);
      throw error;
    }
  },
});

/**
 * Store calculated sentiment scores in the database
 */
export const storeSentimentScores = internalMutation({
  args: {
    scores: v.array(
      v.object({
        ticker: v.string(),
        weight: v.number(),
        mentionCount: v.number(),
        averageSentiment: v.number(),
        totalEngagement: v.number(),
        momentum: v.number(),
        calculatedScore: v.number(),
        multiplier: v.number(),
        timestamp: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Store each score in a sentiment_scores table with change tracking
    let scoresWithChanges = 0;
    let maxChange = 0;
    
    for (const score of args.scores) {
      // Get the most recent score for this ticker to calculate change
      const previousScore = await ctx.db
        .query("sentiment_scores")
        .withIndex("by_ticker_and_calculated_at", (q) => q.eq("ticker", score.ticker))
        .order("desc")
        .first();

      // Calculate change percentage
      let scoreChangePercent: number | undefined = undefined;
      let previousScoreValue: number | undefined = undefined;

      if (previousScore) {
        previousScoreValue = previousScore.calculated_score;
        const rawChange = ((score.calculatedScore - previousScoreValue) / previousScoreValue) * 100;
        scoreChangePercent = rawChange;
        
        // Track statistics
        if (Math.abs(rawChange) > Math.abs(maxChange)) {
          maxChange = rawChange;
        }
        if (Math.abs(rawChange) > 0.01) {
          scoresWithChanges++;
        }
      }

      await ctx.db.insert("sentiment_scores", {
        ticker: score.ticker,
        weight: score.weight,
        mention_count: score.mentionCount,
        average_sentiment: score.averageSentiment,
        total_engagement: score.totalEngagement,
        momentum: score.momentum,
        calculated_score: score.calculatedScore,
        multiplier: score.multiplier,
        previous_score: previousScoreValue,
        score_change_percent: scoreChangePercent,
        calculated_at: score.timestamp,
      });
    }

    console.log(`[Sentiment] Scores with changes: ${scoresWithChanges}/${args.scores.length}`);
    console.log(`[Sentiment] Max change: ${maxChange.toFixed(2)}%`);

    return { success: true, stored: args.scores.length, scoresWithChanges, maxChange };
  },
});
