# Phase 4.1.3: Stale State Reference Bug Fix

## Critical Bug Found

**Issue**: Host agent starts successfully (`isActive: true` in store), but orchestrator keeps waiting and times out.

### Root Cause: Stale State Reference

```typescript
// ❌ BROKEN CODE (Line 514)
const hostStore = useHostAgentStore.getState();

// Later... (Line 545)
while (!hostStore.isActive && Date.now() - hostStartTime < 10000) {
  // hostStore is a CONSTANT reference to the old state
  // Even though the actual state changed to isActive=true,
  // this constant still has isActive=false
}
```

**What happened**:
1. Orchestrator gets hostStore state: `{ isActive: false }`
2. Calls `await hostStore.start()`
3. Host store updates its state: `{ isActive: true }`
4. Orchestrator checks `hostStore.isActive` → **still false** (stale reference!)
5. Waits 10 seconds, times out

### The Fix

```typescript
// ✅ FIXED CODE
while (!useHostAgentStore.getState().isActive && Date.now() - hostStartTime < 10000) {
  // Get FRESH state on every iteration
  attempts++;
  if (attempts % 10 === 0) {
    const currentHostState = useHostAgentStore.getState(); // Fresh state
    _log(`Waiting for host agent... (${attempts * 100}ms elapsed, isActive=${currentHostState.isActive})`);
  }
  await new Promise(resolve => setTimeout(resolve, 100));
}

const finalHostState = useHostAgentStore.getState(); // Fresh state
if (!finalHostState.isActive) {
  throw new Error(`Host agent failed to become active after ${Date.now() - hostStartTime}ms`);
}
```

## Secondary Fix: Invalid State Transitions

**Issue**: When stopping from `error` state, orchestrator tried to transition `error → stopping`, which is not allowed.

### The Fix

```typescript
// Only transition to stopping if we're in live state
// If in error state, we'll clean up and go to idle directly
const isErrorState = state === 'error';
if (!isErrorState) {
  _setState('stopping', 'manual_stop');
}

// ... cleanup code ...

// If we were in error state, go to idle; otherwise go to ready
if (isErrorState) {
  get()._clearError();
  _setState('idle', 'error_rollback');
} else {
  _setState('ready', 'manual_stop');
}
```

**State flow now**:
- **From live**: `live → stopping → ready` ✅
- **From error**: `error → (cleanup) → idle` ✅

## Expected Behavior After Fix

When you click "Go Live":

```
🎛️ [ORCHESTRATOR] Step 3: Starting host agent...
🎙️ HOST STORE: Calling hostAgent.start()...
🎙️ HostAgentService.start() called
📡 Host broadcasting started
✅ Host agent start completed, isActive: true
🎛️ [ORCHESTRATOR] Host start() call completed
🎛️ [ORCHESTRATOR] Host state after wait: {isActive: true, isStreaming: false, elapsed: 100}
🎛️ [ORCHESTRATOR] Step 4: Starting producer...
✅ Broadcast started successfully
```

**Key difference**: 
- **Before**: "Waiting for host agent... (1000ms, 2000ms, 3000ms...)" until timeout
- **After**: Immediately detects `isActive: true` and continues (elapsed: ~100ms)

## Files Modified

### `/lib/stores/orchestrator/broadcastOrchestrator.ts`

**Lines 543-565**: Fixed stale state reference in wait loop
- Changed from checking `hostStore.isActive` (constant)
- To calling `useHostAgentStore.getState().isActive` (fresh state)

**Lines 610-623**: Fixed state transition from error
- Check if in error state before transitioning to stopping
- Skip stopping transition if already in error

**Lines 667-672**: Fixed final state after cleanup
- Go to `idle` if cleaning up from error
- Go to `ready` if normal stop from live

## Testing

Try clicking **"Go Live"** now. Expected results:

1. ✅ Host starts within ~100ms
2. ✅ Broadcast transitions to `live` state
3. ✅ No timeout errors
4. ✅ Live feed begins populating
5. ✅ Host processes posts and generates narrations

If it works, you'll see "✅ Broadcast started successfully" in console!
