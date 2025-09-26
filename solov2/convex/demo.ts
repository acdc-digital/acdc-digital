import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedDemoData = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    // First, create or get demo user
    let demoUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", "demo-user-clerk-id"))
      .first();

    if (!demoUser) {
      const userId = await ctx.db.insert("users", {
        name: "Demo User",
        email: "demo@example.com",
        clerkId: "demo-user-clerk-id",
        createdAt: Date.now(),
      });
      demoUser = await ctx.db.get(userId);
    }

    if (!demoUser) {
      throw new Error("Failed to create demo user");
    }

    // Create some sample daily logs for the current year
    const currentYear = new Date().getFullYear();
    const sampleDates = [
      `${currentYear}-01-15`,
      `${currentYear}-02-10`,
      `${currentYear}-03-20`,
      `${currentYear}-04-05`,
      `${currentYear}-05-12`,
      `${currentYear}-06-08`,
      `${currentYear}-07-22`,
      `${currentYear}-08-14`,
      `${currentYear}-09-03`,
    ];

    const sampleScores = [85, 72, 91, 68, 78, 95, 82, 76, 88];

    for (let i = 0; i < sampleDates.length; i++) {
      const existingLog = await ctx.db
        .query("dailyLogs")
        .withIndex("by_userId_and_date", (q) =>
          q.eq("userId", demoUser._id).eq("date", sampleDates[i])
        )
        .unique();

      if (!existingLog) {
        await ctx.db.insert("dailyLogs", {
          userId: demoUser._id,
          date: sampleDates[i],
          score: sampleScores[i],
          notes: `Sample mood entry for ${sampleDates[i]}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }

    return `Demo data seeded for user ${demoUser._id}`;
  },
});