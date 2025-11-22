import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("uploadedFiles"),
    _creationTime: v.number(),
    filename: v.string(),
    anthropicFileId: v.string(),
    mimeType: v.string(),
    sizeBytes: v.number(),
    content: v.string(),
    createdAt: v.number(),
  })),
  handler: async (ctx) => {
    const files = await ctx.db
      .query("uploadedFiles")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();
    return files;
  },
});

export const create = mutation({
  args: {
    filename: v.string(),
    anthropicFileId: v.string(),
    mimeType: v.string(),
    sizeBytes: v.number(),
    content: v.string(),
  },
  returns: v.id("uploadedFiles"),
  handler: async (ctx, args) => {
    const fileId = await ctx.db.insert("uploadedFiles", {
      filename: args.filename,
      anthropicFileId: args.anthropicFileId,
      mimeType: args.mimeType,
      sizeBytes: args.sizeBytes,
      content: args.content,
      createdAt: Date.now(),
    });
    return fileId;
  },
});

export const remove = mutation({
  args: { id: v.id("uploadedFiles") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const getByAnthropicFileId = query({
  args: { anthropicFileId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("uploadedFiles"),
      _creationTime: v.number(),
      filename: v.string(),
      anthropicFileId: v.string(),
      mimeType: v.string(),
      sizeBytes: v.number(),
      content: v.string(),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const file = await ctx.db
      .query("uploadedFiles")
      .withIndex("by_anthropicFileId", (q) => q.eq("anthropicFileId", args.anthropicFileId))
      .first();
    return file;
  },
});
