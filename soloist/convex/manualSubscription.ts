import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Manually create a subscription for testing (simulates webhook)
 */
export const manuallyCreateSubscription = mutation({
  args: {},
  handler: async (ctx) => {
    // Current user in the database
    const userEmail = "msimon@acdc.digital"; 
    const userId = "mh7es1m1dhwarqsd0chbhf7n4h7t79dc"; // The actual user ID from the database
    const subscriptionId = `manual_sub_${Date.now()}`;
    
    try {
      // Create subscription using the same logic as webhook
      const result = await ctx.runMutation(internal.userSubscriptions.createOrUpdateFromStripe, {
        userIdOrEmail: userId, // Use the user ID directly since we know it
        subscriptionId,
        status: "active",
        currentPeriodEnd: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
      });
      
      console.log("Manually created subscription for current user:", result);
      return { success: true, subscriptionId: result, userId, userEmail };
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw error;
    }
  }
});
