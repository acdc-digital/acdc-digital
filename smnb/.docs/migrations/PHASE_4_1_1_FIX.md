# Phase 4.1.1: State Transition & Host Startup Fixes

## Issues Fixed

### Issue 1: Invalid State Transition (idle → idle)
**Error**: `❌ Invalid state transition: idle → idle "Invalid transition from 'idle' to 'idle'"`

**Root Cause**: 
- When `recover()` was called from 'idle' state, it would call `emergencyStop()`
- `emergencyStop()` transitions back to 'idle'
- This created an invalid 'idle → idle' transition

**Solution**:
Added state check at the beginning of `recover()`:
```typescript
// If already in idle, just re-initialize
if (state === 'idle') {
  _log('Already in idle state, re-initializing...');
  await get().initialize();
  return;
}

// If not in error state, nothing to recover
if (state !== 'error') {
  _log('Not in error state, no recovery needed');
  return;
}
```

Now `recover()` handles three cases:
1. **idle state**: Skip cleanup, go straight to re-initialization
2. **error state**: Full recovery process (emergency stop → clear error → return to idle → re-initialize)
3. **other states**: No action needed

---

### Issue 2: Host Agent Failed to Start
**Error**: `Host agent failed to start` after 5-second timeout

**Root Cause**:
- `hostAgentStore.start()` was synchronous
- It called `hostAgent.start()` which emits 'host:started' event asynchronously
- The event listener sets `isActive: true`
- Orchestrator checked `isActive` immediately after `await hostStore.start()`, before the event fired
- Result: `isActive` was still `false`, causing timeout

**Solution**:
Made `hostAgentStore.start()` properly async:

```typescript
// Start the host agent
start: async () => {
  const { hostAgent } = get();
  if (!hostAgent) {
    console.error('❌ Cannot start: Host agent not initialized');
    return;
  }
  
  // Call the service start (which is synchronous but emits 'host:started' event)
  hostAgent.start();
  
  // Wait for isActive to become true (the event listener sets this)
  const startTime = Date.now();
  while (!get().isActive && Date.now() - startTime < 5000) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  if (!get().isActive) {
    throw new Error('Host agent failed to activate within 5 seconds');
  }
  
  console.log('✅ Host agent start completed, isActive:', get().isActive);
},
```

Also updated the interface:
```typescript
start: () => Promise<void>;  // Changed from () => void
```

**Flow**:
1. Orchestrator calls `await hostStore.start()`
2. Store calls service's synchronous `start()`
3. Service emits 'host:started' event
4. Event listener sets `isActive: true`
5. Store's async loop waits for `isActive` to become true
6. Once true, returns control to orchestrator
7. Orchestrator sees `isActive === true`, continues

---

## Enhanced Logging

### Orchestrator Host Startup
Added detailed logging to diagnose host startup issues:

```typescript
// Step 3: Start host agent
_log('Step 3: Starting host agent...');
_log('Host state before start:', { isActive: hostStore.isActive, isStreaming: hostStore.isStreaming });

try {
  await hostStore.start();
  _log('Host start() call completed');
} catch (hostError) {
  _log('Host start() threw error:', hostError);
  throw new Error(`Host agent start failed: ${hostError instanceof Error ? hostError.message : 'Unknown error'}`);
}

// Wait for host to be active (extended to 10 seconds)
const hostStartTime = Date.now();
let attempts = 0;
while (!hostStore.isActive && Date.now() - hostStartTime < 10000) {
  attempts++;
  if (attempts % 10 === 0) {
    _log(`Waiting for host agent... (${attempts * 100}ms elapsed, isActive=${hostStore.isActive})`);
  }
  await new Promise(resolve => setTimeout(resolve, 100));
}

_log('Host state after wait:', { 
  isActive: hostStore.isActive, 
  isStreaming: hostStore.isStreaming,
  elapsed: Date.now() - hostStartTime 
});

if (!hostStore.isActive) {
  throw new Error(`Host agent failed to become active after ${Date.now() - hostStartTime}ms`);
}
```

Benefits:
- Shows host state before and after start
- Logs progress every 1 second during wait
- Shows exact elapsed time on failure
- Provides detailed error messages

---

## Files Modified

### 1. `/lib/stores/orchestrator/broadcastOrchestrator.ts`
- **Line 671-708**: Enhanced `recover()` with idle state check
- **Line 507-537**: Enhanced host startup with detailed logging and extended timeout

### 2. `/lib/stores/host/hostAgentStore.ts`
- **Line 121**: Updated interface: `start: () => Promise<void>`
- **Line 368-388**: Made `start()` async, added wait loop for `isActive`

---

## Testing Notes

### Expected Console Output (Success)
```
📺 SESSIONS: Starting broadcast via orchestrator
🚀 Starting broadcast sequence...
Step 1: Starting live feed...
Step 2: Starting broadcast session timer...
Step 3: Starting host agent...
Host state before start: { isActive: false, isStreaming: false }
🎙️ HostAgentService.start() called
🎙️ Host agent starting...
📋 Host agent start() - Generated session ID: host-session-1234567890-xyz
📋 Created host session: host-session-1234567890-xyz
✅ Host agent started successfully with session: host-session-1234567890-xyz
📡 Host broadcasting started
✅ Host agent start completed, isActive: true
Host start() call completed
Host state after wait: { isActive: true, isStreaming: false, elapsed: 250 }
Step 4: Starting producer...
✅ Broadcast started successfully
```

### Expected Console Output (Error Recovery)
```
📺 SESSIONS: Error state detected, attempting recovery...
Already in idle state, re-initializing...
🔄 Initializing broadcast orchestrator...
✅ Initialization complete: idle → ready
📺 SESSIONS: Starting broadcast via orchestrator
[... normal startup sequence ...]
```

### What to Watch For
1. **No invalid state transitions**: Should not see "❌ Invalid state transition: idle → idle"
2. **Host starts successfully**: Should see "✅ Host agent start completed, isActive: true"
3. **Quick activation**: Host should activate within 250-500ms, not timeout
4. **Clean recovery**: Clicking "Recover & Start" should work smoothly

---

## Technical Details

### Why the Timing Issue Occurred
The issue was a classic **synchronous/asynchronous mismatch**:

**Old Flow (Broken)**:
```
Orchestrator → hostStore.start() [sync]
                     ↓
               hostAgent.start() [sync]
                     ↓
               emit('host:started') [async]
                     ↓
Orchestrator checks isActive [TOO EARLY] → false → timeout
                     ↓
               listener sets isActive = true [TOO LATE]
```

**New Flow (Fixed)**:
```
Orchestrator → hostStore.start() [async]
                     ↓
               hostAgent.start() [sync]
                     ↓
               emit('host:started') [async]
                     ↓
               listener sets isActive = true
                     ↓
               async loop detects isActive = true
                     ↓
Orchestrator continues → isActive is true ✅
```

### Why We Don't Refactor the Service
The `HostAgentService.start()` is intentionally synchronous because:
1. It sets up intervals and emits events
2. Making it async would require Promise-wrapping all event emissions
3. The store layer is the right place to handle async coordination
4. This pattern matches how other stores (producer, liveFeed) work

### Alternative Approaches Considered
1. **Make service.start() async**: Would require major refactoring, breaks event pattern
2. **Use Promise from event**: Cleaner but requires changing event listeners everywhere
3. **Current approach**: Minimal changes, maintains existing patterns ✅

---

## Next Steps

With these fixes complete, proceed to **Phase 4.2: Test Broadcast Start & Content Aggregation**

1. Start dev server: `npm run dev` (port 8888)
2. Navigate to Sessions tab
3. Click "Go Live" or "Recover & Start"
4. Expected: Broadcast starts successfully
5. Verify: Live feed begins aggregating posts
6. Verify: Host processes posts and generates narrations

If any issues arise, check console for the new detailed logging messages.
