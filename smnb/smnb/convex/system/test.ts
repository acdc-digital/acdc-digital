import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Simple test mutation to verify API generation
export const saveNewsletterTest = mutation({
  args: {
    storyId: v.string(),
    content: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    // Try to find existing document by storyId
    const existing = await ctx.db
      .query("editor_documents")
      .withIndex("by_story_id", q => q.eq("story_id", args.storyId))
      .first();

    const now = Date.now();
    if (existing) {
      // Update existing document
      await ctx.db.patch(existing._id, {
        newsletter_content: args.content,
        newsletter_generated_at: now,
        updated_at: now,
      });
      console.log(`💾 Updated newsletter for story: ${args.storyId}`);
      return existing._id;
    } else {
      // Insert new document
      const docId = await ctx.db.insert("editor_documents", {
        story_id: args.storyId,
        newsletter_content: args.content,
        newsletter_generated_at: now,
        created_at: now,
        updated_at: now,
      });
      console.log(`💾 Created newsletter for story: ${args.storyId}`);
      return docId;
    }
  },
});