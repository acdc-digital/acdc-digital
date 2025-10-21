import { v } from "convex/values";
import { query, action } from "../_generated/server";

// Enhanced trending analysis with LLM keyword extraction
export const getEnhancedTrends = query({
  args: {
    timeRange: v.optional(v.union(
      v.literal("1h"),
      v.literal("6h"), 
      v.literal("24h"),
      v.literal("7d")
    )),
    limit: v.optional(v.number())
  },
  returns: v.array(v.object({
    keyword: v.string(),
    count: v.number(),
    confidence: v.number(),
    category: v.string(),
    sentiment: v.string(),
    topPosts: v.array(v.object({
      title: v.string(),
      subreddit: v.optional(v.string()),
      score: v.optional(v.number())
    })),
    trending: v.boolean()
  })),
  handler: async (ctx, args) => {
    const timeRange = args.timeRange || "24h";
    const limit = args.limit || 20;
    
    // Calculate time window
    const now = Date.now();
    const timeWindows = {
      "1h": 3600000,
      "6h": 21600000,
      "24h": 86400000,
      "7d": 604800000
    };
    const since = now - timeWindows[timeRange];
    
    // Get recent posts with high engagement
    const recentPosts = await ctx.db
      .query("live_feed_posts")
      .withIndex("by_addedAt")
      .filter(q => q.gte(q.field("addedAt"), since))
      .order("desc")
      .take(200); // Analyze top 200 recent posts
    
    // Check if we have any processed keywords in post_stats
    const processedStats = await ctx.db
      .query("post_stats")
      .withIndex("by_created")
      .filter(q => q.gte(q.field("created_at"), since))
      .collect();
    
    // If we have processed keywords, use them
    if (processedStats.length > 0) {
      const keywordMap = new Map<string, {
        count: number,
        sentiment: string[],
        categories: string[],
        posts: typeof recentPosts
      }>();
      
      for (const stat of processedStats) {
        if (stat.keywords && stat.keywords.length > 0) {
          // Find the corresponding post
          const post = recentPosts.find(p => p.id === stat.post_id);
          if (!post) continue;
          
          for (const keyword of stat.keywords) {
            if (!keywordMap.has(keyword)) {
              keywordMap.set(keyword, {
                count: 0,
                sentiment: [],
                categories: [],
                posts: []
              });
            }
            
            const data = keywordMap.get(keyword)!;
            data.count++;
            data.posts.push(post);
            if (stat.sentiment) data.sentiment.push(stat.sentiment);
            if (stat.categories) data.categories.push(...stat.categories);
          }
        }
      }
      
      // Transform to output format
      const trends = Array.from(keywordMap.entries()).map(([keyword, data]) => {
        // Calculate dominant sentiment
        const sentimentCounts = data.sentiment.reduce((acc, s) => {
          acc[s] = (acc[s] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const dominantSentiment = Object.entries(sentimentCounts)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';
        
        // Calculate dominant category
        const categoryCounts = data.categories.reduce((acc, c) => {
          acc[c] = (acc[c] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const dominantCategory = Object.entries(categoryCounts)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'general';
        
        return {
          keyword,
          count: data.count,
          confidence: Math.min(data.count * 0.1, 1.0), // Simple confidence based on frequency
          category: dominantCategory,
          sentiment: dominantSentiment,
          topPosts: data.posts
            .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
            .slice(0, 3)
            .map(p => ({
              title: p.title,
              subreddit: p.subreddit,
              score: p.score
            })),
          trending: data.count >= 3
        };
      });
      
      return trends
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    }
    
    // Fallback: Extract keywords from post titles and content using advanced analysis
    const keywordMap = new Map<string, {
      count: number,
      posts: typeof recentPosts,
      categories: Set<string>,
      sentiments: string[]
    }>();
    
    // Advanced keyword extraction from titles and content
    for (const post of recentPosts) {
      const fullText = `${post.title} ${post.selftext || ''}`;
      const keywords = extractAdvancedKeywords(fullText);
      const category = inferCategory(post.subreddit, fullText);
      const sentiment = inferSentiment(fullText);
      
      for (const keyword of keywords) {
        if (!keywordMap.has(keyword)) {
          keywordMap.set(keyword, { 
            count: 0, 
            posts: [], 
            categories: new Set(),
            sentiments: []
          });
        }
        
        const data = keywordMap.get(keyword)!;
        data.count++;
        data.posts.push(post);
        data.categories.add(category);
        data.sentiments.push(sentiment);
      }
    }
    
    // Transform to output format with enhanced data
    const trends = Array.from(keywordMap.entries())
      .filter(([, data]) => data.count >= 2) // Filter out single occurrences
      .map(([keyword, data]) => {
        // Get dominant category and sentiment
        const categoryArray = Array.from(data.categories);
        const dominantCategory = categoryArray.length > 0 ? categoryArray[0] : 'general';
        
        const sentimentCounts = data.sentiments.reduce((acc, s) => {
          acc[s] = (acc[s] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const dominantSentiment = Object.entries(sentimentCounts)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';
        
        return {
          keyword,
          count: data.count,
          confidence: Math.min(data.count * 0.1, 0.9), // Better confidence for advanced extraction
          category: dominantCategory,
          sentiment: dominantSentiment,
          topPosts: data.posts
            .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
            .slice(0, 3)
            .map(p => ({
              title: p.title,
              subreddit: p.subreddit,
              score: p.score
            })),
          trending: data.count >= 3
        };
      });
    
    return trends
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
});

// Get top posts for LLM analysis
export const getTopPostsForAnalysis = query({
  args: {
    limit: v.optional(v.number()),
    minScore: v.optional(v.number())
  },
  returns: v.array(v.object({
    id: v.string(),
    title: v.string(),
    subreddit: v.optional(v.string()),
    selftext: v.string(),
    score: v.number(),
    created_utc: v.number()
  })),
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const minScore = args.minScore || 10;
    
    // Get recent high-scoring posts
    const posts = await ctx.db
      .query("live_feed_posts")
      .withIndex("by_score")
      .filter(q => q.gte(q.field("score"), minScore))
      .order("desc")
      .take(limit);
    
    return posts.map(post => ({
      id: post.id,
      title: post.title,
      subreddit: post.subreddit,
      selftext: post.selftext,
      score: post.score ?? 0,
      created_utc: post.created_utc
    }));
  }
});

// Batch process keywords with LLM (to be called from client)
export const processKeywordsWithLLM = action({
  args: {
    posts: v.array(v.object({
      id: v.string(),
      title: v.string(),
      subreddit: v.string(),
      selftext: v.optional(v.string())
    }))
  },
  returns: v.array(v.object({
    postId: v.string(),
    keywords: v.array(v.string()),
    categories: v.array(v.string()),
    sentiment: v.string(),
    confidence: v.number()
  })),
  handler: async (ctx, args) => {
    // For now, use enhanced keyword extraction
    // In a real implementation, you'd call an LLM API here
    
    const results = [];
    
    for (const post of args.posts) {
      const title = post.title;
      const content = post.selftext || '';
      const fullText = `${title} ${content}`;
      
      // Enhanced keyword extraction
      const keywords = extractAdvancedKeywords(fullText);
      const category = inferCategory(post.subreddit, fullText);
      const sentiment = inferSentiment(fullText);
      
      results.push({
        postId: post.id,
        keywords: keywords.slice(0, 5), // Top 5 keywords
        categories: [category],
        sentiment,
        confidence: 0.7 // Mock confidence for now
      });
    }
    
    return results;
  }
});

// Advanced keyword extraction with better logic
function extractAdvancedKeywords(text: string): string[] {
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your',
    'his', 'its', 'our', 'their', 'what', 'how', 'when', 'where', 'why', 'who', 'which',
    'just', 'now', 'like', 'get', 'go', 'come', 'make', 'take', 'see', 'know', 'think', 'want',
    'need', 'try', 'use', 'work', 'help', 'look', 'find', 'give', 'way', 'back', 'much', 'good',
    'new', 'first', 'last', 'long', 'great', 'little', 'own', 'other', 'old', 'right', 'big',
    'reddit', 'post', 'comment', 'thread', 'subreddit'
  ]);
  
  // Look for capitalized words (proper nouns), technical terms, etc.
  const words = text.split(/\s+/);
  const keywords = [];
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i].replace(/[^\w]/g, '').toLowerCase();
    
    // Skip common words and short words
    if (commonWords.has(word) || word.length < 3) continue;
    
    // Check for multi-word phrases (like "artificial intelligence", "climate change")
    if (i < words.length - 1) {
      const nextWord = words[i + 1].replace(/[^\w]/g, '').toLowerCase();
      if (!commonWords.has(nextWord) && nextWord.length > 3) {
        const phrase = `${word} ${nextWord}`;
        keywords.push(phrase);
        i++; // Skip next word since we used it in phrase
        continue;
      }
    }
    
    keywords.push(word);
  }
  
  // Count frequency and return top keywords
  const frequency = keywords.reduce((acc, keyword) => {
    acc[keyword] = (acc[keyword] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .map(([keyword]) => keyword)
    .slice(0, 8);
}

// Infer category from subreddit and content
function inferCategory(subreddit: string | undefined, text: string): string {
  const techSubreddits = ['technology', 'programming', 'coding', 'webdev', 'reactjs', 'javascript', 'python', 'MachineLearning', 'artificial'];
  const politicsSubreddits = ['politics', 'worldnews', 'news', 'PoliticalDiscussion'];
  const businessSubreddits = ['business', 'entrepreneur', 'investing', 'stocks', 'economics'];
  const scienceSubreddits = ['science', 'askscience', 'physics', 'biology', 'chemistry'];
  const lifestyleSubreddits = ['lifeprotips', 'productivity', 'fitness', 'nutrition', 'selfimprovement'];
  const entertainmentSubreddits = ['movies', 'television', 'music', 'gaming', 'sports'];
  
  const lowerSubreddit = (subreddit ?? 'unknown').toLowerCase();
  const lowerText = text.toLowerCase();
  
  if (techSubreddits.some(sub => lowerSubreddit.includes(sub)) || 
      /\b(ai|artificial intelligence|machine learning|programming|coding|software|tech|app|website)\b/.test(lowerText)) {
    return 'technology';
  }
  
  if (politicsSubreddits.some(sub => lowerSubreddit.includes(sub)) ||
      /\b(election|vote|government|political|policy|democracy)\b/.test(lowerText)) {
    return 'politics';
  }
  
  if (businessSubreddits.some(sub => lowerSubreddit.includes(sub)) ||
      /\b(business|startup|investment|market|economy|financial)\b/.test(lowerText)) {
    return 'business';
  }
  
  if (scienceSubreddits.some(sub => lowerSubreddit.includes(sub)) ||
      /\b(research|study|scientific|experiment|discovery)\b/.test(lowerText)) {
    return 'science';
  }
  
  if (lifestyleSubreddits.some(sub => lowerSubreddit.includes(sub)) ||
      /\b(health|fitness|lifestyle|productivity|self.improvement)\b/.test(lowerText)) {
    return 'lifestyle';
  }
  
  if (entertainmentSubreddits.some(sub => lowerSubreddit.includes(sub)) ||
      /\b(movie|film|music|game|sport|entertainment)\b/.test(lowerText)) {
    return 'entertainment';
  }
  
  return 'general';
}

// Simple sentiment inference
function inferSentiment(text: string): string {
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'awesome', 'love', 'best', 'perfect', 'wonderful', 'fantastic'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'stupid', 'fail', 'problem', 'issue'];
  
  const lowerText = text.toLowerCase();
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveScore++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeScore++;
  });
  
  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
}