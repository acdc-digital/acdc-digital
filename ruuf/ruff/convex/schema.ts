import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  users: defineTable({
    // Clerk user ID (from ctx.auth.getUserIdentity().subject)
    clerkId: v.string(),
    // User profile information
    email: v.string(),
    name: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    // Timestamps
    lastSeen: v.number(),
  })
    // Index to find users by their Clerk ID
    .index("by_clerk_id", ["clerkId"])
    // Index to find users by email
    .index("by_email", ["email"]),

  // Recipient Lists - Collections of email addresses for campaigns
  recipientLists: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    totalRecipients: v.number(),
    activeRecipients: v.number(),
    tags: v.optional(v.array(v.string())),
  })
    .index("by_user", ["createdBy"])
    .index("by_created", ["createdAt"]),

  // Recipients - Individual email addresses with metadata
  recipients: defineTable({
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    listId: v.id("recipientLists"),
    status: v.union(
      v.literal("active"),
      v.literal("unsubscribed"),
      v.literal("bounced"),
      v.literal("invalid")
    ),
    addedAt: v.number(),
    lastEmailSent: v.optional(v.number()),
    bounceCount: v.number(),
    unsubscribedAt: v.optional(v.number()),
    unsubscribeReason: v.optional(v.string()),
    lastBounceAt: v.optional(v.number()),
    lastBounceReason: v.optional(v.string()),
    customFields: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_list", ["listId"])
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  // Email Campaigns - Individual email sending campaigns
  campaigns: defineTable({
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
    .index("by_user", ["createdBy"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"])
    .index("by_list", ["recipientListId"]),

  // Email Deliveries - Individual email delivery tracking
  emailDeliveries: defineTable({
    campaignId: v.id("campaigns"),
    recipientId: v.id("recipients"),
    resendEmailId: v.optional(v.string()), // ID from Resend service
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
    complaintAt: v.optional(v.number()),
    failedAt: v.optional(v.number()),
    failureReason: v.optional(v.string()),
    openedAt: v.optional(v.number()),
    clickedAt: v.optional(v.number()),
    retryCount: v.number(),
    lastRetryAt: v.optional(v.number()),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_recipient", ["recipientId"])
    .index("by_status", ["status"])
    .index("by_resend_id", ["resendEmailId"]),

  // System Alerts - Notifications and warnings for users
  systemAlerts: defineTable({
    campaignId: v.optional(v.id("campaigns")),
    userId: v.optional(v.id("users")), // Alert target user (null = global)
    alertType: v.union(
      v.literal("high_bounce_rate"),
      v.literal("high_spam_rate"),
      v.literal("rate_limit_hit"),
      v.literal("delivery_failure"),
      v.literal("campaign_completed"),
      v.literal("list_health_issue"),
      v.literal("authentication_issue")
    ),
    severity: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("error"),
      v.literal("critical")
    ),
    title: v.string(),
    message: v.string(),
    actionRequired: v.boolean(),
    suggestedActions: v.optional(v.array(v.string())),
    createdAt: v.number(),
    acknowledgedAt: v.optional(v.number()),
    acknowledgedBy: v.optional(v.id("users")),
    resolvedAt: v.optional(v.number()),
    resolvedBy: v.optional(v.id("users")),
    metadata: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_user", ["userId"])
    .index("by_severity", ["severity"])
    .index("by_created", ["createdAt"])
    .index("by_type", ["alertType"]),

  // Agent Threads - AI conversation contexts for campaigns
  agentThreads: defineTable({
    campaignId: v.optional(v.id("campaigns")),
    userId: v.id("users"),
    threadId: v.string(), // Reference to Agent component thread
    purpose: v.union(
      v.literal("monitoring"),
      v.literal("troubleshooting"),
      v.literal("optimization"),
      v.literal("general")
    ),
    title: v.string(),
    createdAt: v.number(),
    lastActivityAt: v.number(),
    isActive: v.boolean(),
    summary: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_user", ["userId"])
    .index("by_thread_id", ["threadId"])
    .index("by_activity", ["lastActivityAt"]),

  // Performance Metrics - System and campaign performance data
  performanceMetrics: defineTable({
    campaignId: v.optional(v.id("campaigns")),
    metricType: v.string(),
    value: v.number(),
    unit: v.optional(v.string()),
    timestamp: v.number(),
    metadata: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_type", ["metricType"])
    .index("by_timestamp", ["timestamp"]),

  // Unsubscribe Events - Track unsubscribe requests
  unsubscribeEvents: defineTable({
    email: v.string(),
    campaignId: v.optional(v.id("campaigns")),
    recipientId: v.optional(v.id("recipients")),
    reason: v.optional(v.string()),
    timestamp: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_campaign", ["campaignId"])
    .index("by_timestamp", ["timestamp"]),
});
