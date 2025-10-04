# Nexus Agentic Framework - Unified Architecture Guide
**Version:** 2.0 (Updated September 30, 2025)  
**Project:** ACDC Digital Ecosystem  
**Status:** Production Implementation Guide

---

## 📋 Executive Summary

The Nexus Framework is an **adaptable agentic system** that combines AI-powered tool execution with streaming responses and a rich UI component library. This guide reflects our **actual production implementation** in SMNB, incorporating lessons learned and architectural improvements.

**What Nexus Provides:**
- 🤖 **Streaming AI Agents** - Real-time Claude integration with tool execution
- 🔧 **Flexible Tool System** - AI-powered analytics with structured schemas
- 🎨 **Rich Chat UI** - Professional React components for conversations
- 📊 **Real-time Monitoring** - Token tracking and cost analytics
- 🔄 **Production-Ready** - Error handling, retries, and graceful degradation

**Current Maturity:** ~40% of original vision, but the 40% that works is **production-ready** and battle-tested.

---

## 🏗️ Architecture Overview

### The Three Pillars

```
┌─────────────────────────────────────────────────────────────┐
│                    NEXUS FRAMEWORK                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │  BACKEND      │  │  STREAMING    │  │  FRONTEND     │  │
│  │  LAYER        │  │  LAYER        │  │  LAYER        │  │
│  ├───────────────┤  ├───────────────┤  ├───────────────┤  │
│  │ • BaseAgent   │  │ • SSE Stream  │  │ • Conversation│  │
│  │ • Tools       │  │ • AsyncIter   │  │ • Input       │  │
│  │ • Convex DB   │──│ • Chunks      │──│ • Response    │  │
│  │ • Claude API  │  │ • Events      │  │ • Reasoning   │  │
│  │ • Error Logic │  │ • Real-time   │  │ • Suggestions │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Message Input
    ↓
React Component (useNexusAgent hook)
    ↓
POST /api/agents/stream (SSE endpoint)
    ↓
Agent.stream() → Claude API
    ↓
Tool Selection & Execution
    ↓
Convex Database Queries
    ↓
Stream Chunks Back (content, tool_call, metadata, error)
    ↓
Real-time UI Updates
```

---

## 🎯 Part 1: Backend Architecture

### 1.1 BaseNexusAgent Class

**Purpose:** Abstract base class that all agents inherit from.

**Location:** `/lib/agents/nexus/BaseNexusAgent.ts`

```typescript
export abstract class BaseNexusAgent {
  // Agent metadata
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly description: string;
  readonly isPremium: boolean = false;

  // Core methods (must implement)
  abstract stream(request: AgentRequest): AsyncIterable<AgentChunk>;
  protected abstract getTools(): Tool[];

  // Helper methods (provided)
  protected createContentChunk(content: string): AgentChunk;
  protected createToolCallChunk(toolId: string, input: unknown, result?: unknown): AgentChunk;
  protected createMetadataChunk(data: Record<string, unknown>): AgentChunk;
  protected createErrorChunk(error: string | Error): AgentChunk;
  
  // Batch execution (optional)
  async execute(request: AgentRequest): Promise<AgentResponse> {
    const chunks: AgentChunk[] = [];
    for await (const chunk of this.stream(request)) {
      chunks.push(chunk);
    }
    return { chunks };
  }

  // Premium gating (override for custom logic)
  canExecute(context?: ExecutionContext): boolean {
    if (this.isPremium) {
      // TODO: Implement subscription checking
      return true;
    }
    return true;
  }
}
```

**Key Design Decisions:**
- ✅ **Lazy tool initialization** - Tools created on first access, not construction
- ✅ **Chunk helpers** - Consistent chunk creation across all agents
- ✅ **Premium flag** - Built-in support for paid features
- ✅ **Error handling** - Dedicated error chunk type

---

### 1.2 Tool System

**Current Implementation:** Anthropic Tools (AI-powered)

**Future Support:** Command tools (slash commands) and Hybrid tools

```typescript
export interface Tool {
  type: 'anthropic_tool' | 'command' | 'hybrid';
  identifier: string;
  requiresPremium: boolean;
  schema: AnthropicToolSchema;
  handler: ToolHandler;
}

export interface AnthropicToolSchema {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
}

export type ToolHandler = (
  input: unknown,
  context?: ExecutionContext
) => Promise<unknown>;
```

**Best Practices for Tool Design:**

1. **Clear Descriptions** - Claude needs to understand when to use each tool
```typescript
{
  name: 'analyze_session_metrics',
  description: 'Get comprehensive session metrics including total sessions, active sessions, average duration, and user engagement patterns for a specified time range.',
  // ✅ Detailed description helps Claude choose correctly
}
```

2. **Strong Input Validation** - Use enums for controlled inputs
```typescript
{
  input_schema: {
    type: 'object',
    properties: {
      timeRange: {
        type: 'string',
        enum: ['today', 'week', 'month', 'all'],
        description: 'Time range for metrics analysis'
      }
    },
    required: ['timeRange']
  }
}
```

3. **Real Convex Integration** - Connect to actual database queries
```typescript
private async handleSessionMetrics(
  input: unknown, 
  ctx?: ExecutionContext
): Promise<unknown> {
  const params = input as { timeRange: string };
  
  // ✅ Real Convex query
  const metrics = await ctx!.convex!.query(
    api.analytics.getSessionMetrics,
    { 
      timeRange: params.timeRange,
      sessionId: ctx!.sessionId 
    }
  );
  
  return metrics;
}
```

**⚠️ CRITICAL:** Do NOT use placeholder handlers. Every tool must query real data.

---

### 1.3 Streaming Implementation

**The Golden Standard:** AsyncIterable with Server-Sent Events

```typescript
async *stream(request: AgentRequest): AsyncIterable<AgentChunk> {
  const { input, context } = request;
  
  // Build conversation history
  const messages: MessageParam[] = this.buildMessageHistory(request);
  
  try {
    // Call Claude API with streaming
    const stream = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages,
      tools: this.getAnthropicTools(),
      stream: true,
    });

    // Stream content chunks
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && 
          event.delta.type === 'text_delta') {
        yield this.createContentChunk(event.delta.text);
      }
      
      if (event.type === 'content_block_stop' && 
          event.content_block.type === 'tool_use') {
        // Execute tool
        const tool = this.getTool(event.content_block.name);
        const result = await tool.handler(
          event.content_block.input,
          context
        );
        
        yield this.createToolCallChunk(
          event.content_block.id,
          event.content_block.input,
          result
        );
      }
    }

    // Send completion metadata
    yield this.createMetadataChunk({ 
      status: 'complete',
      timestamp: Date.now()
    });
    
  } catch (error) {
    yield this.createErrorChunk(error);
  }
}
```

**Multi-Turn Tool Chaining:**

```typescript
let continueConversation = true;
let turnCount = 0;
const MAX_TURNS = 5;

while (continueConversation && turnCount < MAX_TURNS) {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    messages: conversationMessages,
    tools: this.getAnthropicTools(),
  });

  // Check if Claude wants to use more tools
  const toolUseBlocks = response.content.filter(
    (block) => block.type === 'tool_use'
  );

  if (toolUseBlocks.length === 0) {
    continueConversation = false;
    // Stream final response
  } else {
    // Execute tools and continue conversation
    turnCount++;
  }
}
```

**Why This Works:**
- ✅ Real-time updates - Users see progress immediately
- ✅ Cancellable - Can abort mid-stream if needed
- ✅ Error resilient - Each chunk can be independently handled
- ✅ Tool transparency - Users see what tools are being called

---

### 1.4 Error Handling & Retries

**Production-Ready Pattern:**

```typescript
private async callClaudeWithRetry(
  messages: MessageParam[],
  maxRetries = 3
): Promise<Message> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages,
        tools: this.getAnthropicTools(),
      });
    } catch (error: unknown) {
      lastError = error as Error;
      
      // Check error type
      if (this.isRetryableError(error)) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        continue;
      } else {
        // Non-retryable error, fail immediately
        throw error;
      }
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

private isRetryableError(error: unknown): boolean {
  const err = error as { status?: number };
  // Retry on: 429 (rate limit), 500 (server error), 529 (overload)
  return [429, 500, 529].includes(err.status || 0);
}
```

**User-Friendly Error Messages:**

```typescript
private getErrorMessage(error: unknown): string {
  const err = error as { status?: number; message?: string };
  
  switch (err.status) {
    case 401:
      return "Authentication error. Please check your API credentials.";
    case 429:
      return "Rate limit exceeded. Please try again in a moment.";
    case 500:
    case 529:
      return "Claude API is experiencing issues. Please try again.";
    default:
      return err.message || "An unexpected error occurred.";
  }
}
```

---

### 1.5 Convex Integration

**Database Schema for Sessions:**

```typescript
// convex/schema.ts
export default defineSchema({
  sessions: defineTable({
    userId: v.id("users"),
    status: v.union(v.literal("active"), v.literal("archived")),
    createdAt: v.number(),
    lastActiveAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_userId_and_status", ["userId", "status"]),

  messages: defineTable({
    sessionId: v.id("sessions"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    timestamp: v.number(),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_sessionId_and_timestamp", ["sessionId", "timestamp"]),

  token_usage: defineTable({
    sessionId: v.id("sessions"),
    messageId: v.id("messages"),
    inputTokens: v.number(),
    outputTokens: v.number(),
    inputCost: v.number(),
    outputCost: v.number(),
    totalCost: v.number(),
    duration: v.number(),
    success: v.boolean(),
    error: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_success", ["success"]),
});
```

**Analytics Queries:**

```typescript
// convex/analytics.ts
export const getSessionMetrics = query({
  args: {
    timeRange: v.union(
      v.literal("today"),
      v.literal("week"),
      v.literal("month"),
      v.literal("all")
    ),
    sessionId: v.optional(v.id("sessions")),
  },
  returns: v.object({
    totalSessions: v.number(),
    activeSessions: v.number(),
    averageSessionLength: v.number(),
    totalMessages: v.number(),
    userEngagement: v.number(),
  }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const startTime = getStartTime(args.timeRange, now);
    
    // Query sessions in time range
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_userId", (q) => 
        q.eq("userId", ctx.auth.getUserIdentity()!.subject)
      )
      .filter((q) => q.gte(q.field("createdAt"), startTime))
      .collect();
    
    const activeSessions = sessions.filter(s => s.status === "active");
    
    // Calculate metrics
    return {
      totalSessions: sessions.length,
      activeSessions: activeSessions.length,
      averageSessionLength: calculateAverageLength(sessions),
      totalMessages: await countMessages(ctx, sessions),
      userEngagement: calculateEngagement(sessions),
    };
  },
});
```

**Tool Handler Integration:**

```typescript
private async handleSessionMetrics(
  input: unknown,
  context?: ExecutionContext
): Promise<unknown> {
  if (!context?.convex) {
    throw new Error("Convex client not provided in execution context");
  }
  
  const params = input as { timeRange: string };
  
  // Call Convex query
  const metrics = await context.convex.query(
    api.analytics.getSessionMetrics,
    {
      timeRange: params.timeRange,
      sessionId: context.sessionId,
    }
  );
  
  return metrics;
}
```

---

## 🌊 Part 2: Streaming Layer

### 2.1 SSE API Route

**Location:** `/app/api/agents/stream/route.ts`

```typescript
import { SessionManagerAgent } from '@/lib/agents/nexus/SessionManagerAgent';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { agentId, input, context } = await req.json();
  
  // Instantiate agent (TODO: Use registry)
  const agent = new SessionManagerAgent();
  
  // Create readable stream
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Get async iterable from agent
        const chunks = agent.stream({
          agentId,
          input,
          context,
        });
        
        // Stream chunks as SSE
        for await (const chunk of chunks) {
          const data = `data: ${JSON.stringify(chunk)}\n\n`;
          controller.enqueue(new TextEncoder().encode(data));
        }
        
        controller.close();
      } catch (error) {
        console.error('[NexusAPI] Stream error:', error);
        const errorChunk = {
          type: 'error',
          data: { message: 'Stream failed' },
          timestamp: Date.now(),
        };
        const data = `data: ${JSON.stringify(errorChunk)}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));
        controller.close();
      }
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

**Key Features:**
- ✅ Server-Sent Events format
- ✅ Proper error handling
- ✅ Connection keep-alive
- ✅ JSON chunk encoding

---

### 2.2 Chunk Types

```typescript
export type AgentChunkType = 'content' | 'tool_call' | 'metadata' | 'error';

export interface AgentChunk {
  type: AgentChunkType;
  data: unknown;
  timestamp: number;
}

// Content chunk - Text from Claude
{
  type: 'content',
  data: 'Here are your session metrics...',
  timestamp: 1696089600000
}

// Tool call chunk - Tool execution details
{
  type: 'tool_call',
  data: {
    toolId: 'toolu_123',
    toolName: 'analyze_session_metrics',
    input: { timeRange: 'week' },
    result: { totalSessions: 42, ... }
  },
  timestamp: 1696089601000
}

// Metadata chunk - Status updates
{
  type: 'metadata',
  data: {
    status: 'complete',
    tokenUsage: { input: 150, output: 300 }
  },
  timestamp: 1696089602000
}

// Error chunk - Failures
{
  type: 'error',
  data: {
    message: 'Database query failed',
    code: 'DB_ERROR'
  },
  timestamp: 1696089603000
}
```

---

## 🎨 Part 3: Frontend Architecture

### 3.1 useNexusAgent Hook

**Purpose:** React hook that manages agent communication and state.

**Location:** `/lib/hooks/useNexusAgent.ts`

```typescript
export function useNexusAgent(options: UseNexusAgentOptions) {
  const { agentId, sessionId, onChunk } = options;
  
  const messagesRef = useRef<Message[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const sendMessage = useCallback(async (input: string) => {
    if (isStreaming) {
      console.warn('[useNexusAgent] Already streaming, ignoring new message');
      return;
    }
    
    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };
    
    messagesRef.current = [...messagesRef.current, userMessage];
    setMessages([...messagesRef.current]);
    setIsStreaming(true);
    setError(null);
    
    // Create abort controller
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch('/api/agents/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          input,
          context: { sessionId },
        }),
        signal: abortControllerRef.current.signal,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      let assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: '',
        toolCalls: [],
        timestamp: Date.now(),
      };
      
      messagesRef.current = [...messagesRef.current, assistantMessage];
      setMessages([...messagesRef.current]);
      
      // Read stream
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            if (jsonStr.trim()) {
              const agentChunk = JSON.parse(jsonStr) as AgentChunk;
              
              // Call user's onChunk callback
              onChunk?.(agentChunk);
              
              // Update message based on chunk type
              if (agentChunk.type === 'content') {
                assistantMessage.content += agentChunk.data as string;
                messagesRef.current = [...messagesRef.current];
                setMessages([...messagesRef.current]);
              }
              
              if (agentChunk.type === 'tool_call') {
                assistantMessage.toolCalls!.push(agentChunk.data as ToolCall);
                messagesRef.current = [...messagesRef.current];
                setMessages([...messagesRef.current]);
              }
              
              if (agentChunk.type === 'error') {
                setError((agentChunk.data as { message: string }).message);
              }
            }
          }
        }
      }
      
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Stream failed');
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [agentId, sessionId, isStreaming, onChunk]);
  
  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);
  
  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    cancelStream,
  };
}
```

**Key Features:**
- ✅ Ref-based state management (prevents stale closures)
- ✅ Abort controller for cancellation
- ✅ Real-time UI updates
- ✅ Error handling
- ✅ User callback support

---

### 3.2 Chat UI Components

#### Conversation Component

**Purpose:** Auto-scrolling container for messages.

```tsx
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai/conversation";

<Conversation className="relative w-full" style={{ height: "500px" }}>
  <ConversationContent>
    {messages.map((msg) => (
      <Message key={msg.id} from={msg.role}>
        <MessageContent>{msg.content}</MessageContent>
      </Message>
    ))}
  </ConversationContent>
  <ConversationScrollButton />
</Conversation>
```

**Features:**
- ✅ Auto-scroll to bottom on new messages
- ✅ Scroll button appears when user scrolls up
- ✅ Maintains position when reading history
- ✅ Smooth animations

#### Prompt Input Component

**Purpose:** Auto-resizing textarea with submit button.

```tsx
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from "@/components/ai/prompt-input";

<PromptInput onSubmit={handleSubmit}>
  <PromptInputTextarea
    value={input}
    onChange={(e) => setInput(e.currentTarget.value)}
    placeholder="Type your message..."
  />
  <PromptInputSubmit disabled={!input.trim()} status={status} />
</PromptInput>
```

**Features:**
- ✅ Auto-resize based on content
- ✅ Enter to submit, Shift+Enter for new line
- ✅ Status indicators (ready, streaming, error)
- ✅ Disabled state handling

#### Reasoning Component

**Purpose:** Collapsible thinking display for AI reasoning.

```tsx
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai/reasoning";

<Reasoning isStreaming={isThinking} defaultOpen={false}>
  <ReasoningTrigger title="Thinking" />
  <ReasoningContent>
    {reasoningText}
  </ReasoningContent>
</Reasoning>
```

**Features:**
- ✅ Auto-opens during reasoning
- ✅ Auto-closes when complete
- ✅ Duration tracking
- ✅ Manual toggle support

**Integration with Tool Calls:**

Tool calls from Claude should be displayed as reasoning blocks:

```tsx
{message.toolCalls?.map((toolCall, idx) => (
  <Reasoning key={idx} defaultOpen={false}>
    <ReasoningTrigger title={`Tool: ${toolCall.name}`} />
    <ReasoningContent>
      <div className="space-y-2">
        <div>
          <strong>Input:</strong>
          <pre className="mt-1 p-2 bg-muted rounded">
            {JSON.stringify(toolCall.input, null, 2)}
          </pre>
        </div>
        {toolCall.result && (
          <div>
            <strong>Result:</strong>
            <pre className="mt-1 p-2 bg-muted rounded">
              {JSON.stringify(toolCall.result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </ReasoningContent>
  </Reasoning>
))}
```

#### Response Component

**Purpose:** Markdown renderer optimized for streaming.

```tsx
import { Response } from "@/components/ai/response";

<Response>{message.content}</Response>
```

**Features:**
- ✅ Auto-completes incomplete formatting
- ✅ Hides broken links until complete
- ✅ Syntax highlighting for code blocks
- ✅ Math equation support

#### Suggestions Component

**Purpose:** Quick-start prompts for users.

```tsx
import { Suggestions, Suggestion } from "@/components/ai/suggestion";

const starterPrompts = [
  "How are my data metrics for the week?",
  "Show me token usage statistics",
  "What's my session activity?",
];

<Suggestions>
  {starterPrompts.map((prompt) => (
    <Suggestion
      key={prompt}
      suggestion={prompt}
      onClick={handleSuggestionClick}
    />
  ))}
</Suggestions>
```

**Features:**
- ✅ Horizontal scrolling
- ✅ Click-to-send
- ✅ Mobile-friendly

---

### 3.3 Complete Integration Example

```tsx
"use client";

import { useNexusAgent } from '@/lib/hooks/useNexusAgent';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai/conversation";
import { Message, MessageContent } from "@/components/ai/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from "@/components/ai/prompt-input";
import { Response } from "@/components/ai/response";
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai/reasoning";
import { Suggestions, Suggestion } from "@/components/ai/suggestion";
import { useState } from "react";

export function NexusChat({ sessionId }: { sessionId: string }) {
  const [input, setInput] = useState("");
  
  const {
    messages,
    isStreaming,
    error,
    sendMessage,
  } = useNexusAgent({
    agentId: 'session-manager-agent',
    sessionId,
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Empty state with suggestions */}
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <h2 className="text-2xl font-semibold mb-4">
            How can I help you today?
          </h2>
          <Suggestions>
            <Suggestion
              suggestion="How are my data metrics for the week?"
              onClick={handleSuggestionClick}
            />
            <Suggestion
              suggestion="Show me token usage statistics"
              onClick={handleSuggestionClick}
            />
            <Suggestion
              suggestion="What's my session activity?"
              onClick={handleSuggestionClick}
            />
          </Suggestions>
        </div>
      )}
      
      {/* Messages */}
      {messages.length > 0 && (
        <Conversation className="flex-1">
          <ConversationContent>
            {messages.map((msg) => (
              <Message key={msg.id} from={msg.role}>
                <MessageContent>
                  {/* Main content */}
                  <Response>{msg.content}</Response>
                  
                  {/* Tool calls as reasoning blocks */}
                  {msg.toolCalls?.map((toolCall, idx) => (
                    <Reasoning key={idx} defaultOpen={false}>
                      <ReasoningTrigger title={`Tool: ${toolCall.name}`} />
                      <ReasoningContent>
                        <div className="space-y-2 text-sm">
                          <div>
                            <strong>Input:</strong>
                            <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                              {JSON.stringify(toolCall.input, null, 2)}
                            </pre>
                          </div>
                          {toolCall.result && (
                            <div>
                              <strong>Result:</strong>
                              <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                                {JSON.stringify(toolCall.result, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </ReasoningContent>
                    </Reasoning>
                  ))}
                </MessageContent>
              </Message>
            ))}
            
            {isStreaming && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-4 flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    AI is thinking...
                  </span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive p-3 rounded">
                {error}
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      )}
      
      {/* Input */}
      <PromptInput onSubmit={handleSubmit} className="mt-4">
        <PromptInputTextarea
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder="Ask about your session metrics..."
        />
        <PromptInputSubmit 
          disabled={!input.trim()} 
          status={isStreaming ? 'streaming' : 'ready'} 
        />
      </PromptInput>
    </div>
  );
}
```

---

## 📊 Part 4: Token Tracking & Monitoring

### 4.1 Token Usage Schema

```typescript
// convex/schema.ts
token_usage: defineTable({
  sessionId: v.id("sessions"),
  messageId: v.id("messages"),
  inputTokens: v.number(),
  outputTokens: v.number(),
  inputCost: v.number(),
  outputCost: v.number(),
  totalCost: v.number(),
  duration: v.number(),
  success: v.boolean(),
  error: v.optional(v.string()),
  timestamp: v.number(),
})
  .index("by_sessionId", ["sessionId"])
  .index("by_timestamp", ["timestamp"])
  .index("by_success", ["success"]),
```

### 4.2 Cost Calculation

```typescript
// Claude 3.5 Haiku pricing
const PRICING = {
  INPUT_PER_1K: 0.25 / 1000,   // $0.25 per 1K tokens
  OUTPUT_PER_1K: 1.25 / 1000,  // $1.25 per 1K tokens
};

function calculateCost(usage: { input_tokens: number; output_tokens: number }) {
  const inputCost = usage.input_tokens * PRICING.INPUT_PER_1K;
  const outputCost = usage.output_tokens * PRICING.OUTPUT_PER_1K;
  return {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  };
}
```

### 4.3 Logging Token Usage

```typescript
// After Claude API call
const usage = response.usage;
const costs = calculateCost(usage);

await ctx.runMutation(api.messages.logTokenUsage, {
  sessionId: context.sessionId,
  messageId: assistantMessageId,
  inputTokens: usage.input_tokens,
  outputTokens: usage.output_tokens,
  inputCost: costs.inputCost,
  outputCost: costs.outputCost,
  totalCost: costs.totalCost,
  duration: Date.now() - startTime,
  success: true,
});
```

### 4.4 Dashboard Display

```tsx
// components/TokenCounter.tsx
export function TokenCounter({ sessionId }: { sessionId: string }) {
  const usage = useQuery(api.analytics.getTokenUsage, { sessionId });
  
  if (!usage) return <div>Loading...</div>;
  
  return (
    <div className="flex items-center space-x-4 text-sm">
      <div className="flex items-center space-x-1">
        <CoinsIcon className="w-4 h-4" />
        <span>{usage.totalTokens.toLocaleString()} tokens</span>
      </div>
      <div className="flex items-center space-x-1">
        <DollarSignIcon className="w-4 h-4" />
        <span>${usage.totalCost.toFixed(4)}</span>
      </div>
    </div>
  );
}
```

---

## ✅ Part 5: Best Practices & Lessons Learned

### 5.1 What Works Exceptionally Well

#### ✅ Streaming Architecture
**Why it's excellent:**
- Real-time user feedback
- Perceived performance boost
- Cancelable mid-stream
- Transparent tool execution

**Keep doing:**
- AsyncIterable pattern
- Server-Sent Events
- Chunk-based updates
- Multi-turn tool chaining

#### ✅ Type Safety
**Why it matters:**
- Catches errors at compile time
- Better IDE autocomplete
- Self-documenting code
- Refactoring confidence

**Keep doing:**
- Strong TypeScript throughout
- No `any` types
- Proper Convex ID types
- Interface over type where appropriate

#### ✅ Tool Schema Design
**Why it's clean:**
- Claude understands when to use tools
- Strong input validation
- Clear parameter descriptions
- Enum constraints for inputs

**Keep doing:**
- Detailed tool descriptions
- JSON schema validation
- Required vs optional params
- Bound handler methods

---

### 5.2 Critical Gaps to Address

#### 🔴 Placeholder Tool Handlers
**The Problem:**
```typescript
// ❌ DO NOT DO THIS
private async handleSessionMetrics(input: unknown): Promise<unknown> {
  return {
    placeholder: true,
    message: "This will fetch session metrics...",
    totalSessions: 1234, // fake data
  };
}
```

**The Solution:**
```typescript
// ✅ DO THIS INSTEAD
private async handleSessionMetrics(
  input: unknown,
  context?: ExecutionContext
): Promise<unknown> {
  if (!context?.convex) {
    throw new Error("Convex client required");
  }
  
  const params = input as { timeRange: string };
  
  // Real database query
  const metrics = await context.convex.query(
    api.analytics.getSessionMetrics,
    {
      timeRange: params.timeRange,
      sessionId: context.sessionId,
    }
  );
  
  return metrics;
}
```

#### 🔴 No Shared Package
**The Problem:**
- Each project duplicates BaseNexusAgent
- Version drift across projects
- Bug fixes require N changes

**The Solution:**
```
packages/
  nexus-core/
    package.json
    tsconfig.json
    src/
      agents/
        BaseNexusAgent.ts
      types/
        index.ts
      tools/
        anthropic.ts
      streaming/
        sse.ts
```

**pnpm-workspace.yaml:**
```yaml
packages:
  - 'packages/*'
  - 'smnb/smnb'
  - 'aura/AURA'
  - 'donut'
  - 'home'
```

**Usage in projects:**
```typescript
import { BaseNexusAgent } from '@acdc/nexus-core';

export class SessionManagerAgent extends BaseNexusAgent {
  // Project-specific implementation
}
```

#### 🔴 Manual Agent Instantiation
**The Problem:**
```typescript
// ❌ Hardcoded in API route
const agent = new SessionManagerAgent();
```

**The Solution:**
```typescript
// ✅ Use registry
const agent = nexusRegistry.getAgent('session-manager-agent');

// Registry implementation
class NexusRegistry {
  private agents = new Map<string, BaseNexusAgent>();
  
  register(agent: BaseNexusAgent) {
    this.agents.set(agent.id, agent);
  }
  
  getAgent(id: string): BaseNexusAgent {
    const agent = this.agents.get(id);
    if (!agent) {
      throw new Error(`Agent not found: ${id}`);
    }
    return agent;
  }
  
  getAllAgents(): BaseNexusAgent[] {
    return Array.from(this.agents.values());
  }
}

// Register agents at startup
nexusRegistry.register(new SessionManagerAgent());
nexusRegistry.register(new WorkflowAgent());
```

---

### 5.3 Scaling Recommendations

#### For Adding New Agents

1. **Extend BaseNexusAgent**
```typescript
export class NewsAgent extends BaseNexusAgent {
  readonly id = 'news-agent';
  readonly name = 'News Agent';
  readonly description = 'Aggregates and summarizes news';
  readonly isPremium = false;
  
  protected getTools(): Tool[] {
    return [
      {
        type: 'anthropic_tool',
        identifier: 'fetch_news',
        requiresPremium: false,
        schema: {
          name: 'fetch_news',
          description: 'Fetch latest news articles',
          input_schema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                enum: ['tech', 'business', 'sports'],
              },
            },
            required: ['category'],
          },
        },
        handler: this.handleFetchNews.bind(this),
      },
    ];
  }
  
  async *stream(request: AgentRequest): AsyncIterable<AgentChunk> {
    // Implementation
  }
  
  private async handleFetchNews(input: unknown): Promise<unknown> {
    // Real API call or Convex query
  }
}
```

2. **Register Agent**
```typescript
nexusRegistry.register(new NewsAgent());
```

3. **Use in UI**
```typescript
const { messages, sendMessage } = useNexusAgent({
  agentId: 'news-agent',
  sessionId,
});
```

#### For Multi-Project Rollout

1. **Phase 1:** Create shared package
2. **Phase 2:** Migrate SMNB to use shared package
3. **Phase 3:** Add to AURA project
4. **Phase 4:** Add to other projects
5. **Phase 5:** Deprecate project-specific implementations

---

## 🎯 Part 6: Implementation Checklist

### Backend (High Priority)

- [ ] **Create shared `@acdc/nexus-core` package**
  - [ ] Move BaseNexusAgent to shared package
  - [ ] Move types to shared package
  - [ ] Configure pnpm workspace
  - [ ] Update imports in SMNB

- [ ] **Implement Nexus Registry**
  - [ ] Create NexusRegistry class
  - [ ] Support agent registration
  - [ ] Dynamic agent discovery
  - [ ] Update API route to use registry

- [ ] **Wire Convex to Tool Handlers**
  - [ ] Replace all placeholder handlers
  - [ ] Create analytics queries in Convex
  - [ ] Pass Convex client in ExecutionContext
  - [ ] Test with real data

- [ ] **Add Command Tools**
  - [ ] Implement command tool type
  - [ ] Add slash command parser
  - [ ] Examples: /help, /clear, /settings

- [ ] **Add Hybrid Tools**
  - [ ] Implement hybrid tool type
  - [ ] Support both command and AI modes
  - [ ] Example: /search (command) or natural language

### Frontend (Medium Priority)

- [ ] **Integrate Reasoning Component**
  - [ ] Display tool calls as reasoning blocks
  - [ ] Auto-open during tool execution
  - [ ] Show tool input/output
  - [ ] Track thinking duration

- [ ] **Add Suggestions Component**
  - [ ] Show starter prompts on empty state
  - [ ] Context-based follow-up suggestions
  - [ ] Track which suggestions are clicked

- [ ] **Enhance Error Display**
  - [ ] User-friendly error messages
  - [ ] Retry buttons for failed requests
  - [ ] Network status indicators

### Monitoring (Medium Priority)

- [ ] **Token Tracking Dashboard**
  - [ ] Real-time usage display
  - [ ] Cost breakdown by session
  - [ ] Historical trends
  - [ ] Budget alerts

- [ ] **Performance Monitoring**
  - [ ] Request duration tracking
  - [ ] Tool execution timing
  - [ ] Stream latency metrics
  - [ ] Error rate tracking

### Documentation (Low Priority)

- [ ] **API Documentation**
  - [ ] Agent interface docs
  - [ ] Tool creation guide
  - [ ] Hook usage examples
  - [ ] Component API reference

- [ ] **Examples Library**
  - [ ] Simple chat agent
  - [ ] Analytics agent
  - [ ] Workflow agent
  - [ ] Custom tool examples

---

## 🚀 Part 7: Quick Start Guide

### For Developers: Adding Nexus to Your Project

#### Step 1: Install Shared Package (Future)
```bash
pnpm add @acdc/nexus-core
```

#### Step 2: Create Your Agent
```typescript
// lib/agents/MyAgent.ts
import { BaseNexusAgent } from '@acdc/nexus-core';

export class MyAgent extends BaseNexusAgent {
  readonly id = 'my-agent';
  readonly name = 'My Agent';
  readonly description = 'Does something useful';
  
  protected getTools(): Tool[] {
    return [
      // Your tools
    ];
  }
  
  async *stream(request: AgentRequest): AsyncIterable<AgentChunk> {
    // Your implementation
  }
}
```

#### Step 3: Add SSE Route
```typescript
// app/api/agents/stream/route.ts
import { MyAgent } from '@/lib/agents/MyAgent';

export async function POST(req: NextRequest) {
  const { agentId, input, context } = await req.json();
  const agent = new MyAgent();
  
  // Stream implementation
}
```

#### Step 4: Use in UI
```tsx
// components/MyChat.tsx
import { useNexusAgent } from '@acdc/nexus-core/react';

export function MyChat() {
  const { messages, sendMessage, isStreaming } = useNexusAgent({
    agentId: 'my-agent',
    sessionId: 'session-123',
  });
  
  // UI implementation
}
```

---

## 📊 Conclusion

The Nexus Framework provides a **production-ready foundation** for building agentic AI systems with streaming responses and rich UI. While we're at ~40% of the original vision, the implemented features are **battle-tested** and **scalable**.

**Strengths:**
- ✅ Streaming architecture is gold standard
- ✅ Type safety throughout
- ✅ Clean tool abstraction
- ✅ Rich UI component library
- ✅ Real-time monitoring

**Next Steps (Priority Order):**
1. Wire Convex to tool handlers (3 days)
2. Create shared package (5 days)
3. Implement registry system (2 days)
4. Add command/hybrid tools (4 days)
5. Build out agent ecosystem (ongoing)

**Timeline to Full Vision:** ~30-40 days of focused work

The foundation is solid. Now it's time to complete the integration and scale across projects.
