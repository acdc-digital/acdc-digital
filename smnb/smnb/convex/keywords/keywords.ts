// KEYWORD TRENDS PROCESSING SYSTEM
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/convex/keywords.ts

import { mutation, query, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { Doc } from "../_generated/dataModel";

// Process and store keywords from recent posts
export const processKeywordsFromPosts = mutation({
  args: {
    timeWindowHours: v.optional(v.number()),
    minOccurrences: v.optional(v.number())
  },
  returns: v.object({
    runId: v.string(),
    processed: v.number(),
    extracted: v.number()
  }),
  handler: async (ctx, args) => {
    const timeWindow = args.timeWindowHours || 24;
    const minOccurrences = args.minOccurrences || 2;
    const runId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    // Create extraction run record
    await ctx.db.insert("keyword_extraction_runs", {
      run_id: runId,
      started_at: now,
      posts_processed: 0,
      keywords_extracted: 0,
      new_keywords_found: 0,
      keywords_updated: 0,
      extraction_config: {
        min_keyword_length: 3,
        max_keyword_length: 50,
        min_occurrence_threshold: minOccurrences,
        time_window_hours: timeWindow,
        use_llm_enrichment: false
      },
      status: "running",
      created_at: now,
      updated_at: now
    });
    
    // Get recent posts with stats (very small batch to avoid limits)
    // Use order by addedAt to get most recently added posts, regardless of time window
    const recentPosts = await ctx.db
      .query("live_feed_posts")
      .withIndex("by_addedAt")
      .order("desc")
      .take(20); // Reduced to 20 posts to avoid limits
    
    // Get corresponding post stats (limit to prevent individual query explosion)
    const postStatsMap = new Map<string, Doc<"post_stats">>();
    // Skip post stats lookup to avoid hitting limits - process with just post data
    // for (const post of recentPosts.slice(0, 10)) { // Process even fewer for stats
    //   const stats = await ctx.db
    //     .query("post_stats")
    //     .withIndex("by_post")
    //     .filter(q => q.eq(q.field("post_id"), post.id))
    //     .first();
    //   if (stats) {
    //     postStatsMap.set(post.id, stats);
    //   }
    // }
    
    // Extract and aggregate keywords
    const keywordAggregation = new Map<string, {
      occurrences: number,
      posts: Set<string>,
      subreddits: Map<string, { count: number, totalScore: number }>,
      totalScore: number,
      totalComments: number,
      sentiments: { positive: number, neutral: number, negative: number },
      categories: Set<string>,
      relatedKeywords: Set<string>
    }>();
    
    let processedCount = 0;
    
    for (const post of recentPosts) {
      processedCount++;
      const stats = postStatsMap.get(post.id);
      
      // Extract keywords from post
      const keywords = extractKeywordsFromPost(post, stats);
      
      for (const keyword of keywords) {
        const normalized = keyword.toLowerCase().trim();
        
        if (!keywordAggregation.has(normalized)) {
          keywordAggregation.set(normalized, {
            occurrences: 0,
            posts: new Set(),
            subreddits: new Map(),
            totalScore: 0,
            totalComments: 0,
            sentiments: { positive: 0, neutral: 0, negative: 0 },
            categories: new Set(),
            relatedKeywords: new Set()
          });
        }
        
        const agg = keywordAggregation.get(normalized)!;
        agg.occurrences++;
        agg.posts.add(post.id);
        agg.totalScore += post.score;
        agg.totalComments += post.num_comments;
        
        // Track subreddit distribution
        if (!agg.subreddits.has(post.subreddit)) {
          agg.subreddits.set(post.subreddit, { count: 0, totalScore: 0 });
        }
        const subData = agg.subreddits.get(post.subreddit)!;
        subData.count++;
        subData.totalScore += post.score;
        
        // Add sentiment if available
        if (stats?.sentiment) {
          if (stats.sentiment === "positive") agg.sentiments.positive++;
          else if (stats.sentiment === "negative") agg.sentiments.negative++;
          else agg.sentiments.neutral++;
        } else {
          agg.sentiments.neutral++;
        }
        
        // Add categories if available
        if (stats?.categories) {
          stats.categories.forEach(cat => agg.categories.add(cat));
        }
        
        // Track co-occurring keywords
        for (const otherKeyword of keywords) {
          if (otherKeyword !== keyword) {
            agg.relatedKeywords.add(otherKeyword.toLowerCase());
          }
        }
      }
    }
    
    // Store or update keywords in database
    let extractedCount = 0;
    let newCount = 0;
    let updatedCount = 0;
    
    for (const [keyword, data] of keywordAggregation) {
      if (data.occurrences < minOccurrences) continue;
      
      extractedCount++;
      
      // Check if keyword already exists
      const existing = await ctx.db
        .query("keyword_trends")
        .withIndex("by_keyword")
        .filter(q => q.eq(q.field("normalized_keyword"), keyword))
        .first();
      
      const uniquePosts = data.posts.size;
      const avgScore = data.totalScore / data.occurrences;
      const avgComments = data.totalComments / data.occurrences;
      const engagementScore = avgScore + (avgComments * 2); // Simple engagement metric
      
      // Calculate performance tier
      const performanceTier = calculatePerformanceTier(engagementScore, uniquePosts);
      
      // Calculate trend status
      const trendStatus = calculateTrendStatus(data.occurrences, uniquePosts, existing);
      
      // Get top subreddits
      const topSubreddits = Array.from(data.subreddits.entries())
        .map(([subreddit, stats]) => ({
          subreddit,
          count: stats.count,
          avg_score: stats.totalScore / stats.count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      // Calculate dominant sentiment
      const totalSentiments = data.sentiments.positive + data.sentiments.neutral + data.sentiments.negative;
      let dominantSentiment = "neutral";
      let sentimentConfidence = 0;
      
      if (totalSentiments > 0) {
        const sentimentScores = {
          positive: data.sentiments.positive / totalSentiments,
          neutral: data.sentiments.neutral / totalSentiments,
          negative: data.sentiments.negative / totalSentiments,
          mixed: 0
        };
        
        // Determine if mixed
        if (sentimentScores.positive > 0.3 && sentimentScores.negative > 0.3) {
          dominantSentiment = "mixed";
          sentimentScores.mixed = (sentimentScores.positive + sentimentScores.negative) / 2;
          sentimentConfidence = sentimentScores.mixed;
        } else {
          // Find dominant
          const max = Math.max(sentimentScores.positive, sentimentScores.neutral, sentimentScores.negative);
          if (max === sentimentScores.positive) dominantSentiment = "positive";
          else if (max === sentimentScores.negative) dominantSentiment = "negative";
          sentimentConfidence = max;
        }
      }
      
      const keywordData = {
        keyword: keyword,
        normalized_keyword: keyword,
        keyword_type: determineKeywordType(keyword) as "phrase" | "entity" | "topic" | "subreddit" | "hashtag",
        total_occurrences: data.occurrences,
        unique_posts_count: uniquePosts,
        first_seen_at: existing?.first_seen_at || now,
        last_seen_at: now,
        avg_post_score: avgScore,
        avg_comment_count: avgComments,
        avg_upvote_ratio: 0.85, // Default, can be calculated from posts
        total_engagement_score: engagementScore,
        viral_coefficient: Math.min(engagementScore / 1000, 1),
        primary_category: Array.from(data.categories)[0] || "general",
        secondary_categories: Array.from(data.categories).slice(1),
        related_keywords: Array.from(data.relatedKeywords).slice(0, 10),
        sentiment_scores: {
          positive: data.sentiments.positive / Math.max(totalSentiments, 1),
          neutral: data.sentiments.neutral / Math.max(totalSentiments, 1),
          negative: data.sentiments.negative / Math.max(totalSentiments, 1),
          mixed: 0
        },
        dominant_sentiment: dominantSentiment,
        sentiment_confidence: sentimentConfidence,
        top_subreddits: topSubreddits,
        source_post_ids: Array.from(data.posts).slice(0, 20),
        trend_status: trendStatus,
        trend_velocity: existing ? (data.occurrences - existing.total_occurrences) / timeWindow : 0,
        trend_acceleration: 0,
        performance_tier: performanceTier,
        llm_processed: false,
        created_at: existing?.created_at || now,
        updated_at: now,
        last_processed_at: now,
        processing_version: 1
      };
      
      if (existing) {
        await ctx.db.patch(existing._id, keywordData);
        updatedCount++;
      } else {
        await ctx.db.insert("keyword_trends", keywordData);
        newCount++;
      }
    }
    
    // Update extraction run
    const run = await ctx.db
      .query("keyword_extraction_runs")
      .filter(q => q.eq(q.field("run_id"), runId))
      .first();
    
    if (run) {
      await ctx.db.patch(run._id, {
        completed_at: Date.now(),
        posts_processed: processedCount,
        keywords_extracted: extractedCount,
        new_keywords_found: newCount,
        keywords_updated: updatedCount,
        processing_duration_ms: Date.now() - now,
        status: "completed",
        updated_at: Date.now()
      });
    }
    
    return {
      runId,
      processed: processedCount,
      extracted: extractedCount
    };
  }
});

// Query to get top trending keywords for the generator
export const getTrendingKeywords = query({
  args: {
    limit: v.optional(v.number()),
    category: v.optional(v.string()),
    minEngagement: v.optional(v.number())
  },
  returns: v.array(v.object({
    keyword: v.string(),
    count: v.number(),
    category: v.string(),
    sentiment: v.string(),
    confidence: v.number(),
    trending: v.boolean(),
    tier: v.string(),
    engagement: v.number(),
    topSubreddits: v.array(v.string()),
    trendStatus: v.string()
  })),
  handler: async (ctx, args) => {
    const limit = args.limit || 30;
    const minEngagement = args.minEngagement || 0;
    
    const keywords = await ctx.db
      .query("keyword_trends")
      .withIndex("by_engagement")
      .filter(q => q.gte(q.field("total_engagement_score"), minEngagement))
      .order("desc")
      .take(limit * 2); // Get more than needed for filtering
    
    // Filter by category if specified
    let filtered = keywords;
    if (args.category) {
      filtered = keywords.filter(k => k.primary_category === args.category);
    }
    
    // Transform to frontend format
    return filtered
      .slice(0, limit)
      .map(keyword => ({
        keyword: keyword.keyword,
        count: keyword.total_occurrences,
        category: keyword.primary_category,
        sentiment: keyword.dominant_sentiment,
        confidence: keyword.sentiment_confidence,
        trending: keyword.trend_status === "rising" || keyword.trend_status === "peak",
        tier: keyword.performance_tier,
        engagement: keyword.total_engagement_score,
        topSubreddits: keyword.top_subreddits.map(s => s.subreddit).slice(0, 3),
        trendStatus: keyword.trend_status
      }));
  }
});

// Get extraction run status
export const getExtractionRunStatus = query({
  args: { runId: v.string() },
  returns: v.union(v.object({
    status: v.string(),
    processed: v.number(),
    extracted: v.number(),
    duration: v.optional(v.number())
  }), v.null()),
  handler: async (ctx, args) => {
    const run = await ctx.db
      .query("keyword_extraction_runs")
      .filter(q => q.eq(q.field("run_id"), args.runId))
      .first();
    
    if (!run) return null;
    
    return {
      status: run.status,
      processed: run.posts_processed,
      extracted: run.keywords_extracted,
      duration: run.processing_duration_ms
    };
  }
});

// Helper functions
function extractKeywordsFromPost(post: Doc<"live_feed_posts">, stats?: Doc<"post_stats">) {
  const keywords: string[] = [];
  
  // Use existing keywords if available from stats
  if (stats?.keywords) {
    keywords.push(...stats.keywords);
  }
  
  // Extract from title and content
  const text = `${post.title} ${post.selftext}`.toLowerCase();
  
  // Extract phrases (comprehensive version)
  const phrases = [
    // Mental health patterns
    ...extractPatterns(text, [
      'mental health', 'therapy session', 'anxiety disorder', 'panic attack',
      'depression treatment', 'coping mechanisms', 'emotional support',
      'stress management', 'mindfulness practice', 'social anxiety',
      'self harm', 'suicide ideation', 'bipolar disorder', 'ptsd',
      'eating disorder', 'addiction recovery', 'trauma therapy'
    ]),
    // Productivity patterns  
    ...extractPatterns(text, [
      'time management', 'productivity tips', 'daily routine', 'habit formation',
      'goal setting', 'work life balance', 'procrastination help',
      'morning routine', 'productivity system', 'task management',
      'focus techniques', 'deep work', 'pomodoro technique'
    ]),
    // Self-improvement patterns
    ...extractPatterns(text, [
      'self improvement', 'personal growth', 'self discipline',
      'confidence building', 'social skills', 'communication skills',
      'lifestyle change', 'habit tracker', 'self care',
      'meditation practice', 'journaling', 'mindset shift'
    ]),
    // Technology patterns
    ...extractPatterns(text, [
      'machine learning', 'artificial intelligence', 'data science',
      'web development', 'programming language', 'software engineering',
      'app development', 'coding bootcamp', 'tech interview'
    ]),
    // Career patterns
    ...extractPatterns(text, [
      'career advice', 'job interview', 'remote work', 'career change',
      'job search', 'salary negotiation', 'professional development',
      'networking tips', 'resume writing', 'work from home'
    ]),
    // Health patterns
    ...extractPatterns(text, [
      'weight loss', 'muscle building', 'exercise routine', 'healthy eating',
      'sleep schedule', 'nutrition advice', 'fitness goals',
      'workout plan', 'diet plan', 'health tips'
    ]),
    // Learning patterns
    ...extractPatterns(text, [
      'study tips', 'exam preparation', 'learning techniques',
      'note taking', 'memory improvement', 'online learning',
      'skill development', 'language learning', 'test anxiety'
    ])
  ];
  
  keywords.push(...phrases);
  
  // Add subreddit as keyword
  if (post.subreddit) {
    keywords.push(`r/${post.subreddit}`);
  }
  
  // Extract contextual patterns
  const contextualPatterns = [
    /need help with ([^.!?]{5,40})/g,
    /struggling with ([^.!?]{5,40})/g,
    /how to ([^.!?]{5,50})/g,
    /advice on ([^.!?]{5,40})/g,
    /tips for ([^.!?]{5,40})/g
  ];
  
  for (const pattern of contextualPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        keywords.push(match[1].trim());
      }
    }
  }
  
  return [...new Set(keywords)]; // Remove duplicates
}

function extractPatterns(text: string, patterns: string[]): string[] {
  return patterns.filter(pattern => text.includes(pattern));
}

function determineKeywordType(keyword: string): string {
  if (keyword.startsWith('r/')) return 'subreddit';
  if (keyword.startsWith('#')) return 'hashtag';
  if (keyword.includes(' ')) return 'phrase';
  if (/^[A-Z][a-z]+ [A-Z][a-z]+/.test(keyword)) return 'entity'; // Name pattern
  return 'topic';
}

function calculatePerformanceTier(engagementScore: number, uniquePosts: number): Doc<"keyword_trends">["performance_tier"] {
  const score = engagementScore * Math.log(uniquePosts + 1);
  
  if (score > 10000) return "elite";
  if (score > 5000) return "excel";
  if (score > 2500) return "veryGood";
  if (score > 1000) return "good";
  if (score > 500) return "avgPlus";
  if (score > 250) return "avg";
  if (score > 100) return "avgMinus";
  if (score > 50) return "poor";
  if (score > 10) return "veryPoor";
  return "critical";
}

function calculateTrendStatus(
  occurrences: number,
  uniquePosts: number,
  existing?: Doc<"keyword_trends"> | null
): Doc<"keyword_trends">["trend_status"] {
  if (!existing) return occurrences > 5 ? "emerging" : "stable";
  
  const growth = occurrences - existing.total_occurrences;
  const growthRate = growth / Math.max(existing.total_occurrences, 1);
  
  if (growthRate > 0.5) return "rising";
  if (growthRate > 0.2) return "peak";
  if (growthRate < -0.3) return "declining";
  if (occurrences === 0) return "dormant";
  return "stable";
}

// Internal query for getting keyword details (used in actions)
export const getKeywordDetailsInternal = internalQuery({
  args: { keyword: v.string() },
  handler: async (ctx, args) => {
    const normalized = args.keyword.toLowerCase().trim();
    
    const keyword = await ctx.db
      .query("keyword_trends")
      .withIndex("by_keyword", (q) => q.eq("normalized_keyword", normalized))
      .first();
    
    return keyword;
  }
});