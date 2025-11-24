export const overviewContent = `# Live Feed & Controls System
## Marketing Dashboard - System Overview

---

## Introduction

The **Live Feed and Controls System** is a production-ready marketing intelligence platform that monitors Reddit in real-time, generates AI-powered insights using Claude Haiku 4.5, and displays them in a professional VS Code-inspired dashboard.

### Key Features

- ✅ **Real-time Reddit monitoring** across multiple subreddits
- ✅ **AI-powered insight generation** with Claude Haiku 4.5
- ✅ **Convex real-time synchronization** via WebSocket subscriptions
- ✅ **Circuit breaker rate limiting** for resilient API integration
- ✅ **VS Code-inspired dark theme** for professional UI
- ✅ **Full TypeScript coverage** for type safety

---

## Quick Start

### Prerequisites

\`\`\`bash
# Required
Node.js 18+ with pnpm
Convex account and deployment
Anthropic API key (Claude access)
\`\`\`

### Environment Setup

Create a \`.env.local\` file:

\`\`\`env
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxx
\`\`\`

### Installation

\`\`\`bash
cd /Users/matthewsimon/Projects/acdc-digital/soloist/marketing
pnpm install
pnpm run dev
\`\`\`

### Access

Navigate to \`http://localhost:3000/dashboard\` and click **Start Feed**.

---

## System Architecture

\`\`\`mermaid
graph TB
    subgraph "Presentation Layer"
        Controls[Controls Component]
        LiveFeed[LiveFeed Component]
        InsightCard[InsightCard Component]
    end
    
    subgraph "State Management"
        Store[Zustand Store]
        Service[LiveFeed Service]
    end
    
    subgraph "API Layer"
        RedditAPI[Reddit API Proxy]
        ConvexAPI[Convex Backend]
        AnthropicAPI[Anthropic Claude]
    end
    
    subgraph "Persistence"
        DB[(Convex Database)]
    end
    
    Controls -->|Toggle Feed| Service
    Service -->|Fetch Posts| RedditAPI
    Service -->|Update State| Store
    Service -->|Generate Insights| ConvexAPI
    ConvexAPI -->|Call AI| AnthropicAPI
    Store -->|Render| LiveFeed
    LiveFeed -->|Display| InsightCard
    ConvexAPI -->|Save| DB
    DB -->|Real-time Sync| LiveFeed
\`\`\`

---

## Core Components

### 1. **Controls.tsx**
- Subreddit selection (7 default subreddits)
- Start/Stop feed toggle
- Visual status indicators
- Placeholder for filters and analytics

### 2. **LiveFeed.tsx**
- Real-time insight display via Convex \`useQuery\`
- Auto-updating sidebar (280px wide)
- Insight card rendering
- WebSocket synchronization

### 3. **InsightCard.tsx**
- Type-specific icons and colors
- Priority flags (high/medium/low)
- Sentiment badges (positive/negative/neutral)
- Bookmark functionality
- Reddit link navigation

### 4. **simpleLiveFeedStore.ts**
- Zustand state management
- Post and insight history
- Feed control state
- Error handling

### 5. **simpleLiveFeedService.ts**
- Singleton polling service
- 30-second fetch intervals
- Deduplication with Set
- AI insight triggers

---

## Data Flow

1. **User clicks "Start Feed"** → Controls.tsx
2. **Service starts interval** → liveFeedService.start()
3. **Fetch from Reddit** → redditAPI.fetchHotPosts()
4. **Proxy through Next.js** → /api/reddit route
5. **Add posts to store** → store.addPost()
6. **Generate AI insights** → Convex action (Claude Haiku)
7. **Save to database** → marketing_insights table
8. **Real-time sync** → LiveFeed.tsx useQuery hook
9. **Render insights** → InsightCard components

---

## Key Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | React framework | 15.2.3 |
| **Convex** | Real-time database | 1.23.0 |
| **Zustand** | State management | 5.0.8 |
| **Anthropic** | Claude AI | 0.68.0 |
| **Lucide React** | Icons | 0.541.0 |

---

## Rate Limiting Strategy

### Reddit API
- **Circuit breaker**: Opens at 30s backoff
- **Reset time**: 2 minutes
- **Exponential backoff**: +10s per 429 error
- **Global singleton**: Shared across requests

### Anthropic API
- **Tier 1**: 50 requests per minute
- **Min interval**: 1.2 seconds between calls
- **Tracking**: In-memory timestamp

---

## File Structure

\`\`\`
soloist/marketing/
├── app/
│   ├── dashboard/
│   │   ├── _components/
│   │   │   ├── Controls.tsx           # Feed controls
│   │   │   ├── LiveFeed.tsx          # Real-time insights
│   │   │   ├── InsightCard.tsx       # Individual card
│   │   │   └── index.ts              # Exports
│   │   └── page.tsx                  # Dashboard layout
│   ├── api/
│   │   └── reddit/
│   │       └── route.ts              # CORS proxy + rate limiter
│   └── wiki/                         # Documentation (you are here)
├── lib/
│   ├── stores/
│   │   ├── simpleLiveFeedStore.ts    # Zustand store
│   │   └── simpleLiveFeedService.ts  # Polling service
│   └── api/
│       └── reddit.ts                 # Reddit API client
├── convex/
│   ├── schema.ts                     # 4 tables
│   ├── insights.ts                   # Mutations/queries
│   ├── posts.ts                      # Post storage
│   └── ai/
│       └── generateInsight.ts        # Claude Haiku action
└── package.json
\`\`\`

---

## Next Steps

- 📖 **[Architecture](architecture)** - Detailed system design
- 🧩 **[Components](components)** - Component API reference
- 💾 **[State Management](state-management)** - Zustand patterns
- ⚡ **[API Integration](api-integration)** - Reddit + Claude + Convex
- 🚀 **[Deployment](deployment)** - Production guide
- 🔧 **[Troubleshooting](troubleshooting)** - Common issues

---

## Support

For issues or questions, refer to the troubleshooting guide or contact the development team.

**Last Updated**: ${new Date().toLocaleDateString()}
`;
