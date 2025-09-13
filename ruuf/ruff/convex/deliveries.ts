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

// Query to get delivery records for a campaign
export const getCampaignDeliveries = query({
  args: { 
    campaignId: v.id("campaigns"),
    status: v.optional(v.union(
      v.literal("queued"),
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("bounced"),
      v.literal("complained"),
      v.literal("failed"),
      v.literal("opened"),
      v.literal("clicked")
    )),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("emailDeliveries"),
      campaignId: v.id("campaigns"),
      recipientId: v.id("recipients"),
      resendEmailId: v.optional(v.string()),
      status: v.union(
        v.literal("queued"),
        v.literal("sent"),
        v.literal("delivered"),
        v.literal("bounced"),
        v.literal("complained"),
        v.literal("failed"),
        v.literal("opened"),
        v.literal("clicked")
      ),
      queuedAt: v.number(),
      sentAt: v.optional(v.number()),
      deliveredAt: v.optional(v.number()),
      bouncedAt: v.optional(v.number()),
      bounceReason: v.optional(v.string()),
      bounceType: v.optional(v.union(v.literal("hard"), v.literal("soft"))),
      failureReason: v.optional(v.string()),
      retryCount: v.number(),
      recipientEmail: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    // Verify campaign ownership
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || campaign.createdBy !== user._id) {
      throw new Error("Campaign not found or access denied");
    }
    
    let deliveries = await ctx.db
      .query("emailDeliveries")
      .withIndex("by_campaign", (q: any) => q.eq("campaignId", args.campaignId))
      .collect();
    
    // Filter by status if specified
    if (args.status) {
      deliveries = deliveries.filter(d => d.status === args.status);
    }
    
    // Sort by most recent first
    deliveries.sort((a, b) => b.queuedAt - a.queuedAt);
    
    // Apply limit
    if (args.limit) {
      deliveries = deliveries.slice(0, args.limit);
    }
    
    // Enrich with recipient email
    const enrichedDeliveries = await Promise.all(
      deliveries.map(async (delivery) => {
        const recipient = await ctx.db.get(delivery.recipientId);
        return {
          ...delivery,
          recipientEmail: recipient?.email || "Unknown",
        };
      })
    );
    
    return enrichedDeliveries;
  },
});

// Query to get bounced emails for analysis
export const getBouncedEmails = query({
  args: { campaignId: v.id("campaigns") },
  returns: v.array(
    v.object({
      _id: v.id("emailDeliveries"),
      recipientEmail: v.string(),
      bounceReason: v.optional(v.string()),
      bounceType: v.optional(v.union(v.literal("hard"), v.literal("soft"))),
      bouncedAt: v.optional(v.number()),
      retryCount: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    // Verify campaign ownership
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || campaign.createdBy !== user._id) {
      throw new Error("Campaign not found or access denied");
    }
    
    const bounces = await ctx.db
      .query("emailDeliveries")
      .withIndex("by_campaign", (q: any) => q.eq("campaignId", args.campaignId))
      .filter((q: any) => q.eq(q.field("status"), "bounced"))
      .collect();
    
    // Enrich with recipient email
    const enrichedBounces = await Promise.all(
      bounces.map(async (bounce) => {
        const recipient = await ctx.db.get(bounce.recipientId);
        return {
          _id: bounce._id,
          recipientEmail: recipient?.email || "Unknown",
          bounceReason: bounce.bounceReason,
          bounceType: bounce.bounceType,
          bouncedAt: bounce.bouncedAt,
          retryCount: bounce.retryCount,
        };
      })
    );
    
    return enrichedBounces;
  },
});

// Internal mutation to record email sent
export const recordEmailSent = internalMutation({
  args: {
    campaignId: v.id("campaigns"),
    recipientId: v.id("recipients"),
    resendEmailId: v.string(),
    sentAt: v.number(),
  },
  returns: v.id("emailDeliveries"),
  handler: async (ctx, args) => {
    const delivery = {
      campaignId: args.campaignId,
      recipientId: args.recipientId,
      resendEmailId: args.resendEmailId,
      status: "sent" as const,
      queuedAt: Date.now(),
      sentAt: args.sentAt,
      deliveredAt: undefined,
      bouncedAt: undefined,
      bounceReason: undefined,
      bounceType: undefined,
      complaintAt: undefined,
      failedAt: undefined,
      failureReason: undefined,
      openedAt: undefined,
      clickedAt: undefined,
      retryCount: 0,
      lastRetryAt: undefined,
    };
    
    return await ctx.db.insert("emailDeliveries", delivery);
  },
});

// Internal mutation to record email queued
export const recordEmailQueued = internalMutation({
  args: {
    campaignId: v.id("campaigns"),
    recipientId: v.id("recipients"),
  },
  returns: v.id("emailDeliveries"),
  handler: async (ctx, args) => {
    const delivery = {
      campaignId: args.campaignId,
      recipientId: args.recipientId,
      resendEmailId: undefined,
      status: "queued" as const,
      queuedAt: Date.now(),
      sentAt: undefined,
      deliveredAt: undefined,
      bouncedAt: undefined,
      bounceReason: undefined,
      bounceType: undefined,
      complaintAt: undefined,
      failedAt: undefined,
      failureReason: undefined,
      openedAt: undefined,
      clickedAt: undefined,
      retryCount: 0,
      lastRetryAt: undefined,
    };
    
    return await ctx.db.insert("emailDeliveries", delivery);
  },
});

// Internal mutation to record email failed
export const recordEmailFailed = internalMutation({
  args: {
    campaignId: v.id("campaigns"),
    recipientId: v.id("recipients"),
    failureReason: v.string(),
    failedAt: v.number(),
  },
  returns: v.id("emailDeliveries"),
  handler: async (ctx, args) => {
    const delivery = {
      campaignId: args.campaignId,
      recipientId: args.recipientId,
      resendEmailId: undefined,
      status: "failed" as const,
      queuedAt: Date.now(),
      sentAt: undefined,
      deliveredAt: undefined,
      bouncedAt: undefined,
      bounceReason: undefined,
      bounceType: undefined,
      complaintAt: undefined,
      failedAt: args.failedAt,
      failureReason: args.failureReason,
      openedAt: undefined,
      clickedAt: undefined,
      retryCount: 0,
      lastRetryAt: undefined,
    };
    
    return await ctx.db.insert("emailDeliveries", delivery);
  },
});

// Internal mutation to update delivery status (used by webhooks)
export const updateDeliveryStatus = internalMutation({
  args: {
    resendEmailId: v.string(),
    status: v.union(
      v.literal("delivered"),
      v.literal("bounced"),
      v.literal("complained"),
      v.literal("opened"),
      v.literal("clicked")
    ),
    timestamp: v.number(),
    bounceReason: v.optional(v.string()),
    bounceType: v.optional(v.union(v.literal("hard"), v.literal("soft"))),
  },
  returns: v.union(v.id("emailDeliveries"), v.null()),
  handler: async (ctx, args) => {
    const delivery = await ctx.db
      .query("emailDeliveries")
      .withIndex("by_resend_id", (q: any) => q.eq("resendEmailId", args.resendEmailId))
      .first();
    
    if (!delivery) {
      return null;
    }
    
    const updates: Partial<{
      status: "delivered" | "bounced" | "complained" | "opened" | "clicked";
      deliveredAt: number;
      bouncedAt: number;
      bounceReason: string;
      bounceType: "hard" | "soft";
      complaintAt: number;
      openedAt: number;
      clickedAt: number;
    }> = { status: args.status };
    
    switch (args.status) {
      case "delivered":
        updates.deliveredAt = args.timestamp;
        break;
      case "bounced":
        updates.bouncedAt = args.timestamp;
        updates.bounceReason = args.bounceReason;
        updates.bounceType = args.bounceType;
        break;
      case "complained":
        updates.complaintAt = args.timestamp;
        break;
      case "opened":
        updates.openedAt = args.timestamp;
        break;
      case "clicked":
        updates.clickedAt = args.timestamp;
        break;
    }
    
    await ctx.db.patch(delivery._id, updates);
    
    // Update campaign statistics
    const campaign = await ctx.db.get(delivery.campaignId);
    if (campaign) {
      const campaignUpdates: Partial<{
        deliveredCount: number;
        bouncedCount: number;
        spamCount: number;
        openedCount: number;
        clickedCount: number;
      }> = {};
      
      switch (args.status) {
        case "delivered":
          campaignUpdates.deliveredCount = campaign.deliveredCount + 1;
          break;
        case "bounced":
          campaignUpdates.bouncedCount = campaign.bouncedCount + 1;
          break;
        case "complained":
          campaignUpdates.spamCount = campaign.spamCount + 1;
          break;
        case "opened":
          campaignUpdates.openedCount = (campaign.openedCount || 0) + 1;
          break;
        case "clicked":
          campaignUpdates.clickedCount = (campaign.clickedCount || 0) + 1;
          break;
      }
      
      await ctx.db.patch(delivery.campaignId, campaignUpdates);
    }
    
    // Handle bounce recipient status updates
    if (args.status === "bounced" && args.bounceType === "hard") {
      const recipient = await ctx.db.get(delivery.recipientId);
      if (recipient) {
        await ctx.db.patch(delivery.recipientId, {
          status: "bounced",
          bounceCount: recipient.bounceCount + 1,
          lastBounceAt: args.timestamp,
          lastBounceReason: args.bounceReason,
        });
      }
    }
    
    return delivery._id;
  },
});

// Query to get delivery statistics for dashboard
export const getDeliveryStats = query({
  args: {
    campaignId: v.optional(v.id("campaigns")),
    dateFrom: v.optional(v.number()),
    dateTo: v.optional(v.number()),
  },
  returns: v.object({
    totalSent: v.number(),
    totalDelivered: v.number(),
    totalBounced: v.number(),
    totalComplaints: v.number(),
    totalOpened: v.number(),
    totalClicked: v.number(),
    deliveryRate: v.number(),
    bounceRate: v.number(),
    openRate: v.number(),
    clickRate: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    let deliveries;
    
    if (args.campaignId) {
      // Verify campaign ownership
      const campaign = await ctx.db.get(args.campaignId);
      if (!campaign || campaign.createdBy !== user._id) {
        throw new Error("Campaign not found or access denied");
      }
      
      deliveries = await ctx.db
        .query("emailDeliveries")
        .withIndex("by_campaign", (q: any) => q.eq("campaignId", args.campaignId))
        .collect();
    } else {
      // Get all deliveries for user's campaigns
      const userCampaigns = await ctx.db
        .query("campaigns")
        .withIndex("by_user", (q: any) => q.eq("createdBy", user._id))
        .collect();
      
      const campaignIds = userCampaigns.map(c => c._id);
      deliveries = [];
      
      for (const campaignId of campaignIds) {
        const campaignDeliveries = await ctx.db
          .query("emailDeliveries")
          .withIndex("by_campaign", (q: any) => q.eq("campaignId", campaignId))
          .collect();
        deliveries.push(...campaignDeliveries);
      }
    }
    
    // Filter by date range if specified
    if (args.dateFrom || args.dateTo) {
      deliveries = deliveries.filter(d => {
        const timestamp = d.sentAt || d.queuedAt;
        if (args.dateFrom && timestamp < args.dateFrom) return false;
        if (args.dateTo && timestamp > args.dateTo) return false;
        return true;
      });
    }
    
    const stats = {
      totalSent: 0,
      totalDelivered: 0,
      totalBounced: 0,
      totalComplaints: 0,
      totalOpened: 0,
      totalClicked: 0,
    };
    
    deliveries.forEach(delivery => {
      if (delivery.status === "sent" || delivery.status === "delivered") {
        stats.totalSent++;
      }
      if (delivery.status === "delivered") {
        stats.totalDelivered++;
      }
      if (delivery.status === "bounced") {
        stats.totalBounced++;
      }
      if (delivery.status === "complained") {
        stats.totalComplaints++;
      }
      if (delivery.openedAt) {
        stats.totalOpened++;
      }
      if (delivery.clickedAt) {
        stats.totalClicked++;
      }
    });
    
    const deliveryRate = stats.totalSent > 0 ? (stats.totalDelivered / stats.totalSent) * 100 : 0;
    const bounceRate = stats.totalSent > 0 ? (stats.totalBounced / stats.totalSent) * 100 : 0;
    const openRate = stats.totalDelivered > 0 ? (stats.totalOpened / stats.totalDelivered) * 100 : 0;
    const clickRate = stats.totalDelivered > 0 ? (stats.totalClicked / stats.totalDelivered) * 100 : 0;
    
    return {
      ...stats,
      deliveryRate: Math.round(deliveryRate * 100) / 100,
      bounceRate: Math.round(bounceRate * 100) / 100,
      openRate: Math.round(openRate * 100) / 100,
      clickRate: Math.round(clickRate * 100) / 100,
    };
  },
});