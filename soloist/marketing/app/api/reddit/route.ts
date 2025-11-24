import { NextRequest, NextResponse } from 'next/server';

// Global rate limiting with circuit breaker
class GlobalRateLimiter {
  private static instance: GlobalRateLimiter;
  private lastRequestTime = 0;
  private rateLimitBackoff = 0;
  private minRequestInterval = 5000; // 5 seconds minimum
  private maxBackoff = 60000; // Max 1 minute backoff
  private backoffIncrement = 10000; // 10 second increments
  private circuitBreakerThreshold = 30000; // 30 seconds
  private circuitBreakerResetTime = 120000; // 2 minutes
  private isCircuitBreakerOpen = false;
  private circuitBreakerOpenedAt = 0;

  static getInstance(): GlobalRateLimiter {
    if (!GlobalRateLimiter.instance) {
      GlobalRateLimiter.instance = new GlobalRateLimiter();
    }
    return GlobalRateLimiter.instance;
  }

  async waitForNextRequest(): Promise<{ blocked: boolean; remainingSeconds?: number }> {
    if (this.isCircuitBreakerOpen) {
      const timeSinceOpened = Date.now() - this.circuitBreakerOpenedAt;
      if (timeSinceOpened > this.circuitBreakerResetTime) {
        console.log('🔄 Circuit breaker reset');
        this.isCircuitBreakerOpen = false;
        this.rateLimitBackoff = Math.floor(this.rateLimitBackoff / 2);
      } else {
        const remainingTime = this.circuitBreakerResetTime - timeSinceOpened;
        const remainingSeconds = Math.round(remainingTime / 1000);
        console.warn(`⚠️ Circuit breaker open - ${remainingSeconds}s`);
        return { blocked: true, remainingSeconds };
      }
    }

    const now = Date.now();
    const totalDelay = this.minRequestInterval + this.rateLimitBackoff;
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < totalDelay) {
      const delay = totalDelay - timeSinceLastRequest;
      console.log(`⏳ Rate limiter: waiting ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
    return { blocked: false };
  }

  increaseBackoff(): void {
    this.rateLimitBackoff = Math.min(this.rateLimitBackoff + this.backoffIncrement, this.maxBackoff);
    console.warn(`⚠️ Backoff increased to ${this.rateLimitBackoff}ms`);
    
    if (this.rateLimitBackoff >= this.circuitBreakerThreshold && !this.isCircuitBreakerOpen) {
      this.isCircuitBreakerOpen = true;
      this.circuitBreakerOpenedAt = Date.now();
      console.error('🚫 Circuit breaker opened');
    }
  }

  decreaseBackoff(): void {
    if (this.rateLimitBackoff > 0) {
      this.rateLimitBackoff = Math.max(0, this.rateLimitBackoff - (this.backoffIncrement / 2));
      console.log(`✅ Backoff reduced to ${this.rateLimitBackoff}ms`);
    }
  }

  getCurrentBackoff(): number {
    return this.rateLimitBackoff;
  }
}

const rateLimiter = GlobalRateLimiter.getInstance();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const subreddit = searchParams.get('subreddit') || 'all';
  const sort = searchParams.get('sort') || 'hot';
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);

  try {
    // Check rate limiter
    const rateLimitStatus = await rateLimiter.waitForNextRequest();
    
    if (rateLimitStatus.blocked) {
      return NextResponse.json(
        { 
          error: 'Rate limited',
          remainingSeconds: rateLimitStatus.remainingSeconds,
          kind: 'Listing',
          data: { children: [], after: null, before: null }
        },
        { status: 429 }
      );
    }

    console.log(`🌐 Proxying Reddit: r/${subreddit}/${sort} (limit: ${limit})`);

    const url = `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}&raw_json=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Marketing-Research-Client/1.0)',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    console.log(`📊 Reddit response: ${response.status}`);

    if (!response.ok) {
      if (response.status === 429) {
        rateLimiter.increaseBackoff();
        return NextResponse.json(
          { 
            error: 'Rate limited by Reddit',
            kind: 'Listing',
            data: { children: [], after: null, before: null }
          },
          { status: 429 }
        );
      }
      
      throw new Error(`Reddit API error: ${response.status}`);
    }

    // Success - reduce backoff
    rateLimiter.decreaseBackoff();

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Reddit proxy error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch from Reddit',
        kind: 'Listing',
        data: { children: [], after: null, before: null }
      },
      { status: 500 }
    );
  }
}
