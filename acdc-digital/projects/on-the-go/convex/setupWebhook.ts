// convex/setupWebhook.ts
// One-time setup to configure Twilio webhook programmatically
"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";

/**
 * Configure Twilio phone number webhook
 * Run this once from Convex dashboard
 * 
 * Usage: setupWebhook({ phoneNumberSid: "PN..." })
 * 
 * To find your Phone Number SID:
 * 1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
 * 2. Click on +12294587352
 * 3. Copy the SID (starts with PN...)
 */
export const setupWebhook = internalAction({
  args: {
    phoneNumberSid: v.string(), // e.g., "PN1234567890abcdef1234567890abcdef"
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const deploymentUrl = process.env.CONVEX_SITE_URL;
    
    if (!accountSid || !authToken) {
      return {
        success: false,
        message: "Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN in environment",
      };
    }
    
    const webhookUrl = `${deploymentUrl}/twilio/sms`;
    
    console.log(`Configuring webhook for ${args.phoneNumberSid}`);
    console.log(`Webhook URL: ${webhookUrl}`);
    
    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers/${args.phoneNumberSid}.json`,
        {
          method: "POST",
          headers: {
            "Authorization": `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `SmsUrl=${encodeURIComponent(webhookUrl)}&SmsMethod=POST`,
        }
      );
      
      if (!response.ok) {
        const error = await response.text();
        console.error("Twilio API error:", error);
        return {
          success: false,
          message: `Twilio API error: ${error}`,
        };
      }
      
      const result = await response.json();
      console.log("Webhook configured successfully!");
      console.log("Phone Number:", result.phone_number);
      console.log("SMS URL:", result.sms_url);
      
      return {
        success: true,
        message: `Webhook configured! SMS URL: ${result.sms_url}`,
      };
    } catch (error) {
      console.error("Error configuring webhook:", error);
      return {
        success: false,
        message: `Error: ${error}`,
      };
    }
  },
});

/**
 * Get phone number SID by phone number
 * Helper to find your Phone Number SID
 */
export const getPhoneNumberSid = internalAction({
  args: {},
  returns: v.object({
    success: v.boolean(),
    phoneNumberSid: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    message: v.string(),
  }),
  handler: async () => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const targetNumber = process.env.TWILIO_PHONE_NUMBER; // +12294587352
    
    if (!accountSid || !authToken) {
      return {
        success: false,
        message: "Missing credentials in environment",
      };
    }
    
    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json?PhoneNumber=${encodeURIComponent(targetNumber!)}`,
        {
          headers: {
            "Authorization": `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          },
        }
      );
      
      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          message: `Twilio API error: ${error}`,
        };
      }
      
      const result = await response.json();
      
      if (result.incoming_phone_numbers && result.incoming_phone_numbers.length > 0) {
        const phoneNumber = result.incoming_phone_numbers[0];
        console.log("Found phone number!");
        console.log("SID:", phoneNumber.sid);
        console.log("Number:", phoneNumber.phone_number);
        console.log("Current SMS URL:", phoneNumber.sms_url || "Not set");
        
        return {
          success: true,
          phoneNumberSid: phoneNumber.sid,
          phoneNumber: phoneNumber.phone_number,
          message: `Phone Number SID: ${phoneNumber.sid}`,
        };
      }
      
      return {
        success: false,
        message: `No phone number found for ${targetNumber}`,
      };
    } catch (error) {
      console.error("Error fetching phone number:", error);
      return {
        success: false,
        message: `Error: ${error}`,
      };
    }
  },
});
