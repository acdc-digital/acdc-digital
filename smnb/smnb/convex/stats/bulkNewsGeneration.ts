"use node";

import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { v } from "convex/values";

// All 100 NASDAQ tickers with their weights
const NASDAQ_100_TICKERS = [
  { ticker: "AAPL", weight: 10.63 },
  { ticker: "MSFT", weight: 9.12 },
  { ticker: "GOOGL", weight: 3.87 },
  { ticker: "AMZN", weight: 6.89 },
  { ticker: "NVDA", weight: 8.45 },
  { ticker: "META", weight: 4.23 },
  { ticker: "TSLA", weight: 5.67 },
  { ticker: "AVGO", weight: 4.50 },
  { ticker: "ORCL", weight: 2.34 },
  { ticker: "COST", weight: 3.12 },
  { ticker: "ADBE", weight: 2.89 },
  { ticker: "CSCO", weight: 2.45 },
  { ticker: "AMD", weight: 3.78 },
  { ticker: "NFLX", weight: 2.98 },
  { ticker: "INTC", weight: 1.89 },
  { ticker: "QCOM", weight: 2.67 },
  { ticker: "TMUS", weight: 2.34 },
  { ticker: "PEP", weight: 2.56 },
  { ticker: "AMGN", weight: 1.78 },
  { ticker: "AMAT", weight: 2.12 },
  { ticker: "TXN", weight: 2.34 },
  { ticker: "INTU", weight: 2.45 },
  { ticker: "ISRG", weight: 1.98 },
  { ticker: "BKNG", weight: 1.67 },
  { ticker: "SBUX", weight: 1.45 },
  { ticker: "GILD", weight: 1.34 },
  { ticker: "MDLZ", weight: 1.23 },
  { ticker: "ADI", weight: 1.56 },
  { ticker: "VRTX", weight: 1.89 },
  { ticker: "REGN", weight: 1.45 },
  { ticker: "PANW", weight: 2.01 },
  { ticker: "LRCX", weight: 1.78 },
  { ticker: "SNPS", weight: 1.67 },
  { ticker: "CDNS", weight: 1.34 },
  { ticker: "MELI", weight: 1.45 },
  { ticker: "KLAC", weight: 1.56 },
  { ticker: "ASML", weight: 1.89 },
  { ticker: "CRWD", weight: 1.67 },
  { ticker: "MRVL", weight: 1.45 },
  { ticker: "FTNT", weight: 1.34 },
  { ticker: "ADSK", weight: 1.23 },
  { ticker: "WDAY", weight: 1.12 },
  { ticker: "NXPI", weight: 1.34 },
  { ticker: "ABNB", weight: 1.45 },
  { ticker: "PYPL", weight: 1.23 },
  { ticker: "MNST", weight: 1.12 },
  { ticker: "DASH", weight: 1.01 },
  { ticker: "CHTR", weight: 0.98 },
  { ticker: "TEAM", weight: 1.12 },
  { ticker: "DXCM", weight: 0.89 },
  { ticker: "MRNA", weight: 0.78 },
  { ticker: "PCAR", weight: 0.89 },
  { ticker: "CSX", weight: 0.98 },
  { ticker: "AEP", weight: 0.87 },
  { ticker: "CTAS", weight: 0.76 },
  { ticker: "CPRT", weight: 0.89 },
  { ticker: "PAYX", weight: 0.78 },
  { ticker: "FAST", weight: 0.67 },
  { ticker: "ODFL", weight: 0.76 },
  { ticker: "EA", weight: 0.89 },
  { ticker: "ROST", weight: 0.78 },
  { ticker: "CTSH", weight: 0.67 },
  { ticker: "VRSK", weight: 0.76 },
  { ticker: "BIIB", weight: 0.89 },
  { ticker: "ZS", weight: 0.78 },
  { ticker: "IDXX", weight: 0.67 },
  { ticker: "DDOG", weight: 0.76 },
  { ticker: "ANSS", weight: 0.65 },
  { ticker: "TTWO", weight: 0.78 },
  { ticker: "CSGP", weight: 0.67 },
  { ticker: "ILMN", weight: 0.56 },
  { ticker: "ON", weight: 0.67 },
  { ticker: "WBD", weight: 0.78 },
  { ticker: "MDB", weight: 0.65 },
  { ticker: "GFS", weight: 0.54 },
  { ticker: "FANG", weight: 0.67 },
  { ticker: "GEHC", weight: 0.56 },
  { ticker: "BKR", weight: 0.65 },
  { ticker: "MCHP", weight: 0.54 },
  { ticker: "WBA", weight: 0.43 },
  { ticker: "ZM", weight: 0.54 },
  { ticker: "SMCI", weight: 0.65 },
  { ticker: "LULU", weight: 0.56 },
  { ticker: "ARM", weight: 0.67 },
  { ticker: "TTD", weight: 0.54 },
  { ticker: "EBAY", weight: 0.43 },
  { ticker: "ALGN", weight: 0.52 },
  { ticker: "ENPH", weight: 0.41 },
  { ticker: "XEL", weight: 0.50 },
  { ticker: "AZN", weight: 0.59 },
  { ticker: "SIRI", weight: 0.38 },
  { ticker: "LCID", weight: 0.47 },
  { ticker: "RIVN", weight: 0.56 },
  { ticker: "CEG", weight: 0.45 },
  { ticker: "DLTR", weight: 0.43 },
  { ticker: "KDP", weight: 0.52 },
  { ticker: "KHC", weight: 0.48 },
  { ticker: "CCEP", weight: 0.41 },
  { ticker: "CDW", weight: 0.50 },
];

/**
 * Generate news summaries for all NASDAQ-100 tickers
 * This can be run manually or scheduled
 */
export const generateAllNewsSummaries = action({
  args: {
    batchSize: v.optional(v.number()), // Number of tickers to process at once
    delayMs: v.optional(v.number()), // Delay between batches to avoid rate limits
  },
  returns: v.object({
    total: v.number(),
    successful: v.number(),
    failed: v.number(),
    errors: v.array(v.object({
      ticker: v.string(),
      error: v.string(),
    })),
  }),
  handler: async (ctx, args) => {
    const batchSize = args.batchSize ?? 5; // Process 5 at a time by default
    const delayMs = args.delayMs ?? 2000; // 2 second delay between batches
    
    console.log(`📰 Starting bulk news generation for ${NASDAQ_100_TICKERS.length} tickers...`);
    console.log(`   Batch size: ${batchSize}, Delay: ${delayMs}ms`);
    
    let successful = 0;
    let failed = 0;
    const errors: Array<{ ticker: string; error: string }> = [];
    
    // Process in batches to avoid overwhelming the API
    for (let i = 0; i < NASDAQ_100_TICKERS.length; i += batchSize) {
      const batch = NASDAQ_100_TICKERS.slice(i, i + batchSize);
      console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(NASDAQ_100_TICKERS.length / batchSize)}`);
      
      // Process batch in parallel
      const batchPromises = batch.map(async ({ ticker, weight }) => {
        try {
          console.log(`  📰 Generating news for ${ticker}...`);
          const result = await ctx.runAction(api.stats.finlightNews.generateNewsSummary, {
            ticker,
            weight,
          });
          
          if (result) {
            successful++;
            console.log(`  ✅ ${ticker} - Success (${result.articles_count} articles)`);
          } else {
            failed++;
            errors.push({ ticker, error: "No articles available" });
            console.log(`  ⚠️ ${ticker} - No articles available`);
          }
        } catch (error) {
          failed++;
          const errorMsg = error instanceof Error ? error.message : String(error);
          errors.push({ ticker, error: errorMsg });
          console.log(`  ❌ ${ticker} - Error: ${errorMsg}`);
        }
      });
      
      await Promise.all(batchPromises);
      
      // Delay between batches (except for the last batch)
      if (i + batchSize < NASDAQ_100_TICKERS.length) {
        console.log(`⏳ Waiting ${delayMs}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    console.log(`\n✅ Bulk news generation complete!`);
    console.log(`   Total: ${NASDAQ_100_TICKERS.length}`);
    console.log(`   Successful: ${successful}`);
    console.log(`   Failed: ${failed}`);
    
    return {
      total: NASDAQ_100_TICKERS.length,
      successful,
      failed,
      errors,
    };
  },
});
