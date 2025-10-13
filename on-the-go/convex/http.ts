import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// Twilio webhook endpoint for incoming SMS
// Optimized for receiving only - sending handled by Twilio component
http.route({
  path: "/twilio/sms",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      // Parse Twilio webhook data (form-encoded)
      const formData = await req.formData();
      
      const phoneNumber = formData.get("From") as string;
      const messageBody = formData.get("Body") as string;
      const messageSid = formData.get("MessageSid") as string;
      
      if (!phoneNumber || !messageBody) {
        return new Response("Missing required fields", { status: 400 });
      }
      
      // Create note in database
      await ctx.runMutation(internal.notes.createNote, {
        phoneNumber,
        messageBody,
        twilioMessageSid: messageSid,
        receivedAt: Date.now(),
      });
      
      // Respond with TwiML (simple acknowledgment)
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>✓</Message>
</Response>`;
      
      return new Response(twiml, {
        status: 200,
        headers: {
          "Content-Type": "application/xml",
        },
      });
    } catch (error) {
      console.error("Error processing Twilio webhook:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }),
});

// Health check endpoint
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({ 
        status: "ok", 
        service: "on-the-go-notes",
        timestamp: Date.now()
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }),
});

export default http;
