// convex/twilio.ts
import { Twilio } from "@convex-dev/twilio";
import { components } from "./_generated/api";

// Instantiate Twilio component client with default "from" phone number
export const twilio = new Twilio(components.twilio, {
  defaultFrom: process.env.TWILIO_PHONE_NUMBER!,
});
