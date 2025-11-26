// convex/testSms.ts
// Quick test functions for SMS functionality
// Usage: Call from Convex dashboard

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Test sending an SMS message
 * Usage from Convex dashboard:
 * 
 * testSendMessage({
 *   to: "+19023406353",
 *   message: "Hello from on-the-go!"
 * })
 */
export const testSendMessage = action({
  args: {
    to: v.string(),
    message: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    console.log(`Sending SMS to ${args.to}: ${args.message}`);
    
    await ctx.runAction(internal.notes.sendSms, {
      to: args.to,
      body: args.message,
    });
    
    console.log("SMS sent successfully!");
  },
});

/**
 * Send a quick test message to yourself
 * Update the phone number before using!
 */
export const sendTestToSelf = action({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const YOUR_PHONE = "+19023406353"; // ⚠️ UPDATE THIS!
    
    await ctx.runAction(internal.notes.sendSms, {
      to: YOUR_PHONE,
      body: "🚀 on-the-go SMS test successful!",
    });
    
    console.log(`Test SMS sent to ${YOUR_PHONE}`);
  },
});
