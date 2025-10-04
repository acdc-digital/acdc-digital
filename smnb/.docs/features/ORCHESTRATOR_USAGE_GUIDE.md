# Broadcast Orchestrator - Implementation Guide

## Overview

The Broadcast Orchestrator is a **Finite State Machine (FSM)-based state management system** that provides:

- ✅ **Single source of truth** for broadcast lifecycle
- ✅ **Validated state transitions** with rollback on error
- ✅ **Cross-store coordination** of host, producer, live feed, and session stores
- ✅ **Automatic error recovery** with configurable retry logic
- ✅ **Backend synchronization** (Convex integration ready)
- ✅ **Real-time debugging** with state monitor component

---

## Quick Start

### 1. Initialize the Orchestrator

Add to your dashboard layout:

```typescript
// app/dashboard/layout.tsx
'use client';

import { useEffect } from 'react';
import { useBroadcastOrchestrator } from '@/lib/stores/orchestrator/broadcastOrchestrator';
import { BroadcastStateMonitor } from '@/components/debug/BroadcastStateMonitor';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { initialize } = useBroadcastOrchestrator();
  
  useEffect(() => {
    console.log('📡 Dashboard: Initializing broadcast orchestrator...');
    initialize();
  }, [initialize]);
  
  return (
    <div>
      {children}
      
      {/* Show state monitor in development */}
      {process.env.NODE_ENV === 'development' && <BroadcastStateMonitor />}
    </div>
  );
}
```

### 2. Refactor Components to Use Orchestrator

**Before (Sessions.tsx - BROKEN):**
```typescript
const { isActive: isHostActive, start, stop, hostAgent } = useHostAgentStore();
const { isLive, setIsLive } = useSimpleLiveFeedStore();
const { startBroadcastSession, endBroadcastSession } = useBroadcastSessionStore();

const handleToggleLive = async () => {
  if (isHostActive) {
    setIsLive(false);
    endBroadcastSession();
    await stop();
  } else {
    if (!hostAgent) return; // ❌ FAILS HERE
    setIsLive(true);
    startBroadcastSession('analysis');
    await start();
  }
};
```

**After (Sessions.tsx - WORKING):**
```typescript
import { 
  useBroadcastOrchestrator,
  useIsBroadcasting,
  useCanStartBroadcast,
  useIsTransitioning,
  useBroadcastError
} from '@/lib/stores/orchestrator/broadcastOrchestrator';

export function Sessions() {
  const { startBroadcast, stopBroadcast } = useBroadcastOrchestrator();
  const isLive = useIsBroadcasting();
  const canStart = useCanStartBroadcast();
  const isTransitioning = useIsTransitioning();
  const error = useBroadcastError();
  
  const handleToggleLive = async () => {
    try {
      if (isLive) {
        await stopBroadcast();
      } else if (canStart) {
        await startBroadcast();
      }
    } catch (err) {
      console.error('Failed to toggle broadcast:', err);
      // Error is already in orchestrator state
    }
  };
  
  return (
    <div className="space-y-4">
      <Button
        onClick={handleToggleLive}
        disabled={isTransitioning || (!isLive && !canStart)}
        className={isLive ? "bg-red-500" : "bg-neutral-900"}
      >
        {isTransitioning && <Spinner className="mr-2" />}
        {isLive ? 'LIVE' : 'Go Live'}
      </Button>
      
      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
```

---

## State Machine

### States

```
idle → initializing → ready → starting → live → stopping → idle
                                   ↓        ↓
                                 error → idle
```

| State | Description | Can Transition To |
|-------|-------------|-------------------|
| `idle` | Nothing active, system at rest | `initializing`, `error` |
| `initializing` | Services starting up | `ready`, `error` |
| `ready` | Services ready, can broadcast | `starting`, `idle`, `error` |
| `starting` | Broadcast starting | `live`, `error` |
| `live` | Actively broadcasting | `stopping`, `error` |
| `stopping` | Broadcast stopping | `idle`, `error` |
| `error` | Error state (recoverable) | `idle`, `initializing` |

### Startup Sequence

When you call `startBroadcast()`, the orchestrator executes:

1. **Validate prerequisites**
   - State must be `ready`
   - Host agent must be initialized
   - Live feed must have content

2. **Transition to `starting`**

3. **Execute startup sequence** (order matters!):
   ```typescript
   liveFeedStore.setIsLive(true);           // Step 1
   sessionStore.startBroadcastSession();     // Step 2
   await hostStore.start();                  // Step 3
   await producerStore.startProducer();      // Step 4
   // Sync to Convex (if enabled)            // Step 5
   ```

4. **Transition to `live`** ✅

5. **On error: automatic rollback** ↩️

### Shutdown Sequence

When you call `stopBroadcast()`, the orchestrator executes in **reverse order**:

1. **Validate** - Must be in `live` or `error` state

2. **Transition to `stopping`**

3. **Execute shutdown** (reverse order):
   ```typescript
   await producerStore.stopProducer();      // Step 1
   await hostStore.stop();                  // Step 2
   sessionStore.endBroadcastSession();      // Step 3
   liveFeedStore.setIsLive(false);          // Step 4
   // Sync to Convex (if enabled)           // Step 5
   ```

4. **Transition to `ready`** ✅

---

## API Reference

### Core Actions

#### `initialize()`
Initialize the broadcast system. Ensures all services are ready.

```typescript
const { initialize } = useBroadcastOrchestrator();

await initialize();
// State: idle → initializing → ready
```

**Behavior:**
- Initializes host agent if not already initialized
- Waits for initialization with timeout (default: 10s)
- Auto-retries on failure (default: 3 attempts)
- Transitions to `ready` when complete

---

#### `startBroadcast(sessionId?)`
Start broadcasting with full orchestrated startup sequence.

```typescript
const { startBroadcast } = useBroadcastOrchestrator();

await startBroadcast(); // Without Convex session
// or
await startBroadcast(convexSessionId); // With Convex session
```

**Parameters:**
- `sessionId` (optional): Convex session ID for backend sync

**Throws:**
- Error if prerequisites not met
- Error if any step in startup sequence fails

**Behavior:**
- Validates state and prerequisites
- Executes startup sequence (see above)
- Rolls back on error
- Syncs to Convex if session ID provided

---

#### `stopBroadcast()`
Stop broadcasting with full orchestrated shutdown sequence.

```typescript
const { stopBroadcast } = useBroadcastOrchestrator();

await stopBroadcast();
```

**Behavior:**
- Must be in `live` or `error` state
- Executes shutdown in reverse order
- Returns to `ready` state
- Syncs to Convex if previously synced

---

#### `emergencyStop()`
Immediate shutdown without graceful cleanup. Use in critical situations.

```typescript
const { emergencyStop } = useBroadcastOrchestrator();

await emergencyStop();
```

**Behavior:**
- Bypasses normal shutdown sequence
- Stops all services in parallel
- Forces state to `idle`
- No Convex sync

---

#### `recover()`
Recover from error state. Attempts to return system to working condition.

```typescript
const { recover } = useBroadcastOrchestrator();

await recover();
```

**Behavior:**
- Only works in `error` state
- Runs emergency stop
- Clears error
- Re-initializes if auto-recovery enabled

---

### State Inspection

#### `getSnapshot()`
Get complete state snapshot for debugging and inspection.

```typescript
const { getSnapshot } = useBroadcastOrchestrator();

const snapshot = getSnapshot();
console.log(snapshot.orchestrator.state); // 'live'
console.log(snapshot.host.isActive);      // true
console.log(snapshot.computed.canStart);  // false
```

**Returns:** `BroadcastSnapshot` object with:
- `orchestrator`: Orchestrator state and transition history
- `host`: Host agent state
- `producer`: Producer state
- `liveFeed`: Live feed state
- `session`: Broadcast session state
- `convex`: Convex sync status
- `computed`: Computed flags (canStart, canStop, etc.)

---

#### `canStartBroadcast()`
Check if broadcast can start.

```typescript
const { canStartBroadcast } = useBroadcastOrchestrator();

if (canStartBroadcast()) {
  // Safe to start
}
```

**Returns:** `true` if:
- State is `ready`
- Host agent is initialized
- Live feed has content

---

#### `canStopBroadcast()`
Check if broadcast can stop.

```typescript
const { canStopBroadcast } = useBroadcastOrchestrator();

if (canStopBroadcast()) {
  // Safe to stop
}
```

**Returns:** `true` if state is `live`

---

#### `validateTransition(to: BroadcastState)`
Validate if a state transition is allowed.

```typescript
const { validateTransition } = useBroadcastOrchestrator();

const validation = validateTransition('live');
if (validation.valid) {
  // Transition allowed
} else {
  console.log(validation.reason); // "Invalid transition from..."
}
```

**Returns:** `TransitionValidation` object:
```typescript
{
  valid: boolean;
  reason?: string;
  missingDependencies?: string[];
}
```

---

### Utility Hooks

Pre-built hooks for common use cases:

```typescript
// Check if broadcasting
const isLive = useIsBroadcasting();

// Check if can start
const canStart = useCanStartBroadcast();

// Check if can stop
const canStop = useCanStopBroadcast();

// Get current state
const state = useBroadcastState(); // 'idle' | 'live' | ...

// Check for errors
const hasError = useHasError();
const errorMessage = useBroadcastError();

// Check if transitioning
const isTransitioning = useIsTransitioning();

// Get full snapshot
const snapshot = useBroadcastSnapshot();
```

---

### Configuration

#### `updateConfig(config)`
Update orchestrator configuration.

```typescript
const { updateConfig } = useBroadcastOrchestrator();

updateConfig({
  initializationTimeout: 15000,  // 15 seconds
  enableAutoRecovery: false,      // Disable auto-recovery
  verboseLogging: true,           // Enable detailed logs
});
```

**Available Options:**
```typescript
interface OrchestratorConfig {
  // Timeouts (milliseconds)
  initializationTimeout: number;  // Default: 10000
  startupTimeout: number;          // Default: 15000
  shutdownTimeout: number;         // Default: 10000
  
  // Retry configuration
  maxRetries: number;              // Default: 3
  retryDelay: number;              // Default: 1000
  
  // Feature flags
  enableAutoRecovery: boolean;     // Default: true
  enableConvexSync: boolean;       // Default: true
  enableStateValidation: boolean;  // Default: true
  
  // Debug
  verboseLogging: boolean;         // Default: true in dev
}
```

---

## Migration Examples

### Example 1: Simple Toggle Button

**Before:**
```typescript
const { isActive, start, stop } = useHostAgentStore();

<Button onClick={isActive ? stop : start}>
  {isActive ? 'Stop' : 'Start'}
</Button>
```

**After:**
```typescript
const { startBroadcast, stopBroadcast } = useBroadcastOrchestrator();
const isLive = useIsBroadcasting();
const isTransitioning = useIsTransitioning();

<Button 
  onClick={isLive ? stopBroadcast : startBroadcast}
  disabled={isTransitioning}
>
  {isTransitioning && <Spinner />}
  {isLive ? 'Stop' : 'Start'}
</Button>
```

---

### Example 2: Conditional Controls

**Before:**
```typescript
const { isActive: isHostActive } = useHostAgentStore();
const { isActive: isProducerActive } = useProducerStore();

// Can't easily tell overall state
const canBroadcast = isHostActive && isProducerActive;
```

**After:**
```typescript
const canStart = useCanStartBroadcast();
const canStop = useCanStopBroadcast();
const state = useBroadcastState();

// Clear overall state
<div>
  <Button disabled={!canStart}>Start</Button>
  <Button disabled={!canStop}>Stop</Button>
  <Badge>{state}</Badge>
</div>
```

---

### Example 3: Error Handling

**Before:**
```typescript
const handleStart = async () => {
  try {
    await start();
  } catch (error) {
    // Manual error handling
    setError(error.message);
  }
};
```

**After:**
```typescript
const { startBroadcast } = useBroadcastOrchestrator();
const error = useBroadcastError();

const handleStart = async () => {
  await startBroadcast(); // Error automatically captured
};

// Error displayed automatically
{error && <ErrorMessage>{error}</ErrorMessage>}
```

---

### Example 4: State-Dependent UI

**Before:**
```typescript
const { isActive: hostActive } = useHostAgentStore();
const { isActive: producerActive } = useProducerStore();
const { isLive } = useSimpleLiveFeedStore();

// Complex conditional logic
const showBroadcastUI = hostActive && producerActive && isLive;
```

**After:**
```typescript
const state = useBroadcastState();

const showBroadcastUI = state === 'live';
const showLoadingUI = ['initializing', 'starting', 'stopping'].includes(state);
const showErrorUI = state === 'error';
```

---

## Testing

### Unit Tests

```typescript
import { renderHook, act } from '@testing-library/react';
import { useBroadcastOrchestrator } from './broadcastOrchestrator';

describe('Broadcast Orchestrator', () => {
  it('should start in idle state', () => {
    const { result } = renderHook(() => useBroadcastOrchestrator());
    expect(result.current.state).toBe('idle');
  });
  
  it('should prevent starting without initialization', async () => {
    const { result } = renderHook(() => useBroadcastOrchestrator());
    
    await expect(
      result.current.startBroadcast()
    ).rejects.toThrow('Cannot start broadcast');
  });
  
  it('should complete full startup sequence', async () => {
    const { result } = renderHook(() => useBroadcastOrchestrator());
    
    // Initialize
    await act(async () => {
      await result.current.initialize();
    });
    expect(result.current.state).toBe('ready');
    
    // Start broadcast
    await act(async () => {
      await result.current.startBroadcast();
    });
    expect(result.current.state).toBe('live');
    
    // Check all stores
    const snapshot = result.current.getSnapshot();
    expect(snapshot.host.isActive).toBe(true);
    expect(snapshot.producer.isActive).toBe(true);
    expect(snapshot.liveFeed.isLive).toBe(true);
  });
});
```

---

## Debugging

### State Monitor Component

The `BroadcastStateMonitor` provides real-time debugging:

![State Monitor Screenshot](docs/state-monitor-screenshot.png)

**Features:**
- Live state updates
- Transition history
- Error display
- Action buttons (start, stop, recover)
- Raw JSON view
- Collapsible panel

**Usage:**
```typescript
// app/dashboard/layout.tsx
import { BroadcastStateMonitor } from '@/components/debug/BroadcastStateMonitor';

{process.env.NODE_ENV === 'development' && <BroadcastStateMonitor />}
```

---

### Console Logging

Enable verbose logging:

```typescript
const { updateConfig } = useBroadcastOrchestrator();

updateConfig({ verboseLogging: true });
```

**Output:**
```
🎛️ [ORCHESTRATOR] State transition: idle → initializing { reason: 'system_init' }
🎛️ [ORCHESTRATOR] Starting initialization...
🎛️ [ORCHESTRATOR] Initializing host agent...
🎛️ [ORCHESTRATOR] ✅ Initialization complete - system ready for broadcast
🎛️ [ORCHESTRATOR] State transition: initializing → ready { reason: 'dependency_ready' }
```

---

## Convex Integration (TODO)

### Backend Schema Extension

Add broadcast state fields to sessions:

```typescript
// convex/schema.ts
sessions: defineTable({
  // ... existing fields
  
  // Broadcast state
  broadcastState: v.optional(v.union(
    v.literal("idle"),
    v.literal("live"),
    v.literal("paused")
  )),
  hostActive: v.optional(v.boolean()),
  producerActive: v.optional(v.boolean()),
  liveFeedActive: v.optional(v.boolean()),
  broadcastStartedAt: v.optional(v.number()),
  broadcastDuration: v.optional(v.number()),
}).index("by_broadcastState", ["broadcastState"])
```

### Mutation

```typescript
// convex/users/sessions.ts
export const updateBroadcastState = mutation({
  args: {
    id: v.id("sessions"),
    broadcastState: v.union(
      v.literal("idle"), 
      v.literal("live"), 
      v.literal("paused")
    ),
    hostActive: v.boolean(),
    producerActive: v.boolean(),
    liveFeedActive: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      broadcastState: args.broadcastState,
      hostActive: args.hostActive,
      producerActive: args.producerActive,
      liveFeedActive: args.liveFeedActive,
      lastActiveTime: Date.now(),
    });
  },
});
```

### Orchestrator Integration

Uncomment Convex sync code in `broadcastOrchestrator.ts`:

```typescript
// In startBroadcast()
if (config.enableConvexSync && sessionId) {
  const convex = await getConvexClient();
  await convex.mutation(api.users.sessions.updateBroadcastState, {
    id: sessionId,
    broadcastState: 'live',
    hostActive: true,
    producerActive: true,
    liveFeedActive: true,
  });
}
```

---

## Best Practices

### ✅ DO

- **Always use orchestrator methods** for broadcast control
- **Use utility hooks** for state inspection
- **Initialize in layout/top-level component**
- **Handle errors with try/catch** around orchestrator calls
- **Use state monitor** during development
- **Test state transitions** in integration tests

### ❌ DON'T

- **Don't bypass orchestrator** and call store methods directly
- **Don't mix orchestrator and direct store control**
- **Don't assume state** - always check with `canStart/canStop`
- **Don't ignore errors** - orchestrator captures them for a reason
- **Don't use local useState** for broadcast-related state

---

## Troubleshooting

### Problem: Button doesn't work

**Check:**
1. Is orchestrator initialized? (state should be `ready`, not `idle`)
2. Can you start? (`canStartBroadcast()` returns true?)
3. Any errors? (`useBroadcastError()` has value?)

**Solution:**
```typescript
const state = useBroadcastState();
const canStart = useCanStartBroadcast();
const error = useBroadcastError();

console.log({ state, canStart, error }); // Debug output
```

---

### Problem: State "skips" when switching tabs

**Cause:** You're using local `useState` instead of orchestrator

**Solution:** Remove all local state, use orchestrator hooks:
```typescript
// ❌ Wrong
const [isLive, setIsLive] = useState(false);

// ✅ Right
const isLive = useIsBroadcasting();
```

---

### Problem: Orchestrator stuck in error state

**Solution:** Call `recover()`:
```typescript
const { recover } = useBroadcastOrchestrator();

await recover(); // Returns to idle and re-initializes
```

---

## Summary

The Broadcast Orchestrator provides:

1. **✅ Single source of truth** - No more duplicate control logic
2. **✅ State validation** - Invalid transitions prevented
3. **✅ Error recovery** - Automatic rollback and retry
4. **✅ Debugging tools** - State monitor and verbose logging
5. **✅ Type safety** - Full TypeScript support
6. **✅ Testability** - Easy to test state machine logic

**Migration Path:**
1. Add orchestrator to dashboard layout
2. Refactor one component at a time
3. Remove duplicate control logic
4. Test with state monitor
5. Deploy quick wins
6. Full Convex integration (optional)

**Result:** Robust, maintainable broadcast state management that scales with your app complexity.
