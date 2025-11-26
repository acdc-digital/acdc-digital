import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * List all saved components, ordered by creation time (newest first)
 */
export const listComponents = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("generatedComponents"),
      _creationTime: v.number(),
      code: v.string(),
      title: v.string(),
      framework: v.literal("react"),
      description: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const components = await ctx.db
      .query("generatedComponents")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();

    return components;
  },
});

/**
 * Get a specific component by ID
 */
export const getComponent = query({
  args: { componentId: v.id("generatedComponents") },
  returns: v.union(
    v.object({
      _id: v.id("generatedComponents"),
      _creationTime: v.number(),
      code: v.string(),
      title: v.string(),
      framework: v.literal("react"),
      description: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const component = await ctx.db.get(args.componentId);
    return component;
  },
});

/**
 * Save a new component
 * Validates code size (max 100KB)
 */
export const saveComponent = mutation({
  args: {
    code: v.string(),
    title: v.string(),
    framework: v.literal("react"),
    description: v.optional(v.string()),
  },
  returns: v.id("generatedComponents"),
  handler: async (ctx, args) => {
    // Validate code size (100KB limit)
    const codeSize = new Blob([args.code]).size;
    if (codeSize > 100 * 1024) {
      throw new Error("Component code exceeds 100KB limit");
    }

    // Validate title is not empty
    if (!args.title.trim()) {
      throw new Error("Component title cannot be empty");
    }

    const now = Date.now();
    const componentId = await ctx.db.insert("generatedComponents", {
      code: args.code,
      title: args.title,
      framework: args.framework,
      description: args.description,
      createdAt: now,
      updatedAt: now,
    });

    return componentId;
  },
});

/**
 * Update an existing component
 */
export const updateComponent = mutation({
  args: {
    componentId: v.id("generatedComponents"),
    code: v.optional(v.string()),
    title: v.optional(v.string()),
    framework: v.optional(v.literal("react")),
    description: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { componentId, ...updates } = args;

    // Validate code size if code is being updated
    if (updates.code) {
      const codeSize = new Blob([updates.code]).size;
      if (codeSize > 100 * 1024) {
        throw new Error("Component code exceeds 100KB limit");
      }
    }

    // Validate title if being updated
    if (updates.title !== undefined && !updates.title.trim()) {
      throw new Error("Component title cannot be empty");
    }

    await ctx.db.patch(componentId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Delete a component
 */
export const deleteComponent = mutation({
  args: { componentId: v.id("generatedComponents") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.componentId);
    return null;
  },
});
