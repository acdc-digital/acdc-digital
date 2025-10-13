// convex/convex.config.ts
import { defineApp } from "convex/server";
import twilio from "@convex-dev/twilio/convex.config";

const app = defineApp();
app.use(twilio);

export default app;
