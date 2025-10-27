# Agent Framework Standardization Implementation Guide

## Overview

This guide provides practical steps to standardize agent frameworks across AURA, LifeOS, and SMNB projects based on our analysis findings.

## Phase 1: Create Shared Agent Package (Weeks 1-2)

### 1.1 Setup Shared Package

```bash
# Create shared package
mkdir packages/agents
cd packages/agents
npm init -y
```

```json
// packages/agents/package.json
{
  "name": "@acdc-digital/agents",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "dependencies": {
    "@anthropic-ai/sdk": "^0.61.0",
    "convex": "^1.25.4"
  },
  "peerDependencies": {
    "next": ">=15.0.0",
    "react": ">=19.0.0"
  }
}
```

### 1.2 Extract Common Interfaces

```typescript
// packages/agents/src/types.ts
export interface AgentTool {
  command: string;
  name: string;
  description: string;
  usage?: string;
  examples?: string[];
  requiresPremium?: boolean;
}

export interface AgentCapability {
  type: 'command' | 'anthropic_tool';
  identifier: string;
  schema: any;
  requiresPremium: boolean;
}

export interface AgentExecutionContext {
  sessionId?: string;
  userId?: string;
  projectId?: string;
  streamHandler?: StreamHandler;
}

export interface StreamHandler {
  onChunk(chunk: string): void;
  onComplete(result: string): void;
  onError(error: Error): void;
}

export interface AgentExecutionResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  requiresUserInput?: boolean;
  interactiveComponent?: {
    type: string;
    data?: Record<string, unknown>;
  };
}
```

### 1.3 Create Unified Base Agent

```typescript
// packages/agents/src/BaseAgent.ts
import { AgentTool, AgentExecutionContext, AgentExecutionResult } from './types';

export abstract class BaseAgent {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly icon: string;
  abstract readonly isPremium: boolean;
  abstract readonly tools: AgentTool[];

  // Core execution (maintains backward compatibility)
  abstract execute(
    tool: AgentTool,
    input: string,
    mutations: any,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult>;

  // New streaming execution (optional implementation)
  async *stream(
    tool: AgentTool,
    input: string,
    mutations: any,
    context?: AgentExecutionContext
  ): AsyncIterable<string> {
    // Default implementation falls back to batch processing
    const result = await this.execute(tool, input, mutations, context);
    yield result.message;
  }

  getTool(command: string): AgentTool | undefined {
    return this.tools.find(tool => tool.command === command);
  }

  canExecute(context?: AgentExecutionContext): boolean {
    // Premium check logic
    if (this.isPremium && !context?.userId) {
      return false;
    }
    return true;
  }

  getMetadata() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      icon: this.icon,
      isPremium: this.isPremium,
      toolCount: this.tools.length,
      tools: this.tools,
    };
  }
}
```

### 1.4 Enhanced Registry with Streaming

```typescript
// packages/agents/src/AgentRegistry.ts
import { BaseAgent } from './BaseAgent';
import { AgentExecutionContext, AgentExecutionResult } from './types';

export class AgentRegistry {
  private agents = new Map<string, BaseAgent>();
  private commandToAgent = new Map<string, string>();

  register(agent: BaseAgent): void {
    this.agents.set(agent.id, agent);
    
    agent.tools.forEach(tool => {
      if (this.commandToAgent.has(tool.command)) {
        console.warn(`Command "${tool.command}" already exists. Overwriting...`);
      }
      this.commandToAgent.set(tool.command, agent.id);
    });

    console.log(`✅ Agent registered: ${agent.name} (${agent.id})`);
  }

  // Existing batch execution
  async executeCommand(
    command: string,
    input: string,
    mutations: any,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    const agent = this.getAgentByCommand(command);
    if (!agent) {
      throw new Error(`No agent found for command: ${command}`);
    }

    if (!agent.canExecute(context)) {
      throw new Error(`Agent ${agent.name} requires premium access`);
    }

    const tool = agent.getTool(command);
    if (!tool) {
      throw new Error(`Tool not found: ${command}`);
    }

    return await agent.execute(tool, input, mutations, context);
  }

  // New streaming execution
  async *streamCommand(
    command: string,
    input: string,
    mutations: any,
    context?: AgentExecutionContext
  ): AsyncIterable<string> {
    const agent = this.getAgentByCommand(command);
    if (!agent) {
      throw new Error(`No agent found for command: ${command}`);
    }

    if (!agent.canExecute(context)) {
      throw new Error(`Agent ${agent.name} requires premium access`);
    }

    const tool = agent.getTool(command);
    if (!tool) {
      throw new Error(`Tool not found: ${command}`);
    }

    yield* agent.stream(tool, input, mutations, context);
  }

  getAgentByCommand(command: string): BaseAgent | undefined {
    const agentId = this.commandToAgent.get(command);
    return agentId ? this.agents.get(agentId) : undefined;
  }

  getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }
}
```

## Phase 2: Migrate AURA/LifeOS (Weeks 3-4)

### 2.1 Update Package Dependencies

```json
// aura/AURA/package.json & lifeOS/LifeOS/package.json
{
  "dependencies": {
    "@acdc-digital/agents": "workspace:*",
    // ... other dependencies
  }
}
```

### 2.2 Update Agent Imports

```typescript
// Before (in both projects)
import { BaseAgent, AgentTool } from "./base";
import { AgentRegistry } from "./registry";

// After
import { BaseAgent, AgentTool, AgentRegistry } from "@acdc-digital/agents";
```

### 2.3 Add Streaming Support to Existing Agents

```typescript
// Example: Update TwitterAgent to support streaming
export class TwitterAgent extends BaseAgent {
  // ... existing implementation

  // Add streaming support
  async *stream(
    tool: AgentTool,
    input: string,
    mutations: any,
    context?: AgentExecutionContext
  ): AsyncIterable<string> {
    if (tool.command === "/twitter") {
      yield "🐦 Analyzing content for Twitter optimization...";
      const enhanced = await this.enhanceTwitterContent(input);
      yield "✨ Creating Twitter post with hashtags...";
      // ... continue with streaming updates
      yield `✅ Twitter post ready: ${enhanced.substring(0, 100)}...`;
    }
  }
}
```

## Phase 3: Add Agent Abstraction to SMNB (Weeks 5-6)

### 3.1 Create SMNB Agent Wrapper

```typescript
// smnb/smnb/lib/agents/EditorAgent.ts
import { BaseAgent, AgentTool, AgentExecutionContext, AgentExecutionResult } from "@acdc-digital/agents";
import { EditorAIService } from "../services/editorAIService";

export class EditorAgent extends BaseAgent {
  readonly id = "editor";
  readonly name = "Content Editor";
  readonly description = "AI-powered content creation and formatting";
  readonly icon = "✏️";
  readonly isPremium = false;

  readonly tools: AgentTool[] = [
    {
      command: "/format",
      name: "Format Content",
      description: "Apply AI-powered formatting to content",
      usage: "/format <content>",
      examples: ["/format newsletter content"]
    },
    {
      command: "/generate",
      name: "Generate Content",
      description: "Generate new content based on prompts",
      usage: "/generate <prompt>",
      examples: ["/generate blog post about AI"]
    }
  ];

  private aiService: EditorAIService;

  constructor(apiKey: string) {
    super();
    this.aiService = new EditorAIService(apiKey);
  }

  async execute(
    tool: AgentTool,
    input: string,
    mutations: any,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    // Delegate to existing service methods
    switch (tool.command) {
      case "/format":
        const formatted = await this.aiService.processRequest({
          type: 'newsletter-format',
          input: input
        });
        return {
          success: true,
          message: formatted.content || "Content formatted successfully"
        };
      case "/generate":
        const generated = await this.aiService.processRequest({
          type: 'content-generation',
          input: input
        });
        return {
          success: true,
          message: generated.content || "Content generated successfully"
        };
      default:
        return {
          success: false,
          message: `Unknown tool: ${tool.command}`
        };
    }
  }

  // Implement streaming using existing SMNB streaming infrastructure
  async *stream(
    tool: AgentTool,
    input: string,
    mutations: any,
    context?: AgentExecutionContext
  ): AsyncIterable<string> {
    let fullContent = "";
    
    const streamHandler = {
      onChunk: (chunk: string) => fullContent += chunk,
      onComplete: () => {},
      onError: (error: Error) => { throw error; }
    };

    // Use existing streaming service
    await this.aiService.streamRequest({
      type: tool.command === "/format" ? 'newsletter-format' : 'content-generation',
      input: input
    }, streamHandler);

    // Stream the content as it arrives
    let lastLength = 0;
    const interval = setInterval(() => {
      if (fullContent.length > lastLength) {
        const newChunk = fullContent.substring(lastLength);
        lastLength = fullContent.length;
        // Yield new content (this would need proper async iteration)
      }
    }, 100);

    // Clean up interval when done
    clearInterval(interval);
    yield fullContent;
  }
}
```

### 3.2 Integrate with Existing SMNB UI

```typescript
// smnb/smnb/components/AgentChat.tsx
import { AgentRegistry } from "@acdc-digital/agents";
import { EditorAgent } from "../lib/agents/EditorAgent";

export function AgentChat() {
  const [registry] = useState(() => {
    const reg = new AgentRegistry();
    reg.register(new EditorAgent(process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY!));
    return reg;
  });

  const handleCommand = async (command: string, input: string) => {
    try {
      // Use streaming for real-time updates
      for await (const chunk of registry.streamCommand(command, input, null)) {
        // Update UI with streaming content
        setContent(prev => prev + chunk);
      }
    } catch (error) {
      console.error('Agent execution error:', error);
    }
  };

  // ... rest of component
}
```

## Phase 4: Unified Tool System (Weeks 7-8)

### 4.1 Add Anthropic Tools Support

```typescript
// packages/agents/src/AnthropicToolsAdapter.ts
export class AnthropicToolsAdapter {
  static convertAgentToolToAnthropicTool(tool: AgentTool): any {
    return {
      name: tool.command.replace('/', ''),
      description: tool.description,
      input_schema: {
        type: "object",
        properties: {
          input: {
            type: "string",
            description: "User input for the tool"
          }
        },
        required: ["input"]
      }
    };
  }

  static convertAnthropicToolToAgentTool(anthropicTool: any): AgentTool {
    return {
      command: `/${anthropicTool.name}`,
      name: anthropicTool.name,
      description: anthropicTool.description,
      usage: `/${anthropicTool.name} <input>`
    };
  }
}
```

### 4.2 Enhanced Base Agent with Tool Support

```typescript
// packages/agents/src/BaseAgent.ts (updated)
export abstract class BaseAgent {
  // ... existing properties

  // New: Support for Anthropic tools
  getAnthropicTools(): any[] {
    return this.tools.map(tool => 
      AnthropicToolsAdapter.convertAgentToolToAnthropicTool(tool)
    );
  }

  // New: Execute Anthropic tool calls
  async executeAnthropicTool(
    toolName: string,
    toolInput: any,
    mutations: any,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    const command = `/${toolName}`;
    const tool = this.getTool(command);
    
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    return await this.execute(tool, toolInput.input || '', mutations, context);
  }
}
```

## Phase 5: Testing and Validation (Week 9)

### 5.1 Create Integration Tests

```typescript
// packages/agents/src/__tests__/integration.test.ts
import { AgentRegistry } from '../AgentRegistry';
import { MockAgent } from '../__mocks__/MockAgent';

describe('Agent Registry Integration', () => {
  let registry: AgentRegistry;

  beforeEach(() => {
    registry = new AgentRegistry();
    registry.register(new MockAgent());
  });

  it('should execute commands', async () => {
    const result = await registry.executeCommand('/test', 'input', null);
    expect(result.success).toBe(true);
  });

  it('should stream commands', async () => {
    const chunks: string[] = [];
    for await (const chunk of registry.streamCommand('/test', 'input', null)) {
      chunks.push(chunk);
    }
    expect(chunks.length).toBeGreaterThan(0);
  });
});
```

### 5.2 Performance Testing

```typescript
// packages/agents/src/__tests__/performance.test.ts
describe('Agent Performance', () => {
  it('should handle concurrent executions', async () => {
    const registry = new AgentRegistry();
    registry.register(new MockAgent());

    const promises = Array(10).fill(0).map(() => 
      registry.executeCommand('/test', 'input', null)
    );

    const results = await Promise.all(promises);
    expect(results.every(r => r.success)).toBe(true);
  });
});
```

## Implementation Timeline

| Week | Phase | Activities | Deliverables |
|------|-------|------------|--------------|
| 1-2 | Shared Package | Create @acdc-digital/agents package | Base interfaces, BaseAgent, Registry |
| 3-4 | AURA/LifeOS Migration | Update imports, add streaming | Migrated agents with streaming |
| 5-6 | SMNB Integration | Create agent wrappers | SMNB agents compatible with registry |
| 7-8 | Tool Unification | Anthropic tools adapter | Unified tool system |
| 9 | Testing | Integration and performance tests | Test suite and validation |

## Success Metrics

- **Code Reuse**: >90% shared code between AURA/LifeOS
- **Performance**: Streaming responses <100ms initial chunk
- **Compatibility**: All existing functionality preserved
- **Extensibility**: New agents can be added in <1 day
- **Testing**: >80% code coverage

## Risk Mitigation

1. **Breaking Changes**: Maintain backward compatibility during migration
2. **Performance**: Benchmark before/after to ensure no regressions
3. **Complexity**: Gradual rollout with feature flags
4. **Dependencies**: Lock package versions during migration
5. **Testing**: Comprehensive test suite before production deployment

---

*Implementation Guide Version 1.0 - December 2024*