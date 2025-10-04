# Nexus Framework Implementation Guide - SessionManager Integration

## 📋 Overview

We've successfully implemented the Nexus Agentic Framework for SMNB's SessionManager. This replaces the legacy MCP connector approach with a proper tool-calling architecture using:

- **Anthropic Tools API** for structured tool execution
- **Server-Sent Events (SSE)** for real-time streaming
- **Convex Actions** for secure backend integration
- **React Hooks** for seamless UI integration

## ✅ What's Been Completed

### 1. Core Infrastructure (✅ Complete)

**Files Created:**
- `/lib/agents/nexus/types.ts` - Core type definitions
- `/lib/agents/nexus/BaseNexusAgent.ts` - Abstract base class
- `/lib/agents/nexus/SessionManagerAgent.ts` - Session analytics agent
- `/convex/nexusAgents.ts` - Backend tool execution (DEPLOYED)
- `/app/api/agents/stream/route.ts` - SSE streaming API
- `/lib/hooks/useNexusAgent.ts` - React hook for consumption

### 2. Agent Capabilities (✅ Complete)

SessionManagerAgent implements 7 analytics tools:

1. **analyze_session_metrics** - Session activity and performance
2. **analyze_token_usage** - Token consumption and costs
3. **search_session_messages** - Chat history search
4. **get_active_sessions** - List active sessions
5. **analyze_engagement** - User engagement patterns
6. **check_system_health** - System operational status
7. **analyze_costs** - Spending and budget analysis

### 3. Backend Integration (✅ DEPLOYED)

Convex functions successfully deployed at **15:05:43**:
- `executeAgent` - Routes tool calls to analytics queries
- `getAgentCapabilities` - Returns agent metadata
- `testAgentExecution` - Testing utility

## 🚀 Next Steps: UI Integration

### Step 1: Update SessionManager Component

Replace the existing chat service with the new Nexus agent:

```tsx
// In your SessionManager component
import { useNexusAgent } from '@/lib/hooks/useNexusAgent';

export function SessionManager({ sessionId }: { sessionId: string }) {
  const {
    messages,
    isStreaming,
    error,
    sendMessage,
    clearMessages,
  } = useNexusAgent({
    agentId: 'session-manager-agent',
    sessionId,
    onChunk: (chunk) => {
      // Optional: Handle individual chunks for advanced UI
      console.log('Received chunk:', chunk);
    },
  });

  const handleSubmit = async (userMessage: string) => {
    await sendMessage(userMessage);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Display */}
      <div className="flex-1 overflow-y-auto">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        
        {isStreaming && <StreamingIndicator />}
        {error && <ErrorDisplay error={error} />}
      </div>

      {/* Input */}
      <ChatInput onSubmit={handleSubmit} disabled={isStreaming} />
    </div>
  );
}
```

### Step 2: Create Message Components

**MessageBubble Component** - Display user/assistant messages:

```tsx
interface MessageBubbleProps {
  message: NexusMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        max-w-[70%] rounded-lg p-4 my-2
        ${message.role === 'user' 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-900'}
      `}>
        {/* Main content */}
        <div className="whitespace-pre-wrap">{message.content}</div>

        {/* Tool calls (optional) */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-300">
            <div className="text-xs font-semibold mb-2">Tools Used:</div>
            {message.toolCalls.map((tool, idx) => (
              <ToolCallDisplay key={idx} toolCall={tool} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs opacity-70 mt-2">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
```

**ToolCallDisplay Component** - Show tool execution details:

```tsx
interface ToolCallProps {
  toolCall: {
    name: string;
    input: unknown;
    result?: unknown;
  };
}

function ToolCallDisplay({ toolCall }: ToolCallProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Map tool names to friendly labels
  const toolLabels: Record<string, string> = {
    analyze_session_metrics: '📊 Session Metrics',
    analyze_token_usage: '🎫 Token Usage',
    search_session_messages: '🔍 Message Search',
    get_active_sessions: '🟢 Active Sessions',
    analyze_engagement: '👥 Engagement Analysis',
    check_system_health: '💚 System Health',
    analyze_costs: '💰 Cost Analysis',
  };

  return (
    <div className="bg-white/50 rounded p-2 mb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-sm"
      >
        <span>{toolLabels[toolCall.name] || toolCall.name}</span>
        <span>{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className="mt-2 text-xs space-y-2">
          <div>
            <strong>Input:</strong>
            <pre className="bg-gray-800 text-white p-2 rounded mt-1 overflow-x-auto">
              {JSON.stringify(toolCall.input, null, 2)}
            </pre>
          </div>
          
          {toolCall.result && (
            <div>
              <strong>Result:</strong>
              <pre className="bg-gray-800 text-white p-2 rounded mt-1 overflow-x-auto">
                {JSON.stringify(toolCall.result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

**StreamingIndicator Component** - Visual feedback during streaming:

```tsx
function StreamingIndicator() {
  return (
    <div className="flex justify-start my-2">
      <div className="bg-gray-100 rounded-lg p-4 flex items-center space-x-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" 
               style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" 
               style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" 
               style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-sm text-gray-600">AI is thinking...</span>
      </div>
    </div>
  );
}
```

### Step 3: Example Usage Queries

Test the agent with these natural language queries:

```typescript
// Session metrics
"How are my data metrics for the week?"
"Show me session statistics for today"
"What's my session activity this month?"

// Token usage
"How many tokens have I used?"
"What's my current token consumption?"
"Show token costs for this week"

// Message search
"Find messages about database optimization"
"Search for conversations about React"
"Show me messages from yesterday"

// Active sessions
"List all active sessions"
"How many users are currently online?"
"Show me active conversations"

// Engagement analysis
"Analyze user engagement patterns"
"How engaged are users this week?"
"Show engagement trends"

// System health
"Check system status"
"Is everything running normally?"
"Show system health metrics"

// Cost analysis
"What are my total costs?"
"Show spending breakdown"
"Analyze costs for this month"
```

## 🔍 Testing Checklist

### Basic Functionality
- [ ] Agent responds to simple queries
- [ ] Streaming works (text appears progressively)
- [ ] Tool calls are executed correctly
- [ ] Error handling works (try invalid queries)

### Tool Execution
- [ ] analyze_session_metrics returns real data
- [ ] analyze_token_usage shows token consumption
- [ ] search_session_messages finds relevant messages
- [ ] get_active_sessions lists current sessions
- [ ] analyze_engagement shows trends
- [ ] check_system_health reports status
- [ ] analyze_costs breaks down spending

### Performance
- [ ] First chunk arrives in < 200ms
- [ ] Complete response in < 2 seconds
- [ ] No memory leaks during streaming
- [ ] Multiple consecutive queries work

### Error Cases
- [ ] Invalid queries return helpful errors
- [ ] Network errors are handled gracefully
- [ ] API rate limits are managed
- [ ] Timeout scenarios work correctly

## 🐛 Debugging

### Enable Console Logging

All components include detailed console logs:

```typescript
// API Route logs
[NexusAPI] Starting stream for agent session-manager-agent
[NexusAPI] Tool call: {...}
[NexusAPI] Stream completed successfully

// Hook logs
[useNexusAgent] Already streaming, ignoring new message
[useNexusAgent] Stream complete
[useNexusAgent] Conversation complete
```

### Check Convex Dashboard

Monitor backend execution:
1. Open Convex dashboard
2. Go to Logs tab
3. Watch for `nexusAgents.executeAgent` calls
4. Verify tool routing is working

### Network Inspector

Check SSE stream in browser DevTools:
1. Open Network tab
2. Look for `/api/agents/stream` request
3. Type should be `text/event-stream`
4. View response stream in real-time

## 📊 Architecture Overview

```
User Query
    ↓
React UI (useNexusAgent)
    ↓
POST /api/agents/stream
    ↓
SessionManagerAgent.stream()
    ↓
Anthropic Claude 3.5 Sonnet
    ↓
Tool Selection & Execution
    ↓
Convex Action (nexusAgents.executeAgent)
    ↓
Analytics Query (getSessionMetrics, etc.)
    ↓
Results Streamed Back
    ↓
UI Updates in Real-Time
```

## 🎨 Styling Tips

### Tailwind Classes for Consistency

```tsx
// Message containers
"flex flex-col space-y-2"

// User messages (right-aligned, blue)
"ml-auto bg-blue-600 text-white"

// Assistant messages (left-aligned, gray)
"mr-auto bg-gray-100 text-gray-900"

// Tool indicators
"text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"

// Error displays
"bg-red-50 border border-red-200 text-red-700 p-3 rounded"
```

## 🚨 Common Issues & Solutions

### Issue: "ANTHROPIC_API_KEY not configured"
**Solution:** Add to `.env.local`:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### Issue: "Expected 1 arguments, but got 2"
**Solution:** Check you're using `AgentRequest` object:
```typescript
await agent.stream({ agentId, input: message, context: { sessionId } });
```

### Issue: SSE connection closes immediately
**Solution:** Verify response headers:
```typescript
'Content-Type': 'text/event-stream'
'Cache-Control': 'no-cache'
'Connection': 'keep-alive'
```

### Issue: Tool calls not showing results
**Solution:** Check Convex action routing in `nexusAgents.ts`:
```typescript
case 'analyze_session_metrics':
  result = await ctx.runQuery(api.analytics.getSessionMetrics, {...});
  break;
```

## 📚 Additional Resources

- **Anthropic Tools API**: https://docs.anthropic.com/claude/docs/tool-use
- **Server-Sent Events**: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
- **Convex Actions**: https://docs.convex.dev/functions/actions
- **React Hooks**: https://react.dev/reference/react

## 🎯 Success Criteria

Your implementation is successful when:

1. ✅ User can ask "How are my data metrics for the week?"
2. ✅ System responds with streaming text in < 2 seconds
3. ✅ Tool calls are visible and show results
4. ✅ Real Convex data is displayed
5. ✅ Error handling works gracefully
6. ✅ Multiple queries work without refresh
7. ✅ UI feels responsive and polished

---

**Ready to integrate?** Start with Step 1 above, replacing your existing SessionManager component with the useNexusAgent hook. Test with simple queries first, then add the UI polish. Good luck! 🚀
