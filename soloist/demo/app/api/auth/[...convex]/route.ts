import { NextRequest, NextResponse } from "next/server";

// Stub auth endpoint for demo mode
// In demo mode, no authentication is needed

async function handleRequest(req: NextRequest) {
  console.log("Demo mode: Auth endpoint called (stub)");

  return NextResponse.json({
    message: "Demo mode - no authentication required"
  });
}

export const GET = handleRequest;
export const POST = handleRequest; 