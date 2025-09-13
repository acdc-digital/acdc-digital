// DATABASE HEALTH CHECK API ENDPOINT
// /Users/matthewsimon/Projects/SMNB/smnb/app/api/health/database/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Basic database connectivity check
    // Since we're using Convex, we can check if the URL is configured
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        convex: {
          status: convexUrl ? 'configured' : 'not_configured',
          url_present: !!convexUrl,
          url_format_valid: convexUrl ? convexUrl.includes('convex.cloud') : false
        }
      },
      response_time: Date.now() - startTime
    };
    
    // Determine overall health status
    if (!convexUrl || !health.checks.convex.url_format_valid) {
      health.status = 'unhealthy';
    }
    
    const statusCode = health.status === 'healthy' ? 200 : 503;
    
    return NextResponse.json(health, { status: statusCode });
    
  } catch (error: any) {
    console.error('❌ Database health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Database health check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}