// SYSTEM HEALTH CHECK API ENDPOINT
// /Users/matthewsimon/Projects/SMNB/smnb/app/api/health/system/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Basic system health checks
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        server: {
          status: 'healthy',
          uptime: process.uptime(),
          memory: {
            used: process.memoryUsage().heapUsed / 1024 / 1024, // MB
            total: process.memoryUsage().heapTotal / 1024 / 1024, // MB
          },
          nodejs_version: process.version
        },
        environment: {
          status: 'healthy',
          node_env: process.env.NODE_ENV,
          has_convex_url: !!process.env.NEXT_PUBLIC_CONVEX_URL,
          has_anthropic_key: !!process.env.ANTHROPIC_API_KEY,
          has_reddit_config: !!(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET)
        }
      },
      response_time: Date.now() - startTime
    };
    
    // Determine overall health status
    const hasIssues = !health.checks.environment.has_convex_url || 
                     !health.checks.environment.has_anthropic_key;
    
    if (hasIssues) {
      health.status = 'degraded';
    }
    
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;
    
    return NextResponse.json(health, { status: statusCode });
    
  } catch (error: any) {
    console.error('❌ System health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      error: 'System health check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}