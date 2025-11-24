export const componentsContent = `# Component Reference
## Complete Component API Documentation

---

## Component Hierarchy

\`\`\`
Dashboard (page.tsx)
├── ActivityBar
├── Editor
│   └── Controls (bottom panel)
└── SidePanel
    └── LiveFeed
        └── InsightCard[] (multiple)
\`\`\`

---

## Controls Component

**File**: \`app/dashboard/_components/Controls.tsx\`

### Purpose
Feed control panel for starting/stopping live feed and selecting subreddits.

### Props
None (uses Zustand store directly)

### State Dependencies
\`\`\`typescript
const {
  isLive,
  selectedSubreddits,
  setSelectedSubreddits,
  setIsLive
} = useSimpleLiveFeedStore();
\`\`\`

### Key Functions

#### \`handleStartStop()\`
\`\`\`typescript
const handleStartStop = () => {
  if (isLive) {
    liveFeedService.stop();
    setIsLive(false);
  } else {
    setIsLive(true);
    liveFeedService.start();
  }
};
\`\`\`

**Behavior**:
- Toggles \`isLive\` boolean
- Calls service start/stop methods
- Updates button UI (green → red)

#### \`toggleSubreddit(subreddit: string)\`
\`\`\`typescript
const toggleSubreddit = (subreddit: string) => {
  if (selectedSubreddits.includes(subreddit)) {
    setSelectedSubreddits(selectedSubreddits.filter(s => s !== subreddit));
  } else {
    setSelectedSubreddits([...selectedSubreddits, subreddit]);
  }
};
\`\`\`

**Behavior**:
- Add/remove subreddit from array
- Maintains immutability
- Updates UI indicators

### Default Subreddits
\`\`\`typescript
const DEFAULT_SUBREDDITS = [
  'Entrepreneur',
  'startups',
  'SaaS',
  'marketing',
  'smallbusiness',
  'EntrepreneurRideAlong',
  'growmybusiness'
];
\`\`\`

### UI Structure
\`\`\`tsx
<div className="bg-[#1e1e1e] border-t border-[#2d2d2d]">
  {/* Header Row */}
  <div className="flex items-center justify-between">
    <h3>Control Panel</h3>
    <button onClick={handleStartStop}>
      {isLive ? 'Stop Feed' : 'Start Feed'}
    </button>
  </div>

  {/* Subreddit Selection Grid */}
  <div className="grid grid-cols-4 gap-2">
    {DEFAULT_SUBREDDITS.map(subreddit => (
      <button onClick={() => toggleSubreddit(subreddit)}>
        {subreddit}
      </button>
    ))}
  </div>

  {/* Coming Soon Placeholders */}
  <div className="grid grid-cols-2 gap-4">
    <div>Filters - Coming Soon</div>
    <div>Analytics - Coming Soon</div>
  </div>
</div>
\`\`\`

### Styling
- **Background**: \`#1e1e1e\` (VS Code panel)
- **Border**: \`#2d2d2d\` (subtle divider)
- **Active button**: Green (\`bg-green-500/20\`)
- **Inactive button**: Gray (\`bg-[#0d0d0d]\`)
- **Live indicator**: Pulsing dot

---

## LiveFeed Component

**File**: \`app/dashboard/_components/LiveFeed.tsx\`

### Purpose
Real-time insight display with Convex synchronization.

### Props
None (uses Convex \`useQuery\` hook)

### Data Source
\`\`\`typescript
const convexInsights = useQuery(api.insights.getAllInsights, {});
\`\`\`

**Key Features**:
- WebSocket subscription
- Auto-updates on new insights
- No manual refresh needed

### State Management
\`\`\`typescript
const [localInsights, setLocalInsights] = useState<MarketingInsight[]>([]);

useEffect(() => {
  if (convexInsights) {
    const mapped = convexInsights.map(ci => ({
      id: ci.insight_id,
      narrative: ci.narrative,
      insight_type: ci.insight_type,
      priority: ci.priority,
      sentiment: ci.sentiment,
      topics: ci.topics,
      summary: ci.summary,
      postTitle: ci.postTitle,
      postUrl: ci.postUrl,
      subreddit: ci.subreddit,
      timestamp: ci._creationTime,
    }));
    setLocalInsights(mapped);
  }
}, [convexInsights]);
\`\`\`

### UI Structure
\`\`\`tsx
<div className="w-[280px] h-full bg-[#1e1e1e] border-r border-[#2d2d2d]">
  {/* Header */}
  <div className="border-b border-[#2d2d2d] px-3 py-2">
    <h2>Live Feed</h2>
    <p>{localInsights.length} insights</p>
  </div>

  {/* Insights List */}
  <div className="overflow-y-auto">
    {localInsights.map(insight => (
      <InsightCard key={insight.id} insight={insight} />
    ))}
  </div>
</div>
\`\`\`

### Empty State
\`\`\`tsx
{localInsights.length === 0 && (
  <div className="flex flex-col items-center justify-center h-full">
    <Zap className="w-12 h-12 text-muted-foreground/30" />
    <p>Start the feed to see insights</p>
  </div>
)}
\`\`\`

---

## InsightCard Component

**File**: \`app/dashboard/_components/InsightCard.tsx\`

### Purpose
Display individual marketing insight with metadata.

### Props
\`\`\`typescript
interface InsightCardProps {
  insight: MarketingInsight;
}

interface MarketingInsight {
  id: string;
  narrative: string;
  insight_type: 'pain_point' | 'competitor_mention' | 'feature_request' | 'sentiment';
  priority: 'high' | 'medium' | 'low';
  sentiment: 'positive' | 'negative' | 'neutral';
  topics: string[];
  summary: string;
  postTitle?: string;
  postUrl: string;
  subreddit: string;
  timestamp: number;
}
\`\`\`

### Type Icons
\`\`\`typescript
const TYPE_ICONS = {
  pain_point: <AlertCircle className="w-4 h-4 text-red-400" />,
  competitor_mention: <Users className="w-4 h-4 text-blue-400" />,
  feature_request: <Lightbulb className="w-4 h-4 text-yellow-400" />,
  sentiment: <TrendingUp className="w-4 h-4 text-green-400" />,
};
\`\`\`

### Priority Colors
\`\`\`typescript
const PRIORITY_COLORS = {
  high: 'text-red-500',
  medium: 'text-yellow-500',
  low: 'text-blue-500',
};
\`\`\`

### Sentiment Badges
\`\`\`typescript
const SENTIMENT_COLORS = {
  positive: 'bg-green-500/20 text-green-400 border-green-500/30',
  negative: 'bg-red-500/20 text-red-400 border-red-500/30',
  neutral: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};
\`\`\`

### UI Structure
\`\`\`tsx
<div className="border border-border/40 rounded-sm p-3 hover:border-border/60">
  {/* Header */}
  <div className="flex items-start justify-between mb-2">
    <div className="flex items-center gap-2">
      {TYPE_ICONS[insight.insight_type]}
      <span className="text-xs text-muted-foreground">
        {insight.insight_type.replace('_', ' ')}
      </span>
    </div>
    <div className="flex items-center gap-1">
      <Flag className={PRIORITY_COLORS[insight.priority]} />
      <Bookmark className="w-3 h-3 cursor-pointer" />
    </div>
  </div>

  {/* Title (if available) */}
  {insight.postTitle && (
    <h3 className="text-sm font-medium text-white mb-1">
      {insight.postTitle}
    </h3>
  )}

  {/* Narrative */}
  <p className="text-xs text-gray-300 mb-2 line-clamp-3">
    {insight.narrative}
  </p>

  {/* Topics */}
  <div className="flex flex-wrap gap-1 mb-2">
    {insight.topics.slice(0, 3).map(topic => (
      <span className="px-1.5 py-0.5 bg-[#252526] text-[10px] text-gray-400 rounded">
        {topic}
      </span>
    ))}
  </div>

  {/* Footer */}
  <div className="flex items-center justify-between text-[10px]">
    <span className={SENTIMENT_COLORS[insight.sentiment]}>
      {insight.sentiment}
    </span>
    <div className="flex items-center gap-2 text-muted-foreground">
      <Clock className="w-3 h-3" />
      <span>{formatTimestamp(insight.timestamp)}</span>
      <a href={insight.postUrl} target="_blank" className="text-[#007acc]">
        r/{insight.subreddit}
      </a>
    </div>
  </div>
</div>
\`\`\`

### Helper Functions

#### \`formatTimestamp(timestamp: number)\`
\`\`\`typescript
function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return \`\${minutes}m ago\`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return \`\${hours}h ago\`;
  
  const days = Math.floor(hours / 24);
  return \`\${days}d ago\`;
}
\`\`\`

#### \`handleBookmark()\`
\`\`\`typescript
const handleBookmark = () => {
  // Future: Save to bookmarks collection
  console.log('Bookmarked:', insight.id);
};
\`\`\`

---

## Component Communication

### 1. Controls → Service
\`\`\`typescript
// Controls.tsx
liveFeedService.start(); // Direct call
\`\`\`

### 2. Service → Store
\`\`\`typescript
// simpleLiveFeedService.ts
store.addPost(post); // Store action
store.addInsight(insight); // Store action
\`\`\`

### 3. Store → Components
\`\`\`typescript
// Any component
const { posts, isLive } = useSimpleLiveFeedStore();
// Auto-rerenders on state change
\`\`\`

### 4. Convex → LiveFeed
\`\`\`typescript
// LiveFeed.tsx
const convexInsights = useQuery(api.insights.getAllInsights);
// Auto-updates via WebSocket
\`\`\`

---

## Styling System

### Color Palette
\`\`\`css
--background: #1e1e1e      /* Main background */
--foreground: #cccccc      /* Primary text */
--card: #252526            /* Elevated surfaces */
--border: #2d2d2d          /* Dividers */
--primary: #007acc         /* VS Code blue */
--muted-foreground: #858585 /* Secondary text */
--destructive: #f14c4c     /* Error red */
--success: #89d185         /* Success green */
\`\`\`

### Spacing Scale
- \`px-1\` = 4px
- \`px-2\` = 8px
- \`px-3\` = 12px
- \`px-4\` = 16px
- \`py-1.5\` = 6px
- \`gap-2\` = 8px

### Border Radius
- \`rounded-sm\` = 2px (cards, buttons)
- \`rounded\` = 4px (badges)
- \`rounded-lg\` = 8px (panels)
- \`rounded-full\` = 9999px (indicators)

---

## Accessibility

### Keyboard Navigation
- ✅ All buttons focusable with Tab
- ✅ Enter/Space activate buttons
- ⚠️ ARIA labels missing (future enhancement)

### Screen Readers
- ⚠️ No \`aria-label\` on icon buttons
- ⚠️ No \`role\` attributes
- 🔄 Future: Add semantic HTML5 tags

### Color Contrast
- ✅ WCAG AA compliant
- Text on \`#1e1e1e\`: Contrast ratio 7:1
- Buttons: Minimum 4.5:1

---

## Performance Optimizations

### 1. React.memo
\`\`\`typescript
export default React.memo(InsightCard, (prev, next) => {
  return prev.insight.id === next.insight.id;
});
\`\`\`

### 2. Virtualization
Not implemented (future enhancement for 100+ insights)

### 3. Debouncing
\`\`\`typescript
// Animation cleanup debounced to 2s
setTimeout(() => {
  setIsNew(false);
}, 2000);
\`\`\`

---

## Testing Guidelines

### Unit Tests
\`\`\`typescript
describe('Controls', () => {
  it('should toggle subreddit selection', () => {
    render(<Controls />);
    const button = screen.getByText('Entrepreneur');
    fireEvent.click(button);
    expect(button).toHaveClass('bg-green-500/20');
  });
});
\`\`\`

### Integration Tests
\`\`\`typescript
describe('LiveFeed', () => {
  it('should display insights from Convex', async () => {
    mockConvexQuery([mockInsight]);
    render(<LiveFeed />);
    await waitFor(() => {
      expect(screen.getByText(mockInsight.narrative)).toBeInTheDocument();
    });
  });
});
\`\`\`

---

## Future Enhancements

- [ ] Virtual scrolling for 1000+ insights
- [ ] Insight filtering by type/priority/sentiment
- [ ] Bookmark persistence to Convex
- [ ] Export insights to CSV/JSON
- [ ] Real-time analytics dashboard
- [ ] Custom subreddit input
- [ ] Insight search functionality

---

Continue to:
- 💾 **[State Management](state-management)** - Zustand patterns
- ⚡ **[API Integration](api-integration)** - Integration details
`;
