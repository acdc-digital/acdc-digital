// KEYWORD EXTRACTION WITH CACHING
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/convex/keywords/extraction.ts

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { api } from "../_generated/api";

/**
 * Extract keywords from stats with smart caching
 */
export const extractKeywordsFromStats = mutation({
  args: {
    forceRefresh: v.optional(v.boolean()),
  },
  returns: v.object({
    keywords: v.array(v.object({
      term: v.string(),
      count: v.number(),
      sources: v.array(v.string()),
      sentiment: v.optional(v.string()),
      relatedTickers: v.array(v.string()),
      category: v.string(),
    })),
    fromCache: v.boolean(),
    extractionTime: v.number(),
  }),
  handler: async (ctx, args) => {
    // Generate cache key based on current data
    const sourceHash = generateSourceHash();
    
    // Check cache first
    if (!args.forceRefresh) {
      const cached = await ctx.db
        .query("keywordCache")
        .withIndex("by_sourceHash", (q) => q.eq("sourceHash", sourceHash))
        .filter((q) => q.gt(q.field("expiresAt"), Date.now()))
        .first();
      
      if (cached) {
        return {
          keywords: cached.keywords.map(k => ({
            ...k,
            sentiment: k.sentiment || undefined,
          })),
          fromCache: true,
          extractionTime: cached.extractedAt,
        };
      }
    }
    
    // Extract fresh keywords from multiple sources
    const startTime = Date.now();
    
    // 1. Get trading mentions data
    const tradingData = await ctx.runQuery(
      api.stats.tradingEnhanced.getSubredditsByNasdaqMentions,
      { timeRange: "7d" }
    );
    
    // 2. Get story correlations (for future expansion)
    // const storyData = await ctx.runQuery(
    //   api.stats.tradingEnhanced.getStoryHistoryByNasdaqMentions
    // );
    
    // 3. Get top posts with mentions
    const postRankings = await ctx.runQuery(
      api.stats.tradingEnhanced.getTradingPostRankings,
      { limit: 100 }
    );
    
    // Extract keywords from different sources
    const keywordMap = new Map<string, {
      count: number;
      sources: Set<string>;
      relatedTickers: Set<string>;
      sentiment: Map<string, number>;
      category: string;
    }>();
    
    // Process ticker mentions
    tradingData.subredditStats.forEach((stat: {
      subreddit: string;
      uniqueTickers: string[];
      topMentions: Array<{ ticker: string; count: number; sentiment: number }>;
      mentionCount: number;
      sentimentStrength: string;
    }) => {
      stat.uniqueTickers.forEach((ticker: string) => {
        if (!keywordMap.has(ticker)) {
          keywordMap.set(ticker, {
            count: 0,
            sources: new Set(),
            relatedTickers: new Set(),
            sentiment: new Map(),
            category: "ticker",
          });
        }
        const data = keywordMap.get(ticker)!;
        data.count += stat.mentionCount;
        data.sources.add(stat.subreddit);
        
        // Track sentiment
        const sentKey = stat.sentimentStrength;
        data.sentiment.set(sentKey, (data.sentiment.get(sentKey) || 0) + 1);
      });
      
      // Extract topic keywords from top mentions
      stat.topMentions.forEach((mention: { ticker: string; count: number; sentiment: number }) => {
        // Add sector/industry keywords based on ticker
        const sector = getTickerSector(mention.ticker);
        if (sector && !keywordMap.has(sector)) {
          keywordMap.set(sector, {
            count: 0,
            sources: new Set(),
            relatedTickers: new Set(),
            sentiment: new Map(),
            category: "sector",
          });
        }
        if (sector) {
          const data = keywordMap.get(sector)!;
          data.count += mention.count;
          data.sources.add(stat.subreddit);
          data.relatedTickers.add(mention.ticker);
        }
      });
    });
    
    // Process post titles for topic keywords (limit processing for performance)
    const postsToProcess = postRankings.posts.slice(0, 50); // Limit to top 50 posts for performance
    postsToProcess.forEach((post: {
      title: string;
      mentionedTickers: Array<{ ticker: string; sentiment: string; confidence: number; impactScore: number }>;
      subreddit: string;
      overallSentiment: string;
    }) => {
      const titleKeywords = extractKeywordsFromText(post.title);
      
      // Limit to top 10 keywords per post to prevent explosion
      titleKeywords.slice(0, 10).forEach(keyword => {
        if (!keywordMap.has(keyword)) {
          keywordMap.set(keyword, {
            count: 0,
            sources: new Set(),
            relatedTickers: new Set(),
            sentiment: new Map(),
            category: "topic",
          });
        }
        const data = keywordMap.get(keyword)!;
        data.count++;
        data.sources.add(post.subreddit);
        
        // Link to mentioned tickers
        post.mentionedTickers.forEach((t: { ticker: string; sentiment: string; confidence: number; impactScore: number }) => {
          data.relatedTickers.add(t.ticker);
        });
        
        // Track sentiment
        if (post.overallSentiment !== "neutral") {
          data.sentiment.set(
            post.overallSentiment,
            (data.sentiment.get(post.overallSentiment) || 0) + 1
          );
        }
      });
    });
    
    // Convert to array and sort by relevance
    const keywords = Array.from(keywordMap.entries())
      .map(([term, data]) => {
        // Calculate dominant sentiment
        let dominantSentiment: string | null = null;
        let maxSentimentCount = 0;
        data.sentiment.forEach((count, sentiment) => {
          if (count > maxSentimentCount && sentiment !== "neutral") {
            maxSentimentCount = count;
            dominantSentiment = sentiment;
          }
        });
        
        return {
          term,
          count: data.count,
          sources: Array.from(data.sources),
          sentiment: dominantSentiment,
          relatedTickers: Array.from(data.relatedTickers),
          category: data.category,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 100); // Top 100 keywords
    
    // Note: LLM refinement removed to fix type errors
    // Mutations cannot call actions in Convex
    // Keywords are still meaningful without refinement
    const finalKeywords = keywords;
    
    // Save to cache
    await ctx.db.insert("keywordCache", {
      sourceType: "combined",
      sourceHash,
      keywords: finalKeywords,
      extractedAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hour TTL
    });
    
    return {
      keywords: finalKeywords.map(k => ({
        ...k,
        sentiment: k.sentiment || undefined,
      })),
      fromCache: false,
      extractionTime: Date.now() - startTime,
    };
  },
});

/**
 * Get cached keywords
 */
export const getCachedKeywords = query({
  args: {},
  returns: v.union(
    v.object({
      keywords: v.array(v.object({
        term: v.string(),
        count: v.number(),
        sources: v.array(v.string()),
        sentiment: v.optional(v.string()),
        relatedTickers: v.array(v.string()),
        category: v.string(),
      })),
      fromCache: v.boolean(),
      extractionTime: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const sourceHash = generateSourceHash();
    
    const cached = await ctx.db
      .query("keywordCache")
      .withIndex("by_sourceHash", (q) => q.eq("sourceHash", sourceHash))
      .filter((q) => q.gt(q.field("expiresAt"), Date.now()))
      .first();
    
    if (!cached) {
      return null;
    }
    
    return {
      keywords: cached.keywords.map(k => ({
        ...k,
        sentiment: k.sentiment || undefined,
      })),
      fromCache: true,
      extractionTime: cached.extractedAt,
    };
  },
});

// Helper functions
function generateSourceHash(): string {
  // Create a hash based on the current data state
  // Hour precision for reasonable cache invalidation
  const timestamp = Math.floor(Date.now() / (60 * 60 * 1000));
  return `stats_${timestamp}`;
}

function extractKeywordsFromText(text: string): string[] {
  // Enhanced stop words list - filter out meaningless words
  const stopWords = new Set([
    // Articles & conjunctions
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'from', 'this', 'that', 'will', 'about', 'into', 'than', 'them', 'been', 'have', 'has', 'had', 'are', 'was', 'were', 'would', 'could', 'should',
    // Common discourse markers & filler words
    'what', 'when', 'where', 'which', 'who', 'why', 'how', 'just', 'like', 'get', 'got', 'can', 'also', 'make', 'even', 'much', 'more', 'very', 'still', 'need', 'help', 'want', 'think', 'know', 'going', 'see', 'look', 'way', 'may', 'said', 'say', 'over', 'after', 'back', 'out', 'use', 'her', 'him', 'his', 'their', 'some', 'there', 'any', 'all', 'now', 'then', 'only', 'come', 'its', 'our', 'not', 'first', 'other', 'new', 'because', 'most', 'time', 'people', 'year', 'years', 'thing', 'things', 'well', 'really', 'good', 'great', 'best', 'better', 'full', 'video', 'another', 'one', 'two', 'question',
    // Reddit-specific noise
    'post', 'posts', 'reddit', 'upvote', 'upvotes', 'comment', 'comments', 'thread', 'link', 'subreddit'
  ]);
  
  // Normalize text
  const normalized = text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const words = normalized.split(' ').filter(word => word.length > 0);
  
  // Extract meaningful phrases (bigrams and trigrams)
  const phrases: string[] = [];
  
  // Trigrams (3-word phrases) - highest priority
  for (let i = 0; i < words.length - 2; i++) {
    const w1 = words[i], w2 = words[i + 1], w3 = words[i + 2];
    if (w1.length > 2 && w2.length > 2 && w3.length > 2 && 
        !stopWords.has(w1) && !stopWords.has(w2) && !stopWords.has(w3)) {
      phrases.push(`${w1} ${w2} ${w3}`);
    }
  }
  
  // Bigrams (2-word phrases) - medium priority
  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i], w2 = words[i + 1];
    if (w1.length > 2 && w2.length > 2 && 
        !stopWords.has(w1) && !stopWords.has(w2)) {
      phrases.push(`${w1} ${w2}`);
    }
  }
  
  // Domain-specific keywords - only keep meaningful single words
  const domainKeywords = new Set([
    'earnings', 'revenue', 'profit', 'growth', 'valuation', 'dividend', 'stock', 'market', 'trading', 'investment', 'investor', 'portfolio', 'price', 'share', 'shares', 'rally', 'drop', 'surge', 'bullish', 'bearish', 'analysis', 'forecast', 'target', 'upgrade', 'downgrade', 'acquisition', 'merger', 'ipo', 'listing', 'regulation', 'competition', 'innovation', 'product', 'launch', 'announcement', 'guidance', 'outlook', 'performance', 'strategy', 'executive', 'technology', 'software', 'hardware', 'semiconductor', 'chip', 'automotive', 'electric', 'vehicle', 'energy', 'renewable', 'healthcare', 'pharmaceutical', 'biotech', 'retail', 'ecommerce', 'streaming', 'entertainment', 'financial', 'banking', 'payment', 'crypto', 'blockchain', 'artificial', 'intelligence', 'cloud', 'computing', 'data', 'security', 'privacy'
  ]);
  
  // Keep only domain-specific single words (4+ characters)
  const meaningfulWords = words.filter(word => 
    word.length >= 4 && 
    !stopWords.has(word) && 
    domainKeywords.has(word)
  );
  
  // Combine and deduplicate, prioritizing longer phrases
  return [...new Set([...phrases, ...meaningfulWords])];
}

function getTickerSector(ticker: string): string | null {
  // Map tickers to sectors
  const sectorMap: Record<string, string> = {
    // Technology
    'AAPL': 'technology',
    'MSFT': 'technology',
    'GOOGL': 'technology',
    'GOOG': 'technology',
    'META': 'technology',
    'NVDA': 'semiconductors',
    'AMD': 'semiconductors',
    'INTC': 'semiconductors',
    'AVGO': 'semiconductors',
    'QCOM': 'semiconductors',
    'CSCO': 'technology',
    'ORCL': 'technology',
    'ADBE': 'technology',
    'CRM': 'technology',
    'ACN': 'technology',
    
    // E-commerce & Retail
    'AMZN': 'e-commerce',
    'COST': 'retail',
    'WMT': 'retail',
    
    // Automotive
    'TSLA': 'automotive',
    
    // Communications
    'NFLX': 'streaming',
    'DIS': 'entertainment',
    'CMCSA': 'communications',
    
    // Financial
    'V': 'financial',
    'MA': 'financial',
    'PYPL': 'financial',
    
    // Healthcare
    'UNH': 'healthcare',
    'JNJ': 'healthcare',
    'PFE': 'healthcare',
    'ABBV': 'healthcare',
    'TMO': 'healthcare',
    
    // Consumer
    'PEP': 'consumer-goods',
    'KO': 'consumer-goods',
    'SBUX': 'consumer-goods',
    
    // Industrial
    'HON': 'industrial',
    'BA': 'aerospace',
  };
  
  return sectorMap[ticker] || null;
}
