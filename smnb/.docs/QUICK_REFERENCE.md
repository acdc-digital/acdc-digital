# Broadcast Orchestrator - Quick Reference Card

> **TL;DR:** Use `useBroadcastOrchestrator()` instead of calling individual stores directly.

---

## 🎯 The Golden Rule

❌ **DON'T** call store methods directly:
```typescript
// ❌ Old way - causes state fragmentation
const { start, stop } = useHostAgentStore();
const { setIsLive } = useSimpleLiveFeedStore();
```

✅ **DO** use orchestrator:
```typescript
// ✅ New way - coordinated state management
const { startBroadcast, stopBroadcast } = useBroadcastOrchestrator();
```

---

## 🚀 Most Common Patterns

### 1. Toggle Broadcast Button
```typescript
import { useBroadcastOrchestrator, useIsBroadcasting } from '@/lib/stores/orchestrator/broadcastOrchestrator';

const { startBroadcast, stopBroadcast } = useBroadcastOrchestrator();
const isLive = useIsBroadcasting();

<Button onClick={isLive ? stopBroadcast : startBroadcast}>
  {isLive ? 'Stop' : 'Start'}
</Button>
```

### 2. Conditional UI Based on State
```typescript
import { useBroadcastState } from '@/lib/stores/orchestrator/broadcastOrchestrator';

const state = useBroadcastState();

{state === 'live' && <LiveIndicator />}
{state === 'error' && <ErrorMessage />}
{state === 'starting' && <LoadingSpinner />}
```

### 3. Disable Button During Transitions
```typescript
import { useIsTransitioning, useCanStartBroadcast } from '@/lib/stores/orchestrator/broadcastOrchestrator';

const isTransitioning = useIsTransitioning();
const canStart = useCanStartBroadcast();

<Button 
  disabled={isTransitioning || !canStart}
  onClick={startBroadcast}
>
  Start
</Button>
```

### 4. Show Error Messages
```typescript
import { useBroadcastError } from '@/lib/stores/orchestrator/broadcastOrchestrator';

const error = useBroadcastError();

{error && <Alert variant="error">{error}</Alert>}
```

### 5. Full State Inspection (Debugging)
```typescript
import { useBroadcastSnapshot } from '@/lib/stores/orchestrator/broadcastOrchestrator';

const snapshot = useBroadcastSnapshot();

console.log('Orchestrator:', snapshot.orchestrator.state);
console.log('Host active:', snapshot.host.isActive);
console.log('Can start:', snapshot.computed.canStart);
```

---

## 📦 Available Hooks

| Hook | Returns | Use Case |
|------|---------|----------|
| `useBroadcastOrchestrator()` | Full store | Access to all methods |
| `useIsBroadcasting()` | `boolean` | Check if live |
| `useBroadcastState()` | `BroadcastState` | Get current state |
| `useCanStartBroadcast()` | `boolean` | Check if can start |
| `useCanStopBroadcast()` | `boolean` | Check if can stop |
| `useIsTransitioning()` | `boolean` | Check if loading |
| `useHasError()` | `boolean` | Check for errors |
| `useBroadcastError()` | `string \| null` | Get error message |
| `useBroadcastSnapshot()` | `BroadcastSnapshot` | Full state snapshot |

---

## 🎬 Core Methods

### `initialize()`
Prepares the system for broadcasting.
```typescript
const { initialize } = useBroadcastOrchestrator();
await initialize(); // Call once in layout
```

### `startBroadcast(sessionId?)`
Starts the broadcast with full orchestrated sequence.
```typescript
const { startBroadcast } = useBroadcastOrchestrator();
await startBroadcast(); // or startBroadcast(convexSessionId)
```

### `stopBroadcast()`
Stops the broadcast with full orchestrated sequence.
```typescript
const { stopBroadcast } = useBroadcastOrchestrator();
await stopBroadcast();
```

### `emergencyStop()`
Immediate shutdown (use in critical situations).
```typescript
const { emergencyStop } = useBroadcastOrchestrator();
await emergencyStop();
```

### `recover()`
Recover from error state.
```typescript
const { recover } = useBroadcastOrchestrator();
await recover();
```

---

## 🎨 State Values

| State | Meaning | UI Color |
|-------|---------|----------|
| `idle` | Nothing active | Gray |
| `initializing` | Starting up | Yellow |
| `ready` | Ready to broadcast | Blue |
| `starting` | Broadcast starting | Yellow |
| `live` | Broadcasting | Green |
| `stopping` | Broadcast stopping | Yellow |
| `error` | Error occurred | Red |

---

## 🔧 Common Tasks

### Initialize on App Load
```typescript
// app/dashboard/layout.tsx
useEffect(() => {
  useBroadcastOrchestrator.getState().initialize();
}, []);
```

### Add Debug Monitor
```typescript
// app/dashboard/layout.tsx
import { BroadcastStateMonitor } from '@/components/debug/BroadcastStateMonitor';

{process.env.NODE_ENV === 'development' && <BroadcastStateMonitor />}
```

### Enable Validation
```typescript
// app/dashboard/layout.tsx
import { startValidationMonitoring } from '@/lib/validation/broadcastStateValidator';

useEffect(() => {
  const stop = startValidationMonitoring(5000); // Every 5 seconds
  return stop;
}, []);
```

### Error Handling
```typescript
const { startBroadcast } = useBroadcastOrchestrator();

try {
  await startBroadcast();
} catch (error) {
  // Error is already captured in orchestrator
  // Just log or show user-friendly message
  console.error('Broadcast failed:', error);
}
```

---

## ⚠️ Important Rules

1. **Never bypass the orchestrator**
   - ❌ Don't call `hostStore.start()` directly
   - ✅ Call `orchestrator.startBroadcast()`

2. **Always check prerequisites**
   - Use `canStartBroadcast()` before starting
   - Use `canStopBroadcast()` before stopping

3. **Handle loading states**
   - Use `useIsTransitioning()` to show spinners
   - Disable buttons during transitions

4. **Display errors**
   - Use `useBroadcastError()` to get error messages
   - Show user-friendly error UI

5. **Initialize once**
   - Call `initialize()` in layout, not in every component
   - Don't call multiple times

---

## 🐛 Debugging

### Check Current State
```typescript
const snapshot = useBroadcastOrchestrator.getState().getSnapshot();
console.table(snapshot.orchestrator);
console.table(snapshot.computed);
```

### Validate State
```typescript
import { stateValidator } from '@/lib/validation/broadcastStateValidator';

const report = stateValidator.validateAndLog();
// Logs issues to console
```

### Force State (Development Only)
```typescript
// ⚠️ Only for debugging - don't use in production
const { _setState } = useBroadcastOrchestrator.getState();
_setState('idle', 'user_action'); // Force to idle
```

---

## 📍 File Locations

```
smnb/
├── lib/
│   ├── stores/
│   │   └── orchestrator/
│   │       └── broadcastOrchestrator.ts     ← Main orchestrator
│   └── validation/
│       └── broadcastStateValidator.ts       ← Validation agent
├── components/
│   └── debug/
│       └── BroadcastStateMonitor.tsx        ← Debug UI
└── ORCHESTRATOR_USAGE_GUIDE.md              ← Full documentation
```

---

## 🔗 Quick Links

- **Full API Docs:** [ORCHESTRATOR_USAGE_GUIDE.md](./ORCHESTRATOR_USAGE_GUIDE.md)
- **Implementation Plan:** [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **Original Analysis:** [STATE_MANAGEMENT_ANALYSIS.md](./STATE_MANAGEMENT_ANALYSIS.md)

---

## 💡 Quick Tips

- **Use the state monitor** - It shows everything in real-time
- **Check validation first** - Run `stateValidator.validateAndLog()`
- **Start simple** - Just replace your toggle button first
- **Test tab switching** - Verify state persists
- **Enable verbose logging** - Set `verboseLogging: true` in config

---

## 🆘 Help

**Something not working?**

1. Check state monitor - is orchestrator initialized?
2. Run validation - any errors?
3. Check console - verbose logging enabled?
4. Review [Troubleshooting Guide](./ORCHESTRATOR_USAGE_GUIDE.md#troubleshooting)

**Still stuck?** Check the full documentation or ask for help!

---

**Keep this card handy while migrating components!** 📌
