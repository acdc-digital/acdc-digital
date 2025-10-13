# ACDC Framework Architecture Diagrams

## Core System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        UI[React Components]
        STREAM[Streaming Interface]
        AUTH[Authentication]
    end
    
    subgraph "API Layer"
        ROUTES[Next.js API Routes]
        MIDDLEWARE[Auth Middleware]
        VALIDATION[Input Validation]
    end
    
    subgraph "ACDC Framework Core"
        REGISTRY[Agent Registry]
        ENGINE[Streaming Engine]
        TOOLS[Tool System]
        CONTEXT[Context Manager]
    end
    
    subgraph "Agent Layer"
        NEWS[News Agent]
        EDITOR[Editor Agent]
        RESEARCH[Research Agent]
        WORKFLOW[Workflow Agent]
    end
    
    subgraph "Provider Layer"
        CLAUDE[Claude Provider]
        CONVEX[Convex Provider]
        EXTERNAL[External APIs]
    end
    
    subgraph "Infrastructure"
        DB[(Convex Database)]
        CACHE[(Redis Cache)]
        STORAGE[(File Storage)]
    end
    
    UI --> ROUTES
    STREAM --> ROUTES
    AUTH --> MIDDLEWARE
    
    ROUTES --> REGISTRY
    MIDDLEWARE --> VALIDATION
    VALIDATION --> ENGINE
    
    REGISTRY --> NEWS
    REGISTRY --> EDITOR
    REGISTRY --> RESEARCH
    REGISTRY --> WORKFLOW
    
    ENGINE --> TOOLS
    TOOLS --> CONTEXT
    
    NEWS --> CLAUDE
    EDITOR --> CLAUDE
    RESEARCH --> EXTERNAL
    WORKFLOW --> CONVEX
    
    CLAUDE --> DB
    CONVEX --> DB
    EXTERNAL --> CACHE
    
    DB --> STORAGE
    
    style NEWS fill:#e1f5fe
    style EDITOR fill:#e8f5e8
    style RESEARCH fill:#fff3e0
    style WORKFLOW fill:#f3e5f5
```

## Streaming Data Flow

```mermaid
sequenceDiagram
    participant Client as React Client
    participant API as Next.js API
    participant ACDC as ACDC Registry
    participant Agent as ACDC Agent
    participant Claude as Claude API
    participant DB as Convex DB
    
    Client->>API: POST /api/agents/stream
    API->>ACDC: getAgent(agentId)
    ACDC->>Agent: agent.stream(request)
    
    Agent->>Claude: anthropic.messages.create()
    Note over Claude: Streaming enabled
    
    loop Streaming Response
        Claude-->>Agent: content_block_delta
        Agent-->>API: AgentChunk
        API-->>Client: Server-Sent Event
        Client->>Client: Update UI
    end
    
    Agent->>DB: Store final result
    Agent-->>API: Stream complete
    API-->>Client: Close connection
    
    Note over Client,DB: Real-time content generation
```

## Tool System Architecture

```mermaid
flowchart LR
    subgraph "Tool Request Processing"
        REQ[Tool Request] --> PARSER[Request Parser]
        PARSER --> VALIDATOR[Schema Validator]
        VALIDATOR --> ROUTER[Tool Router]
    end
    
    subgraph "Tool Types"
        ROUTER --> CMD[Command Tools]
        ROUTER --> ANT[Anthropic Tools]
        ROUTER --> HYB[Hybrid Tools]
    end
    
    subgraph "Execution Engines"
        CMD --> CMDENG[Command Engine]
        ANT --> ANTENG[Anthropic Engine]
        HYB --> HYBENG[Hybrid Engine]
    end
    
    subgraph "Response Processing"
        CMDENG --> FORMAT[Response Formatter]
        ANTENG --> FORMAT
        HYBENG --> FORMAT
        FORMAT --> STREAM[Streaming Handler]
    end
    
    subgraph "Output"
        STREAM --> CLIENT[Client Response]
        STREAM --> STORE[Data Storage]
    end
    
    style CMD fill:#ffebee
    style ANT fill:#e8f5e8
    style HYB fill:#fff3e0
```

## Agent Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Initializing
    
    Initializing --> Ready: Configuration loaded
    Initializing --> Error: Configuration failed
    
    Ready --> Executing: Tool request received
    Ready --> Idle: No requests
    
    Executing --> Streaming: Streaming response
    Executing --> Batch: Batch response
    Executing --> Error: Execution failed
    
    Streaming --> Processing: Content generation
    Batch --> Processing: Result processing
    
    Processing --> Complete: Success
    Processing --> Error: Processing failed
    Processing --> Retry: Recoverable error
    
    Retry --> Executing: Retry attempt
    Retry --> Error: Max retries exceeded
    
    Complete --> Ready: Reset for next request
    Error --> Ready: Error handled
    
    Idle --> Ready: Activity detected
    
    note right of Streaming
        Real-time content
        generation with
        immediate feedback
    end note
    
    note right of Error
        Automatic retry for
        recoverable errors
        with exponential backoff
    end note
```

## Multi-Project Integration

```mermaid
graph TD
    subgraph "ACDC Digital Ecosystem"
        ACDC[ACDC Framework Core]
    end
    
    subgraph "Project Integrations"
        SMNB[SMNB - Smart News Bot]
        AURA[AURA - Content Editor]
        LIFEOS[LifeOS - Productivity Platform]
        RUUF[RUUF - MCP Integration]
    end
    
    subgraph "Shared Services"
        AUTH[Clerk Authentication]
        DB[Convex Database]
        AI[Anthropic Claude]
        STORAGE[File Storage]
    end
    
    subgraph "Agent Capabilities"
        NEWS_AGENT[News Analysis Agent]
        CONTENT_AGENT[Content Creation Agent]
        RESEARCH_AGENT[Research Agent]
        WORKFLOW_AGENT[Workflow Automation Agent]
    end
    
    ACDC --> SMNB
    ACDC --> AURA
    ACDC --> LIFEOS
    ACDC --> RUUF
    
    SMNB --> NEWS_AGENT
    AURA --> CONTENT_AGENT
    LIFEOS --> RESEARCH_AGENT
    RUUF --> WORKFLOW_AGENT
    
    NEWS_AGENT --> AUTH
    CONTENT_AGENT --> DB
    RESEARCH_AGENT --> AI
    WORKFLOW_AGENT --> STORAGE
    
    style ACDC fill:#2196f3,color:#ffffff
    style NEWS_AGENT fill:#4caf50,color:#ffffff
    style CONTENT_AGENT fill:#ff9800,color:#ffffff
    style RESEARCH_AGENT fill:#9c27b0,color:#ffffff
    style WORKFLOW_AGENT fill:#f44336,color:#ffffff
```

## Error Recovery Flow

```mermaid
flowchart TD
    START[Agent Execution] --> TRY[Execute Tool]
    TRY --> SUCCESS{Success?}
    
    SUCCESS -->|Yes| COMPLETE[Return Result]
    SUCCESS -->|No| ERROR[Catch Error]
    
    ERROR --> RECOVERABLE{Recoverable?}
    
    RECOVERABLE -->|Yes| BACKOFF[Exponential Backoff]
    RECOVERABLE -->|No| FAIL[Return Error]
    
    BACKOFF --> RETRY_CHECK{Retries < Max?}
    RETRY_CHECK -->|Yes| TRY
    RETRY_CHECK -->|No| FAIL
    
    COMPLETE --> LOG[Log Success]
    FAIL --> LOG_ERROR[Log Error]
    
    LOG --> END[End]
    LOG_ERROR --> END
    
    style SUCCESS fill:#4caf50,color:#ffffff
    style ERROR fill:#f44336,color:#ffffff
    style RECOVERABLE fill:#ff9800,color:#ffffff
    style BACKOFF fill:#2196f3,color:#ffffff
```

## Premium Feature Gating

```mermaid
flowchart LR
    subgraph "Request Processing"
        REQ[Agent Request] --> AUTH_CHECK[Auth Check]
        AUTH_CHECK --> USER_CONTEXT[Load User Context]
    end
    
    subgraph "Permission Validation"
        USER_CONTEXT --> AGENT_CHECK{Agent Premium?}
        AGENT_CHECK -->|No| ALLOW[Allow Execution]
        AGENT_CHECK -->|Yes| SUB_CHECK{Has Subscription?}
    end
    
    subgraph "Subscription Management"
        SUB_CHECK -->|Yes| TIER_CHECK{Correct Tier?}
        SUB_CHECK -->|No| DENY[Deny Access]
        TIER_CHECK -->|Yes| RATE_CHECK[Check Rate Limits]
        TIER_CHECK -->|No| DENY
    end
    
    subgraph "Execution Control"
        RATE_CHECK --> WITHIN_LIMITS{Within Limits?}
        WITHIN_LIMITS -->|Yes| ALLOW
        WITHIN_LIMITS -->|No| THROTTLE[Throttle Request]
        ALLOW --> EXECUTE[Execute Agent]
    end
    
    subgraph "Response Handling"
        EXECUTE --> RESULT[Return Result]
        DENY --> ERROR_PREMIUM[Premium Required Error]
        THROTTLE --> ERROR_RATE[Rate Limit Error]
    end
    
    style ALLOW fill:#4caf50,color:#ffffff
    style DENY fill:#f44336,color:#ffffff
    style THROTTLE fill:#ff9800,color:#ffffff
    style EXECUTE fill:#2196f3,color:#ffffff
```

## Development Workflow

```mermaid
gitgraph
    commit id: "Initial ACDC Setup"
    branch feature-agent
    checkout feature-agent
    commit id: "Create BaseAgent"
    commit id: "Implement Tools"
    commit id: "Add Streaming"
    checkout main
    merge feature-agent
    commit id: "Deploy Agent v1"
    
    branch integration-smnb
    checkout integration-smnb
    commit id: "SMNB Adapter"
    commit id: "Tool Migration"
    commit id: "UI Updates"
    checkout main
    merge integration-smnb
    commit id: "SMNB Integration"
    
    branch integration-aura
    checkout integration-aura
    commit id: "AURA Migration"
    commit id: "Legacy Support"
    commit id: "Performance Optimization"
    checkout main
    merge integration-aura
    commit id: "AURA Integration"
    
    commit id: "Production Release"
```

## Monitoring & Observability

```mermaid
graph TB
    subgraph "Application Layer"
        AGENTS[ACDC Agents]
        API[API Routes]
        UI[React Components]
    end
    
    subgraph "Monitoring Layer"
        METRICS[Metrics Collection]
        LOGS[Structured Logging]
        TRACES[Distributed Tracing]
    end
    
    subgraph "Observability Tools"
        DASHBOARD[Monitoring Dashboard]
        ALERTS[Alert System]
        ANALYTICS[Usage Analytics]
    end
    
    subgraph "Data Storage"
        TSDB[(Time Series DB)]
        LOGSTORE[(Log Storage)]
        METRICS_STORE[(Metrics Store)]
    end
    
    AGENTS --> METRICS
    API --> LOGS
    UI --> TRACES
    
    METRICS --> DASHBOARD
    LOGS --> ALERTS
    TRACES --> ANALYTICS
    
    DASHBOARD --> TSDB
    ALERTS --> LOGSTORE
    ANALYTICS --> METRICS_STORE
    
    style METRICS fill:#4caf50,color:#ffffff
    style LOGS fill:#ff9800,color:#ffffff
    style TRACES fill:#9c27b0,color:#ffffff
```

---

## Legend

### Color Coding
- 🔵 **Blue**: Core framework components
- 🟢 **Green**: Success states and positive flows
- 🟠 **Orange**: Warning states and processing
- 🔴 **Red**: Error states and failures
- 🟣 **Purple**: Premium features and advanced functionality

### Component Types
- **Rectangles**: Processes and services
- **Diamonds**: Decision points
- **Cylinders**: Data storage
- **Circles**: Start/end points
- **Parallelograms**: Input/output operations

---

*Architecture diagrams for the ACDC Agentic Framework*  
*ACDC Digital - December 2024*