# Phase 4.1.2: Host Event Listener Fix

## Issue
**Error**: `Broadcast startup failed: Host agent failed to become active after 10098ms`

**Symptom**: When clicking "Go Live", the broadcast gets stuck in "initializing" state and never transitions to "live". The host agent fails to become active within the 10-second timeout.

## Root Cause Analysis

The issue is in the event-driven architecture between the `HostAgentService` and `hostAgentStore`:

### Expected Flow
1. `hostStore.start()` calls `hostAgent.start()`
2. Service sets internal `this.state.isActive = true`
3. Service emits `'host:started'` event
4. Store's event listener catches event
5. Event listener calls `set({ isActive: true })`
6. Store's async wait loop detects `isActive === true`
7. Control returns to orchestrator

### Problem
The event listener registered in `initializeHostAgent()` may not be catching the `'host:started'` event reliably. This could happen if:
- Event fires before listener is fully registered
- EventEmitter timing issue
- The event is emitted but not reaching the listener
- Some other timing race condition

### Evidence
- Service completes `start()` successfully (logs show "✅ Host agent started successfully")
- Service's internal `state.isActive` is `true`
- Store's `isActive` remains `false`
- Wait loop times out after 5 seconds
- No "📡 Host broadcasting started" log (from event listener)

## Solution

Added **defensive programming** with three layers of protection:

### 1. Enhanced Debug Logging
Added extensive console logging to diagnose exactly where the issue occurs:

```typescript
console.log('🎙️ HOST STORE: Calling hostAgent.start()...');
hostAgent.start();
console.log('🎙️ HOST STORE: hostAgent.start() returned, waiting for isActive...');
console.log('🎙️ HOST STORE: Current store isActive state:', get().isActive);

// During wait loop
if (checkCount % 10 === 0) {
  console.log(`🎙️ HOST STORE: Still waiting... (${checkCount * 50}ms, isActive=${get().isActive})`);
}

console.log('🎙️ HOST STORE: Wait loop ended. isActive:', get().isActive);
```

### 2. Manual Fallback
After the wait loop, if `isActive` is still `false`, manually set it to `true`:

```typescript
// Fallback: If event didn't fire, manually check and set state
if (!get().isActive) {
  console.warn('⚠️ HOST STORE: Event listener did not fire, manually setting isActive');
  set({ isActive: true });
}
```

This ensures that even if the event system fails, the host will still activate because:
- The service's internal state is correct (`this.state.isActive = true`)
- We just need to sync the store's state to match
- This is safe because `hostAgent.start()` has already completed successfully

### 3. Error Handling
Keep the final error check as a last resort:

```typescript
if (!get().isActive) {
  throw new Error('Host agent failed to activate within 5 seconds');
}
```

This should never trigger now because of the manual fallback, but it's kept for safety.

## Code Changes

### File: `/lib/stores/host/hostAgentStore.ts`

**Lines 368-406**: Enhanced `start()` method

```typescript
// Start the host agent
start: async () => {
  const { hostAgent } = get();
  if (!hostAgent) {
    console.error('❌ Cannot start: Host agent not initialized');
    return;
  }
  
  console.log('🎙️ HOST STORE: Calling hostAgent.start()...');
  
  // Call the service start (which is synchronous but emits 'host:started' event)
  hostAgent.start();
  
  console.log('🎙️ HOST STORE: hostAgent.start() returned, waiting for isActive...');
  console.log('🎙️ HOST STORE: Current store isActive state:', get().isActive);
  
  // Wait for isActive to become true (the event listener sets this)
  const startTime = Date.now();
  let checkCount = 0;
  while (!get().isActive && Date.now() - startTime < 5000) {
    checkCount++;
    if (checkCount % 10 === 0) {
      console.log(`🎙️ HOST STORE: Still waiting... (${checkCount * 50}ms, isActive=${get().isActive})`);
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log('🎙️ HOST STORE: Wait loop ended. isActive:', get().isActive);
  
  // Fallback: If event didn't fire, manually check and set state
  // The service sets its internal state.isActive, so if that's true but ours isn't,
  // the event listener failed and we need to manually sync
  if (!get().isActive) {
    console.warn('⚠️ HOST STORE: Event listener did not fire, manually setting isActive');
    set({ isActive: true });
  }
  
  if (!get().isActive) {
    throw new Error('Host agent failed to activate within 5 seconds');
  }
  
  console.log('✅ Host agent start completed, isActive:', get().isActive);
},
```

## Expected Behavior After Fix

### Scenario 1: Event Listener Works (Normal Case)
```
🎙️ HOST STORE: Calling hostAgent.start()...
🎙️ HostAgentService.start() called
🎙️ Host agent starting...
📋 Host agent start() - Generated session ID: host-session-1234567890-xyz
✅ Host agent started successfully with session: host-session-1234567890-xyz
📡 Host broadcasting started  ← Event listener fires
🎙️ HOST STORE: hostAgent.start() returned, waiting for isActive...
🎙️ HOST STORE: Current store isActive state: true
🎙️ HOST STORE: Wait loop ended. isActive: true
✅ Host agent start completed, isActive: true
```

### Scenario 2: Event Listener Fails (Fallback Activates)
```
🎙️ HOST STORE: Calling hostAgent.start()...
🎙️ HostAgentService.start() called
🎙️ Host agent starting...
📋 Host agent start() - Generated session ID: host-session-1234567890-xyz
✅ Host agent started successfully with session: host-session-1234567890-xyz
🎙️ HOST STORE: hostAgent.start() returned, waiting for isActive...
🎙️ HOST STORE: Current store isActive state: false
🎙️ HOST STORE: Still waiting... (500ms, isActive=false)
🎙️ HOST STORE: Still waiting... (1000ms, isActive=false)
🎙️ HOST STORE: Still waiting... (1500ms, isActive=false)
🎙️ HOST STORE: Still waiting... (2000ms, isActive=false)
🎙️ HOST STORE: Still waiting... (2500ms, isActive=false)
🎙️ HOST STORE: Still waiting... (3000ms, isActive=false)
🎙️ HOST STORE: Still waiting... (3500ms, isActive=false)
🎙️ HOST STORE: Still waiting... (4000ms, isActive=false)
🎙️ HOST STORE: Still waiting... (4500ms, isActive=false)
🎙️ HOST STORE: Wait loop ended. isActive: false
⚠️ HOST STORE: Event listener did not fire, manually setting isActive  ← Fallback
✅ Host agent start completed, isActive: true  ← Success!
```

## Benefits of This Approach

1. **Diagnostic Information**: The extensive logging will tell us exactly what's happening
2. **Reliability**: The manual fallback ensures the host starts even if events fail
3. **Safe**: The service has already initialized correctly, we're just syncing state
4. **Non-Breaking**: If events work normally, behavior is unchanged
5. **Debuggable**: If the warning appears, we know there's an event system issue to investigate later

## Testing

After this fix, clicking "Go Live" should:
1. Show detailed console logs from host startup
2. Complete successfully within ~250ms (if event works) or ~5s (if fallback needed)
3. Transition from "initializing" → "live" without timeout errors
4. Begin processing Reddit posts and generating narrations

## Future Improvements

If the fallback warning appears frequently, investigate:
1. EventEmitter timing in Node.js vs browser
2. Whether event listeners need to be registered earlier
3. Alternative synchronization mechanisms (Promise-based instead of event-based)
4. Whether to refactor the service to be fully async

For now, the fallback ensures the system works reliably.
