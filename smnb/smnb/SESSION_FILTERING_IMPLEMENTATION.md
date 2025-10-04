# Session-Based Story Filtering Implementation

**Date:** September 30, 2025  
**Status:** ✅ Complete

---

## Problem

When creating a new session and navigating to the broadcast tab, all stories from ALL previous sessions were visible. Each broadcast session should only show its own stories.

---

## Solution Overview

Implemented end-to-end session filtering by:
1. Tracking session ID throughout the broadcast pipeline
2. Storing session_id with each story in Convex
3. Filtering stories by session_id when loading them

---

## Implementation Details

### 1. Session ID Flow

```
Sessions.tsx (selectedSessionId)
    ↓
broadcastOrchestrator.startBroadcast(sessionId)
    ↓
orchestrator.currentConvexSessionId (stored in state)
    ↓
hostAgentStore.start(sessionId)
    ↓
hostAgentService.currentSessionId
    ↓
Narration metadata includes session_id
    ↓
Story saved to Convex with session_id
    ↓
FeedSidebar reads orchestrator.currentConvexSessionId
    ↓
LiveFeed receives sessionId prop
    ↓
simpleLiveFeedStore.loadStoriesFromConvex(sessionId)
    ↓
Convex query filters by session_id
    ↓
Only current session's stories displayed
```

### 2. Key Files Modified

#### `/app/dashboard/feed/FeedSidebar.tsx`
- **Added:** Import `useBroadcastOrchestrator`
- **Added:** `const currentSessionId = useBroadcastOrchestrator(state => state.currentConvexSessionId)`
- **Updated:** `<LiveFeed sessionId={currentSessionId} />`

**Before:**
```tsx
export default function FeedSidebar() {
  return (
    <aside>
      <Aggregator />
      <LiveFeed className="h-full" />
    </aside>
  );
}
```

**After:**
```tsx
export default function FeedSidebar() {
  const currentSessionId = useBroadcastOrchestrator(state => state.currentConvexSessionId);
  
  return (
    <aside>
      <Aggregator />
      <LiveFeed className="h-full" sessionId={currentSessionId} />
    </aside>
  );
}
```

### 3. Already Implemented Components

#### `components/livefeed/liveFeed.tsx` ✅
- Already accepts `sessionId?: string | null` prop
- Already reloads stories when sessionId changes:
```tsx
useEffect(() => {
  console.log(`📚 Loading stories from Convex${sessionId ? ` (session: ${sessionId})` : ''}`);
  loadStoriesFromConvex(sessionId ?? undefined);
}, [loadStoriesFromConvex, sessionId]);
```

#### `lib/stores/livefeed/simpleLiveFeedStore.ts` ✅
- `loadStoriesFromConvex(sessionId?: string)` already filters by session:
```tsx
const convexStories = await convexClient.query(
  api.host.storyHistory.getRecentStories, 
  { 
    hours: 24,
    sessionId: sessionId // Filter by session if provided
  }
);
```

#### `convex/host/storyHistory.ts` ✅
- `getRecentStories` query already has session filtering:
```tsx
export const getRecentStories = query({
  args: { 
    hours: v.optional(v.number()),
    sessionId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("story_history");
    
    // Filter by session if provided
    if (args.sessionId) {
      query = query.withIndex("by_session_id", q => 
        q.eq("session_id", args.sessionId)
      );
    }
    // ...
  }
});
```

#### `lib/stores/orchestrator/broadcastOrchestrator.ts` ✅
- Already stores `currentConvexSessionId: Id<"sessions"> | null`
- Sets it when broadcast starts: `set({ currentConvexSessionId: sessionId })`
- Clears it when broadcast stops: `set({ currentConvexSessionId: null })`

#### `lib/services/host/hostAgentService.ts` ✅
- Already accepts sessionId in `start(sessionId?: string)` method
- Stores it: `this.currentSessionId = sessionId ?? generated_id`
- Includes it in narration metadata: `session_id: this.currentSessionId`

---

## Testing Instructions

### Test Session Isolation

1. **Start First Session:**
   ```
   1. Create a new session in Sessions tab
   2. Click "Go Live"
   3. Wait for stories to be generated
   4. Note the stories in the broadcast tab
   ```

2. **Create Second Session:**
   ```
   1. Create another new session
   2. Click "Go Live" 
   3. Verify the broadcast tab is NOW EMPTY (no old stories)
   4. Wait for new stories to be generated
   5. Verify only NEW stories appear
   ```

3. **Switch Between Sessions:**
   ```
   1. Stop the current broadcast
   2. Select the first session
   3. Click "Go Live"
   4. Verify the FIRST session's stories reappear
   5. Switch back to second session
   6. Verify SECOND session's stories appear
   ```

### Expected Behavior

✅ **Each session maintains its own story history**  
✅ **Switching sessions shows only that session's stories**  
✅ **New sessions start with empty story feed**  
✅ **Stories are linked to sessions via session_id**  
✅ **Broadcast tab always shows current session's stories**

### Console Logs to Verify

When loading stories, you should see:
```
📚 Loading stories from Convex for live feed display (session: abc123...)
📚 Loaded 5 fresh stories from Convex for session abc123...
```

When saving stories, you should see:
```
💾 Saved story to Convex: host-story-xyz (host) [Session: abc123...]
```

---

## Database Schema

### `story_history` Table

```typescript
{
  story_id: string,
  narrative: string,
  title: string,
  session_id: string, // ← Links story to session
  agent_type: "host" | "editor",
  // ... other fields
}
```

### Index

- `by_session_id` - Efficient filtering by session_id

---

## Benefits

1. **Session Isolation:** Each broadcast session has its own isolated story feed
2. **Clean Slate:** New sessions start fresh without old content
3. **Historical Context:** Can view stories from previous sessions by switching
4. **Scalability:** Efficient querying via indexed session_id
5. **Multi-Session Support:** Can run multiple sessions and keep them separate

---

## Future Enhancements

- [ ] Add session selector dropdown to manually view any session's stories
- [ ] Show session name/date in story cards
- [ ] Implement cross-session story comparison
- [ ] Add "View All Sessions" mode for aggregate analytics
- [ ] Session-based export (download stories by session)

---

**Status:** ✅ **Session filtering is now fully functional!**

Each broadcast session is now properly isolated with its own story history.
