// STRIPE WEBHOOK
// /Users/matthewsimon/Documents/Github/soloist_pro/website/app/api/webhook/stripe/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// IMPORTANT: Create clients lazily at request time, NOT module load time
// This ensures environment variables are always read fresh
function getStripeClient(): Stripe | null {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    console.error("Missing STRIPE_SECRET_KEY environment variable");
    return null;
  }
  return new Stripe(stripeSecretKey, {
    apiVersion: "2025-05-28.basil" as any,
  });
}

function getConvexClient(): ConvexHttpClient | null {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.error("Missing NEXT_PUBLIC_CONVEX_URL environment variable");
    return null;
  }
  return new ConvexHttpClient(convexUrl);
}

export async function POST(request: Request) {
  console.log("=== WEBHOOK REQUEST RECEIVED ===");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Request URL:", request.url);
  console.log("Request method:", request.method);
  
  try {
    console.log("Webhook request received");
    const body = await request.text();
    console.log("Body length:", body.length);
    console.log("Body preview:", body.substring(0, 100) + "...");
    
    const signature = request.headers.get("stripe-signature");
    console.log("Webhook signature:", !!signature);
    console.log("Signature value:", signature?.substring(0, 20) + "...");

    if (!signature) {
      console.error("Missing Stripe signature");
      return NextResponse.json(
        { error: "Missing Stripe signature" },
        { status: 400 }
      );
    }

    // Get webhook secret at request time
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("Webhook secret not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Get Stripe client at request time
    const stripe = getStripeClient();
    if (!stripe) {
      console.error("Stripe client not initialized");
      return NextResponse.json(
        { error: "Payment service not configured" },
        { status: 500 }
      );
    }

    // Get Convex client at request time
    const convex = getConvexClient();
    if (!convex) {
      console.error("Convex client not initialized");
      return NextResponse.json(
        { error: "Backend service not configured" },
        { status: 500 }
      );
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      console.log("Verifying webhook signature");
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log("Signature verified successfully");
    } catch (err) {
      console.error("Invalid webhook signature:", err);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err}` },
        { status: 400 }
      );
    }

    console.log(`Received Stripe webhook event: ${event.type}`);
    console.log("Event ID:", event.id);
    console.log("Event data keys:", Object.keys(event.data.object));

    // Process the webhook event using our Convex function
    const eventData = event.data.object;
    try {
      console.log("Calling Convex processStripeWebhook function");
      const result = await convex.mutation(api.webhooks.processStripeWebhook, {
        eventType: event.type,
        data: eventData
      });
      
      console.log("Webhook processing result:", result);
      
      return NextResponse.json({ received: true, result });
    } catch (error) {
      console.error("Error calling Convex function:", error);
      return NextResponse.json(
        { error: "Error processing webhook in Convex", details: String(error) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error handling webhook:", error);
    return NextResponse.json(
      { error: "An error occurred while processing the webhook" },
      { status: 500 }
    );
  }
} 