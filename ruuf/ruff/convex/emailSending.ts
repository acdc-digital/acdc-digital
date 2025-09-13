import { v } from "convex/values";
import { action, ActionCtx } from "./_generated/server";
import { api, internal } from "./_generated/api";

// Email sending action using Resend
export const sendCampaignEmails = action({
  args: {
    campaignId: v.id("campaigns"),
    batchSize: v.optional(v.number()),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    processed: v.number(),
    failed: v.number(),
  }),
  handler: async (ctx, args) => {
    try {
      // Get campaign details
      const campaign = await ctx.runQuery(api.campaigns.getCampaign, { 
        campaignId: args.campaignId 
      });
      
      if (!campaign) {
        throw new Error("Campaign not found");
      }
      
      if (campaign.status !== "draft" && campaign.status !== "scheduled") {
        throw new Error("Campaign is not in a sendable state");
      }
      
      // Update campaign status to sending
      await ctx.runMutation(api.campaigns.updateCampaignStatus, {
        campaignId: args.campaignId,
        status: "sending",
      });
      
      // Get active recipients
      const recipients = await ctx.runQuery(api.recipients.getActiveRecipients, {
        listId: campaign.recipientListId,
      });
      
      if (recipients.length === 0) {
        await ctx.runMutation(api.campaigns.updateCampaignStatus, {
          campaignId: args.campaignId,
          status: "failed",
        });
        return {
          success: false,
          message: "No active recipients found",
          processed: 0,
          failed: 0,
        };
      }
      
      const batchSize = args.batchSize || 50;
      let processed = 0;
      let failed = 0;
      
      // Process recipients in batches
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        
        for (const recipient of batch) {
          try {
            // Queue the email (create delivery record first)
            await ctx.runMutation(internal.deliveries.recordEmailQueued, {
              campaignId: args.campaignId,
              recipientId: recipient._id,
            });
            
            // TODO: Send email via Resend (will implement after webhook setup)
            // For now, we'll simulate email sending
            await simulateEmailSend(ctx, campaign, recipient);
            
            processed++;
          } catch (error) {
            console.error(`Failed to send email to ${recipient.email}:`, error);
            
            await ctx.runMutation(internal.deliveries.recordEmailFailed, {
              campaignId: args.campaignId,
              recipientId: recipient._id,
              failureReason: error instanceof Error ? error.message : "Unknown error",
              failedAt: Date.now(),
            });
            
            failed++;
          }
        }
        
        // Add small delay between batches to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Update campaign statistics
      await ctx.runMutation(internal.campaigns.updateCampaignStats, {
        campaignId: args.campaignId,
        sentCount: processed,
        failedCount: failed,
      });
      
      // Update campaign status
      const finalStatus = failed === recipients.length ? "failed" : "completed";
      await ctx.runMutation(api.campaigns.updateCampaignStatus, {
        campaignId: args.campaignId,
        status: finalStatus,
      });
      
      return {
        success: processed > 0,
        message: `Processed ${processed} emails, ${failed} failed`,
        processed,
        failed,
      };
      
    } catch (error) {
      console.error("Campaign sending failed:", error);
      
      // Update campaign status to failed
      await ctx.runMutation(api.campaigns.updateCampaignStatus, {
        campaignId: args.campaignId,
        status: "failed",
      });
      
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        processed: 0,
        failed: 0,
      };
    }
  },
});

// Simulate email sending (temporary until Resend is fully integrated)
async function simulateEmailSend(
  ctx: ActionCtx,
  campaign: any,
  recipient: any
) {
  // Simulate some processing time
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Simulate 95% success rate
  const success = Math.random() > 0.05;
  
  if (success) {
    // Record successful send
    const mockResendId = `mock_${Date.now()}_${recipient._id}`;
    await ctx.runMutation(internal.deliveries.recordEmailSent, {
      campaignId: campaign._id,
      recipientId: recipient._id,
      resendEmailId: mockResendId,
      sentAt: Date.now(),
    });
    
    // Simulate delivery after a short delay
    setTimeout(async () => {
      await ctx.runMutation(internal.deliveries.updateDeliveryStatus, {
        resendEmailId: mockResendId,
        status: "delivered",
        timestamp: Date.now(),
      });
    }, 2000);
  } else {
    throw new Error("Simulated send failure");
  }
}

// Action to send a test email
export const sendTestEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    htmlContent: v.string(),
    fromAddress: v.string(),
    fromName: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    emailId: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    try {
      // TODO: Implement actual Resend integration
      // For now, simulate test email
      console.log("Test email would be sent:", {
        to: args.to,
        subject: args.subject,
        from: args.fromAddress,
      });
      
      return {
        success: true,
        message: "Test email sent successfully (simulated)",
        emailId: `test_${Date.now()}`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});