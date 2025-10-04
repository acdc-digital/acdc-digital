# SMNB Broadcast Orchestrator - Testing Guide

**Date:** September 30, 2025  
**Status:** ✅ All Integration Complete - Ready for Testing

---

## 🎯 What's Been Completed

### Phase 1-3: Full Orchestrator Integration ✅
- ✅ Central orchestrator store with FSM (Finite State Machine)
- ✅ Dashboard initialization with orchestrator
- ✅ All components refactored (Sessions, Controls, Host)
- ✅ Convex backend schema extended with broadcast fields
- ✅ Convex sync mutations created
- ✅ Auto-sync hook (`useBroadcastSync`) integrated
- ✅ State monitor component debugged and working
- ✅ State validation monitoring active (dev mode only)

### Key Features Now Working
1. **Single Source of Truth**: Orchestrator coordinates all stores
2. **FSM State Management**: `idle → initializing → ready → starting → live → stopping`
3. **Automatic Rollback**: Errors trigger automatic cleanup
4. **Backend Sync**: State persists to Convex every 5 seconds + on state changes
5. **Cross-Tab Consistency**: State syncs across all browser tabs
6. **Visual Debugging**: State Monitor shows real-time state

---

## 🚀 How to Test the Session Manager

### Step 1: Start Development Environment

```bash
# Terminal 1: Start Convex backend
cd /Users/matthewsimon/Projects/acdc-digital/smnb/smnb
npx convex dev

# Terminal 2: Start Next.js dev server
cd /Users/matthewsimon/Projects/acdc-digital/smnb/smnb
npm run dev
# Or if npm doesn't work due to monorepo structure:
pnpm dev
```

**Expected Output:**
- Convex: `✔ Convex backend running at https://...`
- Next.js: `▲ Next.js ready on http://localhost:8888`

**Open Browser:**
- Navigate to `http://localhost:8888/dashboard`
- Login with Clerk authentication

---

### Step 2: Initial State Verification

**What to Look For:**

1. **State Monitor (Bottom-Right Corner)**
   - Should show orchestrator state: `idle` or `initializing`
   - Host: `✗ Active`, `✓ Initialized` (if initialization succeeded)
   - Producer: `✗ Active`
   - Live Feed: `✗ Live`

2. **Browser Console Logs**
   ```
   🏛️ DASHBOARD: Initializing broadcast orchestrator...
   📡 ORCHESTRATOR: Initializing services...
   ✅ ORCHESTRATOR: Initialization complete
   ```

3. **Expected Initial State**
   - Orchestrator State: `ready` (after initialization)
   - Host Agent: Initialized but not active
   - Producer: Not active
   - Live Feed: Not live

---

### Step 3: Test Broadcast Start (Sessions Tab)

**Action Steps:**

1. Navigate to **Sessions** tab (Archive icon in left sidebar)
2. Verify a session is selected (or create one if needed)
3. Click the **"Go Live"** button

**Expected Behavior:**

#### Console Logs (Detailed Sequence):
```
📺 SESSIONS: Starting broadcast via orchestrator
🚀 ORCHESTRATOR: Starting broadcast sequence...
Step 1: Starting live feed...
Step 2: Starting broadcast session timer...
Step 3: Starting host agent...
  🎙️ HOST: Starting host agent...
  🎙️ HOST: Host agent started successfully
Step 4: Starting producer...
  🏭 PRODUCER: Starting producer...
  🏭 PRODUCER: Producer started
✅ ORCHESTRATOR: Broadcast started successfully
```

#### State Monitor Changes:
```
Before: Orchestrator: ready → live
        Host: ✗ Active → ✓ Active
        Producer: ✗ Active → ✓ Active
        Live Feed: ✗ Live → ✓ Live
        Session: ✗ Active → ✓ Active
```

#### UI Changes:
- Button text changes: `"Go Live"` → `"LIVE"`
- Button color changes: Gray → Red
- Button may show loading spinner briefly

---

### Step 4: Verify Narration Works

**What Should Happen:**

1. **Live Feed Processes Posts**
   - Host agent pulls posts from live feed
   - Posts are converted to narrations
   - Narrations are queued

2. **Console Logs to Watch:**
   ```
   🎙️ HOST: Processing live feed post: [Post Title]
   🎙️ HOST: Generated narration for post
   🎙️ HOST: Streaming narration...
   🎙️ HOST: Narration complete
   ```

3. **State Monitor Updates:**
   - Host: Queue Length increases (1, 2, 3...)
   - Host: `Streaming: ✓` when narrating

4. **Audio Should Play**
   - Check browser audio permissions
   - Listen for AI-generated narration

---

### Step 5: Test Tab Switching

**Action Steps:**

1. **While Broadcast is LIVE**, switch tabs:
   - Sessions → Controls → Host → Studio → Sessions

2. **What to Verify:**
   - State Monitor shows consistent state across all tabs
   - "LIVE" button remains red on all tabs with controls
   - Console shows no errors or state resets

3. **Expected Behavior:**
   - No state loss when switching tabs
   - Broadcast continues running
   - All tabs show synchronized state

---

### Step 6: Test State Persistence (Page Reload)

**Action Steps:**

1. **While Broadcast is LIVE**, refresh the browser (`Cmd+R` or `Ctrl+R`)

2. **What to Verify:**
   - After page loads, check State Monitor
   - Orchestrator should restore to `live` state
   - Host agent should still be active
   - Narration should continue

3. **Console Logs:**
   ```
   🏛️ DASHBOARD: Initializing broadcast orchestrator...
   📡 ORCHESTRATOR: Restoring previous state from Convex...
   ✅ ORCHESTRATOR: State restored - broadcast still live
   ```

4. **Convex Sync Verification:**
   - Open Convex Dashboard: https://dashboard.convex.dev
   - Navigate to your deployment → Data → `sessions` table
   - Find your session document
   - Verify fields:
     - `broadcastState`: `"live"`
     - `isLive`: `true`
     - `hostActive`: `true`
     - `producerActive`: `true`
     - `liveFeedActive`: `true`
     - `broadcastStartedAt`: (timestamp)
     - `lastBroadcastSync`: (recent timestamp)

---

### Step 7: Test Broadcast Stop

**Action Steps:**

1. Click the **"LIVE"** button (should be red)

**Expected Behavior:**

#### Console Logs:
```
📺 SESSIONS: Stopping broadcast via orchestrator
⏹️ ORCHESTRATOR: Stopping broadcast sequence...
Step 1: Stopping producer...
  🏭 PRODUCER: Stopping producer...
Step 2: Stopping host agent...
  🎙️ HOST: Stopping host agent...
Step 3: Ending broadcast session...
Step 4: Stopping live feed...
✅ ORCHESTRATOR: Broadcast stopped successfully
```

#### State Monitor Changes:
```
Orchestrator: live → stopping → ready
Host: ✓ Active → ✗ Active
Producer: ✓ Active → ✗ Active
Live Feed: ✓ Live → ✗ Live
Session: ✓ Active → ✗ Active
```

#### UI Changes:
- Button text: `"LIVE"` → `"Go Live"`
- Button color: Red → Gray
- Session duration stops incrementing

---

## 🔍 State Monitor Reference

### Orchestrator States
- **`idle`**: Nothing active, system at rest
- **`initializing`**: Services starting up (host, producer)
- **`ready`**: Services initialized, ready to broadcast
- **`starting`**: Broadcast starting (sequential startup)
- **`live`**: Actively broadcasting
- **`stopping`**: Broadcast stopping (sequential shutdown)
- **`error`**: Error state (recoverable via "Recover" button)

### State Monitor Sections

1. **Orchestrator**
   - Current FSM state
   - Previous state
   - Error message (if any)
   - Last transition details

2. **Host Agent**
   - Active status
   - Initialized status
   - Queue length (number of pending narrations)
   - Streaming status

3. **Producer**
   - Active status
   - Processing status

4. **Live Feed**
   - Live status
   - Post count
   - Has content flag

5. **Session**
   - Active status
   - Duration (formatted as HH:MM:SS)
   - Session ID

6. **Convex**
   - Synced status
   - Convex session ID

7. **Computed**
   - Can Start (prerequisites met)
   - Can Stop (broadcast is active)
   - Transitioning (in a transition state)

8. **Actions** (Manual controls for debugging)
   - Initialize
   - Start
   - Stop
   - Emergency Stop
   - Recover

---

## ⚠️ Troubleshooting

### Issue: "Go Live" Button Does Nothing

**Causes:**
1. Host agent not initialized
2. No content in live feed
3. Already in a transition state

**Solutions:**
- Check State Monitor: Host → Initialized should be `✓`
- Verify Live Feed → Posts Count > 0
- Check console for error messages
- Try clicking "Initialize" button in State Monitor

---

### Issue: Infinite Loop Error

**Status:** ✅ **FIXED** (as of Phase 4.0)

This was caused by `useBroadcastSnapshot()` creating new objects on every render. Now fixed by using individual Zustand selectors.

---

### Issue: State Resets on Tab Switch

**Causes:**
- Local `useState` in components (old code)
- Not using orchestrator

**Status:** ✅ **FIXED** (Phases 2.1-2.3)
All components now use orchestrator hooks, not local state.

---

### Issue: Convex Sync Not Working

**Check:**
1. Convex dev server is running
2. `useBroadcastSync` hook is called in Sessions.tsx (line 57)
3. Console shows sync logs:
   ```
   🔄 Syncing broadcast state to Convex...
   ✅ Synced to Convex
   ```
4. Check Convex dashboard for updated fields

---

### Issue: No Audio Playback

**Causes:**
1. Browser audio permissions not granted
2. API key not configured
3. Claude API rate limits

**Solutions:**
- Check browser console for audio errors
- Verify API key is set (top-right corner)
- Check Claude API usage in Anthropic console

---

## 📊 Success Criteria

### ✅ Session Manager is Working If:

1. **Initialization**
   - [ ] State Monitor appears in bottom-right
   - [ ] Orchestrator reaches `ready` state
   - [ ] Host agent shows `✓ Initialized`

2. **Broadcast Start**
   - [ ] Button changes from "Go Live" to "LIVE"
   - [ ] State transitions: `ready → starting → live`
   - [ ] All services activate (Host, Producer, Live Feed, Session)
   - [ ] Console shows complete startup sequence logs

3. **Narration**
   - [ ] Queue length increases
   - [ ] Console shows narration generation logs
   - [ ] Audio plays (if enabled)
   - [ ] Streaming indicator appears

4. **Tab Switching**
   - [ ] State persists across all tabs
   - [ ] No console errors
   - [ ] Broadcast continues running

5. **Page Reload**
   - [ ] State restores from Convex
   - [ ] Broadcast continues if was live
   - [ ] No duplicate initializations

6. **Broadcast Stop**
   - [ ] Button changes from "LIVE" to "Go Live"
   - [ ] State transitions: `live → stopping → ready`
   - [ ] All services deactivate cleanly
   - [ ] Session duration is saved

7. **Convex Sync**
   - [ ] Database shows updated broadcast fields
   - [ ] `lastBroadcastSync` updates every 5 seconds
   - [ ] State persists across browser restarts

---

## 🎉 What to Celebrate

You've successfully implemented:
- ✅ Full FSM-based orchestrator pattern
- ✅ Centralized state management (no more fragmentation!)
- ✅ Backend synchronization with Convex
- ✅ Cross-tab state consistency
- ✅ Automatic error recovery
- ✅ Visual debugging tools
- ✅ State validation monitoring

The Session Manager is now the **single source of truth** for broadcast control! 🚀

---

## 📝 Next Steps After Testing

If everything works:

1. **Remove State Monitor** from production:
   ```tsx
   // app/dashboard/layout.tsx
   {process.env.NODE_ENV === 'development' && <BroadcastStateMonitor />}
   ```

2. **Add User-Facing Error Messages**:
   - Show toast notifications for errors
   - Display loading spinners during transitions

3. **Implement Advanced Features**:
   - Multi-session support
   - Session history/analytics
   - Broadcast scheduling
   - Custom narration voices/styles

4. **Write Automated Tests**:
   - Unit tests for FSM transitions
   - Integration tests for orchestrator
   - E2E tests for broadcast lifecycle

---

**Happy Testing! 🎙️📡**

If you encounter any issues, check the console logs and State Monitor for detailed debugging information.
