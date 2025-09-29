import { internalMutation, query } from "../_generated/server";
import { v } from "convex/values";

export const logModelUsage = internalMutation({
  args: {
    model: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    cost: v.number(),
    purpose: v.string(),
    metadata: v.optional(v.any())
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("model_usage_logs", {
      model: args.model,
      inputTokens: args.inputTokens,
      outputTokens: args.outputTokens,
      cost: args.cost,
      purpose: args.purpose,
      metadata: args.metadata,
      timestamp: Date.now()
    });
  }
});

export const getTotalCosts = query({
  args: {
    since: v.optional(v.number())
  },
  returns: v.object({
    total: v.number(),
    byModel: v.array(v.object({
      model: v.string(),
      totalCost: v.number(),
      totalInputTokens: v.number(),
      totalOutputTokens: v.number()
    })),
    byPurpose: v.array(v.object({
      purpose: v.string(),
      totalCost: v.number(),
      count: v.number()
    }))
  }),
  handler: async (ctx, args) => {
    const since = args.since || Date.now() - (30 * 24 * 60 * 60 * 1000); // Default to last 30 days
    
    const logs = await ctx.db
      .query("model_usage_logs")
      .filter((q) => q.gte(q.field("timestamp"), since))
      .collect();
    
    const total = logs.reduce((sum, log) => sum + log.cost, 0);
    
    // Group by model
    const modelMap = new Map();
    logs.forEach(log => {
      const current = modelMap.get(log.model) || { 
        model: log.model, 
        totalCost: 0, 
        totalInputTokens: 0, 
        totalOutputTokens: 0 
      };
      current.totalCost += log.cost;
      current.totalInputTokens += log.inputTokens;
      current.totalOutputTokens += log.outputTokens;
      modelMap.set(log.model, current);
    });
    
    // Group by purpose
    const purposeMap = new Map();
    logs.forEach(log => {
      const current = purposeMap.get(log.purpose) || { 
        purpose: log.purpose, 
        totalCost: 0, 
        count: 0 
      };
      current.totalCost += log.cost;
      current.count += 1;
      purposeMap.set(log.purpose, current);
    });
    
    return {
      total,
      byModel: Array.from(modelMap.values()),
      byPurpose: Array.from(purposeMap.values())
    };
  }
});