# Grapes Nexus Quick Reference

## Architecture at a Glance

```
ComputerUsePanel → useGrapesAgent → /api/agents/stream → GrapesOrchestratorAgent → Tools
```

## Key Files

| File | Purpose | Lines | Status |
|------|---------|-------|--------|
| `lib/agents/nexus/types.ts` | Type definitions | 108 | ✅ Complete |
| `lib/agents/nexus/BaseNexusAgent.ts` | Abstract base class | 225 | ✅ Complete |
| `lib/agents/nexus/GrapesOrchestratorAgent.ts` | Main orchestrator | 562 | ✅ Complete |
| `app/api/agents/stream/route.ts` | SSE endpoint | 166 | ✅ Complete |
| `lib/hooks/useGrapesAgent.ts` | React hook | 242 | ✅ Complete |
| `components/ai/computer-use-panel.tsx` | UI component | ~270 | ✅ Complete |
| `app/api/computer-use/route.ts` | Old API route | 593 | ⚠️ Deprecated |

## Agent Tools

| Tool | Purpose | Status |
|------|---------|--------|
| `capture_screenshot` | Vision analysis of map | 🟡 Placeholder |
| `calculate_area` | Spherical geometry calculation | ✅ Implemented |
| `reverse_geocode` | Coordinates → Address | ✅ Implemented |
| `search_places` | Find businesses/places | ✅ Implemented |

## Hook API

```typescript
const {
  messages,        // Message history
  isStreaming,     // Currently receiving stream
  error,           // Last error message  
  currentResponse, // Accumulating response
  sendMessage,     // Send message with context
  cancelStream,    // Abort current stream
  clearMessages,   // Reset conversation
  clearError,      // Clear error state
} = useGrapesAgent();
```

## Sending Messages

```typescript
// With shape coordinates
await sendMessage({
  message: "Analyze this area",
  shapeCoordinates: [{ lat: 49.28, lng: -123.12 }, ...],
  screenshot: "base64..." // optional
});

// Follow-up question (uses stored context)
await sendMessage({
  message: "What restaurants are here?"
});
```

## Message Structure

```typescript
interface GrapesAgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  toolCalls?: Array<{
    toolId: string;
    input: unknown;
    result?: unknown;
  }>;
}
```

## Adding a New Tool

1. Define in `GrapesOrchestratorAgent.ts`:

```typescript
{
  type: 'tool' as const,
  identifier: 'my_new_tool',
  requiresPremium: false,
  schema: {
    name: 'my_new_tool',
    description: 'What this tool does',
    input_schema: {
      type: 'object',
      properties: {
        param1: { type: 'string', description: '...' }
      },
      required: ['param1']
    }
  },
  handler: async (input: unknown, context?: ExecutionContext) => {
    // Implementation
    return { success: true, data: '...' };
  }
}
```

2. Tool automatically available in agent's capabilities

## Testing Checklist

```bash
# Start dev server
cd grapes/grapes
npm run dev

# Open browser
open http://localhost:3000/demo
```

- [ ] Draw rectangle → Click "Analyze"
- [ ] Draw circle → Click "Analyze"
- [ ] Ask "What's the area?"
- [ ] Ask "What restaurants are here?"
- [ ] Ask "Where is this?"
- [ ] Try with screenshot enabled
- [ ] Test "Clear" button
- [ ] Test error handling (disable internet)
- [ ] Check console for logs

## Common Commands

```bash
# Check for errors
npm run lint

# Format code
npm run format

# Build
npm run build

# Type check
npx tsc --noEmit
```

## Environment Setup

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_MAPS_API_KEY=AIza...

# Optional
NEXT_PUBLIC_CONVEX_URL=https://...
```

## Debugging

Enable detailed logging:

```typescript
// In /api/agents/stream/route.ts
console.log('[Agent Stream] Request:', {
  agentId,
  messageLength: message.length,
  hasScreenshot: !!screenshot,
  coordinateCount: shapeCoordinates?.length || 0
});

// In useGrapesAgent.ts
console.log('[Hook] Chunk received:', chunk);
```

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "ANTHROPIC_API_KEY not configured" | Missing API key | Add to `.env.local` |
| "Agent not found: X" | Invalid agent ID | Use `grapes-orchestrator` |
| "No response body" | Network issue | Check connection |
| "Stream aborted" | User cancelled | Not an error, expected |

## Migration Checklist

Migrating from old API to Nexus:

- [ ] Replace `fetch('/api/computer-use')` with `useGrapesAgent` hook
- [ ] Update state management (remove manual message state)
- [ ] Update message structure (`role` instead of `type`)
- [ ] Update loading states (`isStreaming` instead of `isExecuting`)
- [ ] Remove manual SSE parsing
- [ ] Add error display using `error` state
- [ ] Test thoroughly

## Performance Tips

1. **Minimize re-renders**: Memoize callbacks with `useCallback`
2. **Lazy load**: Code-split large components
3. **Virtual scrolling**: For long message lists
4. **Debounce input**: Prevent excessive typing events
5. **Cache results**: Store tool results in localStorage

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| SSE over WebSockets | Simpler, no connection management needed |
| React hook pattern | Cleaner than context, easier to test |
| Single agent per request | Simpler API, can extend later |
| Base64 screenshots | No file storage needed, passed in context |
| Separate tool files | Could split later, inline for now |

## Next Features to Implement

**Priority 1** (Core functionality):
- Real screenshot vision analysis
- End-to-end testing suite
- Error boundary wrapper

**Priority 2** (User experience):
- Message persistence
- Conversation export
- Suggested prompts
- Voice input

**Priority 3** (Architecture):
- Multiple agent support
- Agent versioning
- Telemetry/analytics
- A/B testing framework

## Resources

- [Nexus Framework Doc](/.agents/nexus-unified-architecture.md)
- [SMNB Reference](/smnb/smnb/lib/agents/nexus/SessionManagerAgent.ts)
- [Anthropic SDK Docs](https://docs.anthropic.com/claude/docs/tool-use)
- [Google Maps APIs](https://developers.google.com/maps/documentation)

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Production Ready (pending tests)
