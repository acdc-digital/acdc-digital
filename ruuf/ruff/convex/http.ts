import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// Resend webhook endpoint
http.route({
  path: "/resend-webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      // Verify webhook signature (implement this when we have the secret)
      // const signature = req.headers.get("resend-signature");
      
      const body = await req.json();
      const event = body;
      
      console.log("Received Resend webhook:", event);
      
      // Process the webhook event
      await processResendEvent(ctx, event);
      
      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("Webhook processing failed:", error);
      return new Response("Error processing webhook", { status: 500 });
    }
  }),
});

async function processResendEvent(ctx: any, event: any) {
  const { type, data, created_at } = event;
  
  if (!data?.email_id) {
    console.warn("Event missing email_id:", event);
    return;
  }
  
  const timestamp = new Date(created_at).getTime();
  
  switch (type) {
    case "email.sent":
      // Email was accepted by Resend
      console.log(`Email ${data.email_id} was sent`);
      break;
      
    case "email.delivered":
      await ctx.runMutation(internal.deliveries.updateDeliveryStatus, {
        resendEmailId: data.email_id,
        status: "delivered",
        timestamp,
      });
      break;
      
    case "email.delivery_delayed":
      // Email delivery was delayed but not failed yet
      console.log(`Email ${data.email_id} delivery delayed`);
      break;
      
    case "email.bounced":
      await ctx.runMutation(internal.deliveries.updateDeliveryStatus, {
        resendEmailId: data.email_id,
        status: "bounced",
        timestamp,
        bounceReason: data.bounce?.reason || "Unknown bounce reason",
        bounceType: determineBounceType(data.bounce?.reason),
      });
      break;
      
    case "email.complained":
      await ctx.runMutation(internal.deliveries.updateDeliveryStatus, {
        resendEmailId: data.email_id,
        status: "complained",
        timestamp,
      });
      break;
      
    case "email.opened":
      await ctx.runMutation(internal.deliveries.updateDeliveryStatus, {
        resendEmailId: data.email_id,
        status: "opened",
        timestamp,
      });
      break;
      
    case "email.clicked":
      await ctx.runMutation(internal.deliveries.updateDeliveryStatus, {
        resendEmailId: data.email_id,
        status: "clicked",
        timestamp,
      });
      break;
      
    default:
      console.log(`Unhandled event type: ${type}`);
  }
}

function determineBounceType(reason?: string): "hard" | "soft" {
  if (!reason) return "soft";
  
  const hardBounceIndicators = [
    "mailbox does not exist",
    "user unknown",
    "invalid recipient",
    "no such user",
    "account disabled",
    "address rejected",
  ];
  
  const lowerReason = reason.toLowerCase();
  const isHardBounce = hardBounceIndicators.some(indicator => 
    lowerReason.includes(indicator)
  );
  
  return isHardBounce ? "hard" : "soft";
}

// Health check endpoint
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(JSON.stringify({
      status: "healthy",
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;