# Soloist Marketing Dashboard

A marketing research tool that scrapes Reddit for user pain points, competitor mentions, feature requests, and sentiment analysis using Claude Haiku 4.5.

## Features

- **Live Reddit Feed**: Real-time monitoring of marketing-focused subreddits
- **AI-Powered Insights**: Automatic analysis using Claude Haiku 4.5
- **Rate-Limited APIs**: Circuit breaker pattern for Reddit (5s minimum) and Anthropic (1.2s minimum)
- **Indefinite Persistence**: All insights saved to Convex database
- **VS Code-Inspired UI**: Clean, professional interface

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS v4
- **Backend**: Convex (real-time database)
- **AI**: Anthropic Claude Haiku 4.5 (`claude-haiku-4-5-20251001`)
- **State Management**: Zustand
- **APIs**: Reddit (public JSON), Anthropic

## ✅ Implementation Complete

The marketing dashboard is fully operational:

1. ✅ **Reddit Integration**: Proxy API routes bypass CORS
2. ✅ **AI Insights**: Claude Haiku 4.5 analyzes every new post
3. ✅ **Rate Limiting**: Server-side circuit breaker (5s min, 30s threshold)
4. ✅ **Real-time Updates**: Convex database with live sync
5. ✅ **Insight Display**: VS Code-styled LiveFeed sidebar

**How It Works:**
1. Service fetches Reddit posts every 30s from selected subreddits
2. Each new post triggers Claude Haiku 4.5 analysis
3. AI extracts pain points, competitor mentions, features, sentiment
4. Insights appear in real-time in the left sidebar
5. All data persists indefinitely in Convex

## Quick Start

### 1. Install Dependencies

```bash
cd soloist/marketing
pnpm install
```

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Add your Anthropic API key:

```env
ANTHROPIC_API_KEY=your_api_key_here
```

The Convex URL is already configured.

### 3. Start Development Servers

**Terminal 1 - Convex Backend:**
```bash
npx convex dev
```

**Terminal 2 - Next.js Frontend:**
```bash
pnpm dev
```

### 4. Access Dashboard

Open [http://localhost:7342/dashboard](http://localhost:7342/dashboard)

## Usage

1. **Start the Feed**: Click the "Start" button in the Controls panel
2. **Select Subreddits**: Enable/disable subreddits by clicking on them
3. **View Insights**: Marketing insights appear in the left sidebar as they're generated
4. **Monitor Feed**: Posts are fetched every 30 seconds from selected subreddits

## Default Subreddits

- r/Entrepreneur
- r/startups
- r/SaaS
- r/marketing
- r/smallbusiness
- r/business
- r/digitalnomad

## Insight Types

- **Pain Points**: User frustrations and unmet needs
- **Competitor Mentions**: Products/services being discussed
- **Feature Requests**: Desired capabilities
- **Sentiment**: Overall emotional tone

## Rate Limiting

### Reddit API
- **Minimum interval**: 5 seconds between requests
- **Backoff**: +10 seconds on 429 errors
- **Circuit breaker**: Opens at 30 seconds, auto-recovers in 2 minutes
- **Graceful degradation**: Returns empty results when throttled

### Anthropic API
- **Minimum interval**: 1.2 seconds (50 RPM Tier 1)
- **Model**: claude-haiku-4-5-20251001
- **Temperature**: 0.3 (no top_p)
- **Max tokens**: 1024

## Data Persistence

- **Posts**: Cached in `live_feed_posts` table
- **Insights**: Stored in `marketing_insights` table (no session filtering)
- **Controls**: Saved in `studio_controls` table
- **Rate Limits**: Tracked in `rate_limits` table

## Architecture

```
┌─────────────────────────────────────────┐
│           Marketing Dashboard            │
├─────────────────────────────────────────┤
│  ActivityBar │ SidePanel │   Editor     │
│  (4 icons)   │ LiveFeed  │   Controls   │
│              │ Insights  │   (4 cols)   │
└─────────────────────────────────────────┘
        ↓              ↓              ↓
    Zustand      Convex DB      Reddit API
     Store       (Real-time)    (Circuit 
                                 Breaker)
        ↓
  Anthropic API
  (Claude Haiku 4.5)
```

## Components

### Dashboard Layout
- **ActivityBar**: 4 icons (Dashboard, Content, Account, Settings)
- **SidePanel**: Live feed of marketing insights (280px width)
- **Editor**: 4-column Controls panel for subreddit management
- **No Terminal**: Removed for cleaner interface

### Controls Panel (4 columns)
1. **Subreddits (First Half)**: First 4 subreddits with Start/Stop button
2. **Subreddits (Second Half)**: Remaining subreddits
3. **Filters**: Placeholder (Coming Soon)
4. **Analytics**: Placeholder (Coming Soon)

## Project Structure

```
marketing/
├── app/
│   └── dashboard/
│       ├── _components/
│       │   ├── livefeed/
│       │   │   ├── LiveFeed.tsx
│       │   │   └── InsightCard.tsx
│       │   ├── ActivityBar.tsx
│       │   ├── SidePanel.tsx
│       │   ├── Editor.tsx
│       │   └── Controls.tsx
│       └── page.tsx
├── convex/
│   ├── ai/
│   │   └── generateInsight.ts
│   ├── liveFeed.ts
│   ├── insights.ts
│   ├── controls.ts
│   ├── rateLimit.ts
│   └── schema.ts
└── lib/
    ├── reddit/
    │   └── reddit.ts
    └── stores/
        ├── simpleLiveFeedStore.ts
        └── simpleLiveFeedService.ts
```

## Development

### Adding New Subreddits

Edit `app/dashboard/_components/Controls.tsx`:

```typescript
const DEFAULT_SUBREDDITS = [
  'Entrepreneur',
  'your_new_subreddit',
  // ...
];
```

### Customizing AI Prompts

Edit `convex/ai/generateInsight.ts`:

```typescript
const prompt = `You are a marketing research analyst...`;
```

### Scripts

- `pnpm dev` - Start Next.js development server (port 7342)
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `npx convex dev` - Start Convex development server

## Troubleshooting

### Convex Connection Issues
```bash
# Restart Convex dev server
npx convex dev --clear-cache
```

### Rate Limit Errors
- Reddit: Circuit breaker will auto-recover in 2 minutes
- Anthropic: Reduce refresh interval or upgrade to higher tier

### Missing Insights
- Check Anthropic API key in `.env.local`
- Verify subreddits have recent posts
- Check browser console for errors

## Future Enhancements

- [ ] Custom subreddit input
- [ ] Insight filters by type/sentiment
- [ ] Export insights to CSV
- [ ] Analytics dashboard
- [ ] Webhook notifications
- [ ] Multi-language support

## License

MIT
