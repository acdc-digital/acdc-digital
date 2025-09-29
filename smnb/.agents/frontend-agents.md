# Front-End LLM Agents Registry

Front-end agents encapsulate LLM calls whose primary impact is user-facing presentation or interactivity. They must be implemented within the Service layer (`smnb/smnb/lib/services`) and consumed by UI components, hooks, or stores.

## Agent Registry

| Agent Key | Service Module | Responsibility | Prompt Overview | Model | Cost Anchor | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `claudeLLMService` | `lib/services/host/claudeLLMService.ts` | Claude API integration | Dynamic prompts for narration & analysis | Claude 3.5 Haiku | $0.002-0.008 | Active |
| `hostAgentService` | `lib/services/host/hostAgentService.ts` | News processing orchestration | Template-based + thread-aware prompts | Claude 3.5 Haiku | $0.001-0.005 | Active |
| `enrichmentAgent` | `lib/services/livefeed/enrichmentAgent.ts` | Content metadata enrichment | Rule-based analysis (non-LLM) | N/A | $0.000 | Active |
| `scoringAgent` | `lib/services/livefeed/scoringAgent.ts` | Engagement score calculation | Algorithmic scoring (non-LLM) | N/A | $0.000 | Active |
| `schedulerService` | `lib/services/livefeed/schedulerService.ts` | Pipeline orchestration | No LLM calls | N/A | $0.000 | Active |
| `enhancedProcessingPipeline` | `lib/services/livefeed/enhancedProcessingPipeline.ts` | Data processing coordination | No direct LLM calls | N/A | $0.000 | Active |
| `simpleLiveFeedService` | `lib/services/livefeed/simpleLiveFeedService.ts` | Live feed management | No LLM calls | N/A | $0.000 | Active |
| `producerAgentService` | `lib/services/producer/producerAgentService.ts` | Producer agent coordination | No direct LLM calls | N/A | $0.000 | Active |
| `apiHealthService` | `lib/services/core/apiHealthService.ts` | Health monitoring | No LLM calls | N/A | $0.000 | Active |
| `eventBus` | `lib/services/core/eventBus.ts` | Event coordination | No LLM calls | N/A | $0.000 | Active |

## Prompt Design Template

Use this scaffold when drafting a prompt before implementation (based on existing patterns):

```text
### Agent: <agent key>
- **Service Module:** smnb/smnb/lib/services/<domain>/<file>.ts
- **Primary UI Impact:** <brief description>
- **Inputs:** 
  - NewsItem | EnhancedRedditPost (structured data)
  - HostAgentConfig (personality, verbosity, context)
  - LLMOptions (temperature, maxTokens, systemPrompt)
- **Output Contract:** HostNarration | LLMAnalysis | string
- **Prompt Goal:** <one-line outcome>
- **System Instructions:**
  ```
  You are a professional news broadcaster generating engaging narrations.
  [personality-specific tone and style guidance]
  ```
- **User Prompt Composition:**
  - Context summary from recent items
  - Current item details (platform, engagement, content)
  - Thread awareness (if applicable)
  - Producer context integration
- **Guardrails:** 
  - Character streaming at 314 WPM (38ms delay)
  - Temperature 0.6-0.9 based on novelty needs
  - Max tokens 200-300 for narrations
  - Duplicate detection via content signatures
- **Telemetry:** 
  - Token counting via tokenCountingService
  - Cost tracking in convex/costTracking.ts
  - Performance metrics via stats mutations
```

## Delivery Checklist

- [ ] Define the agent service class in `smnb/smnb/lib/services/<domain>/`.
- [ ] Export typed methods following the pattern: `async method(args): Promise<Result>`.
- [ ] Integrate with Claude API via `/api/claude` route (security best practice).
- [ ] Implement streaming support using `generateStream()` for real-time UI updates.
- [ ] Add token counting via `tokenCountingService` for cost tracking.
- [ ] Wire into the host agent orchestration or standalone service patterns.
- [ ] Register event emitters for UI coordination (`emit('agent:status', data)`).
- [ ] Add duplicate detection using content signatures for efficiency.
- [ ] Include personality and verbosity configuration support.
- [ ] Update the registry table above and the audit log once merged.
- [ ] Test with both user-provided and environment API keys.

## Cost Reference

| Model | Input $ / 1K tokens | Output $ / 1K tokens | Last Verified |
| --- | --- | --- | --- |
| GPT-4o | $0.005 | $0.015 | 2025-09-29 |
| GPT-4o Mini | $0.0006 | $0.0024 | 2025-09-29 |
| Claude 3.5 Sonnet | $0.003 | $0.015 | 2025-09-29 |

> _Update the footer whenever pricing or model preferences shift._