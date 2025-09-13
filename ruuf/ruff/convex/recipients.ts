import { v } from "convex/values";
import { query, mutation, internalMutation, QueryCtx, MutationCtx } from "./_generated/server";

// Validation helper
async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }
  
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique();
    
  if (!user) {
    throw new Error("User not found");
  }
  
  return user;
}

// Query to list recipient lists for the current user
export const listRecipientLists = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(
    v.object({
      _id: v.id("recipientLists"),
      name: v.string(),
      description: v.optional(v.string()),
      createdAt: v.number(),
      totalRecipients: v.number(),
      activeRecipients: v.number(),
      tags: v.optional(v.array(v.string())),
    })
  ),
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    return await ctx.db
      .query("recipientLists")
      .withIndex("by_user", (q: any) => q.eq("createdBy", user._id))
      .order("desc")
      .take(args.limit || 50);
  },
});

// Query to get a specific recipient list
export const getRecipientList = query({
  args: { listId: v.id("recipientLists") },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("recipientLists"),
      name: v.string(),
      description: v.optional(v.string()),
      createdBy: v.id("users"),
      createdAt: v.number(),
      totalRecipients: v.number(),
      activeRecipients: v.number(),
      tags: v.optional(v.array(v.string())),
    })
  ),
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    const list = await ctx.db.get(args.listId);
    if (!list) {
      return null;
    }
    
    // Check if user owns this list
    if (list.createdBy !== user._id) {
      throw new Error("Access denied");
    }
    
    return list;
  },
});

// Mutation to create a new recipient list
export const createRecipientList = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.id("recipientLists"),
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    const list = {
      name: args.name,
      description: args.description,
      createdBy: user._id,
      createdAt: Date.now(),
      totalRecipients: 0,
      activeRecipients: 0,
      tags: args.tags,
    };
    
    return await ctx.db.insert("recipientLists", list);
  },
});

// Mutation to update recipient list
export const updateRecipientList = mutation({
  args: {
    listId: v.id("recipientLists"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    const list = await ctx.db.get(args.listId);
    if (!list || list.createdBy !== user._id) {
      throw new Error("List not found or access denied");
    }
    
    const updates: Partial<{
      name: string;
      description: string;
      tags: string[];
    }> = {};
    
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.tags !== undefined) updates.tags = args.tags;
    
    await ctx.db.patch(args.listId, updates);
  },
});

// Internal mutation to update recipient list counts
export const updateListCounts = internalMutation({
  args: {
    listId: v.id("recipientLists"),
    totalRecipients: v.optional(v.number()),
    activeRecipients: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const updates: Partial<{
      totalRecipients: number;
      activeRecipients: number;
    }> = {};
    
    if (args.totalRecipients !== undefined) updates.totalRecipients = args.totalRecipients;
    if (args.activeRecipients !== undefined) updates.activeRecipients = args.activeRecipients;
    
    await ctx.db.patch(args.listId, updates);
  },
});

// Query to get recipients in a list
export const getRecipients = query({
  args: { 
    listId: v.id("recipientLists"),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("unsubscribed"),
      v.literal("bounced"),
      v.literal("invalid")
    )),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  returns: v.object({
    recipients: v.array(
      v.object({
        _id: v.id("recipients"),
        email: v.string(),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        status: v.union(
          v.literal("active"),
          v.literal("unsubscribed"),
          v.literal("bounced"),
          v.literal("invalid")
        ),
        addedAt: v.number(),
        lastEmailSent: v.optional(v.number()),
        bounceCount: v.number(),
        customFields: v.optional(v.record(v.string(), v.any())),
      })
    ),
    totalCount: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    // Verify list ownership
    const list = await ctx.db.get(args.listId);
    if (!list || list.createdBy !== user._id) {
      throw new Error("List not found or access denied");
    }
    
    // Get recipients
    const allRecipients = await ctx.db
      .query("recipients")
      .withIndex("by_list", (q: any) => q.eq("listId", args.listId))
      .collect();
    
    // Filter by status if specified
    let filteredRecipients = allRecipients;
    if (args.status) {
      filteredRecipients = allRecipients.filter(r => r.status === args.status);
    }
    
    // Sort by most recent first
    filteredRecipients.sort((a, b) => b.addedAt - a.addedAt);
    
    // Apply pagination
    const offset = args.offset || 0;
    const limit = args.limit || 50;
    const paginatedRecipients = filteredRecipients.slice(offset, offset + limit);
    
    return {
      recipients: paginatedRecipients,
      totalCount: filteredRecipients.length,
    };
  },
});

// Mutation to add a single recipient
export const addRecipient = mutation({
  args: {
    listId: v.id("recipientLists"),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    customFields: v.optional(v.record(v.string(), v.any())),
  },
  returns: v.id("recipients"),
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    // Verify list ownership
    const list = await ctx.db.get(args.listId);
    if (!list || list.createdBy !== user._id) {
      throw new Error("List not found or access denied");
    }
    
    // Check if email already exists in this list
    const existingRecipient = await ctx.db
      .query("recipients")
      .withIndex("by_list", (q: any) => q.eq("listId", args.listId))
      .filter((q: any) => q.eq(q.field("email"), args.email))
      .first();
    
    if (existingRecipient) {
      throw new Error("Email already exists in this list");
    }
    
    const recipient = {
      email: args.email.toLowerCase().trim(),
      firstName: args.firstName,
      lastName: args.lastName,
      listId: args.listId,
      status: "active" as const,
      addedAt: Date.now(),
      lastEmailSent: undefined,
      bounceCount: 0,
      unsubscribedAt: undefined,
      unsubscribeReason: undefined,
      lastBounceAt: undefined,
      lastBounceReason: undefined,
      customFields: args.customFields,
    };
    
    const recipientId = await ctx.db.insert("recipients", recipient);
    
    // Update list counts
    await ctx.db.patch(args.listId, {
      totalRecipients: list.totalRecipients + 1,
      activeRecipients: list.activeRecipients + 1,
    });
    
    return recipientId;
  },
});

// Mutation to bulk add recipients
export const bulkAddRecipients = mutation({
  args: {
    listId: v.id("recipientLists"),
    recipients: v.array(
      v.object({
        email: v.string(),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        customFields: v.optional(v.record(v.string(), v.any())),
      })
    ),
    skipDuplicates: v.optional(v.boolean()),
  },
  returns: v.object({
    added: v.number(),
    skipped: v.number(),
    errors: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    // Verify list ownership
    const list = await ctx.db.get(args.listId);
    if (!list || list.createdBy !== user._id) {
      throw new Error("List not found or access denied");
    }
    
    let added = 0;
    let skipped = 0;
    const errors: string[] = [];
    
    for (const recipientData of args.recipients) {
      try {
        const email = recipientData.email.toLowerCase().trim();
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          errors.push(`Invalid email format: ${email}`);
          continue;
        }
        
        // Check if email already exists in this list
        const existingRecipient = await ctx.db
          .query("recipients")
          .withIndex("by_list", (q: any) => q.eq("listId", args.listId))
          .filter((q: any) => q.eq(q.field("email"), email))
          .first();
        
        if (existingRecipient) {
          if (args.skipDuplicates) {
            skipped++;
            continue;
          } else {
            errors.push(`Duplicate email: ${email}`);
            continue;
          }
        }
        
        const recipient = {
          email,
          firstName: recipientData.firstName,
          lastName: recipientData.lastName,
          listId: args.listId,
          status: "active" as const,
          addedAt: Date.now(),
          lastEmailSent: undefined,
          bounceCount: 0,
          unsubscribedAt: undefined,
          unsubscribeReason: undefined,
          lastBounceAt: undefined,
          lastBounceReason: undefined,
          customFields: recipientData.customFields,
        };
        
        await ctx.db.insert("recipients", recipient);
        added++;
      } catch (error) {
        errors.push(`Failed to add ${recipientData.email}: ${error}`);
      }
    }
    
    // Update list counts
    if (added > 0) {
      await ctx.db.patch(args.listId, {
        totalRecipients: list.totalRecipients + added,
        activeRecipients: list.activeRecipients + added,
      });
    }
    
    return { added, skipped, errors };
  },
});

// Mutation to update recipient status
export const updateRecipientStatus = mutation({
  args: {
    recipientId: v.id("recipients"),
    status: v.union(
      v.literal("active"),
      v.literal("unsubscribed"),
      v.literal("bounced"),
      v.literal("invalid")
    ),
    reason: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    const recipient = await ctx.db.get(args.recipientId);
    if (!recipient) {
      throw new Error("Recipient not found");
    }
    
    // Verify list ownership
    const list = await ctx.db.get(recipient.listId);
    if (!list || list.createdBy !== user._id) {
      throw new Error("Access denied");
    }
    
    const updates: Partial<{
      status: "active" | "unsubscribed" | "bounced" | "invalid";
      unsubscribedAt: number;
      unsubscribeReason: string;
    }> = { status: args.status };
    
    if (args.status === "unsubscribed") {
      updates.unsubscribedAt = Date.now();
      if (args.reason) {
        updates.unsubscribeReason = args.reason;
      }
    }
    
    await ctx.db.patch(args.recipientId, updates);
    
    // Update list active count if status changed to/from active
    if (recipient.status === "active" && args.status !== "active") {
      await ctx.db.patch(list._id, {
        activeRecipients: Math.max(0, list.activeRecipients - 1),
      });
    } else if (recipient.status !== "active" && args.status === "active") {
      await ctx.db.patch(list._id, {
        activeRecipients: list.activeRecipients + 1,
      });
    }
  },
});

// Query to get active recipients for a list (used by email sending)
export const getActiveRecipients = query({
  args: { listId: v.id("recipientLists") },
  returns: v.array(
    v.object({
      _id: v.id("recipients"),
      email: v.string(),
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      customFields: v.optional(v.record(v.string(), v.any())),
    })
  ),
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    // Verify list ownership
    const list = await ctx.db.get(args.listId);
    if (!list || list.createdBy !== user._id) {
      throw new Error("List not found or access denied");
    }
    
    return await ctx.db
      .query("recipients")
      .withIndex("by_list", (q: any) => q.eq("listId", args.listId))
      .filter((q: any) => q.eq(q.field("status"), "active"))
      .collect();
  },
});

// Mutation to delete a recipient list
export const deleteRecipientList = mutation({
  args: { listId: v.id("recipientLists") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    const list = await ctx.db.get(args.listId);
    if (!list || list.createdBy !== user._id) {
      throw new Error("List not found or access denied");
    }
    
    // Check if list is used by any campaigns
    const campaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_list", (q: any) => q.eq("recipientListId", args.listId))
      .collect();
    
    if (campaigns.length > 0) {
      throw new Error("Cannot delete list that is used by campaigns");
    }
    
    // Delete all recipients in the list first
    const recipients = await ctx.db
      .query("recipients")
      .withIndex("by_list", (q: any) => q.eq("listId", args.listId))
      .collect();
    
    for (const recipient of recipients) {
      await ctx.db.delete(recipient._id);
    }
    
    // Delete the list
    await ctx.db.delete(args.listId);
  },
});

// Mutation to delete a single recipient
export const deleteRecipient = mutation({
  args: { recipientId: v.id("recipients") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    const recipient = await ctx.db.get(args.recipientId);
    if (!recipient) {
      throw new Error("Recipient not found");
    }
    
    // Verify list ownership
    const list = await ctx.db.get(recipient.listId);
    if (!list || list.createdBy !== user._id) {
      throw new Error("Access denied");
    }
    
    await ctx.db.delete(args.recipientId);
    
    // Update list counts
    await ctx.db.patch(list._id, {
      totalRecipients: Math.max(0, list.totalRecipients - 1),
      activeRecipients: recipient.status === "active" 
        ? Math.max(0, list.activeRecipients - 1) 
        : list.activeRecipients,
    });
  },
});