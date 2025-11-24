# Marketing Controls

Refined control panel design for Soloist Marketing dashboard, following SMNB patterns.

## Location
`/app/dashboard/controls/Controls.tsx`

## Structure

```
controls/
├── Controls.tsx              # Main control panel component
└── _components/
    ├── index.ts              # Component exports
    ├── types.ts              # Shared TypeScript types
    ├── SubredditManager.tsx  # 2-column subreddit selector
    └── PlaceholderPanel.tsx  # Generic placeholder for future features
```

## Features

### Current
- ✅ **Collapsible Panel** - Minimize/maximize with header buttons
- ✅ **Live Feed Toggle** - Start/stop Reddit feed with visual indicators
- ✅ **Subreddit Manager** - 2-column layout with 14 available sources
- ✅ **Visual Status** - Color-coded indicators (green = selected, gray = available)
- ✅ **Stats Display** - Feed count and active sources
- ✅ **Responsive Grid** - 4-column layout (2 for subreddits, 2 for placeholders)

### Placeholders (Coming Soon)
- 🔜 **Filters** - Content filtering options
- 🔜 **Analytics** - Performance metrics

## Design System

Following SMNB patterns:
- **Spacing**: `py-1.25` (5px) for row consistency
- **Typography**: `text-xs` (12px) for density
- **Colors**: 
  - Active: `bg-green-500/20` with `text-green-400`
  - Inactive: `bg-[#0d0d0d]` with `text-muted-foreground/50`
  - Borders: `border-border/40` (40% opacity)
- **Status Dots**: `w-2 h-2 rounded-full` with color-coded backgrounds

## Usage

```tsx
import Controls from '@/app/dashboard/controls/Controls';

<Controls />
```

## State Management

Uses `useSimpleLiveFeedStore` from `/lib/stores/simpleLiveFeedStore`:
- `isLive` - Feed status
- `selectedSubreddits` - Active sources
- `posts` - Current feed items
- `setIsLive()` - Toggle feed
- `setSelectedSubreddits()` - Update sources

## Default Subreddits

14 marketing-focused subreddits:
- Entrepreneur, startups, SaaS, marketing
- smallbusiness, EntrepreneurRideAlong, growmybusiness
- venturecapital, business, ecommerce
- DigitalMarketing, SEO, socialmedia, content_marketing
