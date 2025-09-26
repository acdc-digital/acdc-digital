// SUBREDDIT STATISTICS QUERIES
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/convex/stats/subredditStats.ts

import { v } from "convex/values";
import { query } from "../_generated/server";

// Get subreddit distribution from live feed posts
export const getSubredditStats = query({
  args: {},
  returns: v.object({
    totalPosts: v.number(),
    totalSubreddits: v.number(), 
    subredditStats: v.array(v.object({
      subreddit: v.string(),
      postCount: v.number(),
      percentage: v.number(),
    })),
  }),
  handler: async (ctx) => {
    // Get all live feed posts
    const posts = await ctx.db
      .query("live_feed_posts")
      .collect();

    // Count posts by subreddit
    const subredditMap = new Map<string, number>();
    
    posts.forEach(post => {
      const subreddit = post.subreddit;
      subredditMap.set(subreddit, (subredditMap.get(subreddit) || 0) + 1);
    });

    // Convert to array and sort by post count (descending)
    const subredditStats = Array.from(subredditMap.entries())
      .map(([subreddit, count]) => ({
        subreddit,
        postCount: count,
        percentage: posts.length > 0 ? Math.round((count / posts.length) * 100 * 10) / 10 : 0
      }))
      .sort((a, b) => b.postCount - a.postCount);

    return {
      totalPosts: posts.length,
      totalSubreddits: subredditMap.size,
      subredditStats,
    };
  },
});

// Get subreddit distribution from story history
export const getStoryHistorySubredditStats = query({
  args: {},
  returns: v.object({
    totalStories: v.number(),
    totalSubreddits: v.number(), 
    subredditStats: v.array(v.object({
      subreddit: v.string(),
      storyCount: v.number(),
      percentage: v.number(),
    })),
  }),
  handler: async (ctx) => {
    // Get all story history documents
    const stories = await ctx.db
      .query("story_history")
      .collect();

    // Count stories by subreddit from original_item
    const subredditMap = new Map<string, number>();
    
    stories.forEach(story => {
      // Check if story has original_item with subreddit
      if (story.original_item?.subreddit) {
        const subreddit = story.original_item.subreddit;
        subredditMap.set(subreddit, (subredditMap.get(subreddit) || 0) + 1);
      }
    });

    // Convert to array and sort by story count (descending)
    const subredditStats = Array.from(subredditMap.entries())
      .map(([subreddit, count]) => ({
        subreddit,
        storyCount: count,
        percentage: stories.length > 0 ? Math.round((count / stories.length) * 100 * 10) / 10 : 0
      }))
      .sort((a, b) => b.storyCount - a.storyCount);

    return {
      totalStories: stories.length,
      totalSubreddits: subredditMap.size,
      subredditStats,
    };
  },
});

// Get combined content stats (posts + stories) per subreddit
export const getCombinedContentStats = query({
  args: {},
  returns: v.object({
    totalContent: v.number(),
    totalSubreddits: v.number(), 
    contentStats: v.array(v.object({
      subreddit: v.string(),
      postCount: v.number(),
      storyCount: v.number(),
      totalContent: v.number(),
      percentage: v.number(),
    })),
  }),
  handler: async (ctx) => {
    // Get all live feed posts
    const posts = await ctx.db
      .query("live_feed_posts")
      .collect();

    // Get all story history documents  
    const stories = await ctx.db
      .query("story_history")
      .collect();

    // Count posts by subreddit
    const postMap = new Map<string, number>();
    posts.forEach(post => {
      const subreddit = post.subreddit;
      postMap.set(subreddit, (postMap.get(subreddit) || 0) + 1);
    });

    // Count stories by subreddit
    const storyMap = new Map<string, number>();
    stories.forEach(story => {
      if (story.original_item?.subreddit) {
        const subreddit = story.original_item.subreddit;
        storyMap.set(subreddit, (storyMap.get(subreddit) || 0) + 1);
      }
    });

    // Combine both maps to get all unique subreddits
    const allSubreddits = new Set([...postMap.keys(), ...storyMap.keys()]);
    
    // Calculate combined stats
    const contentStats = Array.from(allSubreddits).map(subreddit => {
      const postCount = postMap.get(subreddit) || 0;
      const storyCount = storyMap.get(subreddit) || 0;
      const totalContent = postCount + storyCount;
      
      return {
        subreddit,
        postCount,
        storyCount,
        totalContent,
        percentage: 0, // Will calculate after sorting
      };
    });

    // Sort by total content (descending)
    contentStats.sort((a, b) => b.totalContent - a.totalContent);
    
    // Calculate percentages after sorting
    const totalAllContent = posts.length + stories.length;
    contentStats.forEach(stat => {
      stat.percentage = totalAllContent > 0 ? Math.round((stat.totalContent / totalAllContent) * 100 * 10) / 10 : 0;
    });

    return {
      totalContent: totalAllContent,
      totalSubreddits: allSubreddits.size,
      contentStats,
    };
  },
});

// Get subreddit subscriber counts and information
export const getSubredditMemberStats = query({
  args: {},
  returns: v.object({
    totalSubreddits: v.number(),
    totalContent: v.number(),
    subredditMemberStats: v.array(v.object({
      subreddit: v.string(),
      subscribers: v.number(),
      description: v.optional(v.string()),
      isActive: v.boolean(), // Whether we have recent posts from this subreddit
      postCount: v.number(), // Number of posts we have from this subreddit
      storyCount: v.number(), // Number of stories we have from this subreddit
      totalContent: v.number(), // Total posts + stories
    })),
  }),
  handler: async (ctx) => {
    // Get all live feed posts
    const posts = await ctx.db
      .query("live_feed_posts")
      .collect();

    // Get all story history documents  
    const stories = await ctx.db
      .query("story_history")
      .collect();

    // Count posts by subreddit
    const postMap = new Map<string, number>();
    posts.forEach(post => {
      const subreddit = post.subreddit;
      postMap.set(subreddit, (postMap.get(subreddit) || 0) + 1);
    });

    // Count stories by subreddit
    const storyMap = new Map<string, number>();
    stories.forEach(story => {
      if (story.original_item?.subreddit) {
        const subreddit = story.original_item.subreddit;
        storyMap.set(subreddit, (storyMap.get(subreddit) || 0) + 1);
      }
    });

    // Combine both maps to get all unique subreddits
    const allSubreddits = new Set([...postMap.keys(), ...storyMap.keys()]);
    const uniqueSubreddits = Array.from(allSubreddits);
    
    // For now, we'll return mock data with realistic subscriber counts
    // In a real implementation, you'd fetch this from Reddit's API
    const mockSubredditData: Record<string, { subscribers: number; description: string }> = {
      "AskReddit": { subscribers: 45200000, description: "r/AskReddit is the place to ask and answer thought-provoking questions." },
      "funny": { subscribers: 58000000, description: "Welcome to r/Funny: reddit's largest humour depository." },
      "todayilearned": { subscribers: 32000000, description: "You learn something new every day; what did you learn today?" },
      "worldnews": { subscribers: 37000000, description: "A place for major news from around the world, excluding US-internal news." },
      "pics": { subscribers: 30000000, description: "A place for photographs, pictures, and other images." },
      "gaming": { subscribers: 41000000, description: "The Number One Gaming forum on the Internet." },
      "movies": { subscribers: 32000000, description: "The goal of /r/Movies is to provide an inclusive place for discussions and news about films." },
      "news": { subscribers: 26000000, description: "The place for news articles about current events in the United States and the rest of the world." },
      "technology": { subscribers: 14000000, description: "Subreddit dedicated to the news and discussions about the creation and use of technology." },
      "science": { subscribers: 29000000, description: "This community is a place to share and discuss new scientific research." },
      "politics": { subscribers: 8500000, description: "The place for political news and discussion." },
      "sports": { subscribers: 2100000, description: "Sports News and Highlights from the NFL, NBA, NHL, MLB, MLS, and leagues around the world." },
      "books": { subscribers: 21000000, description: "This is a moderated subreddit. It is our intent and purpose to foster and encourage." },
      "history": { subscribers: 17000000, description: "r/history is a place for discussions about history." },
      "space": { subscribers: 23000000, description: "Share & discuss informative content on: Astrophysics, Cosmology, Space Exploration." },
      "programming": { subscribers: 5800000, description: "Computer Programming" },
      "dataisbeautiful": { subscribers: 22000000, description: "DataIsBeautiful is for visualizations that effectively convey information." },
      "explainlikeimfive": { subscribers: 21000000, description: "Explain Like I'm Five is the best forum and archive on the internet for layperson-friendly explanations." },
      "askscience": { subscribers: 22000000, description: "Ask a science question, get a science answer." },
      "IAmA": { subscribers: 22000000, description: "I Am A, where the mundane becomes fascinating and the outrageous suddenly seems normal." }
    };
    
    const subredditMemberStats = uniqueSubreddits.map(subreddit => {
      const mockData = mockSubredditData[subreddit];
      const postCount = postMap.get(subreddit) || 0;
      const storyCount = storyMap.get(subreddit) || 0;
      const totalContent = postCount + storyCount;
      
      return {
        subreddit,
        subscribers: mockData?.subscribers || Math.floor(Math.random() * 1000000) + 100000, // Random fallback
        description: mockData?.description,
        isActive: true, // We have posts from this subreddit
        postCount,
        storyCount,
        totalContent,
      };
    });

    // Sort by total content (descending) - most productive subreddits first
    subredditMemberStats.sort((a, b) => b.totalContent - a.totalContent);

    const totalAllContent = posts.length + stories.length;

    return {
      totalSubreddits: uniqueSubreddits.length,
      totalContent: totalAllContent,
      subredditMemberStats,
    };
  },
});

// Get subreddit content correlation (post-to-story conversion rates)
export const getSubredditContentCorrelation = query({
  args: {},
  returns: v.object({
    totalPosts: v.number(),
    totalStories: v.number(),
    conversionRate: v.number(),
    subredditCorrelations: v.array(
      v.object({
        subreddit: v.string(),
        postCount: v.number(),
        storyCount: v.number(),
        conversionRate: v.number(),
        postsWithStories: v.number(),
        postsWithoutStories: v.number(),
      })
    ),
  }),
  handler: async (ctx) => {
    // Get all posts
    const posts = await ctx.db.query("live_feed_posts").collect();
    
    // Get all stories
    const stories = await ctx.db.query("story_history").collect();
    
    // Create a mapping of posts by title+url for matching with stories
    const postsByKey = new Map<string, typeof posts[0]>();
    for (const post of posts) {
      const key = `${post.title}|||${post.url}`;
      postsByKey.set(key, post);
    }
    
    // Build correlation data per subreddit
    const subredditMap = new Map<string, {
      postCount: number;
      storyCount: number;
      postsWithStories: number;
    }>();
    
    // Count posts by subreddit
    for (const post of posts) {
      const subreddit = post.subreddit;
      if (!subreddit) continue;
      
      if (!subredditMap.has(subreddit)) {
        subredditMap.set(subreddit, {
          postCount: 0,
          storyCount: 0,
          postsWithStories: 0,
        });
      }
      
      const data = subredditMap.get(subreddit)!;
      data.postCount++;
    }
    
    // Count stories by subreddit and track which posts have stories
    const matchedPosts = new Set<string>();
    for (const story of stories) {
      const subreddit = story.original_item?.subreddit;
      if (!subreddit) continue;
      
      if (!subredditMap.has(subreddit)) {
        subredditMap.set(subreddit, {
          postCount: 0,
          storyCount: 0,
          postsWithStories: 0,
        });
      }
      
      const data = subredditMap.get(subreddit)!;
      data.storyCount++;
      
      // Try to match this story to a post
      if (story.original_item?.title && story.original_item?.url) {
        const key = `${story.original_item.title}|||${story.original_item.url}`;
        if (postsByKey.has(key) && !matchedPosts.has(key)) {
          matchedPosts.add(key);
          data.postsWithStories++;
        }
      }
    }
    
    // Calculate correlations
    const subredditCorrelations = Array.from(subredditMap.entries())
      .map(([subreddit, data]) => {
        const postCount = data.postCount;
        const storyCount = data.storyCount;
        const postsWithStories = data.postsWithStories;
        const postsWithoutStories = postCount - postsWithStories;
        const conversionRate = postCount > 0 ? (postsWithStories / postCount) * 100 : 0;
        
        return {
          subreddit,
          postCount,
          storyCount,
          conversionRate,
          postsWithStories,
          postsWithoutStories,
        };
      })
      .sort((a, b) => b.conversionRate - a.conversionRate);
    
    const totalPosts = posts.length;
    const totalStories = stories.length;
    const overallConversionRate = totalPosts > 0 ? (totalStories / totalPosts) * 100 : 0;
    
    return {
      totalPosts,
      totalStories,
      conversionRate: overallConversionRate,
      subredditCorrelations,
    };
  },
});

// Get post rankings with performance scores
export const getPostRankings = query({
  args: {},
  returns: v.object({
    totalPosts: v.number(),
    posts: v.array(v.object({
      id: v.string(),
      title: v.string(),
      subreddit: v.string(),
      author: v.string(),
      url: v.string(),
      permalink: v.string(),
      score: v.number(), // Reddit score
      num_comments: v.number(),
      created_utc: v.number(),
      // Performance metrics
      qualityScore: v.optional(v.number()),
      engagementScore: v.optional(v.number()),
      priorityScore: v.optional(v.number()),
      overallScore: v.number(), // Calculated composite score
      rank: v.number(),
      rankChange: v.union(v.literal("up"), v.literal("down"), v.literal("stable")),
    })),
  }),
  handler: async (ctx) => {
    // Get all live feed posts
    const posts = await ctx.db.query("live_feed_posts").collect();
    
    // Get post stats for performance metrics (if available)
    const postStats = await ctx.db.query("post_stats").collect();
    const statsMap = new Map(postStats.map(stat => [stat.post_id, stat]));
    
    // Calculate performance scores for each post
    const rankedPosts = posts.map((post) => {
      const stats = statsMap.get(post.id);
      
      // Calculate normalized scores (0-100)
      const qualityScore = stats?.quality_score || 0;
      const engagementScore = stats?.engagement_score || 0;
      const priorityScore = stats?.priority_score || 0;
      
      // Reddit engagement metrics (normalized)
      const redditScore = Math.min(post.score / 1000 * 10, 50); // Cap at 50 points
      const commentsScore = Math.min(post.num_comments / 50 * 10, 25); // Cap at 25 points
      const recencyBonus = Math.max(0, 25 - (Date.now() - post.created_utc * 1000) / (1000 * 60 * 60 * 24)); // Recency bonus
      
      // Composite score (weighted average)
      const overallScore = (
        (qualityScore || 0) * 0.3 +           // 30% quality
        (engagementScore || 0) * 0.25 +       // 25% engagement  
        (priorityScore || 0) * 0.15 +         // 15% priority
        redditScore * 0.2 +                   // 20% reddit score
        commentsScore * 0.05 +                // 5% comments
        recencyBonus * 0.05                   // 5% recency
      );
      
      return {
        id: post.id,
        title: post.title,
        subreddit: post.subreddit,
        author: post.author,
        url: post.url,
        permalink: post.permalink.startsWith('https://') ? post.permalink : `https://reddit.com${post.permalink}`,
        score: post.score,
        num_comments: post.num_comments,
        created_utc: post.created_utc,
        qualityScore: stats?.quality_score,
        engagementScore: stats?.engagement_score,
        priorityScore: stats?.priority_score,
        overallScore: Math.round(overallScore * 100) / 100, // Round to 2 decimals
        rank: 0, // Will be set after sorting
        rankChange: "stable" as "up" | "down" | "stable", // Will be calculated later based on historical data
      };
    });
    
    // Sort by overall score (descending)
    rankedPosts.sort((a, b) => b.overallScore - a.overallScore);
    
    // Assign ranks
    rankedPosts.forEach((post, index) => {
      post.rank = index + 1;
      // For now, simulate rank changes (in real implementation, compare with previous rankings)
      const randomChange = Math.random();
      if (randomChange < 0.3) post.rankChange = "up" as const;
      else if (randomChange < 0.6) post.rankChange = "down" as const;
      else post.rankChange = "stable" as const;
    });
    
    return {
      totalPosts: posts.length,
      posts: rankedPosts,
    };
  },
});

// Get metric scoring matrix based on data extrapolation methodology
export const getMetricScoringMatrix = query({
  args: {},
  returns: v.object({
    totalSubreddits: v.number(),
    totalPosts: v.number(),
    totalStories: v.number(),
    overallMetrics: v.object({
      avgStoryYield: v.number(),
      avgFeedContribution: v.number(),
      avgEngagementPotential: v.number(),
      avgRelevanceConsistency: v.number(),
      avgNoveltyIndex: v.number(),
      avgTrendPropagation: v.number(),
      avgVolumeReliability: v.number(),
      avgSignalDensity: v.number(),
      avgConversionMomentum: v.number(),
    }),
    subredditScores: v.array(v.object({
      subreddit: v.string(),
      storyYield: v.number(),          // SY: Stories / Posts
      feedContribution: v.number(),    // FC: Feed Items / Total Feed
      engagementPotential: v.number(), // EP: Avg engagement of story posts
      relevanceConsistency: v.number(), // RC: Relevant stories / Total stories
      noveltyIndex: v.number(),        // NI: Unique concepts / Total stories
      trendPropagation: v.number(),    // TP: Cross-posted stories / Total stories
      volumeReliability: v.number(),   // VR: Posts per time unit stability
      signalDensity: v.number(),       // SD: Stories per 1k tokens
      conversionMomentum: v.number(),  // CM: Change in SY over time
      overallScore: v.number(),        // Weighted composite score
      tier: v.union(v.literal("Tier 1"), v.literal("Tier 2"), v.literal("Tier 3"), v.literal("Tier 4")),
      posts: v.number(),
      stories: v.number(),
    })),
  }),
  handler: async (ctx) => {
    // Get all posts and stories for calculations
    const posts = await ctx.db.query("live_feed_posts").collect();
    const stories = await ctx.db.query("story_history").collect();
    
    // Group data by subreddit for calculations
    const subredditData = new Map<string, {
      posts: number;
      stories: number;
      totalEngagement: number;
      storyEngagement: number;
      relevantStories: number;
      uniqueConcepts: number;
      crossPostedStories: number;
      tokensUsed: number;
      postsOverTime: number[];
    }>();
    
    // Process posts
    posts.forEach(post => {
      const subreddit = post.subreddit;
      if (!subreddit) return;
      
      if (!subredditData.has(subreddit)) {
        subredditData.set(subreddit, {
          posts: 0,
          stories: 0,
          totalEngagement: 0,
          storyEngagement: 0,
          relevantStories: 0,
          uniqueConcepts: 0,
          crossPostedStories: 0,
          tokensUsed: 0,
          postsOverTime: []
        });
      }
      
      const data = subredditData.get(subreddit)!;
      data.posts++;
      data.totalEngagement += post.score + post.num_comments;
      // Estimate tokens (rough approximation: title + selftext)
      data.tokensUsed += Math.ceil((post.title.length + post.selftext.length) / 4);
    });
    
    // Process stories and match to posts
    const storyPostMap = new Map<string, string>(); // story title -> subreddit
    stories.forEach(story => {
      const subreddit = story.original_item?.subreddit;
      if (!subreddit) return;
      
      if (!subredditData.has(subreddit)) {
        subredditData.set(subreddit, {
          posts: 0,
          stories: 0,
          totalEngagement: 0,
          storyEngagement: 0,
          relevantStories: 0,
          uniqueConcepts: 0,
          crossPostedStories: 0,
          tokensUsed: 0,
          postsOverTime: []
        });
      }
      
      const data = subredditData.get(subreddit)!;
      data.stories++;
      
      // Calculate relevance based on Soloist core themes
      const relevantKeywords = [
        'habit', 'mood', 'productivity', 'therapy', 'mental health', 'journaling',
        'discipline', 'focus', 'meditation', 'wellness', 'self-improvement',
        'goal', 'tracking', 'routine', 'mindfulness', 'anxiety', 'depression'
      ];
      
      const storyText = (story.narrative + ' ' + (story.title || '')).toLowerCase();
      const isRelevant = relevantKeywords.some(keyword => storyText.includes(keyword));
      if (isRelevant) data.relevantStories++;
      
      // Track story for cross-posting detection
      storyPostMap.set(story.title || story.narrative.substring(0, 50), subreddit);
      
      // Estimate novelty (simplified: stories with unique topics)
      const hasNovelConcepts = story.topics && story.topics.length > 0;
      if (hasNovelConcepts) data.uniqueConcepts++;
    });
    
    // Detect cross-posted stories (stories with similar titles across subreddits)
    const storyTitles = Array.from(storyPostMap.keys());
    storyTitles.forEach(title => {
      const subreddit = storyPostMap.get(title)!;
      const data = subredditData.get(subreddit)!;
      
      // Check if similar title exists in other subreddits (simplified check)
      const similarInOtherSubs = storyTitles.some(otherTitle => 
        otherTitle !== title && 
        storyPostMap.get(otherTitle) !== subreddit &&
        otherTitle.substring(0, 20) === title.substring(0, 20)
      );
      
      if (similarInOtherSubs) data.crossPostedStories++;
    });
    
    // Calculate metrics for each subreddit
    const subredditScores = Array.from(subredditData.entries()).map(([subreddit, data]) => {
      // 1. Story Yield (SY): Stories / Posts
      const storyYield = data.posts > 0 ? (data.stories / data.posts) * 100 : 0;
      
      // 2. Feed Contribution (FC): Posts from source / Total posts
      const feedContribution = posts.length > 0 ? (data.posts / posts.length) * 100 : 0;
      
      // 3. Engagement Potential (EP): Average engagement (normalized)
      const avgEngagement = data.posts > 0 ? data.totalEngagement / data.posts : 0;
      const engagementPotential = Math.min((avgEngagement / 100) * 100, 100); // Normalize to 0-100
      
      // 4. Relevance Consistency (RC): Relevant stories / Total stories
      const relevanceConsistency = data.stories > 0 ? (data.relevantStories / data.stories) * 100 : 0;
      
      // 5. Novelty Index (NI): Unique concepts / Total stories
      const noveltyIndex = data.stories > 0 ? (data.uniqueConcepts / data.stories) * 100 : 0;
      
      // 6. Trend Propagation (TP): Cross-posted stories / Total stories
      const trendPropagation = data.stories > 0 ? (data.crossPostedStories / data.stories) * 100 : 0;
      
      // 7. Volume Reliability (VR): Posts per time unit (normalized)
      const volumeReliability = Math.min((data.posts / 7) * 10, 100); // Assume 7-day period, normalize
      
      // 8. Signal Density (SD): Stories per 1k tokens
      const signalDensity = data.tokensUsed > 0 ? (data.stories / (data.tokensUsed / 1000)) * 10 : 0;
      
      // 9. Conversion Momentum (CM): Simulated change in SY (placeholder for real time-series)
      const conversionMomentum = 50 + (Math.random() - 0.5) * 40; // Simulated: 30-70 range
      
      // Calculate weighted overall score
      const overallScore = (
        storyYield * 0.25 +           // 25% - Primary efficiency metric
        feedContribution * 0.15 +     // 15% - Volume contribution
        engagementPotential * 0.15 +  // 15% - Quality indicator
        relevanceConsistency * 0.20 + // 20% - Thematic alignment
        noveltyIndex * 0.10 +         // 10% - Uniqueness
        trendPropagation * 0.05 +     // 5% - Viral potential
        volumeReliability * 0.05 +    // 5% - Consistency
        signalDensity * 0.03 +        // 3% - Efficiency
        conversionMomentum * 0.02     // 2% - Momentum
      );
      
      // Determine tier based on overall score
      let tier: "Tier 1" | "Tier 2" | "Tier 3" | "Tier 4";
      if (overallScore >= 80) tier = "Tier 1";
      else if (overallScore >= 60) tier = "Tier 2";
      else if (overallScore >= 40) tier = "Tier 3";
      else tier = "Tier 4";
      
      return {
        subreddit,
        storyYield: Math.round(storyYield * 10) / 10,
        feedContribution: Math.round(feedContribution * 10) / 10,
        engagementPotential: Math.round(engagementPotential * 10) / 10,
        relevanceConsistency: Math.round(relevanceConsistency * 10) / 10,
        noveltyIndex: Math.round(noveltyIndex * 10) / 10,
        trendPropagation: Math.round(trendPropagation * 10) / 10,
        volumeReliability: Math.round(volumeReliability * 10) / 10,
        signalDensity: Math.round(signalDensity * 10) / 10,
        conversionMomentum: Math.round(conversionMomentum * 10) / 10,
        overallScore: Math.round(overallScore * 10) / 10,
        tier,
        posts: data.posts,
        stories: data.stories,
      };
    });
    
    // Sort by overall score (descending)
    subredditScores.sort((a, b) => b.overallScore - a.overallScore);
    
    // Calculate overall averages
    const totalSubs = subredditScores.length;
    const overallMetrics = {
      avgStoryYield: subredditScores.reduce((sum, s) => sum + s.storyYield, 0) / totalSubs,
      avgFeedContribution: subredditScores.reduce((sum, s) => sum + s.feedContribution, 0) / totalSubs,
      avgEngagementPotential: subredditScores.reduce((sum, s) => sum + s.engagementPotential, 0) / totalSubs,
      avgRelevanceConsistency: subredditScores.reduce((sum, s) => sum + s.relevanceConsistency, 0) / totalSubs,
      avgNoveltyIndex: subredditScores.reduce((sum, s) => sum + s.noveltyIndex, 0) / totalSubs,
      avgTrendPropagation: subredditScores.reduce((sum, s) => sum + s.trendPropagation, 0) / totalSubs,
      avgVolumeReliability: subredditScores.reduce((sum, s) => sum + s.volumeReliability, 0) / totalSubs,
      avgSignalDensity: subredditScores.reduce((sum, s) => sum + s.signalDensity, 0) / totalSubs,
      avgConversionMomentum: subredditScores.reduce((sum, s) => sum + s.conversionMomentum, 0) / totalSubs,
    };
    
    return {
      totalSubreddits: totalSubs,
      totalPosts: posts.length,
      totalStories: stories.length,
      overallMetrics,
      subredditScores,
    };
  },
});

// Get top posts by subreddit based on scoring matrix ranking
export const getTopPostsBySubreddit = query({
  args: {},
  returns: v.object({
    totalSubreddits: v.number(),
    topPostsBySubreddit: v.array(v.object({
      subreddit: v.string(),
      subredditRank: v.number(),
      overallScore: v.number(),
      tier: v.union(v.literal("Tier 1"), v.literal("Tier 2"), v.literal("Tier 3"), v.literal("Tier 4")),
      topPost: v.optional(v.object({
        id: v.string(),
        title: v.string(),
        author: v.string(),
        url: v.string(),
        permalink: v.string(),
        score: v.number(),
        num_comments: v.number(),
        overallScore: v.number(),
        postRank: v.number(),
      })),
      totalPosts: v.number(),
      totalStories: v.number(),
    })),
  }),
  handler: async (ctx) => {
    // Get all posts and stories for calculations (reusing logic from other queries)
    const posts = await ctx.db.query("live_feed_posts").collect();
    const stories = await ctx.db.query("story_history").collect();
    const postStats = await ctx.db.query("post_stats").collect();
    const statsMap = new Map(postStats.map(stat => [stat.post_id, stat]));
    
    // Calculate post scores (simplified version of getPostRankings)
    const rankedPosts = posts.map((post) => {
      const stats = statsMap.get(post.id);
      const qualityScore = stats?.quality_score || 0;
      const engagementScore = stats?.engagement_score || 0;
      const priorityScore = stats?.priority_score || 0;
      const redditScore = Math.min(post.score / 1000 * 10, 50);
      const commentsScore = Math.min(post.num_comments / 50 * 10, 25);
      const recencyBonus = Math.max(0, 25 - (Date.now() - post.created_utc * 1000) / (1000 * 60 * 60 * 24));
      
      const overallScore = (
        (qualityScore || 0) * 0.3 + (engagementScore || 0) * 0.25 + (priorityScore || 0) * 0.15 +
        redditScore * 0.2 + commentsScore * 0.05 + recencyBonus * 0.05
      );
      
      return {
        id: post.id,
        title: post.title,
        subreddit: post.subreddit,
        author: post.author,
        url: post.url,
        permalink: post.permalink.startsWith('https://') ? post.permalink : `https://reddit.com${post.permalink}`,
        score: post.score,
        num_comments: post.num_comments,
        overallScore: Math.round(overallScore * 100) / 100,
      };
    });
    
    // Sort posts by overall score (descending) to get global ranks
    rankedPosts.sort((a, b) => b.overallScore - a.overallScore);
    
    // Calculate subreddit scores (simplified version of getMetricScoringMatrix)
    const subredditData = new Map<string, { posts: number; stories: number; totalEngagement: number; relevantStories: number }>();
    
    // Process posts
    posts.forEach(post => {
      const subreddit = post.subreddit;
      if (!subreddit) return;
      
      if (!subredditData.has(subreddit)) {
        subredditData.set(subreddit, { posts: 0, stories: 0, totalEngagement: 0, relevantStories: 0 });
      }
      
      const data = subredditData.get(subreddit)!;
      data.posts++;
      data.totalEngagement += post.score + post.num_comments;
    });
    
    // Process stories
    stories.forEach(story => {
      const subreddit = story.original_item?.subreddit;
      if (!subreddit) return;
      
      if (!subredditData.has(subreddit)) {
        subredditData.set(subreddit, { posts: 0, stories: 0, totalEngagement: 0, relevantStories: 0 });
      }
      
      const data = subredditData.get(subreddit)!;
      data.stories++;
      
      // Check relevance
      const relevantKeywords = ['habit', 'mood', 'productivity', 'therapy', 'mental health', 'journaling', 'discipline', 'focus', 'meditation', 'wellness'];
      const storyText = (story.narrative + ' ' + (story.title || '')).toLowerCase();
      const isRelevant = relevantKeywords.some(keyword => storyText.includes(keyword));
      if (isRelevant) data.relevantStories++;
    });
    
    // Calculate subreddit scores
    const subredditScores = Array.from(subredditData.entries()).map(([subreddit, data]) => {
      const storyYield = data.posts > 0 ? (data.stories / data.posts) * 100 : 0;
      const feedContribution = posts.length > 0 ? (data.posts / posts.length) * 100 : 0;
      const avgEngagement = data.posts > 0 ? data.totalEngagement / data.posts : 0;
      const engagementPotential = Math.min((avgEngagement / 100) * 100, 100);
      const relevanceConsistency = data.stories > 0 ? (data.relevantStories / data.stories) * 100 : 0;
      
      const overallScore = (storyYield * 0.25 + feedContribution * 0.15 + engagementPotential * 0.15 + relevanceConsistency * 0.20 + 50 * 0.25);
      
      let tier: "Tier 1" | "Tier 2" | "Tier 3" | "Tier 4";
      if (overallScore >= 80) tier = "Tier 1";
      else if (overallScore >= 60) tier = "Tier 2";
      else if (overallScore >= 40) tier = "Tier 3";
      else tier = "Tier 4";
      
      return {
        subreddit,
        overallScore: Math.round(overallScore * 10) / 10,
        tier,
        stories: data.stories,
      };
    });
    
    // Sort subreddits by overall score (descending)
    subredditScores.sort((a, b) => b.overallScore - a.overallScore);
    
    // Group posts by subreddit and find top post for each
    const postsBySubreddit = new Map<string, typeof rankedPosts>();
    rankedPosts.forEach(post => {
      if (!postsBySubreddit.has(post.subreddit)) {
        postsBySubreddit.set(post.subreddit, []);
      }
      postsBySubreddit.get(post.subreddit)!.push(post);
    });
    
    // Build final result
    const topPostsBySubreddit = subredditScores.map((subredditScore, index) => {
      const subredditPosts = postsBySubreddit.get(subredditScore.subreddit) || [];
      subredditPosts.sort((a, b) => b.overallScore - a.overallScore);
      const topPost = subredditPosts.length > 0 ? subredditPosts[0] : undefined;
      
      // Find the post's global rank
      let postRank = 0;
      if (topPost) {
        const globalRankIndex = rankedPosts.findIndex(p => p.id === topPost.id);
        postRank = globalRankIndex >= 0 ? globalRankIndex + 1 : 0;
      }
      
      return {
        subreddit: subredditScore.subreddit,
        subredditRank: index + 1,
        overallScore: subredditScore.overallScore,
        tier: subredditScore.tier,
        topPost: topPost ? {
          id: topPost.id,
          title: topPost.title,
          author: topPost.author,
          url: topPost.url,
          permalink: topPost.permalink,
          score: topPost.score,
          num_comments: topPost.num_comments,
          overallScore: topPost.overallScore,
          postRank,
        } : undefined,
        totalPosts: subredditPosts.length,
        totalStories: subredditScore.stories,
      };
    });
    
    return {
      totalSubreddits: subredditScores.length,
      topPostsBySubreddit,
    };
  },
});

// Get subreddit heatmap data for visualization
export const getSubredditHeatmapData = query({
  args: {},
  returns: v.object({
    subreddits: v.array(
      v.object({
        symbol: v.string(), // Subreddit name (abbreviated)
        name: v.string(), // Full subreddit name
        change: v.number(), // Conversion momentum (% change)
        marketCap: v.number(), // Total content volume
        sector: v.string(), // Category/theme
        price: v.number(), // Overall score
        storyYield: v.number(),
        engagementPotential: v.number(),
        relevanceConsistency: v.number(),
        tier: v.number(),
      })
    ),
    categories: v.array(v.string()),
    totalContent: v.number(),
    avgScore: v.number(),
  }),
  handler: async (ctx) => {
    // Get all posts and stories for calculations
    const posts = await ctx.db.query("live_feed_posts").collect();
    const stories = await ctx.db.query("story_history").collect();
    
    // Calculate subreddit data (reusing logic from scoring matrix)
    const subredditData = new Map<string, { 
      posts: number; 
      stories: number; 
      totalEngagement: number; 
      relevantStories: number;
      tokensUsed: number;
    }>();
    
    // Process posts
    posts.forEach(post => {
      const subreddit = post.subreddit;
      if (!subreddit) return;
      
      if (!subredditData.has(subreddit)) {
        subredditData.set(subreddit, { posts: 0, stories: 0, totalEngagement: 0, relevantStories: 0, tokensUsed: 0 });
      }
      
      const data = subredditData.get(subreddit)!;
      data.posts++;
      data.totalEngagement += post.score + post.num_comments;
      data.tokensUsed += Math.ceil((post.title.length + post.selftext.length) / 4);
    });
    
    // Process stories
    stories.forEach(story => {
      const subreddit = story.original_item?.subreddit;
      if (!subreddit) return;
      
      if (!subredditData.has(subreddit)) {
        subredditData.set(subreddit, { posts: 0, stories: 0, totalEngagement: 0, relevantStories: 0, tokensUsed: 0 });
      }
      
      const data = subredditData.get(subreddit)!;
      data.stories++;
      
      // Check relevance
      const relevantKeywords = [
        'habit', 'mood', 'productivity', 'therapy', 'mental health', 'journaling',
        'discipline', 'focus', 'meditation', 'wellness', 'self-improvement'
      ];
      const storyText = (story.narrative + ' ' + (story.title || '')).toLowerCase();
      const isRelevant = relevantKeywords.some(keyword => storyText.includes(keyword));
      if (isRelevant) data.relevantStories++;
    });

    // Category mapping based on content themes
    const getCategoryForSubreddit = (name: string): string => {
      const categories: Record<string, string[]> = {
        "Mental Health": ["mentalhealth", "therapy", "anxiety", "depression", "adhd", "ptsd", "bipolar"],
        "Productivity": ["productivity", "getdisciplined", "decidingtobebetter", "getmotivated", "zenhabits"],
        "Self Improvement": ["selfimprovement", "habits", "meditation", "mindfulness", "stoicism"],
        "Lifestyle": ["digitalminimalism", "minimalism", "simpleliving", "anticonsumption", "frugal"],
        "Relationships": ["relationships", "relationshipadvice", "dating", "marriage", "divorce"],
        "Career": ["careeradvice", "jobs", "freelance", "entrepreneur", "financialindependence"],
        "Health": ["fitness", "nutrition", "loseit", "gainit", "running", "yoga"],
        "Learning": ["getstudying", "college", "gradschool", "learnprogramming", "languagelearning"],
      };
      
      const lowerName = name.toLowerCase();
      for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => lowerName.includes(keyword))) {
          return category;
        }
      }
      return "General";
    };

    // Create abbreviated symbol with collision detection
    const usedSymbols = new Set<string>();
    const createSymbol = (name: string): string => {
      if (name.length <= 5) {
        const symbol = name.toUpperCase();
        if (!usedSymbols.has(symbol)) {
          usedSymbols.add(symbol);
          return symbol;
        }
      }
      
      // Special cases for common subreddits
      const abbreviations: Record<string, string> = {
        "productivity": "PROD",
        "getdisciplined": "GDIS", 
        "selfimprovement": "SIMP",
        "mentalhealth": "MENT",
        "relationships": "RELS",
        "decidingtobebetter": "DTBB",
        "digitalminimalism": "DMIN",
        "meditation": "MEDT",
        "therapy": "THER",
        "getmotivated": "GMOT",
        "zenhabits": "ZENH",
        "habits": "HBIT",
        "mindfulness": "MIND",
        "stoicism": "STOI",
        "minimalism": "MINM",
        "simpleliving": "SLIV",
        "anticonsumption": "ACON",
        "frugal": "FRUG",
        "relationshipadvice": "RELA",
        "dating": "DATE",
        "marriage": "MARR",
        "divorce": "DVOR",
        "careeradvice": "CARE",
        "jobs": "JOBS",
        "freelance": "FREE",
        "entrepreneur": "ENTR",
        "financialindependence": "FIRE",
        "fitness": "FITN",
        "nutrition": "NUTR",
        "loseit": "LOSE",
        "gainit": "GAIN",
        "running": "RUN",
        "yoga": "YOGA",
      };
      
      let symbol = abbreviations[name.toLowerCase()];
      
      if (!symbol) {
        // Generate from first letters or substring
        symbol = name.substring(0, 4).toUpperCase();
      }
      
      // Handle collisions by adding numbers
      let finalSymbol = symbol;
      let counter = 1;
      while (usedSymbols.has(finalSymbol)) {
        finalSymbol = symbol.substring(0, 3) + counter.toString();
        counter++;
      }
      
      usedSymbols.add(finalSymbol);
      return finalSymbol;
    };

    // Format data for heatmap
    const subreddits = Array.from(subredditData.entries()).map(([subreddit, data]) => {
      // Calculate metrics
      const storyYield = data.posts > 0 ? (data.stories / data.posts) : 0;
      const feedContribution = posts.length > 0 ? (data.posts / posts.length) * 100 : 0;
      const avgEngagement = data.posts > 0 ? data.totalEngagement / data.posts : 0;
      const engagementPotential = Math.min((avgEngagement / 100) * 100, 100);
      const relevanceConsistency = data.stories > 0 ? (data.relevantStories / data.stories) : 0;
      
      // Calculate overall score (scale metrics appropriately)
      const storyYieldScore = storyYield * 100; // Convert to percentage
      const feedContributionScore = Math.min(feedContribution * 2, 100); // Scale up but cap at 100
      const engagementScore = Math.min(engagementPotential, 100);
      const relevanceScore = relevanceConsistency * 100; // Convert to percentage
      
      const overallScore = (
        storyYieldScore * 0.30 +    // 30% - Story conversion efficiency
        feedContributionScore * 0.20 + // 20% - Volume contribution  
        engagementScore * 0.25 +    // 25% - Engagement potential
        relevanceScore * 0.25       // 25% - Content relevance
      );
      
      // Determine tier with 10-tier granular system (very lenient)
      let tier: number;
      if (overallScore >= 90) tier = 1;       // Elite performers (90-100)
      else if (overallScore >= 80) tier = 2;  // Excellent (80-89)
      else if (overallScore >= 70) tier = 3;  // Very good (70-79)
      else if (overallScore >= 60) tier = 4;  // Good (60-69)
      else if (overallScore >= 50) tier = 5;  // Above average (50-59)
      else if (overallScore >= 40) tier = 6;  // Average (40-49)
      else if (overallScore >= 30) tier = 7;  // Below average (30-39)
      else if (overallScore >= 20) tier = 8;  // Poor (20-29)
      else if (overallScore >= 10) tier = 9;  // Very poor (10-19)
      else tier = 10;                         // Needs major improvement (0-9)
      
      // Calculate change (conversion momentum) - simulated
      const change = (Math.random() - 0.5) * 20; // -10 to +10 range
      
      return {
        symbol: createSymbol(subreddit),
        name: subreddit,
        change: parseFloat(change.toFixed(2)),
        marketCap: data.posts + data.stories, // Total content as "market cap"
        sector: getCategoryForSubreddit(subreddit),
        price: parseFloat(overallScore.toFixed(1)),
        storyYield: parseFloat(storyYield.toFixed(2)),
        engagementPotential: parseFloat(engagementPotential.toFixed(1)),
        relevanceConsistency: parseFloat(relevanceConsistency.toFixed(2)),
        tier,
      };
    });
    
    // Get unique categories
    const categories = Array.from(new Set(subreddits.map(s => s.sector)));
    
    // Calculate totals
    const totalContent = subreddits.reduce((sum, s) => sum + s.marketCap, 0);
    const avgScore = subreddits.reduce((sum, s) => sum + s.price, 0) / subreddits.length;
    
    return {
      subreddits,
      categories,
      totalContent,
      avgScore,
    };
  },
});

// Get recent posts with content for keyword extraction
export const getRecentPosts = query({
  args: { 
    limit: v.optional(v.number())
  },
  returns: v.array(v.object({
    id: v.string(),
    title: v.string(),
    author: v.string(),
    subreddit: v.string(),
    url: v.string(),
    permalink: v.string(),
    score: v.number(),
    num_comments: v.number(),
    created_utc: v.number(),
    selftext: v.string(),
    domain: v.string(),
  })),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    
    // Get recent posts ordered by creation time
    const posts = await ctx.db
      .query("live_feed_posts")
      .order("desc")
      .take(limit);

    return posts.map(post => ({
      id: post.id,
      title: post.title,
      author: post.author,
      subreddit: post.subreddit,
      url: post.url,
      permalink: post.permalink,
      score: post.score,
      num_comments: post.num_comments,
      created_utc: post.created_utc,
      selftext: post.selftext || '',
      domain: post.domain,
    }));
  },
});