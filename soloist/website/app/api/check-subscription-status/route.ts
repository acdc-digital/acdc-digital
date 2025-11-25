import { NextResponse } from "next/server";
import Stripe from "stripe";

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// IMPORTANT: Create Stripe client lazily at request time, NOT module load time
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Get Stripe client at request time
    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json(
        { error: "Payment service is not properly configured" },
        { status: 500 }
      );
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // If session has subscription, retrieve it
    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
      
      return NextResponse.json({
        status: subscription.status,
        customerId: subscription.customer,
        priceId: subscription.items.data[0].price.id,
        productId: subscription.items.data[0].price.product,
        current_period_end: (subscription as any).current_period_end,
        cancel_at_period_end: (subscription as any).cancel_at_period_end,
      });
    }

    return NextResponse.json({ status: "no_subscription" });
  } catch (error) {
    console.error("Error checking subscription status:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to check subscription status";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 