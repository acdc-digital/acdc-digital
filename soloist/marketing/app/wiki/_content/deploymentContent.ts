export const deploymentContent = `# Deployment Guide
## Production Deployment for Soloist Marketing Dashboard

---

## Deployment Architecture

\`\`\`mermaid
graph LR
    subgraph "Vercel Edge Network"
        NextJS[Next.js App<br/>Frontend + API Routes]
    end
    
    subgraph "Convex Cloud"
        Database[(Real-time Database)]
        Functions[Serverless Functions]
    end
    
    subgraph "External APIs"
        Reddit[Reddit API]
        Anthropic[Anthropic Claude]
    end
    
    Users --> NextJS
    NextJS --> Database
    NextJS --> Functions
    Functions --> Anthropic
    NextJS --> Reddit
\`\`\`

---

## Prerequisites

### Required Accounts
- [ ] **Vercel** account (free tier OK)
- [ ] **Convex** account (free tier OK)
- [ ] **Anthropic** API key (Tier 1 minimum)
- [ ] **GitHub** repository (recommended)

### Local Setup Verified
- [ ] \`pnpm run dev\` works locally
- [ ] Convex connection established
- [ ] Insights generating successfully
- [ ] No console errors

---

## Step 1: Deploy Convex Backend

### 1.1 Login to Convex

\`\`\`bash
cd /Users/matthewsimon/Projects/acdc-digital/soloist/marketing
npx convex login
\`\`\`

### 1.2 Create Production Deployment

\`\`\`bash
npx convex deploy --prod
\`\`\`

**Expected output**:
\`\`\`
✔ Deployment complete!
📡 Deployment URL: https://your-project.convex.cloud
\`\`\`

### 1.3 Set Environment Variables

In Convex dashboard:
1. Go to Settings → Environment Variables
2. Add \`ANTHROPIC_API_KEY\`:
   \`\`\`
   sk-ant-api03-xxxxxxxxxx
   \`\`\`

### 1.4 Verify Schema

\`\`\`bash
npx convex deploy --prod
\`\`\`

Tables should be created:
- \`marketing_insights\`
- \`live_feed_posts\`
- \`studio_controls\`
- \`rate_limits\`

---

## Step 2: Deploy Next.js to Vercel

### 2.1 Connect GitHub Repository

1. Push code to GitHub:
\`\`\`bash
git add .
git commit -m "Prepare for deployment"
git push origin main
\`\`\`

2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository

### 2.2 Configure Project

**Framework Preset**: Next.js  
**Root Directory**: \`./soloist/marketing\`  
**Build Command**: \`pnpm run build\`  
**Output Directory**: \`.next\`  
**Install Command**: \`pnpm install\`

### 2.3 Environment Variables

Add in Vercel dashboard:

\`\`\`env
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
\`\`\`

**Note**: \`ANTHROPIC_API_KEY\` is NOT needed in Vercel (it's in Convex)

### 2.4 Deploy

Click "Deploy"

**Expected timeline**:
- Build: ~2-3 minutes
- Deployment: ~30 seconds

---

## Step 3: Verify Deployment

### 3.1 Check Frontend

Visit your Vercel URL: \`https://your-app.vercel.app/dashboard\`

**Checklist**:
- [ ] Dashboard loads without errors
- [ ] Controls panel visible
- [ ] LiveFeed sidebar visible
- [ ] Start Feed button clickable

### 3.2 Test Live Feed

1. Click "Start Feed"
2. Wait 10 seconds
3. Check console logs for:
   - \`🚀 Starting live feed service...\`
   - \`🔄 Fetching posts from 7 subreddits...\`
   - \`✅ Added X new posts\`

### 3.3 Test AI Insights

1. Wait 30-60 seconds
2. Check LiveFeed sidebar for insights
3. Click on an insight to verify:
   - Type icon and color
   - Priority flag
   - Sentiment badge
   - Timestamp
   - Reddit link works

### 3.4 Test Convex Sync

1. Open dashboard in two browser tabs
2. In tab 1, start feed
3. In tab 2, insights should appear automatically
4. Verify real-time sync (WebSocket)

---

## Step 4: Configure Custom Domain (Optional)

### 4.1 Add Domain in Vercel

1. Go to Project Settings → Domains
2. Add your domain (e.g., \`marketing.soloist.app\`)
3. Add DNS records as shown

### 4.2 DNS Configuration

**For Vercel**:
\`\`\`
Type: CNAME
Name: marketing
Value: cname.vercel-dns.com
\`\`\`

**For root domain**:
\`\`\`
Type: A
Name: @
Value: 76.76.21.21
\`\`\`

### 4.3 SSL Certificate

Vercel automatically provisions SSL certificates via Let's Encrypt.

**Wait time**: 1-5 minutes

---

## Step 5: Production Optimizations

### 5.1 Enable Vercel Analytics

\`\`\`bash
pnpm add @vercel/analytics
\`\`\`

\`\`\`tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
\`\`\`

### 5.2 Add Error Tracking (Sentry)

\`\`\`bash
pnpm add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
\`\`\`

Add to Vercel env:
\`\`\`env
NEXT_PUBLIC_SENTRY_DSN=https://...
\`\`\`

### 5.3 Configure Rate Limits

Adjust in \`app/api/reddit/route.ts\`:

\`\`\`typescript
// Production: More conservative
private minRequestInterval = 10000; // 10s (was 5s)
private circuitBreakerThreshold = 60000; // 60s (was 30s)
\`\`\`

### 5.4 Add Health Check Endpoint

\`\`\`typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: Date.now(),
    version: '1.0.0',
  });
}
\`\`\`

---

## Monitoring & Maintenance

### Vercel Dashboard

**Key Metrics**:
- Request count
- Error rate
- Build time
- Response time

**Alerts** (configure in Settings):
- High error rate (>5%)
- Slow response time (>3s p95)

### Convex Dashboard

**Key Metrics**:
- Function call count
- Database size
- Real-time connections
- Action duration

**Alerts**:
- High action duration (>5s)
- Database size approaching limit

### Anthropic Usage

Check at [console.anthropic.com](https://console.anthropic.com):
- Token usage
- Request count
- Error rate

**Current limits** (Tier 1):
- 50 RPM (requests per minute)
- 40k TPM (tokens per minute)
- $5/month free credit

---

## Scaling Considerations

### Current Capacity

| Resource | Limit | Notes |
|----------|-------|-------|
| **Reddit API** | ~360 req/hour | With circuit breaker |
| **Anthropic** | 50 req/min | Tier 1 limit |
| **Vercel** | 100 GB-hours/month | Free tier |
| **Convex** | 1M function calls/month | Free tier |

### Scaling Strategy

#### 1. Upgrade Anthropic to Tier 2
**Cost**: Usage-based (~$0.25 per 1M tokens)  
**Benefit**: 500 RPM (10x increase)

#### 2. Implement Insight Queue
\`\`\`typescript
// If AI fails, add to queue for retry
const insightQueue = [];

async function processQueue() {
  while (insightQueue.length > 0) {
    const post = insightQueue.shift();
    try {
      await generateInsight(post);
    } catch (error) {
      insightQueue.push(post); // Re-queue
      await sleep(60000); // Wait 1 min
    }
  }
}
\`\`\`

#### 3. Add Caching Layer
\`\`\`typescript
// Cache Reddit responses for 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

function getCachedResponse(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < 300000) {
    return cached.data;
  }
  return null;
}
\`\`\`

#### 4. Implement User Authentication
- Per-user rate limits
- User-specific subreddit selections
- Bookmarks and favorites
- Usage analytics per user

---

## Rollback Procedure

### If Deployment Fails

1. **Revert on Vercel**:
   - Go to Deployments tab
   - Find previous working deployment
   - Click "..." → "Promote to Production"

2. **Revert Convex Schema**:
   \`\`\`bash
   git revert HEAD
   npx convex deploy --prod
   \`\`\`

### If Production Issues

1. **Stop Feed** (client-side):
   - Users can click "Stop Feed" button
   - No server restart needed

2. **Disable API Route**:
   \`\`\`typescript
   // app/api/reddit/route.ts
   export async function GET() {
     return Response.json({ error: 'Maintenance mode' }, { status: 503 });
   }
   \`\`\`

3. **Emergency Redeploy**:
   \`\`\`bash
   git commit --allow-empty -m "Force redeploy"
   git push origin main
   \`\`\`

---

## Security Checklist

- [ ] API keys not in client-side code
- [ ] Environment variables set in Vercel/Convex dashboards
- [ ] Rate limiting enabled on all API routes
- [ ] CORS configured properly
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] Convex functions use proper validators
- [ ] No sensitive data logged
- [ ] Error messages don't expose internals

---

## Post-Deployment Checklist

### Day 1
- [ ] Monitor Vercel logs for errors
- [ ] Check Convex function call counts
- [ ] Verify insights generating correctly
- [ ] Test on mobile devices
- [ ] Share with beta users

### Week 1
- [ ] Review Anthropic usage (stay under $5 credit)
- [ ] Check error rates in Sentry
- [ ] Analyze user behavior in Vercel Analytics
- [ ] Collect feedback
- [ ] Plan next iteration

### Month 1
- [ ] Review total costs
- [ ] Consider upgrading tiers if needed
- [ ] Implement user-requested features
- [ ] Optimize slow functions
- [ ] Add more subreddits

---

## Cost Breakdown (Monthly)

### Free Tier Limits

| Service | Free Tier | Overage Cost |
|---------|-----------|--------------|
| **Vercel** | 100 GB-hours | $20/100 GB-hours |
| **Convex** | 1M calls, 1 GB storage | $25/month after |
| **Anthropic** | $5 credit | $0.25 per 1M tokens |

### Estimated Usage (100 users)

**Assumptions**:
- 100 concurrent users
- Each runs feed for 1 hour/day
- 7 subreddits × 10 posts = 70 posts/user/hour
- 1 insight per post = 70 insights/user/hour

**Reddit API**: ~420k requests/month (free)  
**Anthropic**: ~210k requests/month ($52.50)  
**Convex**: ~630k function calls/month (free)  
**Vercel**: ~100 GB-hours/month (free)

**Total**: ~$52.50/month for 100 active users

---

## Backup & Disaster Recovery

### Database Backups

Convex handles backups automatically:
- Real-time replication
- Point-in-time recovery (up to 30 days)
- Automatic snapshots

### Manual Export

\`\`\`bash
# Export insights to JSON
npx convex export --table marketing_insights > backup.json
\`\`\`

### Restore Procedure

\`\`\`bash
# Import from backup
npx convex import --table marketing_insights backup.json
\`\`\`

---

## Support & Troubleshooting

- 🔧 **[Troubleshooting Guide](troubleshooting)** - Common issues
- 📚 **Convex Docs**: [docs.convex.dev](https://docs.convex.dev)
- 📚 **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- 📚 **Anthropic Docs**: [docs.anthropic.com](https://docs.anthropic.com)

---

**Deployment Complete!** 🎉

Your marketing dashboard is now live and ready to generate insights.
`;
