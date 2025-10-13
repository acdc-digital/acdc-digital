import { NextResponse } from "next/server";

// This endpoint starts the ticker update interval
let updateInterval: NodeJS.Timeout | null = null;
let isInitialized = false;

export async function POST() {
  try {
    // If already initialized and interval is running, don't restart
    if (isInitialized && updateInterval) {
      console.log("[Ticker Init] Already initialized, skipping restart");
      return NextResponse.json({
        success: true,
        message: "Ticker already running",
        alreadyInitialized: true,
      });
    }

    // Clear any existing interval
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }

    // Do an immediate first update only if not already initialized
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9999";
    
    if (!isInitialized) {
      console.log("[Ticker Init] Starting initial update...");
      await fetch(`${baseUrl}/api/ticker/update`);
    } else {
      console.log("[Ticker Init] Restarting interval without resetting progress...");
    }

    isInitialized = true;

    // Set up interval to fetch 2 stocks every minute (60000ms)
    // All 100 stocks will be updated every 50 minutes (conservative rate limiting)
    updateInterval = setInterval(async () => {
      try {
        await fetch(`${baseUrl}/api/ticker/update`);
      } catch (error) {
        console.error("[Ticker Init] Update failed:", error);
      }
    }, 60000); // 1 minute

    return NextResponse.json({
      success: true,
      message: "Ticker updates started (2 stocks per minute with delays, all 100 updated every 50 minutes)",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
    return NextResponse.json({
      success: true,
      message: "Ticker updates stopped",
    });
  }
  return NextResponse.json({
    success: false,
    message: "No active interval",
  });
}
