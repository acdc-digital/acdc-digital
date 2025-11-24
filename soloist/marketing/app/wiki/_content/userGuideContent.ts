export const userGuideContent = `# User Guide
## Understanding the Live Feed & Controls

---

## What is the Live Feed System?

The Live Feed is your **real-time marketing intelligence dashboard** that automatically monitors Reddit discussions and generates AI-powered insights. Think of it as having a marketing research assistant that never sleeps.

### Key Concepts

**🎯 Purpose**: Discover customer pain points, competitor mentions, and market trends from Reddit discussions.

**⚡ Real-time**: New insights appear automatically as Reddit posts are analyzed.

**🤖 AI-Powered**: Claude Haiku analyzes each post to extract actionable marketing intelligence.

---

## How It Works: The Big Picture

\`\`\`mermaid
graph TB
    Start[User Opens Dashboard] --> Controls[Control Panel]
    Controls --> |Configure| Settings[Select Subreddits & Settings]
    Settings --> |Click Start| Polling[System Starts Polling]
    
    Polling --> Reddit[Fetch Reddit Posts]
    Reddit --> New{New Posts?}
    
    New -->|Yes| AI[Send to Claude AI]
    New -->|No| Wait[Wait 30 seconds]
    Wait --> Reddit
    
    AI --> Analyze[Analyze for Insights]
    Analyze --> Store[Save to Database]
    Store --> Display[Display in Live Feed]
    
    Display --> User[User Reviews Insights]
    User --> Action{Take Action?}
    Action -->|Export| Export[Download CSV]
    Action -->|Keep Monitoring| Reddit
    Action -->|Stop| Controls
    
    style Start fill:#4f46e5,stroke:#4338ca,color:#fff
    style AI fill:#10b981,stroke:#059669,color:#fff
    style Display fill:#f59e0b,stroke:#d97706,color:#fff
    style Export fill:#8b5cf6,stroke:#7c3aed,color:#fff
\`\`\`

---

## The Control Panel

Your mission control for Reddit monitoring. Here's what each control does:

### Subreddit Selection
**What it does**: Choose which Reddit communities to monitor.

**Example**: Select \`r/Entrepreneur\`, \`r/SaaS\`, and \`r/startups\` to monitor startup discussions.

**Pro Tip**: Start with 1-2 subreddits, then expand as you find valuable insights.

---

### Post Limit Slider
**What it does**: Controls how many posts to fetch per subreddit per cycle.

- **Minimum**: 5 posts (faster, less data)
- **Maximum**: 25 posts (slower, more comprehensive)
- **Default**: 10 posts (balanced)

**When to adjust**:
- 📉 **Low (5-10)**: Active subreddits with frequent posts
- 📊 **Medium (10-15)**: Most use cases
- 📈 **High (15-25)**: Slower subreddits or catching up on missed content

---

### Polling Interval
**What it does**: How often the system checks for new posts.

- **Options**: 30s, 1m, 2m, 5m
- **Default**: 30 seconds

**When to adjust**:
- ⚡ **30 seconds**: Fast-moving discussions (product launches, breaking news)
- 🕐 **1-2 minutes**: Normal monitoring
- 🕓 **5 minutes**: Background monitoring, less critical

**Important**: Shorter intervals and more subreddits = more Reddit API calls. With anonymous access, it's safest to stay under ~10 requests per minute total.

---

### Start/Stop Controls

\`\`\`mermaid
stateDiagram-v2
    [*] --> Stopped: Initial State
    Stopped --> Running: Click "Start Monitoring"
    Running --> Running: Auto-polling every interval
    Running --> Stopped: Click "Stop Monitoring"
    Running --> Paused: Rate Limited
    Paused --> Running: Circuit Breaker Reset
    Stopped --> [*]: Close Dashboard
    
    note right of Running
        ✓ Fetching posts
        ✓ Generating insights
        ✓ Updating feed
    end note
    
    note right of Paused
        ⏸ Temporarily paused
        ⏸ Waiting for rate limit
    end note
\`\`\`

---

## The Live Feed Display

### Insight Cards

Each card shows one marketing insight from a Reddit post:

\`\`\`
┌─────────────────────────────────────────┐
│ 🎯 Pain Point                HIGH      │
│─────────────────────────────────────────│
│ "Users struggle with email             │
│ marketing automation tools being       │
│ too complex for small teams."          │
│                                        │
│ 📊 Topics: email-marketing, UX        │
│ 💬 Sentiment: Negative                │
│ 🔗 r/Entrepreneur · 2m ago            │
└─────────────────────────────────────────┘
\`\`\`

### Insight Types

| Icon | Type | What to Look For |
|------|------|------------------|
| 🎯 | **Pain Point** | Customer problems and frustrations |
| 🏢 | **Competitor Mention** | Products/services being discussed |
| ✨ | **Feature Request** | Desired capabilities |
| 💭 | **Sentiment** | General market mood |

### Priority Levels

- 🔴 **HIGH**: Urgent issues, strong negative sentiment, major opportunities
- 🟡 **MEDIUM**: Worth noting, moderate impact
- 🟢 **LOW**: Informational, background noise

---

## System Status Indicators

### Status Bar (Bottom Right)

\`\`\`mermaid
graph LR
    A[Status Indicator] --> B{Color}
    B -->|Green| C[System Running]
    B -->|Yellow| D[Rate Limited]
    B -->|Red| E[Error State]
    B -->|Gray| F[Stopped]
    
    C --> C1["✓ Active polling<br/>✓ Generating insights"]
    D --> D1["⏸ Temporary pause<br/>⏸ Auto-resumes"]
    E --> E1["❌ Check logs<br/>❌ Restart needed"]
    F --> F1["⭕ Click Start<br/>⭕ Ready to begin"]
    
    style C fill:#10b981,stroke:#059669,color:#fff
    style D fill:#f59e0b,stroke:#d97706,color:#fff
    style E fill:#ef4444,stroke:#dc2626,color:#fff
    style F fill:#6b7280,stroke:#4b5563,color:#fff
\`\`\`

**What you'll see**:
- **Posts fetched**: Total Reddit posts retrieved
- **Insights generated**: AI insights created
- **Active since**: How long the system has been running
- **Circuit breaker**: Rate limit protection status

---

## Data Flow Architecture

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Controls
    participant Service
    participant Reddit
    participant AI
    participant Database
    participant Feed
    
    User->>Controls: Configure & Start
    Controls->>Service: startPolling()
    
    loop Every Interval
        Service->>Reddit: GET /r/subreddit/hot.json
        Reddit-->>Service: Posts array
        
        Service->>Service: Filter new posts
        
        alt New posts found
            loop For each post
                Service->>AI: generateInsight(post)
                AI-->>Service: Insight object
                Service->>Database: Store insight
                Database-->>Feed: Real-time update
                Feed-->>User: Display new insight
            end
        else No new posts
            Service->>Service: Wait for next cycle
        end
    end
    
    User->>Controls: Stop
    Controls->>Service: stopPolling()
\`\`\`

---

## Common Use Cases

### 1. Product Research
**Scenario**: You're building a new SaaS tool and want to understand customer pain points.

**Setup**:
- Subreddits: \`r/SaaS\`, \`r/Entrepreneur\`, \`r/startups\`
- Limit: 15 posts
- Interval: 1 minute

**What to watch**: Pain point insights with high priority

---

### 2. Competitor Intelligence
**Scenario**: Monitor mentions of competitor products.

**Setup**:
- Subreddits: Your industry-specific subreddits
- Limit: 25 posts (comprehensive)
- Interval: 5 minutes (background monitoring)

**What to watch**: Competitor mention insights

---

### 3. Launch Monitoring
**Scenario**: You just launched and want real-time feedback.

**Setup**:
- Subreddits: Where you announced
- Limit: 10 posts
- Interval: 30 seconds (real-time)

**What to watch**: All insight types, especially sentiment

---

## Data Export

### CSV Export Format

When you export insights, you get a spreadsheet with:

| Column | Description | Example |
|--------|-------------|---------|
| **Timestamp** | When insight was generated | 2025-01-15 14:30:22 |
| **Type** | Insight category | pain_point |
| **Priority** | Urgency level | high |
| **Sentiment** | Emotional tone | negative |
| **Narrative** | Main insight | "Users find tool too complex..." |
| **Summary** | Brief overview | "Complexity concerns" |
| **Topics** | Relevant tags | email-marketing, UX |
| **Subreddit** | Source community | Entrepreneur |
| **URL** | Link to original post | reddit.com/r/... |

**Use this data for**:
- Product roadmap planning
- Marketing campaign ideas
- Customer research reports
- Competitive analysis

---

## Rate Limiting & Circuit Breaker

### Why Rate Limiting Matters

Both Reddit and Anthropic have request limits:
- **Reddit (anonymous/free)**: In practice, Reddit starts rate limiting anonymous traffic around 10 requests per minute. Our defaults are designed to stay under this.
- **Anthropic (Claude, Tier 2)**: Tier 2 includes higher request & token limits than Tier 1. In most cases, Reddit is the main bottleneck, not Claude.

### Reddit vs. Anthropic
- **Reddit** is accessed via anonymous JSON endpoints (no OAuth). That's convenient but more strictly rate limited.
- **Claude (Anthropic)** is accessed with your Tier 2 API key, which can handle high throughput.

The circuit breaker is primarily tuned to avoid Reddit bans (HTTP 429/5xx). Claude rate limits are rarer at our default settings.

### How We Protect You

\`\`\`mermaid
graph TD
    Request[API Request] --> Check{Rate OK?}
    
    Check -->|Yes| Allow[Allow Request]
    Check -->|No| Wait[Wait & Retry]
    
    Allow --> Success{Success?}
    Success -->|Yes| Decrease[Reduce Backoff]
    Success -->|No 429| Increase[Increase Backoff]
    
    Increase --> Threshold{Backoff > 30s?}
    Threshold -->|Yes| Open[Open Circuit Breaker]
    Threshold -->|No| Wait
    
    Open --> Sleep[Sleep 2 minutes]
    Sleep --> Close[Close & Retry]
    Close --> Check
    
    Decrease --> Next[Next Request]
    
    style Open fill:#ef4444,stroke:#dc2626,color:#fff
    style Allow fill:#10b981,stroke:#059669,color:#fff
    style Wait fill:#f59e0b,stroke:#d97706,color:#fff
\`\`\`

**What happens**:
1. **First 429 error**: Wait 5 seconds extra
2. **Repeated errors**: Backoff increases (10s, 20s, 30s)
3. **Backoff hits 30s**: Circuit breaker opens, system pauses 2 minutes
4. **After 2 minutes**: Automatically resumes with reduced backoff

**You don't need to do anything** - the system handles this automatically!

---

## Best Practices

### ✅ DO
- Start small (1-2 subreddits)
- Use default settings first
- Aim to keep total Reddit requests under ~10 per minute (e.g. 3–5 subreddits at 30–60s interval)
- Monitor for 15-30 minutes before exporting
- Export data regularly for backup
- Review high-priority insights first

### ❌ DON'T
- Don't set interval below 30 seconds
- Don't monitor 5+ subreddits simultaneously (at first)
- Don't ignore circuit breaker warnings
- Don't leave running indefinitely (export & stop)

---

## Troubleshooting

### "No insights appearing"

**Check**:
1. ✓ Is polling started? (green status)
2. ✓ Are subreddits spelled correctly?
3. ✓ Is circuit breaker open? (wait 2 minutes)
4. ✓ Check browser console for errors

---

### "Too many rate limit errors"

**Fix**:
1. Increase polling interval (2-5 minutes)
2. Reduce post limit (5-10 posts)
3. Monitor fewer subreddits
4. Wait for circuit breaker to reset

---

### "Insights are duplicates"

This shouldn't happen - the system deduplicates by Reddit post ID. If you see duplicates:
1. Check if they're actually different posts with similar content
2. Refresh the page to clear cache
3. Stop and restart monitoring

---

## System Requirements

- **Browser**: Chrome, Firefox, Safari (latest versions)
- **Internet**: Stable connection required
- **Anthropic API Key**: Required for AI insights
- **Convex Project**: Running backend

---

## Getting Started Checklist

- [ ] 1. Open dashboard at \`/dashboard\`
- [ ] 2. Select 1-2 subreddits from dropdown
- [ ] 3. Keep default settings (10 posts, 30s interval)
- [ ] 4. Click "Start Monitoring"
- [ ] 5. Watch for insights (should appear within 1-2 minutes)
- [ ] 6. Review and filter by type/priority
- [ ] 7. Export data when done (CSV button)
- [ ] 8. Click "Stop Monitoring"

---

## Need More Technical Details?

This guide covers the basics. For deep technical documentation:

- **Architecture**: See "Architecture" section
- **API Integration**: See "API Integration" section
- **Component Details**: See "Component Guide" section
- **Troubleshooting**: See "Troubleshooting" section

---

*Last updated: ${new Date().toLocaleDateString()}*
`;
