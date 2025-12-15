import { mutation, query } from "../../_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "../../shared/lib/requireAdmin";

export const submitEmail = mutation({
  args: {
    email: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email format");
    }

    // Check if email already exists
    const existing = await ctx.db
      .query("learnMore")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      // Email already exists, silently succeed
      return null;
    }

    // Insert new email
    await ctx.db.insert("learnMore", {
      email: args.email,
      createdAt: Date.now(),
    });

    return null;
  },
});

export const getAllEmails = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("learnMore"),
      _creationTime: v.number(),
      email: v.string(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    // Require admin access
    await requireAdmin(ctx);
    
    const emails = await ctx.db.query("learnMore").collect();
    return emails;
  },
});
