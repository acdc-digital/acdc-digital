import { NextResponse } from "next/server";

// Stub webhook endpoint for demo mode
// In demo mode, no real payments are processed
export async function POST(request: Request) {
  console.log("Demo mode: Stripe webhook endpoint called (stub)");

  return NextResponse.json({
    received: true,
    message: "Demo mode - no payment processing"
  });
}
