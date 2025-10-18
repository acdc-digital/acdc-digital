"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

/**
 * Fetch earnings dates and financial metrics from Finlight.me news articles
 * Parse earnings mentions from recent news to extract dates and metrics
 */
export const getEarningsDates = action({
  args: {
    ticker: v.string(),
  },
  returns: v.union(
    v.object({
      nextEarningsDate: v.union(v.string(), v.null()),
      lastEarningsDate: v.union(v.string(), v.null()),
      marketCap: v.union(v.string(), v.null()),
      volume: v.union(v.string(), v.null()),
      peRatio: v.union(v.string(), v.null()),
    }),
    v.null()
  ),
  handler: async (ctx, args): Promise<{
    nextEarningsDate: string | null;
    lastEarningsDate: string | null;
    marketCap: string | null;
    volume: string | null;
    peRatio: string | null;
  } | null> => {
    try {
      const API_KEY = process.env.FINLIGHT_API_KEY;
      if (!API_KEY) {
        console.error("❌ FINLIGHT_API_KEY not configured");
        return null;
      }

      // Fetch recent earnings-related news from Finlight
      console.log(`📊 Fetching financial data for ${args.ticker}...`);
      
      const fromDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 90 days ago
      
      const requestBody = {
        query: `ticker:${args.ticker} AND (earnings OR "earnings report" OR "quarterly results" OR "financial results")`,
        from: fromDate,
        pageSize: 20,
        language: 'en',
        includeContent: true,
      };
      
      const response = await fetch('https://api.finlight.me/v2/articles', {
        method: 'POST',
        headers: {
          "X-API-KEY": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.error(`❌ Finlight API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const newsData = await response.json();
      
      if (!newsData.articles || newsData.articles.length === 0) {
        console.log(`ℹ️ No earnings articles found for ${args.ticker}`);
        return null;
      }

      // Parse articles for earnings dates and financial metrics
      let nextEarningsDate = null;
      let lastEarningsDate = null;
      const marketCap = null;
      const volume = null;
      const peRatio = null;
      
      const now = new Date();
      
      // Simple parsing of content for earnings dates and metrics
      for (const article of newsData.articles) {
        const content = (article.content || article.summary || article.title || '').toLowerCase();
        const publishDate = new Date(article.publishDate || article.published_at || article.date);
        
        // Look for earnings date patterns
        const datePatterns = [
          /earnings.*?(\w+ \d{1,2},? \d{4})/gi,
          /report.*?(\w+ \d{1,2},? \d{4})/gi,
          /scheduled.*?(\w+ \d{1,2},? \d{4})/gi,
        ];
        
        for (const pattern of datePatterns) {
          const matches = content.matchAll(pattern);
          for (const match of matches) {
            try {
              const dateStr = match[1];
              const earningsDate = new Date(dateStr);
              
              if (earningsDate > now && !nextEarningsDate) {
                nextEarningsDate = earningsDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
              }
            } catch {
              // Invalid date, skip
            }
          }
        }
        
        // If article is about past earnings (published in past), use as last earnings
        if (publishDate <= now && !lastEarningsDate && content.includes('report')) {
          lastEarningsDate = publishDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        }
      }
      
      // Note: Finlight doesn't provide market cap, volume, P/E directly
      // These would need to come from a dedicated financial data API
      // Return null for now so fallback values are used
      
      return {
        nextEarningsDate,
        lastEarningsDate,
        marketCap, // null - will use fallback
        volume, // null - will use fallback
        peRatio, // null - will use fallback
      };
      
    } catch (error) {
      console.error(`❌ Error fetching earnings data for ${args.ticker}:`, error);
      return null;
    }
  },
});
