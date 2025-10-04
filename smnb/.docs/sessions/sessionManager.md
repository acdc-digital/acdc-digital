# Session Manager Chat - Architecture & Streaming Flow Documentation

**Last Updated:** September 30, 2025  
**Framework:** Nexus Agentic Framework  
**AI Provider:** Anthropic Claude 3.5 Haiku  
**Backend:** Convex + MCP Server

---

## 📋 Overview

The SMNB Session Manager chat uses the **Nexus Agentic Framework** with a sophisticated multi-stream architecture that handles:

1. **Natural language understanding** (Claude interprets user intent)
2. **Tool execution** (Analytics queries via MCP server or Convex)
3. **Multi-turn conversations** (Claude can make multiple tool calls)
4. **Real-time streaming** (Server-Sent Events for live updates)

---

## 🔄 The Streaming Flow - Step by Step

### Phase 1: User Input → Agent Initialization

```
User types message → NexusChat.tsx
    ↓
sendMessage() in useNexusAgent hook
    ↓
POST /api/agents/stream (SSE endpoint)
    ↓
SessionManagerAgent.stream() begins
```

### Phase 2: Multi-Turn Tool Execution Loop

This is where the magic happens - **Claude can make multiple tool calls in sequence**:

```typescript
// From SessionManagerAgent.ts - Line ~245
while (continueConversation && turnCount < MAX_TURNS) {
  turnCount++;
  
  // Process Claude's response blocks
  for (const block of currentResponse.content) {
    if (block.type === 'text') {
      // Stream text to UI immediately
      yield this.createContentChunk(block.text);
    } 
    else if (block.type === 'tool_use') {
      // Execute tool (MCP server or Convex)
      const toolResult = await this.executeTool(block.name, block.input);
      yield this.createToolCallChunk(block.name, block.input, toolResult);
      
      // Add result to conversation for next turn
      toolResults.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: JSON.stringify(toolResult)
      });
    }
  }
  
  // If tools were used, ask Claude to interpret results
  if (hasToolUse && toolResults.length > 0) {
    conversationMessages.push({
      role: 'user',
      content: toolResults  // Feed results back to Claude
    });
    
    // Get next response from Claude with formatted answer
    currentResponse = await anthropic.messages.create({...});
  } else {
    // No more tools needed, end loop
    continueConversation = false;
  }
}
```

**Key Points:**
- Maximum 10 turns to prevent infinite loops
- Each turn can contain multiple tool calls
- Tool results are fed back to Claude for natural language interpretation
- Claude decides when to stop calling tools

### Phase 3: The Stream Types

Your system streams **4 types of chunks** via SSE:

#### 1. Content Chunks (`type: 'content'`)

```typescript
// Text streaming from Claude
{
  type: 'content',
  data: "Here are your session metrics...",
  timestamp: 1234567890
}
```

**Purpose:** Display streaming text responses in real-time

#### 2. Tool Call Chunks (`type: 'tool_call'`)

```typescript
// Tool execution tracking
{
  type: 'tool_call',
  data: {
    toolId: 'analyze_session_metrics',
    input: { timeRange: 'week' },
    result: { totalSessions: 42, activeSessions: 7, ... }
  },
  timestamp: 1234567890
}
```

**Purpose:** Track which tools were called and their results for UI display

#### 3. Metadata Chunks (`type: 'metadata'`)

```typescript
// Status updates
{
  type: 'metadata',
  data: { 
    status: 'executing_tool',
    toolId: 'analyze_token_usage'
  },
  timestamp: 1234567890
}
```

**Purpose:** Provide status updates and context during streaming

#### 4. Error Chunks (`type: 'error'`)

```typescript
// Error handling
{
  type: 'error',
  data: { 
    message: 'MCP server timeout',
    stack: '...'
  },
  timestamp: 1234567890
}
```

**Purpose:** Graceful error handling with user-friendly messages

---

## 🔧 How Tool Calls Work

### Tool Handler Pattern (Example: Session Metrics)

```typescript
// SessionManagerAgent.ts - Line ~450
private async handleSessionMetrics(input: unknown): Promise<unknown> {
  const { timeRange } = input as { timeRange: 'today' | 'week' | 'month' | 'all' };
  
  // Call MCP server (deployed separately)
  const response = await fetch(`${MCP_SERVER_URL}/mcp/tools/get_session_metrics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ timeRange }),
  });
  
  const data = await response.json();
  return data.result; // Returned to Claude for interpretation
}
```

### Current Architecture

- **7 analytics tools** defined in SessionManagerAgent
- Each tool → **MCP Server** → **Convex queries**
- Results stream back through SSE
- Claude interprets raw data into natural language

### Available Tools (7 total)

1. **`analyze_session_metrics`** - Session activity, counts, trends
2. **`analyze_token_usage`** - Token consumption, cost breakdowns
3. **`search_session_messages`** - Full-text search in chat history
4. **`get_active_sessions`** - Real-time active user count
5. **`analyze_engagement`** - User behavior patterns
6. **`check_system_health`** - System status monitoring
7. **`analyze_costs`** - Spending analysis and projections

---

## 🎨 UI Updates - The React Flow

### useNexusAgent Hook (State Management)

```typescript
// lib/hooks/useNexusAgent.ts
const processChunk = useCallback(async (chunk: AgentChunk) => {
  switch (chunk.type) {
    case 'content':
      // CRITICAL: Update ref first, then trigger re-render
      currentMessageRef.current.content += chunk.data;
      setMessages(prev => {
        const updated = [...prev];
        updated[lastIndex] = { ...currentMessageRef.current };
        return updated;
      });
      break;
      
    case 'tool_call':
      currentMessageRef.current.toolCalls.push(chunk.data);
      setMessages(prev => [...updated]); // Same pattern
      break;
  }
}, []);
```

**Why use refs?**
- Prevents race conditions during rapid streaming
- Updates accumulate in ref before triggering re-renders
- Ensures UI doesn't miss partial content chunks

### Message Display (NexusChatMessage.tsx)

**Styling patterns:**
- User messages → **cyan theme** (`bg-neutral-900`, `border-cyan-400`), right-aligned
- Assistant messages → **purple theme** (`bg-purple-400/10`, `border-purple-400/20`), left-aligned
- Tool calls → **Expandable cards** with color-coded badges:
  - 📊 Session Metrics → Blue (`bg-blue-500/10 text-blue-400`)
  - 🎫 Token Usage → Green (`bg-green-500/10 text-green-400`)
  - 🔍 Message Search → Yellow (`bg-yellow-500/10 text-yellow-400`)
  - 🟢 Active Sessions → Emerald (`bg-emerald-500/10 text-emerald-400`)
  - 👥 Engagement Analysis → Purple (`bg-purple-500/10 text-purple-400`)
  - 💚 System Health → Teal (`bg-teal-500/10 text-teal-400`)
  - 💰 Cost Analysis → Orange (`bg-orange-500/10 text-orange-400`)

**Interactive features:**
- Click tool cards to expand/collapse
- View tool input parameters
- See execution results in formatted JSON
- Execution time tracking displayed

---

## 💾 Database Persistence

All messages saved to **Convex** with rich metadata:

```typescript
// After streaming completes
await convex.mutation(api.nexus.sessionChats.create, {
  sessionId,
  role: 'assistant',
  content: assistantContent,
  toolCalls: [
    {
      toolName: 'analyze_session_metrics',
      toolInput: '{"timeRange":"week"}',
      toolResult: '{...}',
      status: 'success',
      executionTime: 245  // milliseconds
    }
  ],
  tokenUsage: {
    inputTokens: 1234,
    outputTokens: 567,
    totalTokens: 1801,
    estimatedCost: 0.0042,  // USD
    model: 'claude-3-5-haiku-20241022'
  }
});
```

### Database Schema Features

**Core fields:**
- `sessionId` - Groups messages by conversation
- `role` - 'user' | 'assistant' | 'system'
- `content` - Message text content
- `createdAt` - Timestamp for chronological ordering

**Analytics fields:**
- `toolCalls[]` - Array of tool execution metadata
- `tokenUsage{}` - Token counts and cost tracking
- `modelConfig{}` - Model settings used for generation
- `conversationTurn` - Turn number in multi-turn conversations
- `isMultiTurn` - Boolean flag for multi-turn messages

**Quality tracking:**
- `sentiment` - 'positive' | 'neutral' | 'negative'
- `userFeedback{}` - User ratings and comments
- `responseTime` - Time to generate response (ms)

**Indexes:**
- `by_sessionId` - Fast session lookups
- `by_sessionId_and_createdAt` - Chronological message ordering
- `by_createdAt` - Global timeline queries
- `search_chat_content` - Full-text search across all messages

---

## 🔑 Key Design Patterns

### 1. Multi-Turn Conversation Pattern

Claude can execute multiple tools before responding:

```
User: "How are my metrics and costs this week?"
  ↓
Claude thinks: "Need 2 tools"
  ↓
Tool 1: analyze_session_metrics → Result A
  ↓
Tool 2: analyze_costs → Result B
  ↓
Claude: "Here's your data: [formatted with A + B]"
```

**Benefits:**
- More intelligent responses combining multiple data sources
- Reduced back-and-forth (one user query → comprehensive answer)
- Natural language interpretation of complex analytics

### 2. SSE Stream Pattern

```typescript
// Server: Format as SSE
function formatSSE(chunk: AgentChunk): string {
  return `data: ${JSON.stringify(chunk)}\n\n`;
}

// Client: Parse SSE events
const lines = buffer.split('\n\n');
for (const line of lines) {
  if (line.startsWith('data: ')) {
    const chunk = JSON.parse(line.substring(6)); // Remove "data: "
    await processChunk(chunk);
  }
}
```

**Why SSE over WebSockets?**
- Simpler protocol (HTTP-based)
- Better compatibility with serverless (Vercel)
- Automatic reconnection handling
- No need for bidirectional communication

### 3. Ref-Based State Updates

Prevents race conditions during rapid streaming:

```typescript
// Update ref immediately (no re-render)
currentMessageRef.current.content += newText;

// Then trigger re-render with ref data
setMessages(prev => {
  const updated = [...prev];
  updated[lastIndex] = { ...currentMessageRef.current }; // Clone from ref
  return updated;
});
```

**Why this pattern?**
- React state updates are asynchronous
- Multiple chunks can arrive before state updates complete
- Refs provide synchronous accumulation
- Prevents losing intermediate chunks

---

## 🎯 The Complete Request Flow

**Step-by-step breakdown:**

```
1. User: "Show me token usage for this week"
   ↓
2. useNexusAgent: POST /api/agents/stream
   ↓
3. SessionManagerAgent: Save user message to Convex
   ↓
4. Claude: Analyze intent → "Need analyze_token_usage tool"
   ↓
5. SessionManagerAgent: 
   - Yield metadata chunk: { status: 'executing_tool' }
   - Execute: handleTokenUsage({ timeRange: 'week' })
   - Fetch MCP server: /mcp/tools/get_token_usage
   - Yield tool_call chunk: { toolId, input, result }
   ↓
6. Claude: Receive tool result → Generate formatted response
   ↓
7. SessionManagerAgent: 
   - Yield content chunks: "📊 **Token Usage This Week**..."
   - Calculate total cost from tokens
   - Save assistant message to Convex
   - Yield metadata: { status: 'complete' }
   ↓
8. useNexusAgent: Update messages state → UI re-renders
   ↓
9. NexusChatMessage: Display formatted response with expandable tool cards
```

**Timing breakdown (typical):**
- Step 1-3: ~50ms (local processing)
- Step 4: ~200-500ms (Claude analysis)
- Step 5: ~100-300ms (Tool execution)
- Step 6: ~300-800ms (Claude formatting)
- Step 7-9: ~50ms (Save + render)
- **Total: ~700ms - 1.7s** for complete response

---

## 🚀 Strengths of Current Implementation

✅ **Streaming-first** - Real-time updates, no waiting  
✅ **Multi-turn support** - Claude can chain multiple tools  
✅ **Rich metadata** - Full tool tracking, token usage, costs  
✅ **Error resilience** - Graceful fallbacks at every level  
✅ **Premium-ready** - Tool gating architecture in place  
✅ **Analytics-rich** - Comprehensive Convex queries for insights  
✅ **Type-safe** - Full TypeScript coverage with strict validators  
✅ **Scalable** - SSE streams handle concurrent users efficiently

---

## 📝 File Architecture

### Frontend Components

**Location:** `/app/dashboard/studio/sessions/`

- `Sessions.tsx` - Main session manager UI with 3-column layout
- `SessionChat.tsx` - Chat wrapper component (uses NexusChat)
- `SessionList.tsx` - Sidebar with session selection
- `SessionDetails.tsx` - Session metadata display

**Location:** `/lib/services/sessionManager/`

- `NexusChat.tsx` - Core chat component with streaming support
- `_components/NexusChatMessage.tsx` - Message display with tool cards
- `_components/StreamingIndicator.tsx` - Loading animation component

### Hooks & State Management

**Location:** `/lib/hooks/`

- `useNexusAgent.ts` - SSE consumption, message state management
  - Handles SSE stream parsing
  - Manages message accumulation
  - Provides `sendMessage()`, `clearMessages()`, `retry()` methods

### Backend/Agent Layer

**Location:** `/app/api/agents/stream/`

- `route.ts` - SSE streaming API endpoint (POST handler)
  - Validates requests
  - Creates ReadableStream for SSE
  - Formats chunks as Server-Sent Events

**Location:** `/lib/agents/nexus/`

- `SessionManagerAgent.ts` - Agent with 7 analytics tools
  - Implements multi-turn conversation loop
  - Handles tool execution via MCP server
  - Manages Claude API interactions
- `BaseNexusAgent.ts` - Abstract base class for all agents
  - Provides common patterns for streaming
  - Tool registration and execution framework
  - Premium gating logic
- `types.ts` - TypeScript type definitions

### Database Layer

**Location:** `/convex/nexus/`

- `sessionChats.ts` - Convex mutations/queries for chat persistence
  - `create` - Save new messages
  - `update` - Add feedback/sentiment
  - `getBySession` - Retrieve conversation history
  - `getTokenStats` - Aggregate token usage
  - `getToolUsageStats` - Track tool performance
  - `searchMessages` - Full-text search
  - Global analytics queries for cross-session insights

### External Services

- **MCP Server** (Vercel deployment)
  - URL: `https://mcp-server-i6h9k4z40-acdcdigitals-projects.vercel.app`
  - Provides analytics tool execution
  - Interfaces with Convex for data queries
  
- **Anthropic Claude API**
  - Model: `claude-3-5-haiku-20241022`
  - Natural language understanding
  - Tool selection and orchestration
  - Response formatting
  
- **Convex**
  - Real-time database
  - Analytics query engine
  - Message persistence
  - Full-text search

---

## 🔍 Advanced Features

### Token Usage Tracking

Every assistant message includes:
```typescript
tokenUsage: {
  inputTokens: 1234,      // Prompt tokens
  outputTokens: 567,      // Response tokens
  totalTokens: 1801,      // Sum of input + output
  estimatedCost: 0.0042,  // USD (Claude 3.5 Haiku pricing)
  model: 'claude-3-5-haiku-20241022'
}
```

**Pricing (as of 2025):**
- Input: $0.80 per million tokens
- Output: $4.00 per million tokens

### Tool Execution Metrics

Each tool call tracked with:
```typescript
toolCalls: [{
  toolName: 'analyze_session_metrics',
  toolInput: '{"timeRange":"week"}',
  toolResult: '{"totalSessions":42,...}',
  status: 'success' | 'error' | 'pending',
  executionTime: 245,  // milliseconds
  errorMessage?: 'MCP timeout'  // if status === 'error'
}]
```

### Conversation Quality Metrics

Available via `getConversationMetrics` query:
- Average response time
- Multi-turn conversation percentage
- Sentiment analysis (positive/neutral/negative)
- User satisfaction ratings
- Tool success rates

### Search Capabilities

Full-text search with relevance scoring:
```typescript
const results = await ctx.db
  .query("sessionManagerChats")
  .withSearchIndex("search_chat_content", (q) =>
    q.search("content", "database optimization")
     .eq("sessionId", sessionId)
  )
  .take(50);
```

Returns messages with `_score` field for ranking.

---

## 🐛 Debugging & Monitoring

### Console Logging

All components include detailed console logs:

```typescript
// API Route logs
[NexusAPI] Starting stream for agent session-manager-agent
[NexusAPI] Message: Show me token usage...
[NexusAPI] Tool call: { name: 'analyze_token_usage', ... }
[NexusAPI] Stream completed successfully

// Hook logs
[useNexusAgent] Making API request: {...}
[useNexusAgent] API response status: 200
[useNexusAgent] Received chunk: content
[useNexusAgent] Appending content: Here are your metrics...
[useNexusAgent] Stream complete

// Agent logs
[SessionManagerAgent] Saved user message: <messageId>
[SessionManagerAgent] Processing response turn 1
[SessionManagerAgent] Yielding text content: ...
[SessionManagerAgent] Saved assistant message: <messageId>
```

### Convex Dashboard

Monitor backend execution:
1. Open Convex dashboard at `https://dashboard.convex.dev`
2. Go to **Logs** tab
3. Watch for `nexus.sessionChats.create` calls
4. Verify message persistence
5. Check query performance

### Network Inspector

Check SSE stream in browser DevTools:
1. Open **Network** tab
2. Look for `/api/agents/stream` request
3. Type should be `text/event-stream`
4. View response stream in real-time
5. Verify chunk formatting

### Error Tracking

Errors captured at multiple levels:
- **Client-side:** `useNexusAgent` error state
- **API Route:** Try-catch with error chunks
- **Tool execution:** Individual tool error handling
- **Database:** Convex mutation error tracking

---

## 🔐 Security Considerations

### API Key Management

```typescript
// Environment variables required
ANTHROPIC_API_KEY=sk-ant-api03-...
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
NEXT_PUBLIC_MCP_SERVER_URL=https://...vercel.app
```

**Best practices:**
- Never commit `.env.local` to git
- Use Vercel environment variables for production
- Rotate API keys regularly
- Monitor usage in Anthropic dashboard

### Premium Gating

Tools can require premium access:
```typescript
{
  type: 'anthropic_tool',
  identifier: 'advanced_analytics',
  requiresPremium: true,  // Premium users only
  schema: {...},
  handler: this.handleAdvancedAnalytics.bind(this)
}
```

**Implementation:**
- Check `canExecute(context)` before tool execution
- Return error if user lacks premium access
- Track premium feature usage for billing

### Rate Limiting

**Current protections:**
- Max 10 conversation turns per request
- Tool execution timeouts (30s default)
- Convex query rate limits (automatic)
- Claude API rate limits (via Anthropic)

**Future enhancements:**
- Per-user rate limiting
- Cost caps per session
- Throttling for heavy usage

---

## 🎓 Example Queries

### Session Metrics
```
"How are my data metrics for the week?"
"Show me session statistics for today"
"What's my session activity this month?"
```

### Token Usage
```
"How many tokens have I used?"
"What's my current token consumption?"
"Show token costs for this week"
"Break down token usage by model"
```

### Message Search
```
"Find messages about database optimization"
"Search for conversations about React"
"Show me messages from yesterday"
```

### Active Sessions
```
"List all active sessions"
"How many users are currently online?"
"Show me active conversations"
```

### Engagement Analysis
```
"Analyze user engagement patterns"
"How engaged are users this week?"
"Show engagement trends"
```

### System Health
```
"Check system status"
"Is everything running normally?"
"Show system health metrics"
```

### Cost Analysis
```
"What are my total costs?"
"Show spending breakdown"
"Analyze costs for this month"
"Project my budget for next week"
```

---

## 🚧 Known Limitations

### Current Constraints

1. **MCP Server Dependency**
   - All analytics tools require MCP server availability
   - Network latency adds ~100-300ms to tool execution
   - Single point of failure if MCP server is down

2. **No Streaming Cancellation**
   - Once started, streams complete fully
   - No user-initiated stop button
   - Could waste tokens on unwanted responses

3. **Limited Context Window**
   - Claude 3.5 Haiku: ~200K token context
   - Very long conversations may hit limits
   - No automatic context trimming

4. **Tool Call Limits**
   - Max 10 turns per conversation
   - Prevents infinite loops but may truncate complex queries
   - No dynamic adjustment based on complexity

5. **No Conversation Branching**
   - Linear conversation history only
   - Can't fork conversations or explore alternatives
   - No "go back to earlier point" feature

### Performance Considerations

- **Cold starts:** First request may take 1-2s longer
- **Large result sets:** Tool results >10KB slow formatting
- **Concurrent users:** SSE connections limited by Vercel
- **Database queries:** Complex analytics may take >500ms

---

## 🎯 Future Enhancements

### Short-term Improvements

1. **Conversation History Loading**
   - Load previous messages when reopening session
   - Paginated history with infinite scroll
   - Quick navigation to specific dates

2. **Export/Sharing**
   - Export conversations as Markdown/PDF
   - Share session links with read-only access
   - Public session galleries

3. **Better Tool Visualization**
   - Charts/graphs for numeric data
   - Tables for structured results
   - Timeline views for temporal data

4. **Streaming Cancellation**
   - Stop button during streaming
   - Graceful cleanup of partial responses
   - Token refund for cancelled requests

### Long-term Vision

1. **Multi-Agent Collaboration**
   - Multiple specialized agents working together
   - Agent handoffs for complex queries
   - Parallel tool execution

2. **Conversation Intelligence**
   - Automatic tagging/categorization
   - Smart suggestions based on history
   - Anomaly detection in metrics

3. **Advanced Analytics**
   - Predictive analytics for trends
   - Comparative analysis across time periods
   - Custom dashboard generation

4. **Voice Integration**
   - Speech-to-text for voice queries
   - Text-to-speech for responses
   - Voice-optimized UI

---

## 📚 References

### Documentation
- [Anthropic Tools API](https://docs.anthropic.com/claude/docs/tool-use)
- [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Convex Actions](https://docs.convex.dev/functions/actions)
- [React Hooks](https://react.dev/reference/react)

### Related Files
- [Nexus Implementation Guide](/NEXUS_IMPLEMENTATION_GUIDE.md)
- [Sessions Schema](/convex/schema.ts)
- [MCP Server Documentation](/mcp-server/README.md)

### Key Concepts
- **SSE (Server-Sent Events):** HTTP protocol for server → client streaming
- **MCP (Model Context Protocol):** Tool execution abstraction layer
- **Nexus Framework:** ACDC Digital's agentic architecture
- **Multi-turn Conversations:** AI making multiple tool calls before responding

---

## 🤝 Contributing

### Adding New Tools

1. **Define tool in SessionManagerAgent:**
```typescript
{
  type: 'anthropic_tool',
  identifier: 'my_new_tool',
  requiresPremium: false,
  schema: {
    name: 'my_new_tool',
    description: 'What this tool does',
    input_schema: {
      type: 'object',
      properties: {
        param: { type: 'string' }
      },
      required: ['param']
    }
  },
  handler: this.handleMyNewTool.bind(this)
}
```

2. **Implement handler:**
```typescript
private async handleMyNewTool(input: unknown): Promise<unknown> {
  const { param } = input as { param: string };
  // Fetch data from MCP server or Convex
  return result;
}
```

3. **Update MCP server** (if needed)
4. **Add to tool info mapping** in NexusChatMessage.tsx
5. **Test with sample queries**

### Code Style Guidelines

- Use TypeScript strict mode
- Follow Convex best practices (no `.filter()`, use indexes)
- Include JSDoc comments for public APIs
- Add console logs for debugging
- Write descriptive error messages
- Keep components under 300 lines

---

**Questions or issues?** Contact the ACDC Digital team or file an issue in the repository.

---

*End of Documentation*
