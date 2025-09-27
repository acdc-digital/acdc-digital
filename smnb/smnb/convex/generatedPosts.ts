import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Store a generated post in the database
export const storeGeneratedPost = mutation({
  args: {
    // Post Content
    title: v.string(),
    content: v.string(),
    author: v.string(),
    
    // Reddit Context
    target_subreddit: v.string(),
    estimated_score: v.number(),
    estimated_comments: v.number(),
    
    // Generation Context
    source_keywords: v.array(v.string()),
    column_context: v.string(),
    generation_prompt_hash: v.optional(v.string()),
    
    // Performance Metrics Used
    avg_synergy_score: v.optional(v.number()),
    avg_relevance_coefficient: v.optional(v.number()),
    avg_engagement_potential: v.optional(v.number()),
    avg_freshness_coefficient: v.optional(v.number()),
    avg_novelty_index: v.optional(v.number()),
    
    // Model & Cost Info
    model_used: v.string(),
    generation_cost: v.number(),
    input_tokens: v.number(),
    output_tokens: v.number(),
    generated_at: v.number()
  },
  returns: v.id("generated_posts"),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("generated_posts", {
      // Post Content
      title: args.title,
      content: args.content,
      author: args.author,
      
      // Reddit Context  
      target_subreddit: args.target_subreddit,
      estimated_score: args.estimated_score,
      estimated_comments: args.estimated_comments,
      
      // Generation Context
      source_keywords: args.source_keywords,
      column_context: args.column_context,
      generation_prompt_hash: args.generation_prompt_hash,
      
      // Performance Metrics
      avg_synergy_score: args.avg_synergy_score,
      avg_relevance_coefficient: args.avg_relevance_coefficient, 
      avg_engagement_potential: args.avg_engagement_potential,
      avg_freshness_coefficient: args.avg_freshness_coefficient,
      avg_novelty_index: args.avg_novelty_index,
      
      // Model & Cost Info
      model_used: args.model_used,
      generation_cost: args.generation_cost,
      input_tokens: args.input_tokens,
      output_tokens: args.output_tokens,
      
      // Timestamps
      generated_at: args.generated_at,
      created_at: now,
      
      // Initial Status
      status: "generated",
      view_count: 0
    });
  }
});

// Get generated posts with filtering options
export const getGeneratedPosts = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("generated"),
      v.literal("published"), 
      v.literal("archived"),
      v.literal("discarded")
    )),
    subreddit: v.optional(v.string()),
    column_context: v.optional(v.string()),
    since: v.optional(v.number()) // Unix timestamp
  },
  returns: v.array(v.object({
    _id: v.id("generated_posts"),
    title: v.string(),
    content: v.string(),
    author: v.string(),
    target_subreddit: v.string(),
    estimated_score: v.number(),
    estimated_comments: v.number(),
    source_keywords: v.array(v.string()),
    column_context: v.string(),
    model_used: v.string(),
    generation_cost: v.number(),
    generated_at: v.number(),
    status: v.string(),
    user_rating: v.optional(v.string()),
    actual_score: v.optional(v.number()),
    actual_comments: v.optional(v.number()),
    view_count: v.optional(v.number())
  })),
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const since = args.since || Date.now() - (30 * 24 * 60 * 60 * 1000); // Default 30 days
    
    let allPosts;
    
    // Apply filters based on status
    if (args.status) {
      allPosts = await ctx.db
        .query("generated_posts")
        .withIndex("by_status", q => 
          q.eq("status", args.status!).gte("generated_at", since)
        )
        .order("desc")
        .collect();
    } else {
      allPosts = await ctx.db
        .query("generated_posts")
        .withIndex("by_generated_at", q => 
          q.gte("generated_at", since)
        )
        .order("desc")
        .collect();
    }
    
    // Additional filtering
    let filtered = allPosts;
    
    if (args.subreddit) {
      filtered = filtered.filter(post => 
        post.target_subreddit.toLowerCase().includes(args.subreddit!.toLowerCase())
      );
    }
    
    if (args.column_context) {
      filtered = filtered.filter(post => post.column_context === args.column_context);
    }
    
    return filtered.slice(0, limit).map(post => ({
      _id: post._id,
      title: post.title,
      content: post.content,
      author: post.author,
      target_subreddit: post.target_subreddit,
      estimated_score: post.estimated_score,
      estimated_comments: post.estimated_comments,
      source_keywords: post.source_keywords,
      column_context: post.column_context,
      model_used: post.model_used,
      generation_cost: post.generation_cost,
      generated_at: post.generated_at,
      status: post.status,
      user_rating: post.user_rating,
      actual_score: post.actual_score,
      actual_comments: post.actual_comments,
      view_count: post.view_count || 0
    }));
  }
});

// Update post status (e.g., when published, archived, etc.)
export const updateGeneratedPostStatus = mutation({
  args: {
    post_id: v.id("generated_posts"),
    status: v.union(
      v.literal("generated"),
      v.literal("published"), 
      v.literal("archived"),
      v.literal("discarded")
    ),
    actual_reddit_url: v.optional(v.string()),
    actual_score: v.optional(v.number()),
    actual_comments: v.optional(v.number()),
    user_rating: v.optional(v.union(
      v.literal("excellent"),
      v.literal("good"),
      v.literal("fair"), 
      v.literal("poor")
    )),
    user_notes: v.optional(v.string())
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const updates: {
      status: "generated" | "published" | "archived" | "discarded";
      published_at?: number;
      actual_reddit_url?: string;
      actual_score?: number;
      actual_comments?: number;
      user_rating?: "excellent" | "good" | "fair" | "poor";
      user_notes?: string;
    } = {
      status: args.status
    };
    
    if (args.status === "published") {
      updates.published_at = Date.now();
      if (args.actual_reddit_url) updates.actual_reddit_url = args.actual_reddit_url;
      if (args.actual_score) updates.actual_score = args.actual_score;
      if (args.actual_comments) updates.actual_comments = args.actual_comments;
    }
    
    if (args.user_rating) updates.user_rating = args.user_rating;
    if (args.user_notes) updates.user_notes = args.user_notes;
    
    await ctx.db.patch(args.post_id, updates);
  }
});

// Get generation analytics
export const getGenerationAnalytics = query({
  args: {
    days: v.optional(v.number()) // Number of days to look back
  },
  returns: v.object({
    total_posts: v.number(),
    total_cost: v.number(),
    avg_cost_per_post: v.number(),
    posts_by_status: v.array(v.object({
      status: v.string(),
      count: v.number()
    })),
    posts_by_subreddit: v.array(v.object({
      subreddit: v.string(),
      count: v.number(),
      avg_estimated_score: v.number()
    })),
    posts_by_column: v.array(v.object({
      column_context: v.string(),
      count: v.number()
    })),
    performance_comparison: v.array(v.object({
      post_id: v.string(),
      title: v.string(),
      estimated_score: v.number(),
      actual_score: v.optional(v.number()),
      accuracy_percentage: v.optional(v.number())
    }))
  }),
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const since = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    const posts = await ctx.db
      .query("generated_posts")
      .withIndex("by_generated_at", q => q.gte("generated_at", since))
      .collect();
    
    const total_posts = posts.length;
    const total_cost = posts.reduce((sum, post) => sum + post.generation_cost, 0);
    const avg_cost_per_post = total_posts > 0 ? total_cost / total_posts : 0;
    
    // Group by status
    const statusMap = new Map<string, number>();
    posts.forEach(post => {
      statusMap.set(post.status, (statusMap.get(post.status) || 0) + 1);
    });
    
    // Group by subreddit  
    const subredditMap = new Map<string, {count: number, totalScore: number}>();
    posts.forEach(post => {
      const current = subredditMap.get(post.target_subreddit) || {count: 0, totalScore: 0};
      current.count++;
      current.totalScore += post.estimated_score;
      subredditMap.set(post.target_subreddit, current);
    });
    
    // Group by column
    const columnMap = new Map<string, number>();
    posts.forEach(post => {
      columnMap.set(post.column_context, (columnMap.get(post.column_context) || 0) + 1);
    });
    
    // Performance comparison (published posts only)
    const publishedPosts = posts.filter(post => 
      post.status === "published" && post.actual_score !== undefined
    );
    
    return {
      total_posts,
      total_cost,
      avg_cost_per_post,
      posts_by_status: Array.from(statusMap.entries()).map(([status, count]) => ({
        status,
        count
      })),
      posts_by_subreddit: Array.from(subredditMap.entries()).map(([subreddit, data]) => ({
        subreddit,
        count: data.count,
        avg_estimated_score: data.totalScore / data.count
      })),
      posts_by_column: Array.from(columnMap.entries()).map(([column_context, count]) => ({
        column_context,
        count
      })),
      performance_comparison: publishedPosts.map(post => {
        const accuracy = post.actual_score && post.estimated_score > 0
          ? Math.min((post.actual_score / post.estimated_score) * 100, 200) // Cap at 200%
          : undefined;
        
        return {
          post_id: post._id,
          title: post.title.substring(0, 50) + (post.title.length > 50 ? "..." : ""),
          estimated_score: post.estimated_score,
          actual_score: post.actual_score,
          accuracy_percentage: accuracy
        };
      })
    };
  }
});