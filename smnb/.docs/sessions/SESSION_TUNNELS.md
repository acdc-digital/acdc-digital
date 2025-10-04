# SMNB Session Tunneling Architecture

## Executive Summary

This document outlines the **session tunneling problem** in the SMNB broadcast application, where session IDs need to flow consistently from the Session Manager through all broadcast components (Live Feed, Host/Narrator, Producer, and analytics). Currently, sessions are **splitting and leaking** across component boundaries, causing story/metric attribution issues.

---

## 📋 Table of Contents

1. [Current Architecture Overview](#current-architecture-overview)
2. [The Session Tunneling Problem](#the-session-tunneling-problem)
3. [Current Session Flow (Broken)](#current-session-flow-broken)
4. [Root Causes of Session Splits](#root-causes-of-session-splits)
5. [Proposed Solution: Unified Session Tunnel](#proposed-solution-unified-session-tunnel)
6. [Implementation Plan](#implementation-plan)
7. [Session Stats Integration](#session-stats-integration)
8. [Verification & Testing](#verification--testing)

---

## 1. Current Architecture Overview

### Application Structure

```
Activity Bar (Left Navigation)
├── i.   Session Manager       ← 🎯 Session Control Center
├── ii.  Broadcast Center      ← Broadcast UI (Host/Producer display)
├── iii. Live Stats            ← Analytics Dashboard
├── iv.  Insight Market        ← Keyword/Trends
├── v.   Keyword Drafting      ← Content Generation
├── vi.  Docs                  ← Documentation
├── vii. User Settings         ← User Preferences
└── viii. Settings             ← App Configuration
```

### Key Components

1. **Session Manager** (`/dashboard/studio/sessions/Sessions.tsx`)
   - Creates and manages Convex `sessions` records
   - User selects a session from the list
   - Displays Session Overview Panel with live stats
   - Contains "Go Live" button to start broadcast

2. **Broadcast Orchestrator** (`/lib/stores/orchestrator/broadcastOrchestrator.ts`)
   - Central FSM (Finite State Machine) for broadcast lifecycle
   - States: `idle → initializing → ready → starting → live → stopping → idle`
   - Coordinates: Host Agent, Producer, Live Feed, Broadcast Session Timer
   - **Stores**: `currentConvexSessionId` (the session being broadcast)

3. **Host Agent** (`/lib/stores/host/hostAgentStore.ts`)
   - Processes Reddit posts into narrations/stories
   - **Should link stories to session** via `session_id` field
   - Currently has `currentSessionId` but **not always set correctly**

4. **Live Feed** (`/components/livefeed/liveFeed.tsx`)
   - Displays stories from `story_history` table
   - **Takes `sessionId` prop** to filter stories by session
   - Currently receives session from `useBroadcastOrchestrator(state => state.currentConvexSessionId)`

5. **Producer** (`/lib/stores/producer/producerStore.ts`)
   - Aggregates Reddit posts from multiple sources
   - Feeds posts to Host Agent for narration
   - **Does NOT currently track session**

---

## 2. The Session Tunneling Problem

### What is "Session Tunneling"?

**Session tunneling** refers to the challenge of maintaining a single, consistent session context as data flows through multiple asynchronous services and components. Like a tunnel that must remain structurally sound from entrance to exit, the session ID must travel intact through:

```
User Action → Orchestrator → Host Agent → Story Creation → Database → Live Feed Display
     ↓              ↓              ↓              ↓              ↓              ↓
Session Selected  Session Set   Session Used   Session Saved  Session Indexed Session Filtered
```

### Current Problems

#### Problem 1: **Session ID Not Propagated to Host Agent**

```typescript
// In Sessions.tsx - When starting broadcast:
await startBroadcast(selectedSessionId ?? undefined);

// In broadcastOrchestrator.ts - Host agent start:
await hostStore.start(sessionId ?? undefined);
```

**Issue**: The `sessionId` is passed to `hostStore.start()`, but the Host Agent may not reliably:
1. Store it in `currentSessionId`
2. Include it in story generation calls to Convex
3. Pass it to the `story_history` table when creating stories

**Symptom**: Stories created during a broadcast are **not linked to the session**, so:
- Live Feed shows stories from ALL sessions (not just current one)
- Session stats don't reflect current session's activity
- Switching sessions doesn't update the Live Feed properly

#### Problem 2: **Multiple Session ID Storage Locations**

Currently, session IDs exist in **4 different places**:

| Location | Purpose | Scope |
|----------|---------|-------|
| `useBroadcastOrchestrator.currentConvexSessionId` | Current broadcast session | Global (orchestrator) |
| `useHostAgentStore.currentSessionId` | Host's active session | Global (host store) |
| `useBroadcastSessionStore.currentSession.id` | Timer session ID | Global (session timer) |
| Convex `sessions` table record | Database record | Persistent |

**Issue**: These can become **out of sync**, leading to:
- Host processes posts but doesn't tag them with session
- Stories saved without `session_id` field
- Live Feed can't filter by session (shows everything)
- Session stats pull data from wrong session

#### Problem 3: **Live Feed Not Receiving Session Context**

```typescript
// In FeedSidebar.tsx
const currentSessionId = useBroadcastOrchestrator(state => state.currentConvexSessionId);

// Passed to LiveFeed component
<LiveFeed sessionId={currentSessionId} />
```

**Issue**: Even when `currentSessionId` is set correctly:
1. Stories in `story_history` table may not have `session_id` set
2. The `loadStoriesFromConvex()` function filters by `session_id`, but if stories don't have it, they won't show up
3. Result: Live Feed appears empty even though stories exist

#### Problem 4: **Session Stats Not Updated During Broadcast**

The Session Overview panel shows:
- **Tokens** - from `sessionStats.totalTokens`
- **Stories** - from `sessionStats.storyCount`
- **Cost** - from `sessionStats.totalCost`
- **Duration** - from local timer (working correctly)
- **Feed** - ❌ NOT CURRENTLY SHOWN
- **Queue** - ❌ NOT CURRENTLY SHOWN

**Issue**: These stats query the database, but if stories aren't linked to the session:
- `storyCount` remains at 0
- `totalTokens` doesn't increase
- `totalCost` doesn't reflect AI usage
- User has no visibility into queue/feed size

---

## 3. Current Session Flow (Broken)

### Visualization of Broken Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SESSION MANAGER                               │
│  User selects Session A (ID: sess_abc123)                           │
│  Clicks "Go Live" button                                            │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BROADCAST ORCHESTRATOR                            │
│  Sets: currentConvexSessionId = "sess_abc123"                       │
│  Calls: startBroadcast(sessionId: "sess_abc123")                    │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                ┌───────────┴──────────┐
                ▼                      ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│      HOST AGENT          │  │     PRODUCER             │
│                          │  │                          │
│ ✅ start(sessionId)      │  │ ❌ NO session tracking   │
│ ❌ currentSessionId may  │  │                          │
│    not be set correctly  │  │ Feeds posts to host     │
│                          │  │ without session context  │
└────────────┬─────────────┘  └──────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    STORY GENERATION                                  │
│  Host processes Reddit post → Creates narration                     │
│  ❌ PROBLEM: session_id field NOT set when saving to story_history  │
│                                                                      │
│  Convex function call:                                              │
│    await ctx.db.insert("story_history", {                          │
│      story_id: "story_xyz",                                        │
│      narrative: "...",                                              │
│      session_id: undefined  ← ❌ THIS IS THE ISSUE                  │
│      // ... other fields                                            │
│    })                                                               │
└────────────┬────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE (story_history)                          │
│                                                                      │
│  Story Record:                                                       │
│    _id: "st_12345"                                                  │
│    story_id: "story_xyz"                                            │
│    narrative: "Breaking news about..."                              │
│    session_id: null  ← ❌ ORPHANED STORY                            │
│    created_at: 1234567890                                           │
└────────────┬────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        LIVE FEED                                     │
│                                                                      │
│  Query: Get stories WHERE session_id = "sess_abc123"                │
│  Result: [] (empty)  ← ❌ CAN'T FIND STORIES                        │
│                                                                      │
│  User sees: Empty feed despite stories being generated              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    SESSION STATS                                     │
│                                                                      │
│  Query: Get stats for session_id = "sess_abc123"                    │
│  - storyCount: 0  ← ❌ Wrong (stories exist but not linked)         │
│  - totalTokens: 0 ← ❌ Wrong (tokens used but not tracked)          │
│  - totalCost: $0  ← ❌ Wrong (cost incurred but not attributed)     │
└─────────────────────────────────────────────────────────────────────┘
```

### What Goes Wrong

1. **Session Selection**: User picks Session A in Session Manager ✅
2. **Broadcast Start**: Orchestrator receives Session A ID ✅
3. **Host Initialization**: Host Agent `start()` is called with Session A ID ✅
4. **Session Storage**: Host Agent **may or may not** store the session ID correctly ⚠️
5. **Story Creation**: When Host creates a story, the session ID **is not passed** to Convex ❌
6. **Database Write**: Story is saved **without session_id** field ❌
7. **Live Feed Query**: Feed tries to filter by session, finds **nothing** ❌
8. **Session Stats**: Stats query finds **no stories/tokens** for the session ❌

**Result**: User starts a broadcast for Session A, but:
- Stories appear in database with `session_id = null`
- Live Feed shows nothing (or shows stories from other sessions)
- Session stats remain at 0
- Switching to Session B shows the same mixed-up content

---

## 4. Root Causes of Session Splits

### Cause 1: **No Explicit Session Context in Host Agent**

**Location**: `/lib/stores/host/hostAgentStore.ts`

The Host Agent store has a `currentSessionId` field, but it's not consistently:
1. Set when `start(sessionId)` is called
2. Used when creating stories
3. Passed to Convex mutations

**Evidence**:
```typescript
// hostAgentStore.ts - start() method
start: async (sessionId?: string) => {
  // ... initialization code ...
  
  // ❌ Session ID is received but not stored reliably
  // Need to add:
  set({ currentSessionId: sessionId ?? null });
  
  // ... rest of start logic ...
}
```

### Cause 2: **Story Creation Doesn't Include Session Context**

**Location**: Host Agent's story creation (when processing posts)

When the Host Agent generates a narration and saves it to `story_history`, the session ID is not included:

```typescript
// Conceptual code - actual implementation may vary
const storyId = await createStory({
  narrative: generatedNarration,
  tone: 'breaking',
  priority: 'high',
  agent_type: 'host',
  // ❌ Missing: session_id: currentSessionId
});
```

**Why this happens**:
- The Host Agent processes posts asynchronously
- Multiple posts may be in the queue
- The "current session" context can be lost during async processing
- No explicit session tracking in the processing pipeline

### Cause 3: **Live Feed Relies on Database Filtering**

**Location**: `/components/livefeed/liveFeed.tsx`

The Live Feed component loads stories from Convex:

```typescript
useEffect(() => {
  console.log(`📚 Loading stories from Convex for live feed display${sessionId ? ` (session: ${sessionId})` : ''}`);
  loadStoriesFromConvex(sessionId ?? undefined);
}, [loadStoriesFromConvex, sessionId]);
```

This queries the database with a filter:
```typescript
// Conceptual Convex query
export const getStoriesBySession = query({
  args: { sessionId: v.optional(v.id("sessions")) },
  handler: async (ctx, args) => {
    if (args.sessionId) {
      return await ctx.db
        .query("story_history")
        .withIndex("by_session_id", q => q.eq("session_id", args.sessionId))
        .collect();
    }
    // Fallback: return all stories (causes mixing)
    return await ctx.db.query("story_history").collect();
  }
});
```

**Issue**: If `session_id` is `null` in stories, the filter fails and:
- Returns all stories (wrong)
- Returns no stories (empty feed)

### Cause 4: **Session Stats Query Fails**

**Location**: `/convex/users/sessions.ts` - `getSessionStats` query

```typescript
export const getSessionStats = query({
  args: { id: v.id("sessions") },
  handler: async (ctx, args) => {
    // Query story_history for stories linked to this session
    const stories = await ctx.db
      .query("story_history")
      .withIndex("by_session_id", q => q.eq("session_id", args.id))
      .collect();
    
    // If no stories have session_id set, this returns []
    // Result: storyCount = 0, totalTokens = 0, totalCost = 0
  }
});
```

**Issue**: Stories without `session_id` are invisible to stats calculations.

### Cause 5: **No Feed/Queue Metrics in Session Stats**

Currently, the Session Overview panel shows:
- ✅ Tokens
- ✅ Stories
- ✅ Cost
- ✅ Duration
- ❌ Feed (Live Feed post count)
- ❌ Queue (Host Agent queue length)

**Why missing**:
- Feed count should come from `useSimpleLiveFeedStore().posts.length`
- Queue length should come from `useHostAgentStore().stats.queueLength`
- These are **not currently displayed** in the Session Overview

---

## 5. Proposed Solution: Unified Session Tunnel

### Design Principles

1. **Single Source of Truth**: Orchestrator's `currentConvexSessionId` is the master
2. **Explicit Propagation**: Session ID must be explicitly passed at each boundary
3. **Defensive Programming**: Validate session ID at every step
4. **Fail-Safe Behavior**: If session ID is missing, use fallback or warning

### Architecture: The Session Tunnel

```
┌─────────────────────────────────────────────────────────────────────┐
│                   🎯 SINGLE SOURCE OF TRUTH                          │
│            useBroadcastOrchestrator.currentConvexSessionId           │
│                     (Session A: sess_abc123)                         │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            │ TUNNEL ENTRANCE
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  ORCHESTRATOR START SEQUENCE                                         │
│  ✅ Validate session exists in database                              │
│  ✅ Set currentConvexSessionId = sess_abc123                         │
│  ✅ Sync to Convex immediately (updateBroadcastState)               │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                ┌───────────┴──────────┐
                │                      │
                ▼                      ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│  HOST AGENT START        │  │  PRODUCER START          │
│                          │  │                          │
│  ✅ store.start(         │  │  ✅ Pass session to      │
│      sessionId:          │  │      producer context    │
│      sess_abc123         │  │                          │
│    )                     │  │  ✅ Include session in   │
│                          │  │      post metadata       │
│  ✅ set({                │  │                          │
│      currentSessionId:   │  └──────────┬───────────────┘
│        sess_abc123       │             │
│    })                    │             │
│                          │             │
│  ✅ Validate stored      │             │
└────────────┬─────────────┘             │
             │                            │
             │ ◄──────────────────────────┘
             │
             │ STORY CREATION TUNNEL
             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  HOST AGENT: Process Post → Generate Narration                      │
│                                                                      │
│  ✅ Get currentSessionId from store                                  │
│  ✅ Validate session ID exists                                       │
│  ✅ Pass to story creation:                                          │
│                                                                      │
│     await createStory({                                             │
│       narrative: "...",                                             │
│       session_id: this.currentSessionId,  ← ✅ EXPLICIT             │
│       // ... other fields                                           │
│     })                                                              │
│                                                                      │
│  ✅ Log story creation with session context                          │
└────────────┬────────────────────────────────────────────────────────┘
             │
             │ DATABASE WRITE TUNNEL
             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  CONVEX MUTATION: createStory                                        │
│                                                                      │
│  export const createStory = mutation({                              │
│    args: {                                                          │
│      narrative: v.string(),                                         │
│      session_id: v.string(),  ← ✅ REQUIRED FIELD                   │
│      // ... other fields                                            │
│    },                                                               │
│    handler: async (ctx, args) => {                                 │
│      // ✅ Validate session exists                                  │
│      const session = await ctx.db.get(args.session_id);            │
│      if (!session) throw new Error("Invalid session");             │
│                                                                      │
│      // ✅ Insert with session_id                                   │
│      return await ctx.db.insert("story_history", {                 │
│        ...args,                                                     │
│        session_id: args.session_id  ← ✅ GUARANTEED                 │
│      });                                                            │
│    }                                                                │
│  });                                                                │
└────────────┬────────────────────────────────────────────────────────┘
             │
             │ RETRIEVAL TUNNEL
             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  DATABASE: story_history table                                       │
│                                                                      │
│  Story Record:                                                       │
│    _id: "st_12345"                                                  │
│    story_id: "story_xyz"                                            │
│    narrative: "Breaking news..."                                    │
│    session_id: "sess_abc123"  ← ✅ LINKED TO SESSION                │
│    created_at: 1234567890                                           │
│                                                                      │
│  ✅ Index: by_session_id for fast filtering                          │
└────────────┬────────────────────────────────────────────────────────┘
             │
             │ DISPLAY TUNNEL
             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LIVE FEED COMPONENT                                                 │
│                                                                      │
│  ✅ Receive sessionId from orchestrator:                             │
│     const sessionId = useBroadcastOrchestrator(                     │
│       state => state.currentConvexSessionId                         │
│     );                                                              │
│                                                                      │
│  ✅ Query with session filter:                                       │
│     loadStoriesFromConvex(sessionId);                               │
│                                                                      │
│  ✅ Display only stories for current session:                        │
│     Result: [story_xyz, story_abc, ...]  ← ✅ CORRECT               │
│                                                                      │
│  ✅ Real-time updates as new stories arrive                          │
└────────────┬────────────────────────────────────────────────────────┘
             │
             │ ANALYTICS TUNNEL
             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SESSION STATS QUERY                                                 │
│                                                                      │
│  Query: getSessionStats({ id: "sess_abc123" })                      │
│                                                                      │
│  ✅ Count stories: WHERE session_id = "sess_abc123"                  │
│  ✅ Sum tokens: FROM token_usage WHERE session_id = "sess_abc123"   │
│  ✅ Calculate cost: SUM(estimated_cost) WHERE session_id = ...      │
│                                                                      │
│  Result:                                                             │
│    storyCount: 15        ← ✅ CORRECT                                │
│    totalTokens: 45,230   ← ✅ CORRECT                                │
│    totalCost: $0.4523    ← ✅ CORRECT                                │
│                                                                      │
│  ✅ Display in Session Overview panel                                │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ TUNNEL EXIT
                            ▼
                    ✅ USER SEES CORRECT DATA
```

### Key Improvements

1. **Explicit Session Propagation**
   - Session ID passed explicitly to `hostStore.start(sessionId)`
   - Host Agent **stores** session ID in state
   - Session ID **validated** before use

2. **Required Session Field in Story Creation**
   - Convex mutation requires `session_id` parameter
   - Database writes **always** include session ID
   - No orphaned stories

3. **Synchronized State**
   - `useBroadcastSync` hook keeps Convex session record up-to-date
   - All components read from orchestrator
   - Single source of truth maintained

4. **Defensive Error Handling**
   - Validate session exists before starting broadcast
   - Log warnings if session ID is missing
   - Fallback behavior (e.g., show all stories if no session filter)

---

## 6. Implementation Plan

### Phase 1: Fix Host Agent Session Tracking

**File**: `/lib/stores/host/hostAgentStore.ts`

**Changes**:

1. **Ensure `currentSessionId` is set on start**:
```typescript
start: async (sessionId?: string) => {
  // ... existing code ...
  
  // ✅ ADD: Store the session ID
  if (!sessionId) {
    console.warn('⚠️ Host Agent started without session ID - stories will not be linked to a session');
  }
  
  set({ 
    currentSessionId: sessionId ?? null,
    isActive: true 
  });
  
  console.log(`🎙️ Host Agent started for session: ${sessionId || 'none'}`);
  
  // ... rest of start logic ...
}
```

2. **Pass session ID when creating stories**:
```typescript
// In processRedditPost or wherever stories are created
processRedditPost: async (post: EnhancedRedditPost) => {
  const state = get();
  
  // ✅ Get current session
  const sessionId = state.currentSessionId;
  
  if (!sessionId) {
    console.error('❌ Cannot create story: No active session');
    return;
  }
  
  // Generate narration...
  const narration = await generateNarration(post);
  
  // ✅ CREATE STORY WITH SESSION
  const storyId = await convex.mutation(api.reddit.stories.createStory, {
    narrative: narration.text,
    session_id: sessionId,  // ← CRITICAL
    tone: narration.tone,
    priority: narration.priority,
    agent_type: 'host',
    // ... other fields
  });
  
  console.log(`📖 Story created for session ${sessionId}: ${storyId}`);
}
```

3. **Add getter for session validation**:
```typescript
getCurrentSessionId: () => {
  const state = get();
  return state.currentSessionId;
}

isSessionActive: () => {
  const state = get();
  return state.isActive && state.currentSessionId !== null;
}
```

### Phase 2: Update Story Creation Convex Functions

**File**: Create new file `/convex/reddit/stories.ts` (if it doesn't exist)

**Changes**:

```typescript
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// ✅ CREATE STORY WITH REQUIRED SESSION
export const createStory = mutation({
  args: {
    narrative: v.string(),
    session_id: v.string(),  // ← REQUIRED (not optional)
    tone: v.union(
      v.literal("breaking"),
      v.literal("developing"),
      v.literal("analysis"),
      v.literal("opinion"),
      v.literal("human-interest")
    ),
    priority: v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
    agent_type: v.literal("host"),
    title: v.optional(v.string()),
    original_item: v.optional(v.object({
      title: v.string(),
      author: v.string(),
      subreddit: v.optional(v.string()),
      url: v.optional(v.string()),
    })),
  },
  returns: v.id("story_history"),
  handler: async (ctx, args) => {
    // ✅ VALIDATE SESSION EXISTS
    const session = await ctx.db.get(args.session_id as any);
    if (!session) {
      throw new Error(`Invalid session ID: ${args.session_id}`);
    }
    
    // Generate unique story ID
    const story_id = `story_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Calculate metrics
    const word_count = args.narrative.split(/\s+/).length;
    const duration = Math.ceil(word_count / 150) * 60; // ~150 words/min
    
    // ✅ INSERT WITH SESSION ID
    const storyId = await ctx.db.insert("story_history", {
      story_id,
      narrative: args.narrative,
      session_id: args.session_id,  // ← GUARANTEED NON-NULL
      tone: args.tone,
      priority: args.priority,
      agent_type: args.agent_type,
      title: args.title,
      word_count,
      duration,
      created_at: Date.now(),
      completed_at: Date.now(),
      original_item: args.original_item,
    });
    
    console.log(`✅ Story created for session ${args.session_id}: ${storyId}`);
    
    return storyId;
  },
});

// ✅ QUERY STORIES BY SESSION
export const getStoriesBySession = query({
  args: { 
    sessionId: v.string(),
    limit: v.optional(v.number())
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("story_history")
      .withIndex("by_session_id", q => q.eq("session_id", args.sessionId))
      .order("desc");
    
    if (args.limit) {
      return await query.take(args.limit);
    }
    
    return await query.collect();
  },
});
```

### Phase 3: Update Live Feed to Use Session-Filtered Stories

**File**: `/lib/stores/livefeed/simpleLiveFeedStore.ts`

**Changes**:

```typescript
// Update loadStoriesFromConvex to require session ID
loadStoriesFromConvex: async (sessionId?: string) => {
  if (!sessionId) {
    console.warn('⚠️ Loading stories without session filter - this may show mixed content');
    // Fallback: load all stories (not recommended for production)
    const stories = await convex.query(api.reddit.stories.getAllStories);
    set({ storyHistory: stories });
    return;
  }
  
  console.log(`📚 Loading stories for session: ${sessionId}`);
  
  // ✅ LOAD ONLY STORIES FOR THIS SESSION
  const stories = await convex.query(api.reddit.stories.getStoriesBySession, {
    sessionId,
    limit: 50  // Adjust as needed
  });
  
  set({ storyHistory: stories });
  console.log(`📚 Loaded ${stories.length} stories for session ${sessionId}`);
}
```

**File**: `/components/livefeed/liveFeed.tsx`

**Changes**:

```typescript
export default function LiveFeed({ className, sessionId }: LiveFeedProps) {
  // ... existing code ...
  
  // Load stories from Convex on mount and when sessionId changes
  useEffect(() => {
    if (!sessionId) {
      console.warn('⚠️ Live Feed: No session ID provided, stories may not display correctly');
      return;
    }
    
    console.log(`📚 Live Feed: Loading stories for session: ${sessionId}`);
    loadStoriesFromConvex(sessionId);
  }, [loadStoriesFromConvex, sessionId]);
  
  // ✅ DISPLAY WARNING IF NO SESSION
  if (!sessionId) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500">
        <p>No active session - select a session to view stories</p>
      </div>
    );
  }
  
  // ... rest of component ...
}
```

### Phase 4: Add Feed/Queue Metrics to Session Stats

**File**: `/app/dashboard/studio/sessions/Sessions.tsx`

**Changes**:

```typescript
export function Sessions() {
  // ... existing code ...
  
  // ✅ ADD: Get live feed and queue stats
  const liveFeedPostCount = useSimpleLiveFeedStore(state => state.posts.length);
  const hostQueueLength = useHostAgentStore(state => state.stats.queueLength);
  
  // ... in the Session Overview section ...
  
  {/* Existing stats */}
  <div className="flex items-center justify-between py-0.5">
    <span className="text-xs text-neutral-500">Stories</span>
    <span className="text-xs text-cyan-400 font-mono">
      {sessionStats?.storyCount ?? 0}
    </span>
  </div>
  
  {/* ✅ ADD: Feed stat */}
  <div className="flex items-center justify-between py-0.5">
    <span className="text-xs text-neutral-500">Feed</span>
    <span className="text-xs text-cyan-400 font-mono">
      {liveFeedPostCount}
    </span>
  </div>
  
  {/* ✅ ADD: Queue stat */}
  <div className="flex items-center justify-between py-0.5">
    <span className="text-xs text-neutral-500">Queue</span>
    <span className="text-xs text-cyan-400 font-mono">
      {hostQueueLength}
    </span>
  </div>
```

### Phase 5: Update Session Stats Query

**File**: `/convex/users/sessions.ts`

**Changes**:

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
      // ✅ ADD: Additional metrics
      avgStoryLength: v.number(),
      totalDuration: v.number(),
      lastStoryAt: v.optional(v.number()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    // ✅ QUERY STORIES WITH SESSION FILTER
    const stories = await ctx.db
      .query("story_history")
      .withIndex("by_session_id", q => q.eq("session_id", args.id))
      .collect();
    
    // ✅ QUERY TOKEN USAGE WITH SESSION FILTER
    const tokenUsage = await ctx.db
      .query("token_usage")
      .withIndex("by_session_id", q => q.eq("session_id", args.id))
      .collect();
    
    // Calculate stats
    const storyCount = stories.length;
    const totalTokens = tokenUsage.reduce((sum, usage) => sum + usage.total_tokens, 0);
    const inputTokens = tokenUsage.reduce((sum, usage) => sum + usage.input_tokens, 0);
    const outputTokens = tokenUsage.reduce((sum, usage) => sum + usage.output_tokens, 0);
    const totalCost = tokenUsage.reduce((sum, usage) => sum + usage.estimated_cost, 0);
    
    // ✅ ADD: Calculate average story length
    const avgStoryLength = storyCount > 0
      ? stories.reduce((sum, story) => sum + story.word_count, 0) / storyCount
      : 0;
    
    // ✅ ADD: Total story duration
    const totalDuration = stories.reduce((sum, story) => sum + story.duration, 0);
    
    // ✅ ADD: Last story timestamp
    const lastStoryAt = storyCount > 0
      ? Math.max(...stories.map(story => story.created_at))
      : undefined;
    
    return {
      storyCount,
      totalTokens,
      inputTokens,
      outputTokens,
      totalCost,
      avgStoryLength,
      totalDuration,
      lastStoryAt,
    };
  },
});
```

### Phase 6: Add Session Validation in Orchestrator

**File**: `/lib/stores/orchestrator/broadcastOrchestrator.ts`

**Changes**:

```typescript
startBroadcast: async (sessionId?: Id<"sessions">) => {
  const { state, canStartBroadcast, _setState, _setError, _log } = get();
  
  // ✅ ADD: Validate session ID
  if (!sessionId) {
    _setError('Cannot start broadcast: No session ID provided');
    return;
  }
  
  // ✅ ADD: Verify session exists in database
  try {
    const session = await convex.query(api.users.sessions.get, { id: sessionId });
    if (!session) {
      _setError(`Cannot start broadcast: Session ${sessionId} not found`);
      return;
    }
    _log(`✅ Session validated: ${session.name}`);
  } catch (error) {
    _setError(`Cannot start broadcast: Failed to validate session - ${error}`);
    return;
  }
  
  // ... rest of startBroadcast logic ...
  
  // ✅ Step 3: Start host agent WITH SESSION VALIDATION
  _log('Step 3: Starting host agent...', `session: ${sessionId}`);
  
  const currentSession = get().currentConvexSessionId;
  if (currentSession !== sessionId) {
    console.warn(`⚠️ Session ID mismatch: orchestrator=${sessionId}, current=${currentSession}`);
  }
  
  await hostStore.start(sessionId);
  
  // ✅ VERIFY host stored session correctly
  const hostSessionId = hostStore.getCurrentSessionId();
  if (hostSessionId !== sessionId) {
    throw new Error(`Host Agent failed to store session ID correctly: expected=${sessionId}, got=${hostSessionId}`);
  }
  
  _log(`✅ Host Agent session validated: ${hostSessionId}`);
  
  // ... rest of sequence ...
}
```

---

## 7. Session Stats Integration

### Current Session Overview Display

```typescript
{/* Session Overview Section */}
<div className="px-4 pt-4">
  <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
    Session Overview
  </h3>
  <div className="space-y-0.75">
    {/* Session ID/Name */}
    {/* Tokens */}
    {/* Stories */}
    {/* Cost */}
    {/* Duration */}
    {/* Messages */}
  </div>
</div>
```

### Enhanced Session Overview (Proposed)

```typescript
{/* Session Overview Section */}
<div className="px-4 pt-4">
  <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
    Session Overview
  </h3>
  <div className="space-y-0.75">
    {/* Session ID/Name */}
    <div className="flex items-center justify-between py-0.5">
      <span className="text-xs text-neutral-500">Session</span>
      <span className="text-xs text-neutral-200 font-mono truncate max-w-[180px]">
        {selectedSession.name}
      </span>
    </div>
    
    {/* ✅ EXISTING: Tokens */}
    <div className="flex items-center justify-between py-0.5">
      <span className="text-xs text-neutral-500">Tokens</span>
      <span className="text-xs text-cyan-400 font-mono">
        {sessionStats?.totalTokens.toLocaleString() ?? "0"}
      </span>
    </div>
    
    {/* ✅ EXISTING: Stories */}
    <div className="flex items-center justify-between py-0.5">
      <span className="text-xs text-neutral-500">Stories</span>
      <span className="text-xs text-cyan-400 font-mono">
        {sessionStats?.storyCount ?? 0}
      </span>
    </div>
    
    {/* ✅ EXISTING: Cost */}
    <div className="flex items-center justify-between py-0.5">
      <span className="text-xs text-neutral-500">Cost</span>
      <span className="text-xs text-emerald-400 font-mono">
        ${(sessionStats?.totalCost ?? 0).toFixed(4)}
      </span>
    </div>
    
    {/* ✅ EXISTING: Duration */}
    <div className="flex items-center justify-between py-0.5">
      <span className="text-xs text-neutral-500">Duration</span>
      <span className="text-xs text-neutral-200 font-mono">
        {formatDuration(sessionDuration)}
      </span>
    </div>
    
    {/* ✅ NEW: Feed (Live Feed post count) */}
    <div className="flex items-center justify-between py-0.5">
      <span className="text-xs text-neutral-500">Feed</span>
      <span className="text-xs text-purple-400 font-mono">
        {liveFeedPostCount} posts
      </span>
    </div>
    
    {/* ✅ NEW: Queue (Host Agent queue) */}
    <div className="flex items-center justify-between py-0.5">
      <span className="text-xs text-neutral-500">Queue</span>
      <span className="text-xs text-orange-400 font-mono">
        {hostQueueLength} pending
      </span>
    </div>
    
    {/* ✅ NEW: Broadcast Status Indicator */}
    {isLive && (
      <div className="flex items-center justify-between py-0.5 mt-2 pt-2 border-t border-neutral-800">
        <span className="text-xs text-neutral-500">Broadcast</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs text-red-400 font-mono">LIVE</span>
        </div>
      </div>
    )}
  </div>
</div>
```

### Real-Time Updates

All metrics update in real-time:

| Metric | Source | Update Trigger |
|--------|--------|----------------|
| **Tokens** | `sessionStats?.totalTokens` | Every 5 seconds via `useBroadcastSync` |
| **Stories** | `sessionStats?.storyCount` | When new story created |
| **Cost** | `sessionStats?.totalCost` | When tokens logged |
| **Duration** | `sessionDuration` (local state) | Every 1 second (timer) |
| **Feed** | `liveFeedPostCount` | When new post arrives |
| **Queue** | `hostQueueLength` | When host processes/adds items |

---

## 8. Verification & Testing

### Test Scenarios

#### Scenario 1: Single Session Broadcast

**Steps**:
1. Create Session A
2. Click "Go Live" for Session A
3. Verify:
   - ✅ Stories created have `session_id = Session A`
   - ✅ Live Feed shows only Session A stories
   - ✅ Session stats reflect Session A activity
   - ✅ Feed and Queue metrics update

**Expected Behavior**:
- All stories linked to Session A
- Live Feed displays Session A content only
- Stats accurate and real-time

#### Scenario 2: Session Switching While Broadcasting

**Steps**:
1. Create Session A and Session B
2. Start broadcast for Session A
3. Generate 5 stories
4. Stop broadcast
5. Switch to Session B
6. Verify:
   - ✅ Live Feed clears and shows only Session B content (if any)
   - ✅ Session stats show Session B metrics
   - ✅ Session A stats remain unchanged

**Expected Behavior**:
- Session isolation maintained
- No story leakage between sessions

#### Scenario 3: Multiple Sessions in Sequence

**Steps**:
1. Create Session A
2. Start broadcast, generate 10 stories
3. Stop broadcast
4. Create Session B
5. Start broadcast, generate 15 stories
6. Stop broadcast
7. Query database:
   - ✅ Session A has 10 stories
   - ✅ Session B has 15 stories
   - ✅ No stories with `session_id = null`

**Expected Behavior**:
- All stories correctly attributed
- No orphaned stories

#### Scenario 4: Error Recovery

**Steps**:
1. Start broadcast without session ID (should fail)
2. Verify:
   - ✅ Error displayed to user
   - ✅ Broadcast doesn't start
   - ✅ No stories created
3. Fix: Select a session and retry
4. Verify:
   - ✅ Broadcast starts successfully
   - ✅ Stories created with correct session ID

**Expected Behavior**:
- Graceful error handling
- User feedback on issues
- System recovers cleanly

### Debugging Tools

#### 1. Session Flow Logger

Add comprehensive logging at each step:

```typescript
// In orchestrator
console.log('🎬 [SESSION-FLOW] Starting broadcast for session:', sessionId);

// In host agent
console.log('🎙️ [SESSION-FLOW] Host Agent storing session:', sessionId);
console.log('📖 [SESSION-FLOW] Creating story for session:', sessionId);

// In Convex mutation
console.log('💾 [SESSION-FLOW] Saving story to database with session:', args.session_id);

// In Live Feed
console.log('📺 [SESSION-FLOW] Loading stories for session:', sessionId);
console.log('📺 [SESSION-FLOW] Displaying', stories.length, 'stories for session:', sessionId);
```

#### 2. Session Validation Utility

```typescript
// New file: /lib/utils/sessionValidation.ts

export async function validateSessionFlow(sessionId: string) {
  console.log('🔍 [VALIDATION] Checking session flow for:', sessionId);
  
  // Check orchestrator
  const orchestratorSession = useBroadcastOrchestrator.getState().currentConvexSessionId;
  console.log('  Orchestrator session:', orchestratorSession);
  
  // Check host agent
  const hostSession = useHostAgentStore.getState().getCurrentSessionId();
  console.log('  Host Agent session:', hostSession);
  
  // Check database
  const dbStories = await convex.query(api.reddit.stories.getStoriesBySession, {
    sessionId,
    limit: 1
  });
  console.log('  Database stories for session:', dbStories.length);
  
  // Validate consistency
  const isValid = 
    orchestratorSession === sessionId &&
    hostSession === sessionId &&
    dbStories.length > 0;
  
  if (!isValid) {
    console.error('❌ [VALIDATION] Session flow broken!', {
      expected: sessionId,
      orchestrator: orchestratorSession,
      host: hostSession,
      storiesFound: dbStories.length
    });
  } else {
    console.log('✅ [VALIDATION] Session flow intact');
  }
  
  return isValid;
}
```

#### 3. Database Inspector

Query to check story session linkage:

```sql
-- Get story distribution by session
SELECT 
  session_id,
  COUNT(*) as story_count,
  MIN(created_at) as first_story,
  MAX(created_at) as last_story
FROM story_history
GROUP BY session_id
ORDER BY story_count DESC;

-- Find orphaned stories
SELECT *
FROM story_history
WHERE session_id IS NULL
ORDER BY created_at DESC
LIMIT 10;
```

---

## Summary

### Current Problems

1. **Host Agent** doesn't reliably store session ID when started
2. **Story Creation** doesn't include session ID when saving to database
3. **Live Feed** queries by session but stories don't have session ID set
4. **Session Stats** can't attribute metrics to correct session
5. **Feed/Queue** metrics not displayed in Session Overview

### Proposed Solutions

1. **Explicit Session Propagation**: Pass session ID explicitly at each boundary
2. **Required Session Field**: Make `session_id` required in story creation
3. **Unified Session Tunnel**: Single source of truth (orchestrator) with validation at each step
4. **Enhanced Session Stats**: Add Feed and Queue metrics to overview panel
5. **Defensive Programming**: Validate session ID exists before use, log warnings

### Implementation Priority

| Phase | Component | Priority | Complexity |
|-------|-----------|----------|------------|
| 1 | Host Agent session tracking | **CRITICAL** | Medium |
| 2 | Story creation with session | **CRITICAL** | Medium |
| 3 | Live Feed session filtering | **HIGH** | Low |
| 4 | Session stats display | **HIGH** | Low |
| 5 | Orchestrator validation | **MEDIUM** | Medium |
| 6 | Token usage tracking | **MEDIUM** | Low |

### Success Metrics

- ✅ **Zero orphaned stories** (all have `session_id`)
- ✅ **Live Feed accuracy** (shows only current session)
- ✅ **Session stats correctness** (tokens/cost/stories match actual usage)
- ✅ **Real-time updates** (Feed/Queue metrics update within 1 second)
- ✅ **Error handling** (graceful failures with user feedback)

---

## Next Steps

1. **Review this document** with the team
2. **Prioritize phases** based on business needs
3. **Create GitHub issues** for each implementation phase
4. **Set up testing environment** with multiple sessions
5. **Implement Phase 1** (Host Agent session tracking)
6. **Test and validate** before moving to next phase
7. **Monitor production** for session consistency

---

**Document Status**: Draft v1.0  
**Created**: 2025-09-30  
**Author**: AI Assistant (based on codebase analysis)  
**Next Review**: After Phase 1 implementation
