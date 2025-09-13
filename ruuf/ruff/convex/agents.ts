import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Simplified AI agent system for email marketing assistance
// This provides intelligent monitoring and optimization tools

// Agent conversation message interface
export interface AgentMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

// Create a new agent thread for email marketing assistance
export const createAgentThread = mutation({
  args: {
    campaignId: v.optional(v.id("campaigns")),
    userId: v.id("users"),
    purpose: v.union(
      v.literal("monitoring"),
      v.literal("troubleshooting"), 
      v.literal("optimization"),
      v.literal("general")
    ),
    title: v.string(),
    initialMessage: v.optional(v.string()),
  },
  returns: v.object({
    threadId: v.string(),
    agentThreadId: v.id("agentThreads"),
  }),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Generate a unique thread ID
    const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create initial messages array
    const initialMessages: AgentMessage[] = [];
    
    if (args.initialMessage) {
      // Add user message
      initialMessages.push({
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: "user",
        content: args.initialMessage,
        timestamp: now,
      });
      
      // Add assistant welcome response
      initialMessages.push({
        id: `msg_${Date.now() + 1}_${Math.random().toString(36).substr(2, 9)}`,
        role: "assistant", 
        content: "Hello! I'm your email marketing AI assistant. I can help you analyze campaign performance, optimize deliverability, and troubleshoot any issues. What would you like to work on today?",
        timestamp: now + 1,
      });
    }

    // Store thread information in database
    const agentThreadId = await ctx.db.insert("agentThreads", {
      campaignId: args.campaignId,
      userId: args.userId,
      threadId,
      purpose: args.purpose,
      title: args.title,
      createdAt: now,
      lastActivityAt: now,
      isActive: true,
      metadata: { messages: initialMessages },
    });

    return { threadId, agentThreadId };
  },
});

// Send a message to an agent thread
export const sendMessageToAgent = mutation({
  args: {
    threadId: v.string(),
    content: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    response: v.string(),
  }),
  handler: async (ctx, args) => {
    // Find the thread
    const thread = await ctx.db
      .query("agentThreads")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .unique();

    if (!thread) {
      throw new Error("Thread not found");
    }

    const now = Date.now();
    const messages = (thread.metadata?.messages as AgentMessage[]) || [];

    // Add user message
    const userMessage: AgentMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: "user",
      content: args.content,
      timestamp: now,
    };
    messages.push(userMessage);

    // Generate simple AI response based on content
    const response = generateSimpleResponse(args.content.toLowerCase(), thread.campaignId);

    // Add assistant response
    const assistantMessage: AgentMessage = {
      id: `msg_${Date.now() + 1}_${Math.random().toString(36).substr(2, 9)}`,
      role: "assistant",
      content: response,
      timestamp: now + 1,
    };
    messages.push(assistantMessage);

    // Update thread with new messages
    await ctx.db.patch(thread._id, {
      metadata: { ...thread.metadata, messages },
      lastActivityAt: now,
    });

    return { success: true, response };
  },
});

// Simple response generator function
function generateSimpleResponse(userMessage: string, campaignId?: string): string {
  // Campaign performance analysis
  if (userMessage.includes("performance") || userMessage.includes("analyze") || userMessage.includes("metrics")) {
    if (campaignId) {
      return `I'll analyze your campaign performance. Based on industry benchmarks, here's what to look for:

📊 **Key Metrics to Monitor:**
- Delivery Rate: Should be >95%
- Bounce Rate: Should be <5%
- Open Rate: Industry average is 15-25%
- Click Rate: Industry average is 2-5%

💡 **Quick Tips:**
• High bounce rates indicate list quality issues
• Low open rates suggest subject line optimization needed
• Low click rates mean content/CTA improvements required

Would you like me to dive deeper into any specific metric?`;
    } else {
      return "To analyze campaign performance, please specify a campaign context. I can help you understand key metrics like delivery rates, bounce rates, open rates, and click-through rates.";
    }
  }

  // List health analysis
  if (userMessage.includes("list") && (userMessage.includes("health") || userMessage.includes("quality"))) {
    return `📋 **List Health Analysis Available:**

I can help you evaluate:
• **Bounce Rates** - Invalid/outdated emails
• **Engagement Patterns** - Active vs inactive subscribers  
• **Unsubscribe Trends** - Content quality indicators
• **Overall Health Score** - List quality rating

🔧 **Common Issues I Can Identify:**
• High bounce rates (>5%) - Need list cleaning
• Low engagement - Segmentation opportunities
• Spam complaints - Content/frequency adjustments needed

Which list would you like me to analyze?`;
  }

  // Deliverability troubleshooting
  if (userMessage.includes("deliverability") || userMessage.includes("bouncing") || userMessage.includes("spam")) {
    return `🚨 **Deliverability Troubleshooting Guide:**

**Authentication Setup:**
✓ SPF record configured
✓ DKIM signing enabled  
✓ DMARC policy set

**Content Best Practices:**
✓ Avoid spam trigger words
✓ Maintain good text-to-image ratio
✓ Include clear unsubscribe link
✓ Use reputable sending domain

**List Hygiene:**
✓ Remove bounced emails promptly
✓ Segment inactive subscribers
✓ Monitor engagement rates

What specific deliverability issue are you experiencing?`;
  }

  // Send time optimization
  if (userMessage.includes("send time") || userMessage.includes("timing") || userMessage.includes("schedule")) {
    return `⏰ **Send Time Optimization Tips:**

**Best Practice Windows:**
• **Tuesday-Thursday:** 10 AM - 2 PM (highest engagement)
• **Avoid:** Monday mornings, Friday afternoons
• **Mobile Users:** Often check email 6-10 AM, 7-10 PM

**Testing Strategy:**
1. A/B test different send times
2. Monitor open rates by hour/day
3. Consider your audience's time zone
4. Account for industry-specific patterns

**Pro Tip:** Start with industry benchmarks, then optimize based on your audience's actual behavior patterns.

Want me to help you plan a send time test?`;
  }

  // General optimization
  if (userMessage.includes("optimize") || userMessage.includes("improve")) {
    return `🚀 **Email Marketing Optimization Guide:**

**Subject Line Optimization:**
• Keep under 50 characters
• Create urgency without spam words
• Personalize when possible
• A/B test different approaches

**Content Optimization:**
• Mobile-first responsive design
• Clear, prominent call-to-action
• Scannable format with headers
• Balance text and images (80/20 rule)

**Audience Optimization:**
• Segment by engagement level
• Personalize based on behavior
• Clean inactive subscribers regularly
• Test send frequency preferences

What specific area would you like to focus on optimizing?`;
  }

  // Default helpful response
  return `I'm your email marketing AI assistant! 🤖✨

**I can help you with:**

📊 **Performance Analysis** - Campaign metrics & insights
🎯 **Optimization** - Improve open rates & deliverability  
🔧 **Troubleshooting** - Fix delivery & engagement issues
📋 **List Management** - Health monitoring & segmentation
⏰ **Timing** - Optimal send times & frequency

**Just ask me to:**
• "Analyze campaign performance"
• "Check list health"  
• "Troubleshoot deliverability"
• "Optimize send times"
• "Improve open rates"

What would you like to work on today?`;
}

// Get messages from an agent thread
export const getThreadMessages = query({
  args: {
    threadId: v.string(),
  },
  returns: v.array(v.object({
    id: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    timestamp: v.number(),
  })),
  handler: async (ctx, args) => {
    const thread = await ctx.db
      .query("agentThreads")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .unique();

    if (!thread) {
      return [];
    }

    const messages = (thread.metadata?.messages as AgentMessage[]) || [];
    return messages.sort((a, b) => a.timestamp - b.timestamp);
  },
});

// List all agent threads for a user
export const listUserThreads = query({
  args: {
    userId: v.id("users"),
    campaignId: v.optional(v.id("campaigns")),
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("agentThreads")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    if (args.campaignId) {
      const threads = await query.collect();
      return threads.filter((thread) => thread.campaignId === args.campaignId);
    }

    return await query
      .order("desc")
      .collect();
  },
});

// Get thread details
export const getThreadDetails = query({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agentThreads")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .unique();
  },
});

// Campaign performance analysis tool
export const analyzeCampaignPerformance = query({
  args: {
    campaignId: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    const deliveries = await ctx.db
      .query("emailDeliveries")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    const totalSent = deliveries.length;
    const delivered = deliveries.filter((d) => d.status === "delivered").length;
    const bounced = deliveries.filter((d) => d.status === "bounced").length;
    const opened = deliveries.filter((d) => d.openedAt).length;
    const clicked = deliveries.filter((d) => d.clickedAt).length;

    const deliveryRate = totalSent > 0 ? (delivered / totalSent) * 100 : 0;
    const bounceRate = totalSent > 0 ? (bounced / totalSent) * 100 : 0;
    const openRate = delivered > 0 ? (opened / delivered) * 100 : 0;
    const clickRate = delivered > 0 ? (clicked / delivered) * 100 : 0;

    const alerts = await ctx.db
      .query("systemAlerts")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .order("desc")
      .take(5);

    return {
      campaign: {
        name: campaign.name,
        status: campaign.status,
        createdAt: campaign.createdAt,
        startedAt: campaign.startedAt,
        completedAt: campaign.completedAt,
      },
      metrics: {
        totalSent,
        delivered,
        bounced,
        opened,
        clicked,
        deliveryRate: Math.round(deliveryRate * 100) / 100,
        bounceRate: Math.round(bounceRate * 100) / 100,
        openRate: Math.round(openRate * 100) / 100,
        clickRate: Math.round(clickRate * 100) / 100,
      },
      alerts: alerts.map((alert) => ({
        type: alert.alertType,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        createdAt: alert.createdAt,
      })),
    };
  },
});

// Recipient list health analysis
export const analyzeListHealth = query({
  args: {
    listId: v.id("recipientLists"),
  },
  handler: async (ctx, args) => {
    const list = await ctx.db.get(args.listId);
    if (!list) {
      throw new Error("Recipient list not found");
    }

    const recipients = await ctx.db
      .query("recipients")
      .withIndex("by_list", (q) => q.eq("listId", args.listId))
      .collect();

    const total = recipients.length;
    const active = recipients.filter((r) => r.status === "active").length;
    const bounced = recipients.filter((r) => r.status === "bounced").length;
    const unsubscribed = recipients.filter((r) => r.status === "unsubscribed").length;
    const invalid = recipients.filter((r) => r.status === "invalid").length;

    const healthScore = total > 0 ? (active / total) * 100 : 0;
    const bounceRate = total > 0 ? (bounced / total) * 100 : 0;
    const unsubscribeRate = total > 0 ? (unsubscribed / total) * 100 : 0;

    const issues = [];
    if (bounceRate > 5) {
      issues.push({
        type: "high_bounce_rate",
        severity: "warning",
        message: `High bounce rate (${bounceRate.toFixed(1)}%). Consider list cleaning.`,
      });
    }
    if (unsubscribeRate > 10) {
      issues.push({
        type: "high_unsubscribe_rate", 
        severity: "warning",
        message: `High unsubscribe rate (${unsubscribeRate.toFixed(1)}%). Review content quality.`,
      });
    }
    if (healthScore < 70) {
      issues.push({
        type: "low_health_score",
        severity: "error", 
        message: `Low health score (${healthScore.toFixed(1)}%). List needs attention.`,
      });
    }

    return {
      list: {
        name: list.name,
        totalRecipients: list.totalRecipients,
        createdAt: list.createdAt,
      },
      metrics: {
        total,
        active,
        bounced,
        unsubscribed,
        invalid,
        healthScore: Math.round(healthScore * 100) / 100,
        bounceRate: Math.round(bounceRate * 100) / 100,
        unsubscribeRate: Math.round(unsubscribeRate * 100) / 100,
      },
      issues,
    };
  },
});