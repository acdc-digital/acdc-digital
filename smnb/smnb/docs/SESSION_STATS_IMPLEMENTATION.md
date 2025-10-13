# Session Statistics Implementation

## Overview
Implemented real-time session statistics tracking to display accurate story counts, token usage, and costs in the Sessions manager tab.

## Changes Made

### 1. Convex Query (`convex/users/sessions.ts`)
Added `getSessionStats` query that aggregates statistics for a specific session:

```typescript
export const getSessionStats = query({
  args: { id: v.id("sessions") },
  returns: v.union(
    v.object({
      storyCount: v.number(),
      totalTokens: v.number(),
      inputTokens: v.number(),
      outputTokens: v.number(),
      totalCost: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    // Authenticates user and verifies session ownership
    // Queries story_history table (indexed by session_id) to count stories
    // Queries token_usage table (indexed by session_id) to sum tokens and costs
    // Returns aggregated statistics
  },
});
```

**Key Features:**
- Uses indexed queries for performance (`by_session_id` index)
- Aggregates data from `story_history` and `token_usage` tables
- Authenticates and verifies user owns the session
- Returns null if session not found or unauthorized

### 2. UI Updates (`app/dashboard/studio/sessions/Sessions.tsx`)

**Added Query Hook:**
```typescript
const sessionStats = useQuery(
  api.users.sessions.getSessionStats,
  selectedSessionId && isAuthenticated ? { id: selectedSessionId } : "skip"
);
```

**Updated Session Overview Section:**
- **Tokens**: `{sessionStats?.totalTokens.toLocaleString() ?? "0"}` (with thousands separator)
- **Stories**: `{sessionStats?.storyCount ?? 0}`
- **Cost**: `${(sessionStats?.totalCost ?? 0).toFixed(4)}` (4 decimal places for precision)

**Updated Performance Metrics Section:**
- Replaced hardcoded "Messages: 0" with "Stories: {sessionStats?.storyCount ?? 0}"
- Replaced hardcoded "Tokens: 0" with formatted token count
- Replaced hardcoded "Session Duration: 00:00:00" with "Total Cost: ${cost}"

## Database Schema

### Relevant Tables:
1. **`story_history`** (line 215 in schema.ts)
   - `session_id: v.optional(v.string())` - Links stories to sessions
   - Indexed: `.index("by_session_id", ["session_id"])`
   - Contains: narrative, title, tone, priority, word_count, duration, etc.

2. **`token_usage`** (line 9 in schema.ts)
   - `session_id: v.optional(v.string())` - Links token records to sessions
   - Indexed: `.index("by_session_id", ["session_id"])`
   - Contains: input_tokens, output_tokens, total_tokens, estimated_cost

3. **`sessions`** (line 1130 in schema.ts)
   - Does NOT store aggregated stats (by design)
   - Stats calculated on-demand via queries
   - Contains: userId, name, settings, broadcast state, duration tracking

## Real-Time Updates

The query automatically reactively updates when:
- New stories are created and linked to the session
- Token usage records are added with the session_id
- User switches between sessions (query re-runs with new session ID)

## Implementation Notes

### Session ID Handling
- Sessions table uses `Id<"sessions">` type
- Both `story_history` and `token_usage` store session_id as `string`
- Query converts `Id<"sessions">` to string for comparison
- This works because Convex IDs are stored as strings internally

### Cost Display
- Uses 4 decimal places (`toFixed(4)`) for precision
- Claude API costs are typically very small (fractions of cents)
- Example: $0.0012 for a typical narration request

### Loading States
- Uses nullish coalescing (`??`) to show "0" during loading
- No loading spinner needed (instant fallback to zero)
- Query automatically skips when no session selected

## Testing Checklist

To verify the implementation works:

1. **Start a broadcast session**
   - Session stats should start at 0
   
2. **Generate stories**
   - Story count should increment with each story
   - Token count should increase
   - Cost should accumulate

3. **Switch sessions**
   - Stats should update to show selected session's data
   - Each session maintains independent stats

4. **Create new session**
   - New session should show 0 for all stats
   - Old session stats should be preserved

5. **Check real-time updates**
   - Stats update automatically (Convex reactive queries)
   - No manual refresh needed

## Performance Considerations

- Indexed queries ensure fast lookups even with large datasets
- Aggregation happens on-demand (not stored, computed fresh each time)
- For sessions with thousands of stories/tokens, consider pagination or caching
- Current implementation is suitable for typical session sizes (hundreds of items)

## Future Enhancements

Potential improvements:
1. Add breakdown by story tone or priority
2. Display token efficiency metrics (tokens per story)
3. Show cost per story
4. Add time-based analytics (stories per hour, cost per hour)
5. Implement caching for very large sessions
6. Add message count (currently hardcoded to 0)
