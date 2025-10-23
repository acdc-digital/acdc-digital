# Session Manager Migration Guide

## ✅ **Migration Complete: SessionChatService → SessionManagerAgent**

### **What Changed**

The Session Manager now uses the **Nexus Framework** with the **SessionManagerAgent** for all chat functionality. This provides:

- ✅ **7 built-in analytics tools** (session metrics, token usage, message search, etc.)
- ✅ **MCP Server integration** for real-time data access
- ✅ **Streaming responses** via Server-Sent Events (SSE)
- ✅ **Multi-turn conversations** with tool orchestration
- ✅ **Natural language understanding** powered by Claude 3.5 Haiku

---

## **Architecture Overview**

### **Current Stack (Nexus Framework)**

```
User Query
    ↓
NexusChat Component (UI)
    ↓
useNexusAgent Hook (React)
    ↓
/api/agents/stream (SSE Endpoint)
    ↓
SessionManagerAgent (Nexus Agent)
    ├── Claude 3.5 Haiku (Tool Selection)
    ├── 7 Analytics Tools
    └── MCP Server (HTTP) → Convex Analytics Queries
```

### **Deprecated Stack (Old)**

```
User Query
    ↓
Chat Component
    ↓
SessionChatService
    ↓
/api/claude Endpoint
    ↓
Claude API (No Tools)
```

---

## **File Status**

### ✅ **Active Files (Use These)**

| File | Purpose |
|------|---------|
| `SessionManagerAgent.ts` | Core agent with 7 analytics tools |
| `NexusChat.tsx` | Main chat component (streaming UI) |
| `useNexusAgent.ts` | React hook for SSE consumption |
| `/api/agents/stream/route.ts` | SSE endpoint for agent streaming |

### ⚠️ **Deprecated Files (Legacy)**

| File | Status | Migration Path |
|------|--------|---------------|
| `SessionChatService.ts` | **DEPRECATED** | Use `SessionManagerAgent` |
| `Chat.tsx` | **DEPRECATED** | Use `NexusChat` |
| `/api/claude/route.ts` | **LEGACY** | Only used by non-agent features |

---

## **How to Use Session Manager Chat**

### **1. In React Components**

```tsx
import { NexusChat } from '@/lib/services/sessionManager/NexusChat';

function MyComponent() {
  return (
    <NexusChat
      agentId="session-manager-agent"
      sessionId={currentSessionId}
      conversationId={`session-${currentSessionId}`}
      showSettings={true}
    />
  );
}
```

### **2. With Custom Hook**

```tsx
import { useNexusAgent } from '@/lib/hooks/useNexusAgent';

function MyCustomChat() {
  const { messages, isStreaming, sendMessage } = useNexusAgent({
    agentId: 'session-manager-agent',
    sessionId: currentSessionId,
  });
  
  const handleSubmit = async (query: string) => {
    await sendMessage(query);
  };
  
  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      {/* Your custom UI */}
    </div>
  );
}
```

---

## **Available Tools**

The SessionManagerAgent provides these analytics tools:

1. **`analyze_session_metrics`** - Session activity, duration, and engagement
2. **`analyze_token_usage`** - Token consumption and cost tracking
3. **`search_session_messages`** - Find specific conversations
4. **`get_active_sessions`** - View currently active sessions
5. **`analyze_engagement`** - User engagement patterns and metrics
6. **`check_system_health`** - System status and error rates
7. **`analyze_costs`** - Cost breakdown and spending trends

### **Example Queries**

Users can ask naturally:

- "How are my data metrics for the week?"
- "Show me token usage trends"
- "What's my current system health?"
- "Analyze my engagement metrics"
- "Compare this week to last week"

---

## **MCP Server Integration**

### **Architecture**

```
SessionManagerAgent Tool Call
    ↓
HTTP Fetch to MCP Server
    ↓
MCP Server Endpoint (e.g., /mcp/tools/get_session_metrics)
    ↓
Convex Analytics Query
    ↓
Return JSON Data
    ↓
Claude Interprets & Formats Response
    ↓
Stream to User
```

### **MCP Server URL**

```typescript
const MCP_SERVER_URL = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 
  'https://mcp-server-i6h9k4z40-acdcdigitals-projects.vercel.app';
```

### **Example Tool Handler**

```typescript
private async handleSessionMetrics(input: unknown): Promise<unknown> {
  const { timeRange } = input as { timeRange: string };
  
  // Call MCP server
  const response = await fetch(`${MCP_SERVER_URL}/mcp/tools/get_session_metrics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ timeRange }),
  });
  
  const data = await response.json();
  return data.result; // Returned to Claude for interpretation
}
```

---

## **Why This Migration?**

### **Problems with Old System**

1. ❌ No tool calling capabilities
2. ❌ Manual MCP integration attempts (didn't work)
3. ❌ Limited to simple Q&A
4. ❌ No analytics access from chat
5. ❌ Inconsistent with Nexus Framework

### **Benefits of New System**

1. ✅ Full tool orchestration via Claude
2. ✅ Native MCP Server integration
3. ✅ Multi-turn conversations
4. ✅ Real-time analytics access
5. ✅ Consistent with other agents
6. ✅ Streaming responses
7. ✅ Better error handling

---

## **Testing the Migration**

### **1. Test Basic Chat**

```
User: "Hello, how can you help me?"
Expected: Agent introduces itself and available tools
```

### **2. Test Tool Execution**

```
User: "Show me my session metrics for this week"
Expected: Agent calls analyze_session_metrics tool and displays data
```

### **3. Test Multi-Turn**

```
User: "Compare my token usage this week vs last week"
Expected: Agent calls analyze_token_usage twice and compares
```

### **4. Verify MCP Integration**

Check server logs for:
```
[SessionManagerAgent] Processing response turn 1 blocks: 2
[SessionManagerAgent] Block type: tool_use index: 0
[SessionManagerAgent] Executing tool: analyze_session_metrics
```

---

## **Next Steps**

1. ✅ **SessionManagerAgent** is the single source of truth
2. ✅ **NexusChat** is the recommended UI component
3. ⚠️ **SessionChatService** can be deleted after verification
4. ⚠️ **Chat.tsx** can be deleted after verification
5. ✅ Update any remaining references to use Nexus Framework

---

## **Support**

For questions or issues:
- Review: `/lib/agents/nexus/SessionManagerAgent.ts`
- Review: `/lib/services/sessionManager/NexusChat.tsx`
- Check: Server logs for tool execution traces
- Verify: MCP Server is accessible at configured URL
