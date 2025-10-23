# SMNB Agents and Tools Documentation

## 📊 Agent Overview

| # | Agent Name | Category | Primary Function |
|---|------------|----------|------------------|
| 1 | **Producer Agent** | AI-Powered | Content generation from source material |
| 2 | **Editor Agent** | AI-Powered | Content refinement and fact-checking |
| 3 | **Host Agent** | AI-Powered | Content presentation and delivery timing |
| 4 | **Narrator Agent** | AI-Powered | Story narration (integrated with Host) |
| 5 | **Sentiment Analysis Agent** | AI-Powered | Analyzes sentiment of posts/news |
| 6 | **Quality Scoring Agent** | AI-Powered | Evaluates content quality (0-100) |
| 7 | **Market Correlation Agent** | AI-Powered | Correlates sentiment with MNQ1 index |
| 8 | **Orchestrator Agent** | System Management | Master pipeline coordinator |
| 9 | **Session Manager Agent** | System Management | Tracks state, costs, and history |
| 10 | **Whistleblower Agent** | System Management | Rate limit monitor and circuit breaker |
| 11 | **Queue Manager** | System Management | Intelligent post selection algorithm |
| 12 | **Scheduler Agent** | System Management | Timing and scheduling system |
| 13 | **Threading Agent** | State Management | Deduplication and story grouping |
| 14 | **Feed State Manager** | State Management | Live feed state management |
| 15 | **Ticker State Manager** | State Management | Selected ticker context management |

## 🎯 Agent Categories Summary

```
AI-POWERED AGENTS (7)          SYSTEM MANAGEMENT (5)      STATE MANAGEMENT (3)
├─ Producer                    ├─ Orchestrator            ├─ Threading
├─ Editor                      ├─ Session Manager         ├─ Feed State Manager
├─ Host                        ├─ Whistleblower           └─ Ticker State Manager
├─ Narrator                    ├─ Queue Manager
├─ Sentiment Analysis          └─ Scheduler
├─ Quality Scoring
└─ Market Correlation
```

### Category Breakdown

| Category | Count | Technologies | Core Purpose |
|----------|-------|--------------|--------------|
| **AI-Powered** | 7 | GPT-4, Claude, NLP | Content generation, analysis, and presentation |
| **System Management** | 5 | Convex, Node.js | Pipeline orchestration and system health |
| **State Management** | 3 | React Context, Zustand | Application state and data consistency |

---

## 🛠️ Complete Tools Library (63 Tools)

### Tool Categories Overview

| Category | Tools | Primary Use Case |
|----------|-------|------------------|
| 🌐 External API | 6 | Third-party service integration |
| 💾 Database | 5 | Data persistence and queries |
| 🔍 Analysis | 7 | Content and sentiment analysis |
| ⚙️ Processing | 6 | Data transformation and validation |
| ⏰ Scheduling | 5 | Task timing and rate control |
| 📦 Storage | 4 | File and session management |
| 📡 Communication | 4 | Real-time updates and messaging |
| 📊 Monitoring | 6 | Performance and health tracking |
| 🔄 Data Transformation | 5 | Data aggregation and filtering |
| 🤖 AI Enhancement | 5 | LLM optimization and control |
| 📈 Market Analysis | 5 | Trading signals and trends |
| 📝 Content | 5 | Content creation and validation |

### 🌐 External API Tools

| # | Tool Name | Function | Integration |
|---|-----------|----------|-------------|
| 1 | Reddit API Tool | Fetch posts from subreddits | Reddit OAuth |
| 2 | OpenAI API Tool | GPT-4/GPT-4o model access | OpenAI SDK |
| 3 | Anthropic Claude API Tool | Claude Opus model access | Anthropic SDK |
| 4 | Market Data API Tool | MNQ1 index data fetching | Finlight.me API |
| 5 | News API Tool | Traditional media sentiment comparison | NewsAPI.org |
| 6 | Webhook Tool | External service notifications | HTTP POST |

### 💾 Database Tools

| # | Tool Name | Function | Type |
|---|-----------|----------|------|
| 7 | Convex Query Tool | Read data from database | Read-only |
| 8 | Convex Mutation Tool | Write/update database records | Write |
| 9 | Index Query Tool | Efficient indexed database lookups | Optimized Read |
| 10 | Pagination Tool | Handle large dataset queries | Read + Navigation |
| 11 | Transaction Tool | Atomic database operations | Write + Rollback |

### 🔍 Analysis Tools

| # | Tool Name | Function | Output Range |
|---|-----------|----------|--------------|
| 12 | NLP Sentiment Analyzer | Extract sentiment scores | -1 to +1 |
| 13 | Quality Scorer | Calculate quality metrics | 0-100 |
| 14 | Similarity Detector | Find duplicate/related content | 0-1 (similarity) |
| 15 | Topic Modeler | Extract topics and categories | String[] |
| 16 | Entity Extractor | Identify people, companies, places | Object[] |
| 17 | Keyword Extractor | Pull relevant keywords | String[] |
| 18 | Correlation Calculator | Pearson correlation coefficient | -1 to +1 |

### ⚙️ Processing Tools

| # | Tool Name | Function |
|---|-----------|----------|
| 19 | Text Formatter | Clean and format text content |
| 20 | Markdown Processor | Convert between markdown formats |
| 21 | JSON Parser | Parse and validate JSON data |
| 22 | HTML Sanitizer | Clean HTML content |
| 23 | URL Validator | Check and normalize URLs |
| 24 | Timestamp Converter | Handle time zone conversions |

### ⏰ Scheduling Tools

| # | Tool Name | Function | API |
|---|-----------|----------|-----|
| 25 | Cron Scheduler | Schedule periodic tasks | `cron` |
| 26 | Delay Scheduler | Delayed execution | `ctx.scheduler.runAfter()` |
| 27 | Queue Manager | Priority queue operations | Custom |
| 28 | Rate Limiter | Throttle API calls | Custom |
| 29 | Backoff Calculator | Exponential backoff timing | Algorithm |

### 📦 Storage Tools

| # | Tool Name | Function | Storage Type |
|---|-----------|----------|--------------|
| 30 | File Storage Tool | Blob storage | `ctx.storage` |
| 31 | URL Generator | Generate signed URLs | Temporary URLs |
| 32 | Cache Manager | Temporary data storage | In-memory |
| 33 | Session Storage | User session persistence | Database |

### 📡 Communication Tools

| # | Tool Name | Function | Protocol |
|---|-----------|----------|----------|
| 34 | WebSocket Pusher | Real-time client updates | WebSocket |
| 35 | Event Emitter | Inter-agent communication | Event Bus |
| 36 | Message Queue | Async message passing | Queue |
| 37 | Notification Service | Alert dispatching | Push/Email |

### 📊 Monitoring Tools

| # | Tool Name | Function | Metric Type |
|---|-----------|----------|-------------|
| 38 | Token Counter | Track LLM token usage | Integer |
| 39 | Cost Calculator | Calculate API costs | Currency |
| 40 | Performance Monitor | Track latency metrics | Milliseconds |
| 41 | Error Logger | Log and track errors | Error[] |
| 42 | Health Checker | System health monitoring | Boolean |
| 43 | Circuit Breaker | Prevent cascading failures | State Machine |

### 🔄 Data Transformation Tools

| # | Tool Name | Function |
|---|-----------|----------|
| 44 | Aggregator | Combine multiple data sources |
| 45 | Filter Tool | Apply quality/relevance filters |
| 46 | Sorter Tool | Multi-factor sorting |
| 47 | Deduplicator | Remove duplicate entries |
| 48 | Normalizer | Standardize data formats |

### 🤖 AI Enhancement Tools

| # | Tool Name | Function | Parameter |
|---|-----------|----------|-----------|
| 49 | Prompt Template Engine | Dynamic prompt generation | Template strings |
| 50 | Context Window Manager | Manage LLM context limits | Token count |
| 51 | Embedding Generator | Create vector embeddings | Vector[] |
| 52 | Temperature Controller | Adjust AI creativity | 0.0 - 1.0 |
| 53 | Response Validator | Validate AI outputs | Boolean |

### 📈 Market Analysis Tools

| # | Tool Name | Function | Output |
|---|-----------|----------|--------|
| 54 | Trend Detector | Identify trending topics | Trend[] |
| 55 | Velocity Analyzer | Measure engagement growth | Percentage |
| 56 | Divergence Calculator | Find arbitrage opportunities | Score |
| 57 | Historical Pattern Matcher | Find similar past events | Match[] |
| 58 | Volatility Predictor | Estimate market volatility | VIX-like |

### 📝 Content Tools

| # | Tool Name | Function | Scope |
|---|-----------|----------|-------|
| 59 | Content Generator | Create new content | Full text |
| 60 | Content Editor | Modify existing content | Partial edit |
| 61 | Content Validator | Check content standards | Pass/Fail |
| 62 | Threading Tool | Group related stories | Story groups |
| 63 | Summary Generator | Create concise summaries | Abstract |

---

## 🔗 Tool Access Matrix

### Agent → Tool Mapping

| Agent | Tool Access | Tool Count | Category |
|-------|-------------|------------|----------|
| **Producer** | Content Generator, Prompt Template Engine, Context Window Manager | 3 | Content Creation |
| **Editor** | Content Editor, Content Validator, Text Formatter, Markdown Processor | 4 | Content Refinement |
| **Sentiment** | NLP Sentiment Analyzer, Entity Extractor, Keyword Extractor | 3 | Analysis |
| **Orchestrator** | **ALL TOOLS** (Master Coordinator) | 63 | Full Access |
| **Whistleblower** | Rate Limiter, Circuit Breaker, Health Checker, Performance Monitor | 4 | System Health |
| **Session Manager** | Token Counter, Cost Calculator, Session Storage, Cache Manager | 4 | State Tracking |

### Detailed Tool Assignments

```
PRODUCER AGENT
├─ Content Generator (Tool #59)
├─ Prompt Template Engine (Tool #49)
└─ Context Window Manager (Tool #50)

EDITOR AGENT
├─ Content Editor (Tool #60)
├─ Content Validator (Tool #61)
├─ Text Formatter (Tool #19)
└─ Markdown Processor (Tool #20)

SENTIMENT AGENT
├─ NLP Sentiment Analyzer (Tool #12)
├─ Entity Extractor (Tool #16)
└─ Keyword Extractor (Tool #17)

ORCHESTRATOR AGENT
└─ ALL TOOLS (1-63) - Master Coordinator Role

WHISTLEBLOWER AGENT
├─ Rate Limiter (Tool #28)
├─ Circuit Breaker (Tool #43)
├─ Health Checker (Tool #42)
└─ Performance Monitor (Tool #40)

SESSION MANAGER AGENT
├─ Token Counter (Tool #38)
├─ Cost Calculator (Tool #39)
├─ Session Storage (Tool #33)
└─ Cache Manager (Tool #32)
```

---

## 📋 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   ORCHESTRATOR AGENT                         │
│              (Master Pipeline Coordinator)                   │
│                    Access: ALL 63 Tools                      │
└─────────────────┬───────────────────────┬───────────────────┘
                  │                       │
        ┌─────────▼──────────┐  ┌────────▼──────────┐
        │  SESSION MANAGER   │  │   WHISTLEBLOWER   │
        │  Tools: 4          │  │   Tools: 4        │
        │  • Token Counter   │  │   • Rate Limiter  │
        │  • Cost Calc       │  │   • Circuit Break │
        └─────────┬──────────┘  └────────┬──────────┘
                  │                      │
        ┌─────────▼──────────────────────▼──────────┐
        │         CONTENT PIPELINE AGENTS            │
        ├────────────────────────────────────────────┤
        │  PRODUCER (3) → EDITOR (4) → HOST (0)     │
        │      ↓              ↓            ↓         │
        │  SENTIMENT (3)  QUALITY (0)  MARKET (0)   │
        └────────────────────────────────────────────┘
```

---

## 📊 Summary Statistics

| Metric | Count | Details |
|--------|-------|---------|
| **Total Agents** | 15 | 7 AI-Powered, 5 System Management, 3 State Management |
| **Total Tools** | 63 | Distributed across 12 categories |
| **Tool Categories** | 12 | External API, Database, Analysis, etc. |
| **Average Tools/Category** | 5.25 | Well-balanced distribution |
| **Agents with Full Access** | 1 | Orchestrator only |
| **Most Equipped Agent** | Orchestrator | 63 tools (100%) |
| **Least Equipped Agents** | Multiple | 3-4 tools (specialized) |

### Key Insights

- **Modular Design**: Each agent has specialized tool access for its specific function
- **Centralized Control**: Orchestrator coordinates all operations with full tool access
- **System Reliability**: Whistleblower ensures API compliance and prevents failures
- **Cost Transparency**: Session Manager tracks all token usage and costs
- **Scalable Architecture**: Easy to add new agents or tools without disrupting existing system

---

## 🚀 Platform Capabilities

These tools enable the agents to perform their specialized functions while maintaining:

✅ **System Reliability** - Circuit breakers, rate limiting, health monitoring  
✅ **Data Quality** - Multi-stage validation, quality scoring, deduplication  
✅ **Cost Control** - Token tracking, usage monitoring, budget management  
✅ **Real-Time Processing** - WebSocket updates, event-driven architecture  
✅ **Market Intelligence** - Sentiment correlation, trend detection, volatility prediction  
✅ **Scalable Growth** - Modular tool system allows easy extension of functionality
