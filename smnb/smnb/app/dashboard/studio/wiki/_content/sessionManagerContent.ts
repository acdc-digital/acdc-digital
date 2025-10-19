export const sessionManagerContent = `# Session Manager Deep Dive

## Overview

The Session Manager is a comprehensive chat system built with Next.js and Convex that handles multi-session conversations with AI assistants, tool integration, and MCP server connectivity. It provides a robust, scalable foundation for AI-powered conversations with advanced features including real-time synchronization, cross-session intelligence, and secure tool execution.

**Key Capabilities**:
- **Multi-Session Management**: Organize conversations across unlimited sessions
- **Real-time Sync**: Instant updates across all connected clients
- **Tool Integration**: Execute code, access files, query databases, call external APIs
- **MCP Server**: Extended protocol support for custom capabilities
- **Cross-Session Intelligence**: Learn from all previous conversations

---

## 🏗️ Architecture Overview

### Frontend Components

| Component | Location | Purpose | Key Features |
|-----------|----------|---------|--------------|
| **Sessions Page** | \`/app/dashboard/studio/sessions/page.tsx\` | Session list view | Display all sessions, search, filter, create new |
| **Session Detail** | \`/app/dashboard/studio/sessions/[sessionId]/page.tsx\` | Individual chat interface | Real-time messaging, tool execution, history |
| **Session Components** | \`/components/sessions/\` | Reusable UI elements | Message bubbles, input fields, tool results |
| **Convex Provider** | \`/components/ConvexClientProvider.tsx\` | Real-time connection | WebSocket subscriptions, optimistic updates |

### Backend (Convex)

| Module | Location | Purpose | Key Functions |
|--------|----------|---------|---------------|
| **Session Functions** | \`/convex/sessions.ts\` | Session CRUD operations | create, update, delete, archive, list |
| **Message Functions** | \`/convex/messages.ts\` | Message handling | send, edit, delete, react, list |
| **Tool Integration** | \`/convex/tools/\` | Tool execution | execute, validate, permissions, results |
| **MCP Server** | \`/convex/mcp/\` | Protocol handlers | connect, request, response, stream |

---

## 📋 Core Components

### 1. Session Management

#### Session Lifecycle

\`\`\`
Create → Active → [Archive/Delete]
  ↓
Configure
  ↓
Add Messages
  ↓
Execute Tools
  ↓
Cross-Reference
\`\`\`

#### Session Creation Process

1. **User Initiates**: Click "New Session" button
2. **Generate ID**: Unique session identifier created
3. **Initialize Metadata**: Set default configuration
4. **Store in DB**: Persist to Convex database
5. **Navigate**: Redirect to session detail view

#### Session Storage Schema

\`\`\`typescript
sessions: {
  _id: Id<"sessions">           // Unique identifier
  userId: Id<"users">            // Owner of session
  title: string                  // Display name
  createdAt: number              // Unix timestamp
  updatedAt: number              // Last modification time
  status: "active" | "archived" | "deleted"
  metadata: {
    model?: string               // AI model (e.g., "gpt-4")
    temperature?: number         // Creativity (0.0-1.0)
    maxTokens?: number           // Response length limit
    tools?: string[]             // Enabled tool names
  }
}
\`\`\`

**Database Features**:
- Real-time synchronization across all clients
- Persistent storage with automatic backup
- Indexed for fast queries by user, status, date
- Cross-session data aggregation for intelligence

---

### 2. Message Flow Architecture

#### Message Pipeline

\`\`\`
┌─────────────┐
│ User Input  │
└──────┬──────┘
       ↓
┌─────────────────┐
│ Frontend Component │
└──────┬───────────┘
       ↓
┌─────────────────┐
│ Convex Mutation  │ ← sendMessage()
└──────┬───────────┘
       ↓
┌─────────────────┐
│ Store in DB     │
└──────┬───────────┘
       ↓
┌─────────────────┐
│ AI Processing   │ ← Action with tool access
└──────┬───────────┘
       ↓
┌─────────────────┐
│ Tool Execution  │ (if needed)
└──────┬───────────┘
       ↓
┌─────────────────┐
│ Generate Response│
└──────┬───────────┘
       ↓
┌─────────────────┐
│ Store Response  │
└──────┬───────────┘
       ↓
┌─────────────────┐
│ Real-time Update│ ← Client subscription
└─────────────────┘
\`\`\`

#### Message Types & Roles

| Role | Purpose | Example | Stored in DB |
|------|---------|---------|--------------|
| **user** | Human input | "What's the weather today?" | ✅ |
| **assistant** | AI response | "The weather is sunny, 72°F" | ✅ |
| **system** | System notifications | "Session started" | ✅ |
| **tool** | Tool execution results | "Code executed successfully" | ✅ |

#### Message Schema

\`\`\`typescript
messages: {
  _id: Id<"messages">
  sessionId: Id<"sessions">     // Parent session
  role: "user" | "assistant" | "system" | "tool"
  content: string               // Message text
  timestamp: number             // Unix timestamp
  metadata?: {
    toolCalls?: ToolCall[]      // Tools executed
    error?: string              // Error messages
    model?: string              // AI model used
    tokens?: number             // Token count
  }
}
\`\`\`

---

### 3. Data Management & Aggregation

#### Collected Data Sources

The system aggregates data from multiple sources to provide comprehensive context:

| Data Source | Type | Purpose | Real-time? |
|-------------|------|---------|------------|
| **All Sessions** | Historical | Past conversations, solutions, patterns | ✅ |
| **Tool Results** | Execution | Code outputs, file contents, API responses | ✅ |
| **File Attachments** | Documents | Uploaded files, images, code snippets | ❌ |
| **External APIs** | Live Data | Weather, stocks, news, third-party services | ✅ |
| **MCP Server** | Custom | Project-specific tools and data sources | ✅ |

#### Data Flow Diagram

\`\`\`
┌──────────────┐
│ User Session │
└──────┬───────┘
       ↓
┌──────────────────┐
│  Convex Database │
└──────┬───────────┘
       ↓
┌──────────────────┐
│ Aggregation Layer│ ← Combines all data sources
└──────┬───────────┘
       ↓
┌──────────────────┐
│   AI Context     │ ← Formatted for AI consumption
└──────┬───────────┘
       ↓
┌──────────────────┐
│  Tool Results    │ ← Executed based on AI decision
└──────┬───────────┘
       ↓
┌──────────────────┐
│   MCP Server     │ ← Extended capabilities
└──────────────────┘
\`\`\`

#### Cross-Session Intelligence

The system learns across all sessions:
- **Pattern Recognition**: Identify recurring issues and solutions
- **Knowledge Graph**: Build connections between concepts
- **Solution Reuse**: Reference past successful approaches
- **Context Awareness**: Understand project evolution over time

---

### 4. Tool Integration System

#### Available Tools

| Category | Tools | Capabilities |
|----------|-------|--------------|
| **File Operations** | read_file, write_file, search_files | Access and modify project files |
| **Code Execution** | run_code, test_code, lint_code | Execute and validate code snippets |
| **Database Queries** | query_convex, get_data, aggregate_data | Access Convex database directly |
| **External APIs** | fetch_api, webhook_call, http_request | Call external services |
| **MCP Commands** | mcp_execute, custom_tool | Project-specific functionality |

#### Tool Execution Flow

\`\`\`
1. AI Analysis
   ↓
   Identifies tool requirement from user request
   
2. Tool Selection
   ↓
   Chooses appropriate tool with parameters
   
3. Permission Check
   ↓
   Validates user has permission for this tool
   
4. Parameter Validation
   ↓
   Ensures all required parameters are valid
   
5. Sandboxed Execution
   ↓
   Executes tool in isolated environment
   
6. Result Processing
   ↓
   Formats output for conversation context
   
7. Response Generation
   ↓
   AI incorporates tool result in response
   
8. Store & Display
   ↓
   Save to database and show to user
\`\`\`

#### Tool Permission Model

\`\`\`typescript
tools: {
  _id: Id<"tools">
  name: string                  // e.g., "read_file"
  description: string           // Human-readable description
  parameters: JsonSchema        // Parameter validation schema
  permissions: string[]         // Required user roles
  category: string              // Grouping (file, code, api, etc.)
  rateLimit?: {
    max: number                 // Max calls per period
    period: number              // Time window in seconds
  }
}
\`\`\`

---

### 5. MCP Server Integration

#### MCP Capabilities

| Feature | Description | Use Case |
|---------|-------------|----------|
| **Extended Tools** | Custom tool registration beyond built-ins | Project-specific operations |
| **Protocol Handlers** | Custom request/response patterns | Specialized data formats |
| **Streaming Responses** | Real-time data streaming | Live updates, progress tracking |
| **Async Operations** | Long-running background tasks | Data processing, batch jobs |

#### Connection Management

\`\`\`typescript
// MCP server connection established per session
interface MCPConnection {
  transport: "websocket" | "http"  // Communication method
  url: string                       // Server endpoint
  auth?: {
    token: string                   // Authentication token
    refreshToken?: string           // For session renewal
  }
  reconnect: {
    enabled: boolean                // Auto-reconnect on disconnect
    maxAttempts: number             // Retry limit
    backoff: number                 // Delay between attempts (ms)
  }
  correlation: Map<string, Promise> // Request/response tracking
}
\`\`\`

#### MCP Request Lifecycle

\`\`\`
Client Request
    ↓
Serialize to MCP Protocol
    ↓
Send via Transport (WS/HTTP)
    ↓
Server Processing
    ↓
Response/Stream Back
    ↓
Deserialize Response
    ↓
Update UI / Store Result
    ↓
Error Recovery (if needed)
\`\`\`

---

## 🔧 API Reference

### Frontend Hooks (React)

#### Query Hooks (Read Operations)

\`\`\`typescript
// Get all sessions for current user
const sessions = useQuery(api.sessions.list)
// Returns: Session[] | undefined

// Get specific session by ID
const session = useQuery(api.sessions.get, { 
  sessionId: "k170..." 
})
// Returns: Session | null | undefined

// Get messages for a session
const messages = useQuery(api.messages.list, { 
  sessionId: "k170..." 
})
// Returns: Message[] | undefined

// Get available tools
const tools = useQuery(api.tools.list)
// Returns: Tool[] | undefined
\`\`\`

#### Mutation Hooks (Write Operations)

\`\`\`typescript
// Send a new message
const sendMessage = useMutation(api.messages.send)
await sendMessage({ 
  sessionId: "k170...", 
  content: "Hello!" 
})

// Create a new session
const createSession = useMutation(api.sessions.create)
const newSession = await createSession({ 
  title: "New Chat" 
})

// Archive a session
const archiveSession = useMutation(api.sessions.archive)
await archiveSession({ 
  sessionId: "k170..." 
})

// Execute a tool
const executeTool = useMutation(api.tools.execute)
const result = await executeTool({
  toolName: "read_file",
  parameters: { path: "/src/app.ts" }
})
\`\`\`

---

### Convex Functions (Backend)

#### Session Operations

\`\`\`typescript
// Create new session
api.sessions.create
  args: { title: string, metadata?: SessionMetadata }
  returns: Id<"sessions">

// Update session
api.sessions.update
  args: { sessionId: Id<"sessions">, updates: Partial<Session> }
  returns: void

// Delete session (soft delete)
api.sessions.delete
  args: { sessionId: Id<"sessions"> }
  returns: void

// Archive session
api.sessions.archive
  args: { sessionId: Id<"sessions"> }
  returns: void

// List user sessions
api.sessions.list
  args: { status?: "active" | "archived", limit?: number }
  returns: Session[]
\`\`\`

#### Message Operations

\`\`\`typescript
// Send message
api.messages.send
  args: { sessionId: Id<"sessions">, content: string, role?: Role }
  returns: Id<"messages">

// Edit message
api.messages.edit
  args: { messageId: Id<"messages">, content: string }
  returns: void

// Delete message
api.messages.delete
  args: { messageId: Id<"messages"> }
  returns: void

// React to message (emoji)
api.messages.react
  args: { messageId: Id<"messages">, emoji: string }
  returns: void

// List messages in session
api.messages.list
  args: { sessionId: Id<"sessions">, limit?: number }
  returns: Message[]
\`\`\`

#### Tool Operations

\`\`\`typescript
// Execute a tool
api.tools.execute
  args: { toolName: string, parameters: Record<string, any> }
  returns: ToolResult

// List available tools
api.tools.list
  args: { category?: string }
  returns: Tool[]

// Get tool permissions
api.tools.getPermissions
  args: { toolName: string }
  returns: string[]

// Validate tool parameters
api.tools.validate
  args: { toolName: string, parameters: Record<string, any> }
  returns: { valid: boolean, errors?: string[] }
\`\`\`

---

## 📊 Data Flow Examples

### Example 1: Sending a Message

\`\`\`typescript
// User Flow
1. User types: "What files are in the src directory?"
   
2. Frontend calls: sendMessage({ 
     sessionId: "k170...", 
     content: "What files are in the src directory?" 
   })
   
3. Message stored in DB with role: "user"
   
4. AI processing triggered via Convex action
   
5. AI decides to use "list_files" tool
   
6. Tool executed: list_files({ path: "/src" })
   
7. Tool result: ["app.ts", "index.ts", "utils.ts"]
   
8. AI generates response: "The src directory contains 3 files: 
      app.ts, index.ts, and utils.ts"
   
9. Response stored in DB with role: "assistant"
   
10. UI updated via real-time subscription
    ↓
    User sees response instantly
\`\`\`

### Example 2: Tool Execution

\`\`\`typescript
// Tool Execution Flow
1. AI identifies need for "read_file" tool
   
2. Checks user permissions:
   - User has "file:read" permission ✅
   
3. Validates parameters:
   - path: "/src/app.ts" ✅
   - encoding: "utf-8" (default) ✅
   
4. Executes in sandbox:
   const content = await fs.readFile("/src/app.ts", "utf-8")
   
5. Returns result:
   {
     success: true,
     content: "import React from 'react'...",
     metadata: { size: 1245, lines: 42 }
   }
   
6. AI formats for conversation:
   "I've read the file. It's a React component with 42 lines..."
   
7. Result added to conversation context
   
8. User can reference file content in follow-up questions
\`\`\`

### Example 3: Cross-Session Query

\`\`\`typescript
// Cross-Session Intelligence
1. User asks: "How did we solve the authentication issue last week?"
   
2. System queries all sessions:
   - Search for keyword: "authentication"
   - Filter by: last 7 days
   - Find: 3 relevant conversations
   
3. Extract relevant context:
   Session A (6 days ago):
   - User: "Auth token not refreshing"
   - Solution: "Added retry logic to token refresh"
   
   Session B (5 days ago):
   - User: "Session timeout too short"
   - Solution: "Increased timeout to 24 hours"
   
4. Knowledge graph updated:
   authentication → token refresh → retry logic
   authentication → session timeout → configuration
   
5. Context provided to AI:
   "Based on your previous conversations..."
   
6. Enhanced response generated:
   "Last week you solved two authentication issues:
    1. Token refresh failures - fixed by adding retry logic
    2. Session timeouts - fixed by increasing timeout to 24h"
   
7. User gets comprehensive answer from past work
\`\`\`

---

## ⚙️ Configuration

### Environment Variables

\`\`\`env
# Convex Configuration
CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# AI Configuration
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# MCP Server
MCP_SERVER_URL=http://localhost:3001
MCP_AUTH_TOKEN=your-secret-token

# Session Configuration
MAX_SESSION_LENGTH=1000
MESSAGE_TIMEOUT=30000
TOOL_EXECUTION_TIMEOUT=10000
\`\`\`

### Session Configuration Object

\`\`\`typescript
interface SessionConfig {
  // Message handling
  maxSessionLength: number        // Max messages per session (1000)
  messageTimeout: number          // Message timeout in ms (30000)
  
  // Tool execution
  toolExecutionTimeout: number    // Tool timeout in ms (10000)
  maxConcurrentTools: number      // Max parallel tools (5)
  
  // Feature flags
  enableMCP: boolean              // Enable MCP server (true)
  enableCrossSessionData: boolean // Enable cross-session queries (true)
  enableToolCaching: boolean      // Cache tool results (true)
  
  // AI configuration
  defaultModel: string            // Default AI model ("gpt-4")
  defaultTemperature: number      // Creativity 0-1 (0.7)
  defaultMaxTokens: number        // Response length (2000)
  
  // Real-time
  subscriptionDebounce: number    // Debounce updates in ms (100)
  optimisticUpdates: boolean      // Enable optimistic UI (true)
}
\`\`\`

---

## 🚀 Performance Optimizations

### 1. Message Pagination

\`\`\`typescript
// Load messages in chunks (50 at a time)
const { results, continueCursor } = await ctx.db
  .query("messages")
  .withIndex("by_sessionId", q => q.eq("sessionId", sessionId))
  .order("desc")
  .paginate({ numItems: 50, cursor })

// Infinite scroll support
const loadMore = async () => {
  if (!continueCursor) return
  const nextPage = await fetchMessages(continueCursor)
  setMessages([...messages, ...nextPage.results])
}

// Virtual scrolling for 1000+ messages
<VirtualScroller
  items={messages}
  itemHeight={60}
  bufferSize={10}
/>
\`\`\`

### 2. Caching Strategy

| Cache Type | Duration | Invalidation |
|------------|----------|--------------|
| **Tool Results** | 5 minutes | On parameter change |
| **Session Metadata** | 1 minute | On session update |
| **User Permissions** | 10 minutes | On role change |
| **AI Responses** | Not cached | - |

\`\`\`typescript
// Tool result caching
const cachedExecute = cache(
  async (toolName: string, params: any) => {
    return await executeTool(toolName, params)
  },
  { ttl: 300000 } // 5 minutes
)
\`\`\`

### 3. Real-time Update Optimization

\`\`\`typescript
// Selective subscriptions (only active session)
const messages = useQuery(
  api.messages.list,
  isActive ? { sessionId } : "skip"
)

// Debounced updates (prevent excessive rerenders)
const debouncedUpdate = useMemo(
  () => debounce(handleUpdate, 100),
  []
)

// Optimistic UI (instant feedback)
const sendMessage = async (content: string) => {
  // Add to UI immediately
  setMessages([...messages, { 
    content, 
    role: "user", 
    _id: "temp" 
  }])
  
  // Send to server
  const id = await mutation({ content })
  
  // Replace temp with real message
  setMessages(msgs => msgs.map(m => 
    m._id === "temp" ? { ...m, _id: id } : m
  ))
}
\`\`\`

---

## 🔒 Security Considerations

### 1. Authentication & Authorization

\`\`\`typescript
// Session-level permissions
- User must be authenticated to access sessions
- Can only view/edit their own sessions
- Admin role can access all sessions for moderation

// Tool access control
- Each tool has required permission list
- Permissions checked before execution
- Rate limiting applied per user per tool
\`\`\`

### 2. Data Privacy

| Layer | Protection | Implementation |
|-------|------------|----------------|
| **User Isolation** | Database queries scoped to userId | Convex auth checks |
| **Encrypted Storage** | Data encrypted at rest | Convex Cloud encryption |
| **Secure Execution** | Tools run in sandbox | Isolated environment |
| **Audit Logging** | All operations logged | Convex system tables |

### 3. Rate Limiting

\`\`\`typescript
interface RateLimit {
  // API call limits
  maxAPICalls: 100              // per hour
  maxToolExecutions: 50         // per hour
  maxMessagesSent: 200          // per hour
  
  // Concurrent limits
  maxConcurrentSessions: 5      // active at once
  maxConcurrentTools: 3         // running at once
  
  // Size limits
  maxMessageLength: 10000       // characters
  maxFileSize: 10485760         // 10MB
  maxAttachments: 5             // per message
}
\`\`\`

---

## 🐛 Monitoring & Debugging

### Logging System

\`\`\`typescript
// Structured logging levels
export enum LogLevel {
  DEBUG = "debug",     // Development details
  INFO = "info",       // General information
  WARN = "warn",       // Warning conditions
  ERROR = "error"      // Error conditions
}

// Session activity logs
await ctx.db.insert("logs", {
  level: "info",
  category: "session",
  action: "message_sent",
  sessionId: session._id,
  userId: user._id,
  metadata: { 
    messageLength: content.length,
    toolsUsed: ["read_file"]
  },
  timestamp: Date.now()
})
\`\`\`

### Debug Tools

| Tool | Purpose | Access |
|------|---------|--------|
| **Session Inspector** | View session state, metadata, messages | Dev mode panel |
| **Message Timeline** | Chronological message flow with timing | Session detail view |
| **Tool Execution Viewer** | Tool calls, parameters, results, errors | Debug panel |
| **MCP Traffic Monitor** | Request/response logging for MCP | Network tab |

### Performance Metrics

\`\`\`typescript
// Track key metrics
interface SessionMetrics {
  avgResponseTime: number        // ms
  messagesPerSession: number     // count
  toolUsageRate: number          // percentage
  errorRate: number              // percentage
  activeUsers: number            // concurrent
  tokensConsumed: number         // total
}
\`\`\`

---

## 🔮 Future Enhancements

### Planned Features (Roadmap)

| Priority | Feature | Description | Timeline |
|----------|---------|-------------|----------|
| 🔥 **High** | Multi-modal Support | Images, audio, video in conversations | Q1 2025 |
| 🔥 **High** | Collaborative Sessions | Multiple users in same session | Q2 2025 |
| 🟡 **Medium** | Advanced Analytics | Usage patterns, insights dashboard | Q2 2025 |
| 🟡 **Medium** | Plugin System | Custom tool development & marketplace | Q3 2025 |
| 🟢 **Low** | Export/Import | Session backup and restore | Q3 2025 |
| 🟢 **Low** | Voice Interface | Speech-to-text and text-to-speech | Q4 2025 |

### Performance Improvements

\`\`\`typescript
// Planned optimizations
1. WebSocket Connection Pooling
   - Reuse connections across sessions
   - Reduce handshake overhead
   - Target: 50% latency reduction

2. Message Compression
   - Gzip large messages before storage
   - Transparent decompression on read
   - Target: 70% storage savings

3. Lazy Loading Strategies
   - Load messages on scroll
   - Defer tool result rendering
   - Target: 2x faster initial load

4. Edge Caching
   - Cache static responses at CDN
   - Reduce database queries
   - Target: 90% cache hit rate
\`\`\`

---

## 🆘 Troubleshooting

### Common Issues

#### Session Not Loading

**Symptoms**: Blank screen, infinite loading spinner

**Diagnosis**:
\`\`\`typescript
1. Check network connection
   - Open DevTools → Network tab
   - Look for failed requests to Convex

2. Verify authentication
   - Check auth token in localStorage
   - Confirm user is logged in

3. Inspect browser cache
   - Clear site data
   - Hard reload (Cmd+Shift+R)

4. Check Convex deployment status
   - Visit Convex dashboard
   - Verify deployment is online
\`\`\`

**Solutions**:
- Refresh page
- Clear browser cache
- Re-authenticate
- Check Convex status page

---

#### Tools Not Executing

**Symptoms**: Tool calls fail, no results returned

**Diagnosis**:
\`\`\`typescript
1. Verify user permissions
   await ctx.auth.getUserIdentity()
   // Check if user has required role

2. Check tool availability
   const tools = await ctx.db.query("tools").collect()
   // Verify tool exists and is enabled

3. Review execution logs
   // Check Convex logs for errors
   // Look for timeout or permission errors

4. Validate parameters
   // Ensure all required params provided
   // Check parameter types match schema
\`\`\`

**Solutions**:
- Grant necessary permissions to user
- Enable tool in configuration
- Fix parameter validation errors
- Increase tool timeout if needed

---

#### MCP Connection Issues

**Symptoms**: MCP server unreachable, requests timeout

**Diagnosis**:
\`\`\`typescript
1. Check server URL
   console.log(process.env.MCP_SERVER_URL)
   // Verify URL is correct and accessible

2. Verify credentials
   // Check auth token is valid
   // Confirm token has not expired

3. Review firewall settings
   // Ensure port is open
   // Check network security rules

4. Check protocol version
   // Verify client/server version compatibility
   // Update if mismatch detected
\`\`\`

**Solutions**:
- Update MCP_SERVER_URL
- Refresh authentication token
- Open firewall port
- Upgrade to compatible version

---

## 💡 Best Practices

### For Developers

\`\`\`typescript
// 1. Always handle loading states
const messages = useQuery(api.messages.list, { sessionId })
if (messages === undefined) {
  return <LoadingSpinner />
}

// 2. Implement proper error boundaries
<ErrorBoundary fallback={<ErrorUI />}>
  <SessionView />
</ErrorBoundary>

// 3. Use optimistic updates
const sendMessage = async (content: string) => {
  const tempId = generateTempId()
  setMessages([...messages, { _id: tempId, content, role: "user" }])
  
  try {
    const id = await mutation({ content })
    setMessages(msgs => msgs.map(m => m._id === tempId ? { ...m, _id: id } : m))
  } catch (error) {
    setMessages(msgs => msgs.filter(m => m._id !== tempId))
    showError("Failed to send message")
  }
}

// 4. Cache expensive operations
const computedData = useMemo(
  () => processMessages(messages),
  [messages]
)

// 5. Follow TypeScript strict mode
// Enable in tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
\`\`\`

### For Users

\`\`\`
1. Keep Sessions Focused
   ✅ One topic per session
   ✅ Clear, descriptive session titles
   ❌ Mixing unrelated topics

2. Use Descriptive Titles
   ✅ "Debug authentication issue - OAuth redirect"
   ✅ "Implement dark mode toggle"
   ❌ "Help" or "Question"

3. Archive Completed Sessions
   - Keep active list manageable
   - Easier to find current work
   - Better performance

4. Leverage Cross-Session Knowledge
   - Reference past solutions
   - Build on previous work
   - Create knowledge base over time

5. Report Issues Promptly
   - Use feedback button
   - Include reproduction steps
   - Attach relevant screenshots
\`\`\`

---

## 📝 Conclusion

The Session Manager provides a **robust, scalable foundation** for AI-powered conversations with advanced features like tool integration, MCP server connectivity, and cross-session intelligence.

### Key Strengths

✅ **Real-time Architecture**: Instant updates across all clients  
✅ **Data Integrity**: Persistent storage with automatic backup  
✅ **Security**: Authentication, authorization, sandboxed execution  
✅ **Scalability**: Handles unlimited sessions and messages  
✅ **Extensibility**: Plugin system and custom tool support  

### Production Ready

The system is designed for production use with:
- Comprehensive error handling
- Performance optimizations
- Security best practices
- Monitoring and debugging tools
- Extensive documentation

### Next Steps

1. **Review Architecture**: Understand data flow and components
2. **Explore API**: Familiarize with available functions
3. **Build Features**: Leverage tools and MCP capabilities
4. **Monitor Performance**: Use debug tools and metrics
5. **Contribute**: Share improvements and report issues

---

**Last Updated**: October 18, 2025  
**Version**: 1.0.0  
**Maintainers**: ACDC Digital Team  
**Support**: [GitHub Issues](https://github.com/acdc-digital/smnb/issues)
`;
