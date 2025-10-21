"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal, api } from "../_generated/api";
import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const generateRedditPost = action({
  args: { 
    keywords: v.array(v.object({
      keyword: v.string(),
      count: v.number(),
      category: v.string(),
      sentiment: v.string(),
      confidence: v.number(),
      trending: v.boolean()
    })),
    columnContext: v.string(),
    instructions: v.optional(v.string())
  },
  returns: v.object({
    title: v.string(),
    content: v.string(),
    subreddit: v.string(),
    author: v.string(),
    estimatedScore: v.number(),
    estimatedComments: v.number(),
    keywords: v.array(v.string()),
    generatedAt: v.number(),
    modelCost: v.number(),
    postId: v.id("generated_posts")
  }),
  handler: async (ctx, args): Promise<{
    title: string;
    content: string;
    subreddit: string;
    author: string;
    estimatedScore: number;
    estimatedComments: number;
    keywords: string[];
    generatedAt: number;
    modelCost: number;
    postId: any;
  }> => {
    if (args.keywords.length === 0) {
      throw new Error("No keywords provided for generation");
    }

    // Get top posts for each keyword
    const topPosts = await ctx.runQuery(internal.keywords.metrics.getTopPostsForKeywords, {
      keywords: args.keywords.map(k => k.keyword),
      limit: 3
    });

    // Get metric scores for keywords
    const keywordMetrics: any[] = await ctx.runQuery(internal.keywords.metrics.getKeywordMetrics, {
      keywords: args.keywords.map(k => k.keyword)
    });

    // Calculate aggregate metrics for strategy determination
    const aggregateMetrics = calculateAggregateMetrics(keywordMetrics);
    
    // Determine content strategy based on metrics
    const contentStrategy = determineContentStrategy(aggregateMetrics);

    // Build structured context with metric-driven insights
    const structuredContext: any = {
      keywords: keywordMetrics.map((km: any, index: number) => ({
        keyword: km.keyword,
        
        // Core Metrics with strategic implications
        metrics: {
          SY: `${km.metrics.synergyScore}%`, // High = metrics align well
          RC: `${km.metrics.relevanceCoefficient}%`, // High = strong subreddit fit
          EP: km.metrics.engagementPotential.toFixed(1), // High = viral potential
          FC: `${km.metrics.freshnessCoefficient.toFixed(1)}%`, // Low = fresh topic
          NI: `${km.metrics.noveltyIndex}%`, // High = needs unique angle
          tier: km.metrics.performanceTier,
          trend: km.metrics.trendStatus,
          velocity: km.metrics.trendVelocity
        },
        
        // Top performing examples with engagement data
        topPosts: topPosts[index]?.posts.map((p: any) => ({
          title: p.title,
          subreddit: `r/${p.subreddit}`,
          score: p.score ?? 0,
          comments: p.num_comments ?? 0,
          ratio: `${Math.round((p.upvote_ratio || 0.85) * 100)}%`,
          link: p.permalink,
          // Extract successful patterns
          titleLength: p.title.length,
          hasQuestion: p.title.includes('?'),
          hasNumbers: /\d/.test(p.title)
        })) || []
      })),
      
      // Enhanced subreddit selection based on metrics
      targetSubreddit: determineOptimalSubreddit(keywordMetrics, aggregateMetrics),
      
      // Strategic guidance based on metrics
      contentStrategy: contentStrategy
    };

    // Create metric-driven system prompt
    let systemPrompt = `You are an expert Reddit content generator that creates posts optimized for maximum engagement based on data-driven metrics.

CRITICAL: Your primary goal is to generate content that will score highly according to our 9-metric scoring matrix:
1. Story Yield (SY): Efficiency of converting posts to stories
2. Feed Contribution (FC): Proportion of feed items from this source
3. Engagement Potential (EP): Average engagement metrics
4. Relevance Consistency (RC): Alignment with core themes
5. Novelty Index (NI): Uniqueness of content
6. Trend Propagation (TP): Cross-posting potential
7. Volume Reliability (VR): Posting consistency
8. Signal Density (SD): Information value per content unit
9. Conversion Momentum (CM): Growth trajectory

You must analyze the provided metrics and adapt your content generation strategy accordingly.`;
    
    // Add user instructions with context about metrics
    if (args.instructions && args.instructions.trim()) {
      systemPrompt += `\n\nUSER INSTRUCTIONS (HIGH PRIORITY - but optimize within metric constraints):\n"${args.instructions}"\n\nBalance these instructions with metric optimization for best results.`;
    }

    const userPrompt = `Generate a Reddit post using these performance metrics and proven patterns:

KEYWORD METRICS & ANALYSIS:
${JSON.stringify(structuredContext, null, 2)}

CONTENT STRATEGY (BASED ON METRICS):
${JSON.stringify(contentStrategy, null, 2)}

METRIC-DRIVEN REQUIREMENTS:
${generateMetricRequirements(aggregateMetrics)}

TOP PERFORMING PATTERNS TO EMULATE:
${extractSuccessPatterns(topPosts)}

CONTEXT: ${args.columnContext}
TARGET: ${structuredContext.targetSubreddit}
${args.instructions ? `\nUSER INSTRUCTIONS: "${args.instructions}"` : ""}

Generate a post that:
1. MAXIMIZES predicted engagement based on EP scores (${aggregateMetrics.avgEP.toFixed(1)})
2. ALIGNS with subreddit relevance patterns (RC: ${aggregateMetrics.avgRC.toFixed(1)}%)
3. INCORPORATES novelty if NI is low (current: ${aggregateMetrics.avgNI.toFixed(1)}%)
4. LEVERAGES freshness opportunities (FC: ${aggregateMetrics.avgFC.toFixed(1)}%)
5. FOLLOWS successful title/content patterns from top posts
6. TARGETS tier ${aggregateMetrics.dominantTier} performance level

Format as JSON with metric-based predictions:
{
  "title": "Title optimized for engagement (consider: question format, numbers, controversy)",
  "content": "Body that maximizes signal density while maintaining authenticity",
  "author": "credible_username_style",
  "estimatedScore": <calculate based on EP and historical data>,
  "estimatedComments": <predict based on controversy and question potential>
}`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1000,
        temperature: calculateOptimalTemperature(aggregateMetrics), // Adjust temperature based on novelty needs
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt
          }
        ]
      });

      const responseText = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';

      let generatedPost: {
        title: string;
        content: string;
        author: string;
        estimatedScore: number;
        estimatedComments: number;
      };
      
      console.log("Raw response from Claude:", responseText.substring(0, 500) + "...");
      
      try {
        // Multiple attempts to extract JSON from the response
        let jsonString = null;
        
        // Method 1: Look for JSON between curly braces (greedy match)
        let jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonString = jsonMatch[0];
          console.log("Method 1 - Found JSON with regex");
        }
        
        // Method 2: Look for lines starting with { and ending with }
        if (!jsonString) {
          const lines = responseText.split('\n');
          const startIndex = lines.findIndex(line => line.trim().startsWith('{'));
          const endIndex = lines.findIndex(line => line.trim().endsWith('}'));
          if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
            jsonString = lines.slice(startIndex, endIndex + 1).join('\n');
            console.log("Method 2 - Found JSON by line parsing");
          }
        }
        
        // Method 3: Try to find JSON in code blocks
        if (!jsonString) {
          const codeBlockMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
          if (codeBlockMatch) {
            jsonString = codeBlockMatch[1];
            console.log("Method 3 - Found JSON in code block");
          }
        }
        
        if (jsonString) {
          console.log("Extracted JSON, attempting manual field extraction...");
          
          // Instead of trying to fix malformed JSON, manually extract fields
          try {
            // Extract title
            const titleMatch = jsonString.match(/"title"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
            const title = titleMatch ? titleMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n') : null;
            
            // Extract content - handle multi-line content with backticks or quotes
            let contentMatch = jsonString.match(/"content"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/s);
            if (!contentMatch) {
              // Try with backticks
              contentMatch = jsonString.match(/"content"\s*:\s*`([^`]*)`/s);
            }
            const content = contentMatch ? contentMatch[1]
              .replace(/\\"/g, '"')
              .replace(/\\n/g, '\n')
              .replace(/\\'/g, "'")
              .replace(/\\\\/g, '\\') : null;
            
            // Extract author
            const authorMatch = jsonString.match(/"author"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
            const author = authorMatch ? authorMatch[1].replace(/^u\//, '') : null;
            
            // Extract scores
            const scoreMatch = jsonString.match(/"estimatedScore"\s*:\s*(\d+)/);
            const estimatedScore = scoreMatch ? parseInt(scoreMatch[1]) : 42;
            
            const commentsMatch = jsonString.match(/"estimatedComments"\s*:\s*(\d+)/);
            const estimatedComments = commentsMatch ? parseInt(commentsMatch[1]) : 7;
            
            console.log("Manual extraction results:", {
              titleLength: title?.length || 0,
              contentLength: content?.length || 0,
              author,
              estimatedScore,
              estimatedComments
            });
            
            if (title && content) {
              generatedPost = {
                title: title.trim(),
                content: content.trim(),
                author: author || `user_${Math.random().toString(36).substr(2, 9)}`,
                estimatedScore,
                estimatedComments
              };
              console.log("Successfully created generatedPost via manual extraction");
            } else {
              throw new Error(`Missing required fields. Title: ${!!title}, Content: ${!!content}`);
            }
          } catch (error) {
            console.error("Manual extraction failed:", error);
            throw error;
          }
        } else {
          throw new Error("No JSON found in response using any method");
        }
      } catch (error) {
        console.error("JSON parsing failed:", error);
        console.log("Raw response for debugging:", responseText);
        
        // Fallback with metric-based estimates
        const avgEP = keywordMetrics.reduce((sum: number, km: any) => 
          sum + km.metrics.engagementPotential, 0) / keywordMetrics.length;
        
        generatedPost = {
          title: `Discussion: ${args.keywords[0].keyword}`,
          content: "Failed to parse generated content. Please try again.",
          author: `user_${Math.random().toString(36).substr(2, 9)}`,
          estimatedScore: Math.round(avgEP * 10),
          estimatedComments: Math.round(avgEP / 5)
        };
      }

      // Calculate model cost
      const inputTokens = response.usage?.input_tokens || 0;
      const outputTokens = response.usage?.output_tokens || 0;
      const modelCost = (inputTokens * 0.00000025) + (outputTokens * 0.00000125);

      // Log the generation
      await ctx.runMutation(internal.analytics.costTracking.logModelUsage, {
        model: "claude-3-haiku",
        inputTokens,
        outputTokens,
        cost: modelCost,
        purpose: "reddit_post_generation",
        metadata: {
          keywords: args.keywords.map(k => k.keyword),
          columnContext: args.columnContext,
          instructions: args.instructions || null,
          metrics: structuredContext
        }
      });

      const generatedAt = Date.now();
      const authorName = generatedPost.author || `user_${Math.random().toString(36).substr(2, 9)}`;
      
      // Enhanced score estimation based on actual metrics
      const estimatedScore = calculateMetricBasedScore(aggregateMetrics, keywordMetrics);
      const estimatedComments = calculateExpectedComments(aggregateMetrics, estimatedScore);
      
      // Calculate average metrics for storage
      const avgMetrics = keywordMetrics.reduce((acc: any, km: any) => ({
        synergyScore: acc.synergyScore + km.metrics.synergyScore,
        relevanceCoefficient: acc.relevanceCoefficient + km.metrics.relevanceCoefficient,
        engagementPotential: acc.engagementPotential + km.metrics.engagementPotential,
        freshnessCoefficient: acc.freshnessCoefficient + km.metrics.freshnessCoefficient,
        noveltyIndex: acc.noveltyIndex + km.metrics.noveltyIndex
      }), {
        synergyScore: 0,
        relevanceCoefficient: 0,
        engagementPotential: 0,
        freshnessCoefficient: 0,
        noveltyIndex: 0
      });
      
      const count = keywordMetrics.length;
      if (count > 0) {
        avgMetrics.synergyScore /= count;
        avgMetrics.relevanceCoefficient /= count;
        avgMetrics.engagementPotential /= count;
        avgMetrics.freshnessCoefficient /= count;
        avgMetrics.noveltyIndex /= count;
      }

      // Store the generated post in database
      const postId: any = await ctx.runMutation(api.editor.generatedPosts.storeGeneratedPost, {
        title: generatedPost.title,
        content: generatedPost.content,
        author: authorName,
        target_subreddit: structuredContext.targetSubreddit.replace('r/', ''),
        estimated_score: estimatedScore,
        estimated_comments: estimatedComments,
        source_keywords: args.keywords.map(k => k.keyword),
        column_context: args.columnContext,
        avg_synergy_score: aggregateMetrics.avgSY,
        avg_relevance_coefficient: aggregateMetrics.avgRC,
        avg_engagement_potential: aggregateMetrics.avgEP,
        avg_freshness_coefficient: aggregateMetrics.avgFC,
        avg_novelty_index: aggregateMetrics.avgNI,
        model_used: "claude-3-haiku",
        generation_cost: modelCost,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        generated_at: generatedAt
      });

      return {
        title: generatedPost.title,
        content: generatedPost.content,
        subreddit: structuredContext.targetSubreddit.replace('r/', ''),
        author: authorName,
        estimatedScore: estimatedScore,
        estimatedComments: estimatedComments,
        keywords: args.keywords.map(k => k.keyword),
        generatedAt: generatedAt,
        modelCost: modelCost,
        postId: postId // Include the database ID for reference
      };

    } catch (error) {
      console.error("Error generating Reddit post:", error);
      throw new Error(`Failed to generate Reddit post: ${error}`);
    }
  }
});

// Helper function to calculate aggregate metrics
function calculateAggregateMetrics(keywordMetrics: any[]) {
  const count = keywordMetrics.length;
  if (count === 0) {
    return {
      avgSY: 50, avgRC: 50, avgEP: 50, avgFC: 50, avgNI: 50,
      dominantTier: "Tier 3", trendDirection: "stable"
    };
  }
  
  const totals = keywordMetrics.reduce((acc: any, km: any) => ({
    sy: acc.sy + km.metrics.synergyScore,
    rc: acc.rc + km.metrics.relevanceCoefficient,
    ep: acc.ep + km.metrics.engagementPotential,
    fc: acc.fc + km.metrics.freshnessCoefficient,
    ni: acc.ni + km.metrics.noveltyIndex,
    tiers: [...acc.tiers, km.metrics.performanceTier],
    trends: [...acc.trends, km.metrics.trendStatus]
  }), { sy: 0, rc: 0, ep: 0, fc: 0, ni: 0, tiers: [], trends: [] });
  
  // Calculate dominant tier
  const tierCounts = totals.tiers.reduce((acc: any, tier: string) => {
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {});
  const dominantTier = Object.entries(tierCounts)
    .sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "Tier 3";
  
  return {
    avgSY: totals.sy / count,
    avgRC: totals.rc / count,
    avgEP: totals.ep / count,
    avgFC: totals.fc / count,
    avgNI: totals.ni / count,
    dominantTier,
    trendDirection: totals.trends.filter((t: string) => t === "rising").length > count / 2 ? "rising" : "stable"
  };
}

// Determine content strategy based on metrics
function determineContentStrategy(metrics: any) {
  const strategies = [];
  
  if (metrics.avgEP > 80) {
    strategies.push("HIGH VIRAL POTENTIAL: Focus on controversial or emotionally resonant content");
  }
  if (metrics.avgRC > 85) {
    strategies.push("STRONG FIT: Lean into subreddit-specific culture and references");
  }
  if (metrics.avgNI < 30) {
    strategies.push("OVERSATURATED TOPIC: Add unique personal angle or contrarian view");
  }
  if (metrics.avgFC < 20) {
    strategies.push("FRESH OPPORTUNITY: Be first-mover on emerging trend");
  }
  if (metrics.avgSY > 75) {
    strategies.push("HIGH CONVERSION: Structure as narrative or story format");
  }
  
  return {
    primary: strategies[0] || "BALANCED APPROACH: Optimize for steady engagement",
    secondary: strategies.slice(1, 3),
    tier: metrics.dominantTier,
    expectedPerformance: metrics.avgEP > 70 ? "high" : metrics.avgEP > 40 ? "medium" : "low"
  };
}

// Generate specific requirements based on metrics
function generateMetricRequirements(metrics: any): string {
  const requirements = [];
  
  if (metrics.avgEP > 70) {
    requirements.push("• Include controversial element or strong opinion to drive comments");
  }
  if (metrics.avgRC > 80) {
    requirements.push("• Use subreddit-specific terminology and insider references");
  }
  if (metrics.avgNI < 40) {
    requirements.push("• CRITICAL: Add unique perspective or unexpected twist to stand out");
  }
  if (metrics.avgFC < 25) {
    requirements.push("• Capitalize on timing - this is a fresh topic with first-mover advantage");
  }
  if (metrics.dominantTier === "Tier 1" || metrics.dominantTier === "Tier 2") {
    requirements.push("• Maintain high quality - this keyword performs at elite level");
  }
  
  return requirements.join("\n");
}

// Extract success patterns from top posts
function extractSuccessPatterns(topPosts: any[]): string {
  const patterns = {
    questionTitles: 0,
    numbersInTitle: 0,
    avgTitleLength: 0,
    avgScore: 0,
    avgComments: 0
  };
  
  let count = 0;
  topPosts.forEach((keywordPosts: any) => {
    keywordPosts?.posts?.forEach((post: any) => {
      if (post.hasQuestion) patterns.questionTitles++;
      if (post.hasNumbers) patterns.numbersInTitle++;
      patterns.avgTitleLength += post.titleLength || 0;
      patterns.avgScore += (post.score ?? 0) || 0;
      patterns.avgComments += post.comments || 0;
      count++;
    });
  });
  
  if (count > 0) {
    patterns.avgTitleLength /= count;
    patterns.avgScore /= count;
    patterns.avgComments /= count;
  }
  
  return `
- ${patterns.questionTitles > count/2 ? "USE" : "AVOID"} question format in title
- ${patterns.numbersInTitle > count/3 ? "INCLUDE" : "SKIP"} numbers/statistics
- Target title length: ${Math.round(patterns.avgTitleLength)} characters
- Expected performance: ${Math.round(patterns.avgScore)} upvotes, ${Math.round(patterns.avgComments)} comments`;
}

// Calculate optimal temperature based on novelty needs
function calculateOptimalTemperature(metrics: any): number {
  // Higher temperature for low novelty (need creativity)
  // Lower temperature for high engagement potential (need precision)
  if (metrics.avgNI < 30) return 0.9; // Need creativity
  if (metrics.avgEP > 80) return 0.6; // Need precision
  return 0.75; // Balanced
}

// Calculate metric-based score estimation
function calculateMetricBasedScore(aggregateMetrics: any, keywordMetrics: any[]): number {
  // Base score from engagement potential
  let score = aggregateMetrics.avgEP * 10; // Convert to 0-1000 range
  
  // Multiply by relevance coefficient
  score *= (aggregateMetrics.avgRC / 100);
  
  // Boost for freshness
  if (aggregateMetrics.avgFC < 20) {
    score *= 1.5; // 50% boost for fresh topics
  }
  
  // Penalty for oversaturation
  if (aggregateMetrics.avgNI < 30) {
    score *= 0.7; // 30% penalty without unique angle
  }
  
  // Tier multiplier
  const tierMultipliers: any = {
    "Tier 1": 2.0,
    "Tier 2": 1.5,
    "Tier 3": 1.0,
    "Tier 4": 0.5
  };
  score *= tierMultipliers[aggregateMetrics.dominantTier] || 1.0;
  
  return Math.round(Math.min(Math.max(score, 10), 5000)); // Clamp between 10-5000
}

// Calculate expected comments based on metrics
function calculateExpectedComments(metrics: any, estimatedScore: number): number {
  // Comments correlate with controversy and questions
  let comments = estimatedScore * 0.05; // Base 5% of score
  
  // Boost for low novelty (controversial topics)
  if (metrics.avgNI < 40) {
    comments *= 1.5;
  }
  
  // Boost for high engagement potential
  if (metrics.avgEP > 70) {
    comments *= 1.3;
  }
  
  return Math.round(Math.max(comments, 3)); // Minimum 3 comments
}

// Enhanced subreddit selection based on metrics
function determineOptimalSubreddit(keywordMetrics: any[], aggregateMetrics: any): string {
  const subredditScores = new Map<string, { score: number; relevance: number; volume: number }>();
  
  keywordMetrics.forEach((km: any) => {
    km.metrics.topSubreddits.forEach((sub: any) => {
      const current = subredditScores.get(sub.name) || { score: 0, relevance: 0, volume: 0 };
      
      // Weight by multiple factors
      const engagementScore = sub.avgScore * (km.metrics.engagementPotential / 100);
      const relevanceScore = km.metrics.relevanceCoefficient / 100;
      const volumeScore = sub.postCount;
      
      // Composite score with weighted factors
      const compositeScore = (
        engagementScore * 0.4 +  // 40% engagement
        relevanceScore * 100 * 0.4 +  // 40% relevance
        Math.min(volumeScore, 100) * 0.2  // 20% volume (capped)
      );
      
      subredditScores.set(sub.name, {
        score: current.score + compositeScore,
        relevance: current.relevance + relevanceScore,
        volume: current.volume + volumeScore
      });
    });
  });
  
  // Sort by composite score
  const sorted = Array.from(subredditScores.entries())
    .sort((a, b) => b[1].score - a[1].score);
  
  // If top subreddit has high relevance, use it
  if (sorted[0] && sorted[0][1].relevance > 0.8) {
    return `r/${sorted[0][0]}`;
  }
  
  // Otherwise, consider volume as tiebreaker
  const highVolume = sorted.filter(([_, data]) => data.volume > 10);
  if (highVolume.length > 0) {
    return `r/${highVolume[0][0]}`;
  }
  
  return sorted[0] ? `r/${sorted[0][0]}` : 'r/AskReddit';
}