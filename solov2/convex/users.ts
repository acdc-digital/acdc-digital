import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByClerkId = query({
  args: { 
    clerkId: v.string() 
  },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      name: v.string(),
      email: v.string(),
      clerkId: v.string(),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      clerkId: args.clerkId,
      createdAt: now,
    });
  },
});