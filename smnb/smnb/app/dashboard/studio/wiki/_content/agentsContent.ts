export const agentsContent = `# Agent & Tool Profiles

Complete technical specifications for all 15 SMNB agents organized by category.

---

## 🤖 AI-Powered Agents (7)

### Producer Agent

| Specification | Value |
|---------------|-------|
| **Agent ID** | \`producer-agent\` |
| **Status** | 🟢 Active |
| **Category** | AI-Powered Content |
| **Model** | GPT-4o / Claude Opus |
| **Version** | v1.2.0 |
| **Primary Function** | Content generation from source material |
| **Input** | Reddit posts, market data, sentiment scores |
| **Output** | Structured content stories, formatted narratives |
| **Tools** | Content Generator, Prompt Template Engine, Context Window Manager |
| **Latency** | 2-5 seconds per generation |
| **Token Usage** | ~800-1500 tokens/generation |
| **Cost** | $0.02-0.05 per story |
| **Dependencies** | OpenAI API, Anthropic API |
| **Error Handling** | Retry with exponential backoff (3 attempts) |

**Capabilities**: Streaming, Multi-model fallback, Context optimization, Brand voice consistency

---

### Editor Agent

| Specification | Value |
|---------------|-------|
| **Agent ID** | \`editor-agent\` |
| **Status** | 🟢 Active |
| **Category** | AI-Powered Quality |
| **Model** | GPT-4 |
| **Version** | v1.1.0 |
| **Primary Function** | Content refinement and fact-checking |
| **Input** | Raw generated content, source links |
| **Output** | Polished content, fact-check results, quality score |
| **Tools** | Content Editor, Content Validator, Text Formatter, Markdown Processor |
| **Latency** | 1-3 seconds per edit |
| **Token Usage** | ~500-1000 tokens/edit |
| **Cost** | $0.01-0.03 per edit |
| **Dependencies** | OpenAI API |
| **Error Handling** | Graceful degradation to basic formatting |

**Capabilities**: Grammar correction, Style consistency, Fact verification, Citation validation

---

### Host Agent

| Specification | Value |
|---------------|-------|
| **Agent ID** | \`host-agent\` |
| **Status** | 🟢 Active |
| **Category** | AI-Powered Presentation |
| **Model** | Claude 3.5 Haiku |
| **Version** | v2.0.0 |
| **Primary Function** | Content presentation and delivery timing |
| **Input** | Edited content, user context, feed state |
| **Output** | Formatted posts, delivery schedule, engagement hooks |
| **Tools** | None (uses Narrator internally) |
| **Latency** | 500ms-1s per format |
| **Token Usage** | ~200-400 tokens/format |
| **Cost** | $0.001-0.005 per format |
| **Dependencies** | Anthropic API, Narrator Agent |
| **Error Handling** | Fallback to default formatting |

**Capabilities**: Real-time chat, Context maintenance, Tone adaptation, Engagement optimization

---

### Narrator Agent

| Specification | Value |
|---------------|-------|
| **Agent ID** | \`narrator-agent\` |
| **Status** | 🟢 Active |
| **Category** | AI-Powered Storytelling |
| **Model** | GPT-4 Turbo |
| **Version** | v1.0.0 |
| **Primary Function** | Story narration (integrated with Host) |
| **Input** | Content outline, narrative style preferences |
| **Output** | Narrative text, story arcs, emotional beats |
| **Tools** | Integrated with Host Agent |
| **Latency** | 1-2 seconds per narration |
| **Token Usage** | ~300-600 tokens/narration |
| **Cost** | $0.005-0.015 per narration |
| **Dependencies** | OpenAI API, Host Agent |
| **Error Handling** | Default to neutral narrative style |

**Capabilities**: Story structure, Emotional pacing, Character voice, Narrative consistency

---

### Sentiment Analysis Agent

| Specification | Value |
|---------------|-------|
| **Agent ID** | \`sentiment-agent\` |
| **Status** | 🟢 Active |
| **Category** | AI-Powered Analysis |
| **Model** | Claude Haiku 4.5 (claude-haiku-4-5-20251001) |
| **Version** | v1.3.0 |
| **Primary Function** | Analyzes sentiment of posts/news |
| **Input** | Text content, metadata, context |
| **Output** | Sentiment score (-1 to +1), confidence (0-1), emotion breakdown |
| **Tools** | NLP Sentiment Analyzer, Entity Extractor, Keyword Extractor |
| **Latency** | 800-1200ms per analysis |
| **Token Usage** | ~400-700 tokens/analysis |
| **Cost** | $0.0025 per analysis (100-150 word excerpts) |
| **Dependencies** | Anthropic API |
| **Error Handling** | Return neutral sentiment (0.0) on failure |

**Capabilities**: Multi-paragraph analysis, Emotion detection, Confidence scoring, Context-aware sentiment

---

### Quality Scoring Agent

| Specification | Value |
|---------------|-------|
| **Agent ID** | \`quality-agent\` |
| **Status** | 🟢 Active |
| **Category** | AI-Powered Analysis |
| **Model** | Multi-factor algorithm |
| **Version** | v1.0.0 |
| **Primary Function** | Evaluates content quality (0-100) |
| **Input** | Content, source credibility, engagement metrics |
| **Output** | Quality score (0-100), tier classification, improvement suggestions |
| **Tools** | None (algorithmic) |
| **Latency** | 50-100ms per evaluation |
| **Token Usage** | 0 (no LLM) |
| **Cost** | Negligible (compute only) |
| **Dependencies** | None |
| **Error Handling** | Default to baseline score of 50 |

**Capabilities**: Source credibility check, Content depth analysis, Engagement prediction, Tier classification

---

### Market Correlation Agent

| Specification | Value |
|---------------|-------|
| **Agent ID** | \`market-correlation-agent\` |
| **Status** | 🟢 Active |
| **Category** | AI-Powered Trading |
| **Model** | Statistical + GPT-4 |
| **Version** | v1.1.0 |
| **Primary Function** | Correlates sentiment with MNQ1 index |
| **Input** | Aggregated sentiment, MNQ1 historical data, time window |
| **Output** | Pearson correlation coefficient, predicted delta, confidence interval |
| **Tools** | None (statistical) |
| **Latency** | 150-300ms per calculation |
| **Token Usage** | 0 (statistical analysis) |
| **Cost** | Negligible (compute only) |
| **Dependencies** | Finlight.me API (MNQ1 data) |
| **Error Handling** | Return last known correlation on API failure |

**Capabilities**: Real-time correlation, Historical backtesting, Volatility prediction, Divergence detection

---

## ⚙️ System Management Agents (5)

### Orchestrator Agent

| Specification | Value |
|---------------|-------|
| **Agent ID** | \`orchestrator-agent\` |
| **Status** | 🟢 Active |
| **Category** | System Management |
| **Model** | N/A (Logic-based) |
| **Version** | v2.0.0 |
| **Primary Function** | Master pipeline coordinator |
| **Input** | Pipeline state, agent availability, user requests |
| **Output** | Task assignments, execution order, resource allocation |
| **Tools** | **ALL 63 TOOLS** (full system access) |
| **Latency** | 10-50ms per coordination |
| **Token Usage** | 0 (no LLM) |
| **Cost** | Negligible |
| **Dependencies** | All agents, Convex scheduler |
| **Error Handling** | Circuit breaker pattern, graceful degradation |

**Capabilities**: Task scheduling, Load balancing, Priority management, Error recovery, Resource optimization

---

### Session Manager Agent

| Specification | Value |
|---------------|-------|
| **Agent ID** | \`session-manager-agent\` |
| **Status** | 🟢 Active |
| **Category** | System Management |
| **Model** | N/A (Analytics) |
| **Version** | v2.0.0 |
| **Primary Function** | Tracks state, costs, and history |
| **Input** | Session events, token usage, API calls |
| **Output** | Session metrics, cost reports, usage analytics |
| **Tools** | Token Counter, Cost Calculator, Session Storage, Cache Manager |
| **Latency** | 20-100ms per operation |
| **Token Usage** | 0 (no LLM) |
| **Cost** | Negligible |
| **Dependencies** | Convex database |
| **Error Handling** | Fallback to estimated costs |

**Capabilities**: Real-time tracking, Cost forecasting, Usage analytics, Session persistence, Budget alerts

---

### Whistleblower Agent

| Specification | Value |
|---------------|-------|
| **Agent ID** | \`whistleblower-agent\` |
| **Status** | 🟢 Active |
| **Category** | System Management |
| **Model** | N/A (Monitor) |
| **Version** | v1.0.0 |
| **Primary Function** | Rate limit monitor and circuit breaker |
| **Input** | API call rates, error rates, system health metrics |
| **Output** | Alerts, throttle commands, circuit breaker states |
| **Tools** | Rate Limiter, Circuit Breaker, Health Checker, Performance Monitor |
| **Latency** | 5-20ms per check |
| **Token Usage** | 0 (no LLM) |
| **Cost** | Negligible |
| **Dependencies** | System health APIs |
| **Error Handling** | Immediate circuit break on critical failures |

**Capabilities**: Rate limiting, Circuit breaking, Health monitoring, Alert dispatching, Auto-recovery

---

### Queue Manager

| Specification | Value |
|---------------|-------|
| **Agent ID** | \`queue-manager\` |
| **Status** | 🟢 Active |
| **Category** | System Management |
| **Model** | N/A (Priority Queue) |
| **Version** | v1.2.0 |
| **Primary Function** | Intelligent post selection algorithm |
| **Input** | Available posts, quality scores, priority levels |
| **Output** | Prioritized queue, selection recommendations |
| **Tools** | Queue Manager, Filter Tool, Sorter Tool |
| **Latency** | 30-100ms per operation |
| **Token Usage** | 0 (no LLM) |
| **Cost** | Negligible |
| **Dependencies** | Quality Agent, Priority Classifier |
| **Error Handling** | FIFO fallback on algorithm failure |

**Capabilities**: Priority scheduling, Quality filtering, Deduplication, Fair distribution, Backpressure handling

---

### Scheduler Agent

| Specification | Value |
|---------------|-------|
| **Agent ID** | \`scheduler-agent\` |
| **Status** | 🟢 Active |
| **Category** | System Management |
| **Model** | N/A (Cron-based) |
| **Version** | v1.0.0 |
| **Primary Function** | Timing and scheduling system |
| **Input** | Task definitions, cron expressions, dependencies |
| **Output** | Execution schedule, task triggers, delay calculations |
| **Tools** | Cron Scheduler, Delay Scheduler, Backoff Calculator |
| **Latency** | 5-15ms per schedule |
| **Token Usage** | 0 (no LLM) |
| **Cost** | Negligible |
| **Dependencies** | Convex scheduler |
| **Error Handling** | Retry with exponential backoff |

**Capabilities**: Cron scheduling, Delayed execution, Dependency management, Retry logic, Time zone handling

---

## 🔄 State Management Agents (3)

### Threading Agent

| Specification | Value |
|---------------|-------|
| **Agent ID** | \`threading-agent\` |
| **Status** | 🟢 Active |
| **Category** | State Management |
| **Model** | N/A (Similarity) |
| **Version** | v1.1.0 |
| **Primary Function** | Deduplication and story grouping |
| **Input** | Posts, content fingerprints, entity data |
| **Output** | Thread IDs, related story links, similarity scores |
| **Tools** | Threading Tool, Similarity Detector, Deduplicator |
| **Latency** | 100-250ms per thread |
| **Token Usage** | 0 (no LLM) |
| **Cost** | Negligible |
| **Dependencies** | Entity Extractor |
| **Error Handling** | Create new thread on failure |

**Capabilities**: Content fingerprinting, Similarity detection, Thread management, Related story linking

---

### Feed State Manager

| Specification | Value |
|---------------|-------|
| **Agent ID** | \`feed-state-manager\` |
| **Status** | 🟢 Active |
| **Category** | State Management |
| **Model** | N/A (State) |
| **Version** | v1.0.0 |
| **Primary Function** | Live feed state management |
| **Input** | Feed events, user interactions, scroll position |
| **Output** | Feed state, visible items, load triggers |
| **Tools** | Cache Manager, Pagination Tool |
| **Latency** | 10-30ms per update |
| **Token Usage** | 0 (no LLM) |
| **Cost** | Negligible |
| **Dependencies** | Convex subscriptions |
| **Error Handling** | Refresh feed on state corruption |

**Capabilities**: Real-time updates, Scroll position tracking, Lazy loading, State persistence, Optimistic updates

---

### Ticker State Manager

| Specification | Value |
|---------------|-------|
| **Agent ID** | \`ticker-state-manager\` |
| **Status** | 🟢 Active |
| **Category** | State Management |
| **Model** | N/A (Context) |
| **Version** | v1.0.0 |
| **Primary Function** | Selected ticker context management |
| **Input** | Ticker selection, user preferences, filter settings |
| **Output** | Active ticker state, filtered data, context |
| **Tools** | Cache Manager, Filter Tool |
| **Latency** | 5-20ms per update |
| **Token Usage** | 0 (no LLM) |
| **Cost** | Negligible |
| **Dependencies** | React Context |
| **Error Handling** | Reset to default ticker |

**Capabilities**: Context persistence, Filter management, State sync, Preference storage

---

## 📊 Agent Performance Summary

| Category | Agents | Avg Latency | LLM Usage | Monthly Cost (est.) |
|----------|--------|-------------|-----------|---------------------|
| **AI-Powered** | 7 | 1-3 seconds | High | $500-1500 |
| **System Management** | 5 | 10-100ms | None | <$10 |
| **State Management** | 3 | 5-250ms | None | <$5 |
| **TOTAL** | **15** | **Variable** | **Mixed** | **~$515-1515/mo** |

---

## 🔧 Integration Patterns

### Calling AI-Powered Agents

\`\`\`typescript
import { api } from "@/convex/_generated/api";

// Producer Agent
const story = await ctx.runAction(api.agents.producer.generateContent, {
  postId: "post_123",
  style: "narrative",
});

// Sentiment Agent
const sentiment = await ctx.runAction(api.agents.sentiment.analyze, {
  text: "This is amazing news!",
  context: { source: "reddit", subreddit: "technology" },
});
\`\`\`

### Calling System Management Agents

\`\`\`typescript
// Orchestrator Agent
await ctx.runMutation(api.agents.orchestrator.coordinatePipeline, {
  taskType: "enrichment",
  posts: batchIds,
});

// Session Manager
const metrics = await ctx.runQuery(api.agents.sessionManager.getMetrics, {
  sessionId: "session_123",
  timeRange: "24h",
});
\`\`\`

### Calling State Management Agents

\`\`\`typescript
// Threading Agent
const threadId = await ctx.runMutation(api.agents.threading.createThread, {
  postId: "post_123",
  entities: ["AAPL", "NVDA"],
});

// Feed State Manager
const feedState = await ctx.runQuery(api.agents.feedState.getCurrentState, {
  feedId: "main-feed",
});
\`\`\`

---

## 🚀 Future Agents (Roadmap)

| Agent | Category | Purpose | Priority | ETA |
|-------|----------|---------|----------|-----|
| **Content Distribution** | AI-Powered | Multi-platform posting | High | Q1 2026 |
| **Trend Predictor** | AI-Powered | Viral content forecasting | Medium | Q2 2026 |
| **Cost Optimizer** | System | Budget management | High | Q1 2026 |
| **Analytics Reporter** | System | Automated reporting | Medium | Q2 2026 |
| **A/B Test Manager** | State | Experiment management | Low | Q3 2026 |

---

## 📋 Development Guidelines

### Agent Creation Checklist

- [ ] Define clear single responsibility
- [ ] Use new Convex function syntax (\`query({})\`, \`mutation({})\`, \`action({})\`)
- [ ] Add proper TypeScript types with \`v.*\` validators
- [ ] Implement error handling and fallbacks
- [ ] Add token/cost tracking (if LLM-based)
- [ ] Create integration tests
- [ ] Document in this wiki
- [ ] Add to Orchestrator coordination

### Best Practices

1. **Type Safety**: Always use \`Id<"tableName">\` for document IDs
2. **Validation**: Include both \`args\` and \`returns\` validators
3. **Error Messages**: Provide user-friendly, actionable feedback
4. **Logging**: Track all operations for debugging and analytics
5. **Testing**: Test with real data and edge cases
6. **Performance**: Monitor latency and optimize hot paths
7. **Cost**: Track and optimize LLM token usage

---

*Last Updated: October 16, 2025 | Agent Count: 15 | System Version: 2.0*
`;
