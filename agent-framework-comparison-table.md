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