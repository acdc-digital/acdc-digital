export const troubleshootingContent = `# Troubleshooting Guide
## Common Issues and Solutions

---

## Feed Not Starting

### Symptom
Clicking "Start Feed" button does nothing, or feed stops immediately.

### Possible Causes

#### 1. Service Already Running
**Check**: Look for console message: \`⚠️ Service already running\`

**Solution**:
\`\`\`typescript
// Force stop and restart
liveFeedService.stop();
setTimeout(() => {
  liveFeedService.start();
}, 1000);
\`\`\`

#### 2. No Subreddits Selected
**Check**: Look for console message: \`⚠️ No subreddits selected\`

**Solution**: Click at least one subreddit button (should turn green)

#### 3. Network Error
**Check**: Browser console for \`Failed to fetch\` errors

**Solution**:
1. Check internet connection
2. Verify Reddit is accessible: https://www.reddit.com
3. Check Convex URL in \`.env.local\`

---

## No Insights Appearing

### Symptom
Feed is running, posts are fetching, but no insights in sidebar.

### Possible Causes

#### 1. Anthropic API Key Missing
**Check**: Convex dashboard → Settings → Environment Variables

**Solution**: Add \`ANTHROPIC_API_KEY\`:
\`\`\`
sk-ant-api03-xxxxxxxxxx
\`\`\`

**Verify**: Check Convex logs for:
\`\`\`
Error: ANTHROPIC_API_KEY is not set
\`\`\`

#### 2. Rate Limit Exceeded
**Check**: Console for: \`⚠️ Rate limit exceeded\`

**Solution**: Wait for reset (1-2 minutes), then insights will resume

**Long-term**: Upgrade to Anthropic Tier 2 (500 RPM)

#### 3. Invalid Post Content
**Check**: Console for: \`Failed to generate insight for post XXX\`

**Solution**: This is normal - some posts have no content. Service will continue with next post.

#### 4. Convex Action Failed
**Check**: Convex dashboard → Logs → Look for action errors

**Solution**:
1. Verify Anthropic API key is valid
2. Check Anthropic account has credits
3. Verify network connectivity from Convex

---

## Circuit Breaker Opened

### Symptom
Console shows: \`🔴 Circuit breaker opened\`

### What This Means
Reddit API rate limit was exceeded. Circuit breaker prevents further requests for 2 minutes.

### Solution
**Automatic**: Circuit breaker will reset after 2 minutes

**Manual**: If you need to force reset:
\`\`\`typescript
// In browser console
globalRateLimiter.isCircuitBreakerOpen = false;
globalRateLimiter.rateLimitBackoff = 0;
\`\`\`

### Prevention
1. Reduce \`refreshInterval\` from 30s to 60s
2. Select fewer subreddits (4-5 instead of 7)
3. Decrease \`limit\` from 10 to 5 posts per subreddit

---

## Insights Not Persisting

### Symptom
Insights appear, but disappear on page refresh.

### Possible Causes

#### 1. Convex Mutation Failing
**Check**: Console for: \`❌ Failed to save insight\`

**Solution**: Verify Convex URL is correct in \`.env.local\`:
\`\`\`env
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
\`\`\`

#### 2. Schema Mismatch
**Check**: Convex dashboard → Data → marketing_insights table exists

**Solution**: Redeploy schema:
\`\`\`bash
npx convex deploy --prod
\`\`\`

#### 3. Network Error
**Check**: Browser Network tab → Look for failed Convex requests

**Solution**:
1. Check internet connection
2. Verify Convex deployment is active
3. Check browser console for CORS errors

---

## High Memory Usage

### Symptom
Browser tab becomes slow or unresponsive after extended use.

### Possible Causes

#### 1. Unbounded Post Array
**Check**: In console:
\`\`\`javascript
useSimpleLiveFeedStore.getState().posts.length
\`\`\`

**Solution**: Add limit to \`addPost\` action:
\`\`\`typescript
addPost: (post) => {
  set((state) => ({
    posts: [newPost, ...state.posts].slice(0, 100) // Limit to 100
  }));
}
\`\`\`

#### 2. Too Many Insights Rendered
**Check**: In console:
\`\`\`javascript
document.querySelectorAll('[data-insight-card]').length
\`\`\`

**Solution**: Implement virtual scrolling or pagination

---

## Slow Insight Generation

### Symptom
Insights take 10-20 seconds to appear after posts are fetched.

### Possible Causes

#### 1. Anthropic Rate Limiting
**Expected**: With 1.2s min interval, max 50 insights/min

**Solution**: This is normal behavior. If too slow:
1. Upgrade to Anthropic Tier 2 (500 RPM)
2. Reduce number of posts fetched
3. Implement parallel processing (within rate limits)

#### 2. Network Latency
**Check**: Convex dashboard → Actions → Check average duration

**Solution**:
1. If consistently >5s, contact Anthropic support
2. Check Convex deployment region (should be close to Anthropic servers)

---

## Duplicate Insights

### Symptom
Same insight appears multiple times in feed.

### Possible Causes

#### 1. Deduplication Not Working
**Check**: Look for duplicate post IDs in store:
\`\`\`javascript
const posts = useSimpleLiveFeedStore.getState().posts;
const ids = posts.map(p => p.id);
const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
console.log('Duplicates:', duplicates);
\`\`\`

**Solution**: Verify \`seenIds\` Set is not being reset:
\`\`\`typescript
// In simpleLiveFeedService.ts
private seenIds = new Set<string>(); // Should persist across fetches
\`\`\`

#### 2. Multiple Service Instances
**Check**: Look for multiple "🚀 Starting live feed service..." messages

**Solution**: Ensure singleton pattern:
\`\`\`typescript
// Only one instance should exist
export const liveFeedService = new SimpleLiveFeedService();
\`\`\`

---

## Authentication Errors

### Symptom
Console shows: \`Authentication failed\` or \`Invalid API key\`

### Solutions

#### Convex
**Check**: \`.env.local\` has correct URL:
\`\`\`env
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
\`\`\`

**Verify**: Visit URL in browser, should show Convex API docs

#### Anthropic
**Check**: Convex dashboard → Settings → Environment Variables

**Verify**: Key format is \`sk-ant-api03-...\`

**Test**: In Convex dashboard, run test action:
\`\`\`typescript
// In Convex dashboard console
api.ai.generateInsight.generateInsight({
  postTitle: "Test",
  postContent: "Test content",
  postSubreddit: "test",
  postUrl: "https://reddit.com"
})
\`\`\`

---

## Build Errors (Deployment)

### Error: "Module not found"

**Cause**: Missing dependency

**Solution**:
\`\`\`bash
pnpm install
\`\`\`

### Error: "Type error in file X"

**Cause**: TypeScript compilation error

**Solution**:
\`\`\`bash
# Check for errors locally
pnpm run build

# Fix type errors, then redeploy
\`\`\`

### Error: "NEXT_PUBLIC_CONVEX_URL is not defined"

**Cause**: Environment variable not set in Vercel

**Solution**: Add in Vercel dashboard → Settings → Environment Variables

---

## Performance Issues

### Symptom: Slow UI Rendering

**Check**: React DevTools Profiler

**Common Causes**:
1. Not using selectors (re-renders on every state change)
2. Too many insights rendered at once
3. No React.memo on components

**Solutions**:
\`\`\`typescript
// Use selectors
const isLive = useSimpleLiveFeedStore(state => state.isLive);

// Memoize components
export default React.memo(InsightCard);

// Limit rendered insights
const recentInsights = insights.slice(0, 50);
\`\`\`

### Symptom: High CPU Usage

**Check**: Browser Task Manager (Shift+Esc in Chrome)

**Common Causes**:
1. Too many re-renders
2. Expensive calculations in render
3. Memory leaks

**Solutions**:
1. Add \`useMemo\` for expensive calculations
2. Use \`useCallback\` for event handlers
3. Clean up intervals/subscriptions in \`useEffect\`

---

## Data Issues

### Symptom: Invalid Insight Data

**Check**: Console for validation warnings:
\`\`\`
Invalid insight_type, defaulting to sentiment
\`\`\`

**Cause**: Claude returned invalid enum value

**Solution**: This is handled automatically with fallbacks. If frequent:
1. Improve prompt engineering
2. Add stricter validation in action
3. Contact Anthropic support if persistent

### Symptom: Missing Fields

**Check**: Console for errors:
\`\`\`
Cannot read property 'narrative' of undefined
\`\`\`

**Solution**: Add null checks:
\`\`\`typescript
{insight.narrative || 'No narrative available'}
\`\`\`

---

## Debugging Tools

### Browser Console Commands

\`\`\`javascript
// Check store state
console.log(useSimpleLiveFeedStore.getState());

// Check service status
console.log({
  isRunning: liveFeedService.isRunning,
  intervalId: liveFeedService.intervalId,
  seenIds: liveFeedService.seenIds.size
});

// Force fetch
liveFeedService.fetchPosts();

// Clear all data
useSimpleLiveFeedStore.getState().clearPosts();
useSimpleLiveFeedStore.getState().clearInsights();
\`\`\`

### Convex Dashboard

**Logs**: Real-time function call logs  
**Data**: Browse tables and documents  
**Functions**: Test queries/mutations/actions  
**Metrics**: Call counts, durations, errors

### Vercel Logs

**Real-time**: \`vercel logs --follow\`  
**Specific deployment**: \`vercel logs [deployment-url]\`  
**Filter by status**: \`vercel logs --status=error\`

---

## Getting Help

### 1. Check Console Logs
Look for emoji indicators:
- 🚀 Service started
- 🔄 Fetching data
- ✅ Success
- ❌ Error
- ⚠️ Warning

### 2. Check Network Tab
Filter by:
- \`reddit\` - Reddit API calls
- \`convex.cloud\` - Convex calls
- \`anthropic\` - AI calls

### 3. Check Convex Dashboard
- Function logs
- Error traces
- Performance metrics

### 4. Enable Verbose Logging

\`\`\`typescript
// In simpleLiveFeedService.ts
const DEBUG = true;

if (DEBUG) {
  console.log('[Service] State:', /* ... */);
}
\`\`\`

### 5. Contact Support

**Convex**: support@convex.dev or Discord  
**Vercel**: vercel.com/support  
**Anthropic**: support@anthropic.com

---

## Known Limitations

1. **Posts not persisted**: Lost on page refresh (intentional)
2. **No pagination**: Only fetches most recent 10 posts per subreddit
3. **No user authentication**: All users share same insights
4. **Rate limited**: 50 insights/min (Anthropic Tier 1)
5. **No offline support**: Requires internet connection
6. **No insight editing**: Insights are read-only
7. **No filtering**: Can't filter insights by type/priority

These are documented and planned for future releases.

---

## Emergency Contacts

**System Down?**
1. Check [status.vercel.com](https://status.vercel.com)
2. Check [status.convex.dev](https://status.convex.dev)
3. Check [status.anthropic.com](https://status.anthropic.com)

**Critical Issue?**
1. Stop the feed (click "Stop Feed")
2. Clear browser cache and reload
3. Check deployment logs in Vercel
4. Rollback if needed (see Deployment Guide)

---

**Still Having Issues?**

Refer back to:
- 📖 **[Overview](overview)** - System basics
- 🏗️ **[Architecture](architecture)** - How it works
- ⚡ **[API Integration](api-integration)** - External APIs
- 🚀 **[Deployment](deployment)** - Deployment guide
`;
