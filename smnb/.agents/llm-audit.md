# LLM ## Discovery Log

- Scope: `smnb/smnb/lib/services`, `smnb/smnb/convex`, API routes, and shared utilities.
- Methods: pattern searches for "openai", "gpt", "anthropic", "prompt", "model", "ChatCompletion", and related SDK keywords.
- Result: Found multiple active LLM integrations using Anthropic Claude SDK with structured agent architecture.
- Architecture: Hybrid front-end service + Convex backend approach with API route proxying for security.Audit — smnb (2025-09-29)

## Summary

A repository-wide review on 2025-09-29 found **active LLM integrations** across both front-end services and Convex backend. The project uses Claude (Anthropic) as the primary LLM with comprehensive agent architecture for news processing, content generation, and host narration.

## Discovery Log

- Scope: `smnb/smnb/lib/services`, `smnb/smnb/convex`, and shared utilities.
- Methods: pattern searches for “openai”, “gpt”, “anthropic”, “prompt”, “model”, “ChatCompletion”, and related SDK keywords.
- Result: no direct SDK usage, HTTP calls, or helper abstractions indicative of LLM invocations.

## Call Inventory

| Call Site | Agent Type | Source File | Invocation Path | Model | Prompt Source | Notes | Est. Cost / Call |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Host Agent | Front-end | `lib/services/host/claudeLLMService.ts` | Service → API Route | Claude 3.5 Haiku | Dynamic prompts | Live streaming narration | $0.002-0.008 |
| Host Agent | Front-end | `lib/services/host/hostAgentService.ts` | Service orchestration | Claude 3.5 Haiku | Template-based | News processing & analysis | $0.001-0.005 |
| Content Generator | Back-end | `convex/generateContent.ts` | Convex Action | Claude 3.5 Haiku | Metric-driven prompts | Reddit post generation | $0.005-0.015 |
| API Proxy | Server | `app/api/claude/route.ts` | HTTP endpoint | Claude 3.5 Haiku | Pass-through | Secure API key handling | Variable |
| Enrichment Agent | Front-end | `lib/services/livefeed/enrichmentAgent.ts` | Rule-based | N/A | Keyword analysis | Non-LLM content analysis | $0.000 |
| Scoring Agent | Front-end | `lib/services/livefeed/scoringAgent.ts` | Rule-based | N/A | Algorithmic scoring | Non-LLM engagement scoring | $0.000 |

## Next Steps

- [ ] Register the first front-end agent once service-facing prompts are finalized.
- [ ] Mirror the registration for back-end agents under Convex actions/mutations and update this log.
- [ ] Revisit the cost table below when a concrete model selection is made.

## Cost Reference

| Model | Input $ / 1K tokens | Output $ / 1K tokens | Last Verified |
| --- | --- | --- | --- |
| GPT-4o | $0.005 | $0.015 | 2025-09-29 |
| GPT-4o Mini | $0.0006 | $0.0024 | 2025-09-29 |
| Claude 3.5 Sonnet | $0.003 | $0.015 | 2025-09-29 |

> _Keep this footer in sync with procurement updates or provider announcements._