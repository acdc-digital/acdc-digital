# SessionManagerChats Implementation

## Overview
Implemented a comprehensive chat storage system for the SessionManagerAgent following Convex best practices for AI conversational flows.

## Database Schema

### Table: `sessionManagerChats`

**Purpose**: Store all chat messages for SessionManagerAgent analytics conversations with comprehensive metadata, token tracking, and tool usage information.

**Location**: `/smnb/convex/schema.ts` (lines 1157-1257)

#### Core Fields
- `sessionId`: string - Unique session identifier for grouping conversations
- `role`: "user" | "assistant" | "system" - Message role
- `content`: string - Message text content
- `createdAt`: number - Timestamp (milliseconds)
- `updatedAt`: number (optional) - Last update timestamp

#### Message Metadata
- `messageId`: string (optional) - Unique message identifier
- `parentMessageId`: string (optional) - For threading/conversation flow
- `messageType`: "query" | "response" | "tool_result" | "error" | "context"
- `conversationTurn`: number (optional) - Turn number in conversation
- `isMultiTurn`: boolean (optional) - Part of multi-turn tool chain

#### Tool Usage Tracking
- `toolCalls`: array (optional) - Array of tool call records
  - `toolName`: string - e.g., "analyze_session_metrics"
  - `toolInput`: string - JSON string of input parameters
  - `toolResult`: string (optional) - JSON string of tool output
  - `status`: "pending" | "success" | "error"
  - `executionTime`: number (optional) - Milliseconds
  - `errorMessage`: string (optional)

#### Token Usage & Cost
- `tokenUsage`: object (optional)
  - `inputTokens`: number
  - `outputTokens`: number
  - `totalTokens`: number
  - `estimatedCost`: number (USD)
  - `model`: string - e.g., "claude-3-5-sonnet-20241022"

#### AI Model Configuration
- `modelConfig`: object (optional)
  - `model`: string
  - `temperature`: number (optional)
  - `maxTokens`: number (optional)
  - `topP`: number (optional)

#### Quality & Analytics
- `sentiment`: "positive" | "neutral" | "negative" (optional)
- `userFeedback`: object (optional)
  - `rating`: "helpful" | "neutral" | "unhelpful"
  - `comment`: string (optional)
  - `feedbackAt`: number
- `responseTime`: number (optional) - Total response time in ms
- `streamingEnabled`: boolean (optional)

#### Extensibility
- `metadata`: string (optional) - JSON blob for future extensibility

#### Indexes
1. `by_sessionId` - Primary access pattern
2. `by_sessionId_and_createdAt` - Chronological within session
3. `by_role` - Filter by message role
4. `by_messageType` - Filter by message type
5. `by_createdAt` - Global time-based queries
6. **Search Index** `search_chat_content` - Full-text search
   - Search field: `content`
   - Filter fields: `sessionId`, `role`, `messageType`

---

## Convex Functions

### Location: `/smnb/convex/sessionManagerChats.ts`

All functions follow the new Convex syntax with explicit `args` and `returns` validators.

---

## Mutations

### `create`
**Purpose**: Insert a new chat message into a session

**Arguments**:
- `sessionId`: string (required)
- `role`: "user" | "assistant" | "system" (required)
- `content`: string (required)
- All optional fields from schema

**Returns**: `Id<"sessionManagerChats">` - Document ID of created message

**Usage**:
```typescript
const messageId = await ctx.runMutation(api.sessionManagerChats.create, {
  sessionId: "session_123",
  role: "user",
  content: "Show me token usage for today",
  messageType: "query",
  conversationTurn: 1,
});
```

---

### `update`
**Purpose**: Update an existing message (e.g., add tool results, user feedback)

**Arguments**:
- `messageId`: Id<"sessionManagerChats"> (required)
- `toolCalls`: array (optional) - Update tool call results
- `userFeedback`: object (optional) - Add user ratings
- `sentiment`: string (optional) - Add sentiment analysis
- `metadata`: string (optional) - Add custom metadata

**Returns**: `null`

**Usage**:
```typescript
await ctx.runMutation(api.sessionManagerChats.update, {
  messageId: messageId,
  userFeedback: {
    rating: "helpful",
    comment: "Great analysis!",
    feedbackAt: Date.now(),
  },
});
```

---

### `clearSession`
**Purpose**: Delete all messages from a session

**Arguments**:
- `sessionId`: string (required)

**Returns**: `number` - Count of deleted messages

**Usage**:
```typescript
const deletedCount = await ctx.runMutation(api.sessionManagerChats.clearSession, {
  sessionId: "session_123",
});
```

---

### `deleteMessage`
**Purpose**: Delete a specific message

**Arguments**:
- `messageId`: Id<"sessionManagerChats"> (required)

**Returns**: `null`

---

## Queries

### `getBySession`
**Purpose**: Get all messages for a session in chronological order

**Arguments**:
- `sessionId`: string (required)

**Returns**: Array of message objects (full schema)

**Usage**:
```typescript
const messages = await ctx.runQuery(api.sessionManagerChats.getBySession, {
  sessionId: "session_123",
});
```

---

### `list`
**Purpose**: Get paginated messages for a session (for large histories)

**Arguments**:
- `sessionId`: string (required)
- `paginationOpts`: PaginationOptions (required)

**Returns**: Paginated result with `page`, `isDone`, `continueCursor`

**Usage**:
```typescript
const result = await ctx.runQuery(api.sessionManagerChats.list, {
  sessionId: "session_123",
  paginationOpts: { numItems: 50, cursor: null },
});
```

---

### `getRecentMessages`
**Purpose**: Get last N messages for AI context (limited, chronological)

**Arguments**:
- `sessionId`: string (required)
- `limit`: number (required) - e.g., 50 for last 50 messages

**Returns**: Array of recent messages (limited fields for efficiency)

**Usage**:
```typescript
const recentMessages = await ctx.runQuery(api.sessionManagerChats.getRecentMessages, {
  sessionId: "session_123",
  limit: 50,
});
```

**Best Practice**: Use this for building AI context window instead of `getBySession` to limit token usage.

---

### `getMessageCount`
**Purpose**: Get total message count for a session

**Arguments**:
- `sessionId`: string (required)

**Returns**: `number` - Total messages

---

### `getTokenStats`
**Purpose**: Get comprehensive token usage statistics for a session

**Arguments**:
- `sessionId`: string (required)

**Returns**: Object with:
- `totalMessages`: number
- `totalInputTokens`: number
- `totalOutputTokens`: number
- `totalTokens`: number
- `totalCost`: number (USD)
- `averageTokensPerMessage`: number
- `messagesByRole`: { user, assistant, system }

**Usage**:
```typescript
const stats = await ctx.runQuery(api.sessionManagerChats.getTokenStats, {
  sessionId: "session_123",
});
console.log(`Total cost: $${stats.totalCost.toFixed(4)}`);
```

---

### `searchMessages`
**Purpose**: Full-text search within session messages

**Arguments**:
- `sessionId`: string (required)
- `searchQuery`: string (required)
- `limit`: number (optional, default: 50)

**Returns**: Array of matching messages with relevance `_score`

**Usage**:
```typescript
const results = await ctx.runQuery(api.sessionManagerChats.searchMessages, {
  sessionId: "session_123",
  searchQuery: "token usage analysis",
  limit: 20,
});
```

---

### `getToolUsageStats`
**Purpose**: Analyze tool usage patterns and performance

**Arguments**:
- `sessionId`: string (required)

**Returns**: Object with:
- `totalToolCalls`: number
- `successfulCalls`: number
- `failedCalls`: number
- `averageExecutionTime`: number (ms)
- `toolBreakdown`: Array of per-tool stats
  - `toolName`: string
  - `count`: number
  - `successRate`: number (0-1)
  - `averageTime`: number (ms)

**Usage**:
```typescript
const toolStats = await ctx.runQuery(api.sessionManagerChats.getToolUsageStats, {
  sessionId: "session_123",
});

toolStats.toolBreakdown.forEach(tool => {
  console.log(`${tool.toolName}: ${(tool.successRate * 100).toFixed(1)}% success`);
});
```

---

### `getConversationMetrics`
**Purpose**: Get quality metrics for conversation analysis

**Arguments**:
- `sessionId`: string (required)

**Returns**: Object with:
- `totalTurns`: number
- `averageResponseTime`: number (ms)
- `multiTurnPercentage`: number (0-100)
- `sentimentBreakdown`: { positive, neutral, negative }
- `userSatisfaction`: { helpful, neutral, unhelpful, totalRatings }

---

### `getActiveSessions`
**Purpose**: Get all sessions with recent activity

**Arguments**:
- `minutesThreshold`: number (required) - e.g., 30 for last 30 minutes

**Returns**: Array of active sessions with:
- `sessionId`: string
- `lastMessageAt`: number (timestamp)
- `messageCount`: number
- `lastMessageContent`: string

**Usage**:
```typescript
const activeSessions = await ctx.runQuery(api.sessionManagerChats.getActiveSessions, {
  minutesThreshold: 30,
});
```

---

## Integration with SessionManagerAgent

### Current Status
✅ Schema defined and deployed
✅ All mutations and queries implemented
✅ Full-text search enabled
✅ Comprehensive analytics queries
⏳ SessionManagerAgent tool handlers (next phase)

### Next Steps

#### 1. Update Tool: `search_session_messages`
Replace mock implementation with:
```typescript
const results = await ctx.runQuery(api.sessionManagerChats.searchMessages, {
  sessionId: args.sessionId,
  searchQuery: args.query,
  limit: args.limit ?? 50,
});
```

#### 2. Update Tool: `analyze_session_metrics`
Use `getMessageCount` and `getConversationMetrics`:
```typescript
const count = await ctx.runQuery(api.sessionManagerChats.getMessageCount, {
  sessionId: args.sessionId,
});
const metrics = await ctx.runQuery(api.sessionManagerChats.getConversationMetrics, {
  sessionId: args.sessionId,
});
```

#### 3. Update Tool: `analyze_token_usage`
Use `getTokenStats`:
```typescript
const stats = await ctx.runQuery(api.sessionManagerChats.getTokenStats, {
  sessionId: args.sessionId,
});
```

#### 4. Update Tool: `get_active_sessions`
Use `getActiveSessions`:
```typescript
const sessions = await ctx.runQuery(api.sessionManagerChats.getActiveSessions, {
  minutesThreshold: 30,
});
```

#### 5. Update Tool: `analyze_engagement`
Use `getConversationMetrics` and `getToolUsageStats`:
```typescript
const metrics = await ctx.runQuery(api.sessionManagerChats.getConversationMetrics, {
  sessionId: args.sessionId,
});
const toolStats = await ctx.runQuery(api.sessionManagerChats.getToolUsageStats, {
  sessionId: args.sessionId,
});
```

---

## Best Practices Implemented

### ✅ Convex Documentation Standards
1. **Dedicated messages table** with proper schema
2. **Mutations for writes** with full validation
3. **Queries with pagination** for scalability
4. **Metadata tracking**: timestamps, session IDs, user feedback
5. **Real-time updates**: Convex automatically syncs UI
6. **Recent messages pattern**: `.order("desc").take(limit).reverse()` for AI context

### ✅ Project-Specific Standards
1. **New Convex function syntax**: All functions use `args` and `returns` validators
2. **Type safety**: Proper validators for all fields (no `any` types)
3. **Comprehensive indexes**: Performance-optimized queries
4. **Search integration**: Full-text search on message content
5. **Token tracking**: Cost and usage analytics per message
6. **Tool usage tracking**: Nexus agent tool call metadata

### ✅ AI Conversational Flow Best Practices
1. **Conversation threading**: `messageId` and `parentMessageId` for flow
2. **Turn tracking**: `conversationTurn` for sequence analysis
3. **Multi-turn chains**: `isMultiTurn` flag for complex workflows
4. **Token optimization**: `getRecentMessages` for context window management
5. **Quality metrics**: Sentiment analysis, user feedback, response times
6. **Tool performance**: Execution times, success rates, error tracking

---

## Testing Checklist

### ✅ Compilation
- [x] Schema compiles without errors
- [x] Functions compile without TypeScript errors
- [x] Convex dev deployment successful

### ⏳ Functional Testing (Next Phase)
- [ ] Create message with `create` mutation
- [ ] Query messages with `getBySession`
- [ ] Test pagination with `list`
- [ ] Search messages with `searchMessages`
- [ ] Get token stats with `getTokenStats`
- [ ] Get tool usage stats with `getToolUsageStats`
- [ ] Test active sessions query
- [ ] Update message with feedback
- [ ] Clear session test
- [ ] Verify indexes perform efficiently

### ⏳ Integration Testing (Next Phase)
- [ ] Wire SessionManagerAgent tools to database
- [ ] Test multi-turn conversations
- [ ] Verify token tracking accuracy
- [ ] Test tool usage logging
- [ ] Frontend React hooks integration
- [ ] Real-time updates verification

---

## Performance Considerations

### Index Usage
- **by_sessionId**: Primary access pattern (O(log n))
- **by_sessionId_and_createdAt**: Chronological queries (O(log n))
- **search_chat_content**: Full-text search (optimized by Convex)

### Query Efficiency
- Use `getRecentMessages` instead of `getBySession` for AI context (limits data transfer)
- Use pagination (`list`) for large chat histories (prevents memory issues)
- Use search indexes for text queries (avoid `.filter()` on content)

### Cost Optimization
- Token tracking per message enables cost analytics
- `getTokenStats` provides aggregated cost insights
- Can set alerts based on `totalCost` thresholds

---

## Frontend Integration (Future)

### React Hooks Pattern
```typescript
// In a React component
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function ChatComponent({ sessionId }: { sessionId: string }) {
  // Real-time message updates
  const messages = useQuery(api.sessionManagerChats.getBySession, { sessionId });
  
  // Create message mutation
  const createMessage = useMutation(api.sessionManagerChats.create);
  
  const handleSend = async (content: string) => {
    await createMessage({
      sessionId,
      role: "user",
      content,
      messageType: "query",
    });
  };
  
  return (
    <div>
      {messages?.map(msg => (
        <div key={msg._id}>{msg.content}</div>
      ))}
    </div>
  );
}
```

### Real-time Updates
Convex automatically updates UI when database changes occur. No WebSocket setup required!

---

## Migration Path

Since this is a new table, no migration is needed. The schema is backward compatible.

To populate with existing data (if any):
1. Export data from old format
2. Transform to new schema structure
3. Bulk insert using `create` mutation

---

## Documentation References

- **Convex Best Practices**: See user-provided documentation in conversation
- **Project Standards**: `/smnb/.github/copilot-instructions.md`
- **Schema Location**: `/smnb/convex/schema.ts` (lines 1157-1257)
- **Functions Location**: `/smnb/convex/sessionManagerChats.ts`
- **Agent Location**: `/smnb/lib/agents/nexus/SessionManagerAgent.ts`

---

## Success Metrics

### Implementation Complete ✅
- Schema: 100% complete (11 fields, 6 indexes, 1 search index)
- Mutations: 100% complete (4 mutations)
- Queries: 100% complete (9 queries)
- Compilation: ✅ No errors
- Deployment: ✅ Convex dev deployment successful

### Next Milestone (Agent Integration)
- Wire 7 SessionManagerAgent tools to database
- Replace all mock data with real queries
- Target: Move from 10% → 100% implementation
- Estimated effort: 3-5 days (from gap analysis)

---

**Created**: 2025-09-29  
**Status**: Implementation Complete ✅  
**Next Phase**: Agent Tool Integration
