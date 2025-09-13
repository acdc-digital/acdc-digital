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

// Query to list campaigns for the current user
export const listCampaigns = query({
  args: { 
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("sending"),
      v.literal("completed"),
      v.literal("paused"),
      v.literal("failed")
    )),
    limit: v.optional(v.number())
  },
  returns: v.array(
    v.object({
      _id: v.id("campaigns"),
      name: v.string(),
      description: v.optional(v.string()),
      status: v.union(
        v.literal("draft"),
        v.literal("scheduled"),
        v.literal("sending"),
        v.literal("completed"),
        v.literal("paused"),
        v.literal("failed")
      ),
      subject: v.string(),
      fromAddress: v.string(),
      fromName: v.optional(v.string()),
      recipientListId: v.id("recipientLists"),
      createdAt: v.number(),
      scheduledAt: v.optional(v.number()),
      completedAt: v.optional(v.number()),
      totalRecipients: v.number(),
      sentCount: v.number(),
      deliveredCount: v.number(),
      bouncedCount: v.number(),
      spamCount: v.number(),
      failedCount: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    const query = ctx.db
      .query("campaigns")
      .withIndex("by_user", (q) => q.eq("createdBy", user._id));
    
    if (args.status) {
      // Filter by status - we'll need to collect all and filter manually
      // since Convex doesn't support compound indexes for this case
      const allCampaigns = await query.collect();
      const filteredCampaigns = allCampaigns.filter(c => c.status === args.status);
      return filteredCampaigns
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, args.limit || 50);
    }
    
    return await query
      .order("desc")
      .take(args.limit || 50);
  },
});

// Query to get a specific campaign
export const getCampaign = query({
  args: { campaignId: v.id("campaigns") },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("campaigns"),
      name: v.string(),
      description: v.optional(v.string()),
      status: v.union(
        v.literal("draft"),
        v.literal("scheduled"),
        v.literal("sending"),
        v.literal("completed"),
        v.literal("paused"),
        v.literal("failed")
      ),
      fromAddress: v.string(),
      fromName: v.optional(v.string()),
      replyToAddress: v.optional(v.string()),
      subject: v.string(),
      htmlContent: v.string(),
      plainTextContent: v.optional(v.string()),
      recipientListId: v.id("recipientLists"),
      createdBy: v.id("users"),
      createdAt: v.number(),
      scheduledAt: v.optional(v.number()),
      startedAt: v.optional(v.number()),
      completedAt: v.optional(v.number()),
      totalRecipients: v.number(),
      sentCount: v.number(),
      deliveredCount: v.number(),
      bouncedCount: v.number(),
      spamCount: v.number(),
      failedCount: v.number(),
      openedCount: v.optional(v.number()),
      clickedCount: v.optional(v.number()),
      customHeaders: v.optional(
        v.array(
          v.object({
            name: v.string(),
            value: v.string(),
          })
        )
      ),
    })
  ),
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) {
      return null;
    }
    
    // Check if user owns this campaign
    if (campaign.createdBy !== user._id) {
      throw new Error("Access denied");
    }
    
    return campaign;
  },
});

// Mutation to create a new campaign
export const createCampaign = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    fromAddress: v.string(),
    fromName: v.optional(v.string()),
    replyToAddress: v.optional(v.string()),
    subject: v.string(),
    htmlContent: v.string(),
    plainTextContent: v.optional(v.string()),
    recipientListId: v.id("recipientLists"),
    scheduledAt: v.optional(v.number()),
    customHeaders: v.optional(
      v.array(
        v.object({
          name: v.string(),
          value: v.string(),
        })
      )
    ),
  },
  returns: v.id("campaigns"),
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    // Verify the recipient list exists and user owns it
    const recipientList = await ctx.db.get(args.recipientListId);
    if (!recipientList || recipientList.createdBy !== user._id) {
      throw new Error("Invalid recipient list");
    }
    
    const campaign = {
      name: args.name,
      description: args.description,
      status: "draft" as const,
      fromAddress: args.fromAddress,
      fromName: args.fromName,
      replyToAddress: args.replyToAddress,
      subject: args.subject,
      htmlContent: args.htmlContent,
      plainTextContent: args.plainTextContent,
      recipientListId: args.recipientListId,
      createdBy: user._id,
      createdAt: Date.now(),
      scheduledAt: args.scheduledAt,
      startedAt: undefined,
      completedAt: undefined,
      totalRecipients: recipientList.activeRecipients,
      sentCount: 0,
      deliveredCount: 0,
      bouncedCount: 0,
      spamCount: 0,
      failedCount: 0,
      openedCount: 0,
      clickedCount: 0,
      customHeaders: args.customHeaders,
    };
    
    return await ctx.db.insert("campaigns", campaign);
  },
});

// Mutation to update campaign
export const updateCampaign = mutation({
  args: {
    campaignId: v.id("campaigns"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    fromAddress: v.optional(v.string()),
    fromName: v.optional(v.string()),
    replyToAddress: v.optional(v.string()),
    subject: v.optional(v.string()),
    htmlContent: v.optional(v.string()),
    plainTextContent: v.optional(v.string()),
    scheduledAt: v.optional(v.number()),
    customHeaders: v.optional(
      v.array(
        v.object({
          name: v.string(),
          value: v.string(),
        })
      )
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || campaign.createdBy !== user._id) {
      throw new Error("Campaign not found or access denied");
    }
    
    // Only allow editing if campaign is in draft status
    if (campaign.status !== "draft") {
      throw new Error("Cannot edit campaign that is not in draft status");
    }
    
    const updates: Partial<{
      name: string;
      description: string;
      fromAddress: string;
      fromName: string;
      replyToAddress: string;
      subject: string;
      htmlContent: string;
      plainTextContent: string;
      scheduledAt: number;
      customHeaders: Array<{ name: string; value: string }>;
    }> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.fromAddress !== undefined) updates.fromAddress = args.fromAddress;
    if (args.fromName !== undefined) updates.fromName = args.fromName;
    if (args.replyToAddress !== undefined) updates.replyToAddress = args.replyToAddress;
    if (args.subject !== undefined) updates.subject = args.subject;
    if (args.htmlContent !== undefined) updates.htmlContent = args.htmlContent;
    if (args.plainTextContent !== undefined) updates.plainTextContent = args.plainTextContent;
    if (args.scheduledAt !== undefined) updates.scheduledAt = args.scheduledAt;
    if (args.customHeaders !== undefined) updates.customHeaders = args.customHeaders;
    
    await ctx.db.patch(args.campaignId, updates);
  },
});

// Mutation to update campaign status
export const updateCampaignStatus = mutation({
  args: {
    campaignId: v.id("campaigns"),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("sending"),
      v.literal("completed"),
      v.literal("paused"),
      v.literal("failed")
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || campaign.createdBy !== user._id) {
      throw new Error("Campaign not found or access denied");
    }
    
    const updates: Partial<{
      status: "draft" | "scheduled" | "sending" | "completed" | "paused" | "failed";
      startedAt: number;
      completedAt: number;
    }> = { status: args.status };
    
    // Set timestamps based on status
    if (args.status === "sending" && !campaign.startedAt) {
      updates.startedAt = Date.now();
    } else if (args.status === "completed" && !campaign.completedAt) {
      updates.completedAt = Date.now();
    }
    
    await ctx.db.patch(args.campaignId, updates);
  },
});

// Internal mutation to update campaign statistics
export const updateCampaignStats = internalMutation({
  args: {
    campaignId: v.id("campaigns"),
    sentCount: v.optional(v.number()),
    deliveredCount: v.optional(v.number()),
    bouncedCount: v.optional(v.number()),
    spamCount: v.optional(v.number()),
    failedCount: v.optional(v.number()),
    openedCount: v.optional(v.number()),
    clickedCount: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const updates: Partial<{
      sentCount: number;
      deliveredCount: number;
      bouncedCount: number;
      spamCount: number;
      failedCount: number;
      openedCount: number;
      clickedCount: number;
    }> = {};
    if (args.sentCount !== undefined) updates.sentCount = args.sentCount;
    if (args.deliveredCount !== undefined) updates.deliveredCount = args.deliveredCount;
    if (args.bouncedCount !== undefined) updates.bouncedCount = args.bouncedCount;
    if (args.spamCount !== undefined) updates.spamCount = args.spamCount;
    if (args.failedCount !== undefined) updates.failedCount = args.failedCount;
    if (args.openedCount !== undefined) updates.openedCount = args.openedCount;
    if (args.clickedCount !== undefined) updates.clickedCount = args.clickedCount;
    
    await ctx.db.patch(args.campaignId, updates);
  },
});

// Query to get campaign statistics
export const getCampaignStats = query({
  args: { campaignId: v.id("campaigns") },
  returns: v.union(
    v.null(),
    v.object({
      totalRecipients: v.number(),
      sentCount: v.number(),
      deliveredCount: v.number(),
      bouncedCount: v.number(),
      spamCount: v.number(),
      failedCount: v.number(),
      openedCount: v.optional(v.number()),
      clickedCount: v.optional(v.number()),
      deliveryRate: v.number(),
      bounceRate: v.number(),
      spamRate: v.number(),
      progressPercentage: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || campaign.createdBy !== user._id) {
      return null;
    }
    
    const deliveryRate = campaign.totalRecipients > 0 
      ? (campaign.deliveredCount / campaign.totalRecipients) * 100 
      : 0;
    const bounceRate = campaign.totalRecipients > 0 
      ? (campaign.bouncedCount / campaign.totalRecipients) * 100 
      : 0;
    const spamRate = campaign.totalRecipients > 0 
      ? (campaign.spamCount / campaign.totalRecipients) * 100 
      : 0;
    const progressPercentage = campaign.totalRecipients > 0 
      ? (campaign.sentCount / campaign.totalRecipients) * 100 
      : 0;
    
    return {
      totalRecipients: campaign.totalRecipients,
      sentCount: campaign.sentCount,
      deliveredCount: campaign.deliveredCount,
      bouncedCount: campaign.bouncedCount,
      spamCount: campaign.spamCount,
      failedCount: campaign.failedCount,
      openedCount: campaign.openedCount,
      clickedCount: campaign.clickedCount,
      deliveryRate,
      bounceRate,
      spamRate,
      progressPercentage,
    };
  },
});

// Mutation to delete campaign
export const deleteCampaign = mutation({
  args: { campaignId: v.id("campaigns") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || campaign.createdBy !== user._id) {
      throw new Error("Campaign not found or access denied");
    }
    
    // Only allow deletion if campaign is in draft or completed status
    if (campaign.status !== "draft" && campaign.status !== "completed" && campaign.status !== "failed") {
      throw new Error("Cannot delete campaign that is currently sending");
    }
    
    await ctx.db.delete(args.campaignId);
  },
});