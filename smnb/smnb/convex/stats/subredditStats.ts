// SUBREDDIT STATISTICS QUERIES
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/convex/stats/subredditStats.ts

import { v } from "convex/values";
import { query } from "../_generated/server";

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