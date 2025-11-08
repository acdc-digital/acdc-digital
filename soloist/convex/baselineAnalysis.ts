// BASELINE ANALYSIS FUNCTIONS
// /Users/matthewsimon/Projects/acdc-digital/soloist/convex/baselineAnalysis.ts

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Mutation to save or update baseline analysis
export const saveBaseline = mutation({
  args: {
    // Emotional Landscape
    emotionalFrequency: v.optional(v.string()),
    stressRecovery: v.optional(v.string()),
    typicalMood: v.optional(v.string()),
    emotionalAwareness: v.optional(v.string()),
    goodDayDescription: v.optional(v.string()),
    // Cognitive Patterns
    decisionStyle: v.optional(v.string()),
    overthinking: v.optional(v.string()),
    reactionToSetback: v.optional(v.string()),
    // Motivation & Focus
    motivationType: v.optional(v.string()),
    focusTrigger: v.optional(v.string()),
    successDefinition: v.optional(v.string()),
    // Behavioral Rhythms
    consistency: v.optional(v.string()),
    reflectionFrequency: v.optional(v.string()),
    resetStrategy: v.optional(v.string()),
    // Social & Self-Perception
    socialLevel: v.optional(v.string()),
    rechargeMethod: v.optional(v.string()),
    selfUnderstanding: v.optional(v.string()),
    selfImprovementFocus: v.optional(v.string()),
    // Metadata
    isComplete: v.optional(v.boolean()),
  },
  returns: v.id("baselineAnalysis"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();

    // Check if baseline already exists for this user
    const existingBaseline = await ctx.db
      .query("baselineAnalysis")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existingBaseline) {
      // Update existing baseline
      await ctx.db.patch(existingBaseline._id, {
        ...args,
        updatedAt: now,
        ...(args.isComplete && { completedAt: now }),
      });
      return existingBaseline._id;
    } else {
      // Create new baseline
      const baselineId = await ctx.db.insert("baselineAnalysis", {
        userId,
        ...args,
        isComplete: args.isComplete ?? false,
        createdAt: now,
        updatedAt: now,
        ...(args.isComplete && { completedAt: now }),
      });
      return baselineId;
    }
  },
});

// Query to get user's baseline analysis
export const getBaseline = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("baselineAnalysis"),
      userId: v.id("users"),
      emotionalFrequency: v.optional(v.string()),
      stressRecovery: v.optional(v.string()),
      typicalMood: v.optional(v.string()),
      emotionalAwareness: v.optional(v.string()),
      goodDayDescription: v.optional(v.string()),
      decisionStyle: v.optional(v.string()),
      overthinking: v.optional(v.string()),
      reactionToSetback: v.optional(v.string()),
      motivationType: v.optional(v.string()),
      focusTrigger: v.optional(v.string()),
      successDefinition: v.optional(v.string()),
      consistency: v.optional(v.string()),
      reflectionFrequency: v.optional(v.string()),
      resetStrategy: v.optional(v.string()),
      socialLevel: v.optional(v.string()),
      rechargeMethod: v.optional(v.string()),
      selfUnderstanding: v.optional(v.string()),
      selfImprovementFocus: v.optional(v.string()),
      isComplete: v.boolean(),
      completedAt: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.number(),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Get the baseline for this user
    const baseline = await ctx.db
      .query("baselineAnalysis")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    return baseline;
  },
});

// Mutation to update specific field (for auto-save on field change)
export const updateBaselineField = mutation({
  args: {
    field: v.string(),
    value: v.string(),
  },
  returns: v.id("baselineAnalysis"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();

    // Check if baseline already exists for this user
    const existingBaseline = await ctx.db
      .query("baselineAnalysis")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existingBaseline) {
      // Update existing baseline with single field
      await ctx.db.patch(existingBaseline._id, {
        [args.field]: args.value,
        updatedAt: now,
      });
      return existingBaseline._id;
    } else {
      // Create new baseline with this field
      const baselineId = await ctx.db.insert("baselineAnalysis", {
        userId,
        [args.field]: args.value,
        isComplete: false,
        createdAt: now,
        updatedAt: now,
      });
      return baselineId;
    }
  },
});
