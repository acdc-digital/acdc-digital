import { NextResponse } from "next/server";
import { state } from "../update/route";

export async function GET() {
  const prices = Array.from(state.stockPricesCache.values());
  
  return NextResponse.json({
    success: true,
    count: prices.length,
    data: prices,
  });
}
