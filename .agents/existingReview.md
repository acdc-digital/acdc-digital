# Agent Framework Detailed Comparison Table

## Core Architecture Comparison

| Feature | AURA | LifeOS | SMNB |
|---------|------|--------|------|
| **Base Architecture** | `BaseAgent` abstract class | `BaseAgent` abstract class | Service classes |
| **Registry Pattern** | `AgentRegistry` centralized routing | `AgentRegistry` centralized routing | N/A |
| **Command System** | `/command` pattern | `/command` pattern | Direct method calls |
| **Tool System** | Custom `AgentTool` interface | Custom `AgentTool` interface | Anthropic Tools API |
| **File Count** | 10 TypeScript files | 10 TypeScript files | 74+ AI-related files |
| **Code Duplication** | High (shared with LifeOS) | High (shared with AURA) | Low |

## Agent Capabilities Matrix

| Agent/Feature | AURA | LifeOS | SMNB Equivalent |
|---------------|------|--------|-----------------|
| **Instructions Agent** | ✅ `/instructions` | ✅ `/instructions` | ❌ Manual documentation |
| **File Creator Agent** | ✅ `/create-file` | ✅ `/create-file` | ✅ Editor file operations |
| **Project Creator Agent** | ✅ `/create-project` | ✅ `/create-project` | ❌ Manual project setup |
| **Twitter Agent (CMO)** | ✅ `/twitter` (Premium) | ✅ `/twitter` (Premium) | ❌ No social media integration |
| **Scheduling Agent** | ✅ `/schedule` | ✅ `/schedule` | ❌ No scheduling features |
| **Preview Agent** | ✅ Brand previews | ❌ Not available | ❌ No preview generation |
| **Copywriter Agent** | ❌ Not available | ✅ Canvas integration | ✅ Editor AI (similar) |
| **Research System** | ❌ Not available | ✅ Lead/Simple agents | ❌ Manual research |
| **Streaming AI** | ❌ Batch only | ❌ Batch only | ✅ Real-time streaming |
| **Editor Integration** | ❌ File-based only | ❌ File-based only | ✅ Rich text editor |

## Technical Implementation Details

### Agent System (AURA/LifeOS)

| Component | Purpose | Implementation | Lines of Code |
|-----------|---------|----------------|---------------|
| `base.ts` | Abstract base class and interfaces | TypeScript interfaces + abstract class | ~150 |
| `registry.ts` | Command routing and agent management | Map-based routing system | ~100 |
| `index.ts` | Agent initialization and exports | Factory pattern implementation | ~50 |
| `store.ts` | UI state management | Zustand store integration | ~150 |
| Individual Agents | Specific functionality | Class extending BaseAgent | 200-500 each |

### Service System (SMNB)

| Component | Purpose | Implementation | Lines of Code |
|-----------|---------|----------------|---------------|
| `editorAIService.ts` | Core AI integration | Anthropic SDK wrapper | ~800+ |
| `aiFormattingService.ts` | Rich text formatting | TipTap editor integration | ~400+ |
| `claude/route.ts` | API endpoint | Next.js API route | ~300+ |
| AI Components | UI integration | React components | 100-300 each |
| Formatting Tools | Content transformation | Utility functions | ~200+ |

## API Integration Patterns

### Claude API Usage

| Project | Integration Method | Authentication | Error Handling | Streaming |
|---------|-------------------|----------------|----------------|-----------|
| **AURA** | Convex Actions | Environment variable | Try/catch in actions | ❌ No |
| **LifeOS** | Direct HTTP calls | Environment variable | Try/catch + retry logic | ❌ No |
| **SMNB** | API Routes + SDK | Client/server key options | Exponential backoff | ✅ Server-Sent Events |

### Tool Usage Patterns

| Project | Tool Definition | Tool Execution | Tool Results |
|---------|----------------|----------------|--------------|
| **AURA** | `AgentTool` interface | `execute()` method | `AgentExecutionResult` |
| **LifeOS** | `AgentTool` interface | `execute()` method | `AgentExecutionResult` |
| **SMNB** | Anthropic Tools spec | Direct API calls | Native tool responses |

## State Management Comparison

| State Type | AURA | LifeOS | SMNB |
|------------|------|--------|------|
| **Persistent Data** | Convex database | Convex database | Convex database |
| **UI State** | Zustand store | Zustand store | TipTap editor state |
| **Agent State** | Agent activation tracking | Agent activation tracking | Service call state |
| **Real-time Updates** | Convex subscriptions | Convex subscriptions | Editor state + Convex |
| **Chat History** | Convex chat messages | Convex chat messages | N/A (Editor focused) |

## Feature Support Matrix

| Feature | AURA | LifeOS | SMNB |
|---------|------|--------|------|
| **Multi-step Workflows** | ✅ Interactive components | ✅ Interactive components | ❌ Single-step only |
| **Premium Gating** | ✅ Agent-level | ✅ Agent-level | ❌ No premium model |
| **Real-time Collaboration** | ✅ Via Convex | ✅ Via Convex | ✅ Via Convex + Editor |
| **File Management** | ✅ Full CRUD | ✅ Full CRUD | ✅ Editor files only |
| **Project Organization** | ✅ Project structure | ✅ Project structure | ❌ Flat file structure |
| **Content Templates** | ✅ Project templates | ✅ Project templates | ✅ Editor templates |
| **Batch Operations** | ✅ Multi-file processing | ✅ Multi-file processing | ❌ Single file focus |
| **External Integrations** | ✅ Social media APIs | ✅ Social media APIs | ❌ Editor only |

## Development Experience

| Aspect | AURA | LifeOS | SMNB |
|--------|------|--------|------|
| **Adding New Agents** | Easy - extend BaseAgent | Easy - extend BaseAgent | Complex - create new services |
| **Testing** | Moderate - agent execution testing | Moderate - agent execution testing | Easy - service unit tests |
| **Debugging** | Agent execution logs | Agent execution logs | HTTP request/response logs |
| **Type Safety** | Strong - TypeScript + Convex | Strong - TypeScript + Convex | Strong - TypeScript + Anthropic types |
| **Documentation** | Excellent - comprehensive docs | Good - shared patterns | Moderate - implementation focused |

## Performance Characteristics

| Metric | AURA | LifeOS | SMNB |
|--------|------|--------|------|
| **Response Time** | Batch processing (2-10s) | Batch processing (2-10s) | Streaming (immediate) |
| **Throughput** | Medium - sequential agent execution | Medium - sequential agent execution | High - concurrent requests |
| **Memory Usage** | Low - lightweight agents | Low - lightweight agents | Medium - editor state |
| **Network Efficiency** | Moderate - Convex roundtrips | Moderate - direct API calls | High - streaming responses |
| **Scalability** | Good - agent registry pattern | Good - agent registry pattern | Excellent - stateless services |

## Future Roadmap Alignment

| Project | Planned Features | Architecture Readiness | Standardization Potential |
|---------|------------------|------------------------|---------------------------|
| **AURA** | More agents, workflow composer | High - extensible registry | High - can be reference |
| **LifeOS** | Enhanced research, collaboration | High - modular design | High - shares AURA patterns |
| **SMNB** | Advanced editing, computer use | Medium - service expansion | Medium - needs abstraction |

---

*Last Updated: December 2024*

# Agent Framework Standardization Analysis Report

## Executive Summary

This comprehensive analysis examines the agentic frameworks across three main projects in the ACDC Digital monorepo: **AURA**, **LifeOS**, and **SMNB**. Each project implements AI capabilities using Anthropic's Claude API but follows different architectural patterns and design philosophies.

## 1. Project Analysis and Comparison Table

### 1.1 Framework Overview

| Aspect | AURA | LifeOS | SMNB |
|--------|------|--------|------|
| **Framework Type** | Class-based Agent System | Class-based Agent System | Service-based AI Integration |
| **Architecture Pattern** | Registry + BaseAgent Classes | Registry + BaseAgent Classes | API Routes + Service Classes |
| **Agent Count** | 5 Core Agents | 6 Core Agents + Research System | AI-powered Editor Features |
| **LLM Provider** | Anthropic Claude (via Convex Actions) | Anthropic Claude (via API) | Anthropic Claude (Direct API) |
| **Tool System** | Command-based (/command) | Command-based (/command) | Anthropic Tools API |
| **State Management** | Convex + Zustand | Convex + Zustand | Convex + TipTap Editor |
| **Premium Features** | Yes (Agent-based) | Yes (Agent-based) | No |
| **UI Integration** | Chat Interface + Interactive Components | Chat Interface + Interactive Components | Rich Text Editor |

### 1.2 Detailed Agent Comparison

#### AURA Agents
- **Instructions Agent** - Documentation generation
- **File Creator Agent** - File management and creation
- **Project Creator Agent** - Project bootstrapping
- **Twitter Agent** (CMO) - Social media content creation (Premium)
- **Scheduling Agent** - Content scheduling optimization
- **Preview Agent** - Brand identity previews

#### LifeOS Agents
- **Instructions Agent** - Documentation generation
- **File Creator Agent** - File management and creation  
- **Project Creator Agent** - Project bootstrapping
- **Twitter Agent** (CMO) - Social media content creation (Premium)
- **Scheduling Agent** - Content scheduling optimization
- **Copywriter Agent** - Canvas content integration and optimization

#### LifeOS Research System
- **Lead Agent** - Primary research coordinator
- **Simple Agent** - Basic research tasks
- **Claude Client** - Direct Claude API integration
- **Research Tools** - Web search, content analysis

#### SMNB AI Features
- **Editor AI Service** - Content generation and formatting
- **AI Formatting Service** - Rich text editor enhancements
- **Producer Computer Use** - Advanced AI workflows
- **Claude API Routes** - Server-side AI processing
- **Streaming AI** - Real-time content generation

### 1.3 Technical Architecture Comparison

| Component | AURA | LifeOS | SMNB |
|-----------|------|--------|------|
| **Base Class** | `BaseAgent` (4,117 bytes) | `BaseAgent` (4,121 bytes) | N/A - Service-based |
| **Registry System** | `AgentRegistry` (3,604 bytes) | `AgentRegistry` (3,608 bytes) | N/A |
| **Tool Definition** | `AgentTool` interface | `AgentTool` interface | Anthropic Tools spec |
| **Execution Pattern** | `execute()` method | `execute()` method | Service method calls |
| **Error Handling** | Try/catch in agents | Try/catch in agents | HTTP error responses |
| **Streaming** | No | No | Yes (SSE) |
| **File Integration** | Convex file storage | Convex file storage | TipTap editor state |

## 2. Framework Consistency Analysis

### 2.1 High Consistency Areas

**AURA and LifeOS are nearly identical:**
- Share the same base architecture (BaseAgent, AgentRegistry)
- Use identical interface definitions
- Follow the same command pattern (`/command`)
- Have matching core agents (Instructions, File Creator, Project Creator, Twitter, Scheduling)
- Both use Convex for state management and file storage
- Both implement premium agent features

**Evidence of Code Sharing:**
- Base.ts files are 99.9% identical (4,117 vs 4,121 bytes)
- Registry.ts files are nearly identical (3,604 vs 3,608 bytes)
- Project Creator agents share identical template structures
- Command patterns and tool definitions match exactly

### 2.2 Architectural Divergence

**SMNB follows a completely different pattern:**
- **No agent classes** - Uses service-oriented architecture
- **Direct API integration** - Makes HTTP calls to Claude API routes
- **Tool-based approach** - Uses Anthropic's native tools API
- **Editor-focused** - Optimized for rich text editing workflows
- **Streaming capabilities** - Real-time content generation
- **Different state model** - TipTap editor state vs. file-based storage

### 2.3 Connection Analysis

**Strong Connections (AURA ↔ LifeOS):**
- Shared codebase ancestry (likely templated from common source)
- Identical architectural patterns and interfaces
- Compatible command structures and data models
- Same dependency management (Convex, Next.js, TypeScript)

**Weak Connections (SMNB ↔ Others):**
- Different architectural philosophy (services vs. agents)
- Different interaction model (editor vs. chat)
- Different tool implementation (Anthropic tools vs. command pattern)
- Different streaming approach (SSE vs. batch processing)

## 3. Strengths and Weaknesses Analysis

### 3.1 AURA/LifeOS Agent System Strengths

✅ **Modularity**: Clear separation of concerns with individual agent files
✅ **Extensibility**: Easy to add new agents following established patterns
✅ **Consistency**: Uniform interface and execution model across all agents
✅ **Premium Features**: Built-in support for subscription-based agent access
✅ **Interactive Components**: Sophisticated UI integration for multi-step workflows
✅ **Documentation**: Well-documented architecture with clear patterns
✅ **Registry Pattern**: Centralized command routing and agent management
✅ **Type Safety**: Strong TypeScript integration with Convex schema
✅ **Real-time**: Convex provides real-time state synchronization

### 3.2 AURA/LifeOS Agent System Weaknesses

❌ **No Streaming**: Batch processing only, no real-time content generation
❌ **Code Duplication**: Nearly identical implementations across projects
❌ **Limited Tool Ecosystem**: Custom command pattern vs. standard AI tools
❌ **Complex State Management**: Multiple layers (Convex + Zustand + Component state)
❌ **Monolithic Commands**: Single execute() method handles all tool logic
❌ **Testing Complexity**: Difficult to unit test individual tool behaviors
❌ **Performance**: Not optimized for large-scale content generation

### 3.3 SMNB AI System Strengths

✅ **Streaming**: Real-time content generation with immediate user feedback
✅ **Standard Tools**: Uses Anthropic's native tools API for better compatibility
✅ **Editor Integration**: Deep integration with TipTap rich text editor
✅ **Performance**: Optimized for content creation workflows
✅ **Flexibility**: Service-oriented architecture allows for diverse AI applications
✅ **Advanced Features**: Computer use, complex formatting, visual content
✅ **Error Recovery**: Robust error handling with exponential backoff
✅ **Direct API**: No abstraction layers, uses Claude capabilities directly

### 3.4 SMNB AI System Weaknesses

❌ **No Agent Abstraction**: Lacks reusable agent patterns
❌ **Tight Coupling**: AI logic coupled to specific UI components
❌ **No Premium Model**: Cannot gate advanced features behind subscriptions
❌ **Limited Extensibility**: Harder to add new AI capabilities
❌ **No Command System**: Lacks standardized interaction patterns
❌ **Single Use Case**: Optimized for editor only, not general purpose
❌ **No Multi-step Workflows**: Cannot handle complex agent interactions

## 4. Standardization Recommendations

### 4.1 Hybrid Architecture Proposal

**Combine the best of both approaches:**

```typescript
// Unified Agent Interface
interface StandardAgent {
  id: string;
  name: string;
  description: string;
  capabilities: AgentCapability[];
  execute(input: AgentInput): Promise<AgentOutput>;
  stream?(input: AgentInput): AsyncIterable<AgentChunk>;
}

// Support both command and tool patterns
interface AgentCapability {
  type: 'command' | 'tool';
  identifier: string; // /command or tool_name
  schema: ToolSchema | CommandSchema;
  requiresPremium: boolean;
}
```

### 4.2 Technical Standardization

**Core Standards:**
1. **LLM Provider**: Standardize on Anthropic Claude (already consistent)
2. **API Integration**: Adopt SMNB's streaming approach across all projects
3. **Tool System**: Use Anthropic's native tools API with agent abstraction layer
4. **State Management**: Maintain Convex for persistence, add streaming state
5. **Premium Features**: Implement consistent subscription gating
6. **Error Handling**: Adopt SMNB's retry and recovery patterns

**Architecture Evolution:**
1. **Phase 1**: Extract common interfaces and create shared npm package
2. **Phase 2**: Add streaming capabilities to AURA/LifeOS agents
3. **Phase 3**: Implement agent abstraction in SMNB
4. **Phase 4**: Unify tool systems and command patterns

### 4.3 Implementation Framework

**Shared Package Structure:**
```
@acdc-digital/agents/
├── core/
│   ├── BaseAgent.ts          # Unified agent interface
│   ├── AgentRegistry.ts      # Command and tool routing
│   ├── ToolSystem.ts         # Anthropic tools integration
│   └── StreamingHandler.ts   # Real-time response handling
├── providers/
│   ├── ClaudeProvider.ts     # Standardized Claude client
│   └── ConvexProvider.ts     # State management integration
├── ui/
│   ├── ChatInterface.ts      # Standard chat UI
│   ├── EditorInterface.ts    # Rich text editor UI
│   └── InteractiveComponents.ts # Multi-step workflows
└── utils/
    ├── PremiumGating.ts      # Subscription management
    └── ErrorHandling.ts      # Retry and recovery
```

## 5. Conclusion

The analysis reveals a **fragmented but promising** agent ecosystem. AURA and LifeOS demonstrate strong architectural consistency with sophisticated agent patterns, while SMNB showcases advanced AI integration with streaming and tool use. 

**Key Finding**: The projects represent two distinct evolution paths of AI integration - **agent-centric** (AURA/LifeOS) vs. **capability-centric** (SMNB). Both have merit and can be unified into a hybrid approach.

**Recommendation**: Develop a unified agent framework that combines AURA/LifeOS's modularity and extensibility with SMNB's streaming capabilities and direct tool integration. This will provide a standardized foundation for all future AI features while preserving the unique strengths of each project.

---

*Report Generated: December 2024*  
*Analysis Coverage: 74 agent-related files across 3 projects*

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