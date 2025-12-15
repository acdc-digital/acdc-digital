// LONG FORM ENTRIES
// /Users/matthewsimon/Projects/acdc-digital/soloist/convex/longForm.ts

import { mutation, query } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

/**
 * Save or update a long-form journal entry.
 * Upserts based on userId + date - one entry per user per day.
 */
export const saveLongFormEntry = mutation({
  args: {
    userId: v.string(),
    date: v.string(),
    title: v.optional(v.string()),
    content: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    entryId: v.optional(v.string()),
    isNew: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const { userId, date, title, content } = args;
    const typedUserId = userId as Id<"users">;

    // Calculate word and character counts
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const charCount = content.length;

    // Check for existing entry on this date
    const existingEntry = await ctx.db
      .query("longFormEntries")
      .withIndex("by_userId_and_date", (q) => 
        q.eq("userId", typedUserId).eq("date", date)
      )
      .first();

    if (existingEntry) {
      // Update existing entry
      await ctx.db.patch(existingEntry._id, {
        title,
        content,
        wordCount,
        charCount,
        updatedAt: Date.now(),
      });

      return {
        success: true,
        entryId: existingEntry._id,
        isNew: false,
      };
    } else {
      // Create new entry
      const entryId = await ctx.db.insert("longFormEntries", {
        userId: typedUserId,
        date,
        title,
        content,
        wordCount,
        charCount,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      return {
        success: true,
        entryId,
        isNew: true,
      };
    }
  },
});

/**
 * Get a long-form entry for a specific user and date.
 */
export const getLongFormEntry = query({
  args: {
    userId: v.string(),
    date: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("longFormEntries"),
      userId: v.id("users"),
      date: v.string(),
      title: v.optional(v.string()),
      content: v.string(),
      wordCount: v.number(),
      charCount: v.number(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const { userId, date } = args;
    const typedUserId = userId as Id<"users">;

    return await ctx.db
      .query("longFormEntries")
      .withIndex("by_userId_and_date", (q) => 
        q.eq("userId", typedUserId).eq("date", date)
      )
      .first();
  },
});

/**
 * List all long-form entries for a user, ordered by date (most recent first).
 */
export const listLongFormEntries = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("longFormEntries"),
      userId: v.id("users"),
      date: v.string(),
      title: v.optional(v.string()),
      content: v.string(),
      wordCount: v.number(),
      charCount: v.number(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const { userId, limit } = args;
    const typedUserId = userId as Id<"users">;

    let query = ctx.db
      .query("longFormEntries")
      .withIndex("by_userId_and_createdAt", (q) => q.eq("userId", typedUserId))
      .order("desc");

    if (limit) {
      return await query.take(limit);
    }

    return await query.collect();
  },
});

/**
 * Get long-form entries for a user within a date range.
 */
export const getLongFormEntriesByDateRange = query({
  args: {
    userId: v.string(),
    startDate: v.string(),
    endDate: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("longFormEntries"),
      userId: v.id("users"),
      date: v.string(),
      title: v.optional(v.string()),
      content: v.string(),
      wordCount: v.number(),
      charCount: v.number(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const { userId, startDate, endDate } = args;
    const typedUserId = userId as Id<"users">;

    return await ctx.db
      .query("longFormEntries")
      .withIndex("by_userId", (q) => q.eq("userId", typedUserId))
      .filter((q) => 
        q.and(
          q.gte(q.field("date"), startDate),
          q.lte(q.field("date"), endDate)
        )
      )
      .collect();
  },
});

/**
 * Delete a long-form entry.
 */
export const deleteLongFormEntry = mutation({
  args: {
    entryId: v.id("longFormEntries"),
    userId: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const { entryId, userId } = args;

    // Verify the entry belongs to the user
    const entry = await ctx.db.get(entryId);
    if (!entry || entry.userId !== userId) {
      return { success: false };
    }

    await ctx.db.delete(entryId);
    return { success: true };
  },
});
