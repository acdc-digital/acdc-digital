# ACDC Framework Quick Reference

## Core Concepts

### Agent Types
- **News Agent**: Content analysis, sentiment analysis, trend identification
- **Editor Agent**: Content formatting, enhancement, newsletter generation  
- **Research Agent**: Information gathering, synthesis, fact-checking
- **Workflow Agent**: Multi-step processes, task automation

### Tool Types
- **Command Tools**: Legacy `/command` pattern from AURA/LifeOS
- **Anthropic Tools**: Native Claude API tools with JSON schema
- **Hybrid Tools**: Support both command and API patterns

## Quick Start

### 1. Create a Basic Agent

```typescript
import { BaseACDCAgent, Tool, AgentRequest, AgentChunk } from '@acdc/agents';

export class MyAgent extends BaseACDCAgent {
  readonly id = 'my-agent';
  readonly name = 'My Custom Agent';
  readonly description = 'Description of what this agent does';
  readonly isPremium = false;

  protected defineTools(): Tool[] {
    return [
      {
        type: 'anthropic_tool',
        identifier: 'my_tool',
        schema: {
          name: 'my_tool',
          description: 'What this tool does',
          input_schema: {
            type: 'object',
            properties: {
              input: { type: 'string', description: 'User input' }
            },
            required: ['input']
          }
        },
        handler: this.handleTool.bind(this),
        requiresPremium: false
      }
    ];
  }

  async *stream(request: AgentRequest): AsyncIterable<AgentChunk> {
    yield this.createChunk('content', 'Processing...');
    // Implementation here
  }

  private async handleTool(input: any): Promise<any> {
    // Tool implementation
    return { result: 'success' };
  }
}
```

### 2. Register Agent

```typescript
// In your application startup
import { ACDCRegistry } from '@acdc/agents';
import { MyAgent } from './agents/MyAgent';

const registry = new ACDCRegistry();
registry.register(new MyAgent());
```

### 3. Use in API Route

```typescript
// app/api/agents/stream/route.ts
import { ACDCRegistry } from '@acdc/agents';

export async function POST(request: Request) {
  const { agentId, toolId, input } = await request.json();
  
  const registry = new ACDCRegistry();
  const agent = registry.getAgent(agentId);
  
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of agent.stream({ toolId, input })) {
        const data = `data: ${JSON.stringify(chunk)}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));
      }
      controller.close();
    }
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}
```

### 4. Frontend Integration

```tsx
// components/AgentChat.tsx
'use client';

import { useState } from 'react';

export function AgentChat() {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSubmit = async (input: string) => {
    setIsStreaming(true);
    
    const response = await fetch('/api/agents/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'news-agent',
        toolId: 'analyze_sentiment',
        input: { content: input }
      })
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          setMessages(prev => [...prev, data]);
        }
      }
    }

    setIsStreaming(false);
  };

  return (
    <div>
      {/* Chat UI implementation */}
    </div>
  );
}
```

## Common Patterns

### Streaming Content Generation

```typescript
async *stream(request: AgentRequest): AsyncIterable<AgentChunk> {
  yield this.createChunk('metadata', { status: 'starting' });
  
  const stream = await this.claudeProvider.streamCompletion({
    prompt: request.input.prompt,
    tools: this.getTools().map(t => t.schema)
  });

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta') {
      yield this.createChunk('content', chunk.delta.text);
    }
  }
  
  yield this.createChunk('metadata', { status: 'complete' });
}
```

### Error Handling with Retry

```typescript
import { StandardErrorHandler } from '@acdc/agents';

async executeToolWithRetry(tool: Tool, input: any): Promise<any> {
  return StandardErrorHandler.withRetry(
    async () => await tool.handler(input),
    3, // max retries
    1000 // backoff ms
  );
}
```

### Premium Feature Gating

```typescript
export class PremiumAgent extends BaseACDCAgent {
  readonly isPremium = true;

  async *stream(request: AgentRequest): AsyncIterable<AgentChunk> {
    if (!this.canExecute(request.context)) {
      yield this.createChunk('error', 'Premium subscription required');
      return;
    }
    
    // Implementation for premium users
  }
}
```

### Legacy Agent Migration

```typescript
import { LegacyAgentAdapter } from '@acdc/agents';
import { OldAuraAgent } from './legacy/OldAuraAgent';

// Wrap legacy agent
const modernAgent = new LegacyAgentAdapter(new OldAuraAgent());

// Register with ACDC
registry.register(modernAgent);
```

## API Reference

### Core Interfaces

```typescript
interface AgentRequest {
  toolId: string;
  input: any;
  context?: ExecutionContext;
}

interface AgentChunk {
  type: 'content' | 'tool_call' | 'metadata' | 'error';
  data: any;
  timestamp: number;
}

interface Tool {
  type: 'command' | 'anthropic_tool' | 'hybrid';
  identifier: string;
  schema: any;
  handler: ToolHandler;
  requiresPremium: boolean;
}

interface ExecutionContext {
  sessionId?: string;
  userId?: string;
  projectId?: string;
  mutations?: ConvexMutations;
}
```

### Registry Methods

```typescript
class ACDCRegistry {
  register(agent: BaseACDCAgent): void
  getAgent(agentId: string): BaseACDCAgent | undefined
  getAllAgents(): BaseACDCAgent[]
  executeAgent(agentId: string, request: AgentRequest): Promise<AgentResponse>
  streamAgent(agentId: string, request: AgentRequest): AsyncIterable<AgentChunk>
}
```

### Base Agent Methods

```typescript
abstract class BaseACDCAgent {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly isPremium: boolean;
  
  abstract stream(request: AgentRequest): AsyncIterable<AgentChunk>;
  async execute(request: AgentRequest): Promise<AgentResponse>;
  
  getTool(identifier: string): Tool | undefined;
  getTools(): Tool[];
  canExecute(context?: ExecutionContext): boolean;
  
  protected createChunk(type: string, data: any): AgentChunk;
  protected abstract defineTools(): Tool[];
}
```

## Environment Setup

### Package Installation

```bash
# Install ACDC framework
pnpm add @acdc/agents

# Peer dependencies
pnpm add @anthropic-ai/sdk convex next react
```

### Environment Variables

```bash
# .env.local
ANTHROPIC_API_KEY=your_api_key_here
CONVEX_DEPLOYMENT=your_convex_deployment
NEXT_PUBLIC_CONVEX_URL=your_convex_url
CLERK_SECRET_KEY=your_clerk_secret_key
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@acdc/*": ["./node_modules/@acdc/*/dist"]
    }
  }
}
```

## Debugging

### Enable Debug Logging

```typescript
import { AgentTracer, StreamDebugger } from '@acdc/agents/debug';

// Trace agent execution
const result = await AgentTracer.trace('my-agent', async () => {
  return await agent.execute(request);
});

// Debug streaming
const debuggedStream = StreamDebugger.debug(agent.stream(request), 'my-agent');
```

### Common Debug Commands

```bash
# Check agent registration
console.log(registry.getAllAgents().map(a => a.id));

# Validate tool schemas
agent.getTools().forEach(tool => {
  console.log(`${tool.identifier}:`, tool.schema);
});

# Monitor streaming chunks
for await (const chunk of agent.stream(request)) {
  console.log('Chunk:', chunk.type, chunk.data);
}
```

## Performance Tips

### Optimize Streaming

```typescript
// Use efficient chunk sizes
private chunkText(text: string, size: number = 100): string[] {
  return text.match(new RegExp(`.{1,${size}}`, 'g')) || [];
}

// Implement connection pooling
class OptimizedClaudeProvider {
  private static instance: OptimizedClaudeProvider;
  // Implementation...
}
```

### Cache Responses

```typescript
import { CacheManager } from '@acdc/agents/cache';

async executeWithCache(request: AgentRequest): Promise<any> {
  const cacheKey = `agent:${this.id}:${JSON.stringify(request)}`;
  
  return CacheManager.getCachedResponse(
    cacheKey,
    () => this.executeInternal(request),
    300000 // 5 minutes TTL
  );
}
```

### Monitor Performance

```typescript
// Track execution metrics
class PerformanceMonitor {
  static async trackExecution<T>(
    operation: () => Promise<T>,
    metadata: any
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await operation();
      this.recordMetric('success', performance.now() - start, metadata);
      return result;
    } catch (error) {
      this.recordMetric('error', performance.now() - start, metadata);
      throw error;
    }
  }
}
```

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Agent not found | Not registered | Check `registry.register(agent)` |
| Tool schema error | Invalid JSON schema | Validate with JSON Schema validator |
| Streaming cuts off | Network timeout | Implement retry mechanism |
| Memory leak | Unclosed streams | Use proper cleanup in finally blocks |
| Rate limiting | Too many requests | Implement exponential backoff |

### Health Checks

```typescript
// Agent health check
async function checkAgentHealth(agentId: string): Promise<boolean> {
  try {
    const agent = registry.getAgent(agentId);
    if (!agent) return false;
    
    const result = await agent.execute({
      toolId: 'health_check',
      input: { test: true }
    });
    
    return result.success;
  } catch {
    return false;
  }
}
```

---

*ACDC Framework Quick Reference v1.0*  
*ACDC Digital - December 2024*