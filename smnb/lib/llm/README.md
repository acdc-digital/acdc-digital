# LLM Prompt Configuration System

This directory contains documentation for the centralized prompt configuration system.

**Note:** The actual `prompts.ts` file is located in `convex/llm/prompts.ts` because Convex functions can only import from within the `convex/` directory.

## 📁 Files

- **`convex/llm/prompts.ts`** - Main configuration file with all prompts, models, and parameters
- **`lib/llm/README.md`** - This documentation file

## 🎯 Purpose

Instead of having prompts scattered across multiple files, this system provides:

1. **Single Source of Truth** - All prompts in one place
2. **Type Safety** - Full TypeScript support with input/output types
3. **Easy Updates** - Change a prompt once, applies everywhere
4. **Cost Tracking** - Built-in cost estimation per prompt
5. **Model Management** - Centralized model selection

## 🚀 Usage

### From Convex Functions (Server-Side)

```typescript
import { LLM_PROMPTS, buildMessages } from "../llm/prompts";
import Anthropic from "@anthropic-ai/sdk";

// 1. Get the prompt configuration
const config = LLM_PROMPTS.SENTIMENT_ANALYSIS;

// 2. Prepare your input data
const input = {
  ticker: "AAPL",
  indexWeight: 0.0856,
  sentimentScore: 75.5,
  baselineCalculation: 65.2,
  performanceMultiplier: 1.85,
  change24h: 2.3
};

// 3. Build messages
const messages = buildMessages(config, input);

// 4. Call Claude with the configuration
const response = await anthropic.messages.create({
  model: config.model,
  max_tokens: config.maxTokens,
  temperature: config.temperature,
  system: config.systemPrompt,
  messages,
});
```

### Available Prompts

| Prompt ID | Purpose | Model | Cost/Call |
|-----------|---------|-------|-----------|
| `SENTIMENT_ANALYSIS` | Generate sentiment excerpts | Haiku 4.5 | $0.0025 |
| `NEWS_SUMMARY` | Summarize news + extract sentiment | Haiku 4.5 | $0.0025 |
| `CONTENT_GENERATION` | Generate social media posts | Haiku 3 | $0.002 |
| `HOST_NARRATION` | Real-time market commentary | Sonnet 3.5 | $0.015 |
| `EDITOR_FORMATTING` | Format newsletters with text_editor | Sonnet 3.5 | $0.065 |

### Example: Sentiment Analysis

```typescript
import { LLM_PROMPTS, buildMessages } from "../llm/prompts";

const config = LLM_PROMPTS.SENTIMENT_ANALYSIS;

// Input is type-checked!
const input: SentimentAnalysisInput = {
  ticker: "NVDA",
  indexWeight: 7.23,
  sentimentScore: 85.2,
  baselineCalculation: 20864.5,
  performanceMultiplier: 1.65,
  change24h: 3.2,
};

const messages = buildMessages(config, input);

const response = await anthropic.messages.create({
  model: config.model, // "claude-haiku-4-5-20251001"
  max_tokens: config.maxTokens, // 512
  temperature: config.temperature, // 0.7
  system: config.systemPrompt,
  messages,
});

console.log(`Estimated cost: $${config.estimatedCost}`);
```

### Example: News Summary

```typescript
import { LLM_PROMPTS, buildMessages } from "../llm/prompts";

const config = LLM_PROMPTS.NEWS_SUMMARY;

const input: NewsSummaryInput = {
  ticker: "TSLA",
  indexWeight: 3.45,
  articles: [
    {
      title: "Tesla unveils new battery technology",
      description: "Company announces breakthrough in energy density...",
      publishedAt: "2025-10-15T10:30:00Z",
      source: "Bloomberg"
    },
    // More articles...
  ]
};

const messages = buildMessages(config, input);
// Use config.model, config.maxTokens, etc.
```

## 🔧 Adding a New Prompt

To add a new prompt configuration:

1. **Define the input type:**

```typescript
export interface MyNewFeatureInput {
  ticker: string;
  someMetric: number;
  // ... other fields
}
```

2. **Create the prompt configuration:**

```typescript
export const MY_NEW_FEATURE: LLMPromptConfig<MyNewFeatureInput> = {
  id: "my-new-feature",
  description: "What this prompt does",
  model: "claude-3-5-haiku-20241022",
  maxTokens: 512,
  temperature: 0.7,
  estimatedCost: 0.0025,
  
  systemPrompt: `You are an expert at...`,
  
  buildPrompt: (input: MyNewFeatureInput) => {
    return `Analyze ${input.ticker}...`;
  },
  
  outputFormat: "Description of expected output"
};
```

3. **Add to the registry:**

```typescript
export const LLM_PROMPTS = {
  SENTIMENT_ANALYSIS,
  NEWS_SUMMARY,
  MY_NEW_FEATURE, // Add here
} as const;
```

4. **Use it in your code:**

```typescript
const config = LLM_PROMPTS.MY_NEW_FEATURE;
// Use as shown in examples above
```

## 💰 Cost Estimation

### Per-Call Estimation

```typescript
import { LLM_PROMPTS } from "../llm/prompts";

const config = LLM_PROMPTS.SENTIMENT_ANALYSIS;
console.log(`Estimated cost: $${config.estimatedCost}`);
```

### Bulk Estimation

```typescript
import { estimateTotalCost } from "../llm/prompts";

const estimate = estimateTotalCost([
  { promptId: "sentiment-analysis", count: 100 },
  { promptId: "news-summary", count: 100 },
  { promptId: "host-narration", count: 50 },
]);

console.log(`Total estimated cost: $${estimate.toFixed(2)}`);
// Output: Total estimated cost: $1.25
```

## 📊 Model Selection Guide

| Model | Best For | Cost | Speed |
|-------|----------|------|-------|
| **Haiku 4.5** | Routine analysis, summaries | $ | ⚡⚡⚡ |
| **Haiku 3.5** | Legacy support | $ | ⚡⚡⚡ |
| **Haiku 3** | Legacy, simple generation | $ | ⚡⚡⚡ |
| **Sonnet 3.5** | Complex editing, formatting | $$$ | ⚡⚡ |
| **Opus 3** | Premium features (rarely used) | $$$$$ | ⚡ |

### When to Use Each Model

**Use Haiku 4.5 for:**
- Sentiment analysis
- News summarization
- Data extraction
- Routine generation

**Use Sonnet 3.5 for:**
- Complex content editing
- Newsletter formatting
- Advanced tool usage (text_editor)
- Multi-step reasoning

**Avoid Opus unless:**
- User explicitly requests premium
- Complex multi-step planning required
- Budget allows for 5x cost

## 🔍 Helper Functions

### `getPromptConfig(id: string)`

Get a prompt configuration by its ID:

```typescript
const config = getPromptConfig("sentiment-analysis");
if (config) {
  console.log(config.model);
}
```

### `listPromptIds()`

List all available prompt IDs:

```typescript
const ids = listPromptIds();
// ["sentiment-analysis", "news-summary", "content-generation", ...]
```

### `buildMessages<T>(config, input)`

Build Anthropic messages array from config and input:

```typescript
const messages = buildMessages(config, input);
// Returns: [{ role: "user", content: "..." }]
```

## 📝 Prompt Engineering Tips

### 1. Be Specific
```typescript
// ❌ Bad
buildPrompt: () => "Analyze this stock"

// ✅ Good
buildPrompt: (input) => `Analyze ${input.ticker} with:
- Sentiment score: ${input.sentimentScore}
- 24h change: ${input.change24h}%
Focus on 2-paragraph analysis.`
```

### 2. Include Format Requirements
```typescript
systemPrompt: `Output EXACTLY in this format:
SENTIMENT_SCORE: [0-100]
SUMMARY: [2 paragraphs]`
```

### 3. Use Examples (Few-Shot)
```typescript
buildPrompt: (input) => `Example good response:
"AAPL shows strong sentiment at 85/100..."

Now analyze ${input.ticker}:`
```

### 4. Set Clear Constraints
```typescript
buildPrompt: (input) => `Requirements:
- Exactly 100-150 words
- No price predictions
- Data-driven only
- Professional tone`
```

## 🧪 Testing Prompts

Before deploying a new prompt:

1. **Test with sample data:**
```typescript
const testInput = {
  ticker: "TEST",
  // ... fill in test data
};
const messages = buildMessages(config, testInput);
console.log(messages[0].content);
```

2. **Validate output format:**
```typescript
const response = await testPrompt(config, testInput);
// Check if response matches expected format
```

3. **Check token usage:**
```typescript
console.log(`Tokens used: ${response.usage.input_tokens + response.usage.output_tokens}`);
console.log(`Actual cost: $${calculateCost(response.usage)}`);
```

## 🔒 Security Considerations

### API Key Management

```typescript
// ✅ Server-side (Convex actions)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ✅ Client-side (via proxy)
const response = await fetch('/api/claude', {
  method: 'POST',
  body: JSON.stringify({ messages, model: config.model }),
});
```

### Never include:
- User PII in prompts
- API keys in client code
- Sensitive business logic in prompts
- Raw database queries

## 📈 Performance Optimization

### 1. Cache Results
```typescript
// Check cache before calling LLM
const cached = await getCachedResult(ticker);
if (cached && !isExpired(cached)) {
  return cached.result;
}

// Call LLM only if cache miss
const result = await callLLM(config, input);
await cacheResult(ticker, result);
```

### 2. Batch Requests
```typescript
// Instead of 100 sequential calls
for (const ticker of tickers) {
  await generateSummary(ticker); // Slow
}

// Process in batches
const batches = chunk(tickers, 5);
for (const batch of batches) {
  await Promise.all(batch.map(generateSummary));
  await delay(2000); // Rate limiting
}
```

### 3. Use Streaming for Long Responses
```typescript
const stream = await anthropic.messages.create({
  ...config,
  stream: true,
});

for await (const chunk of stream) {
  // Process chunks as they arrive
}
```

## 🐛 Troubleshooting

### Prompt Not Working?

1. **Check input types:**
```typescript
// TypeScript will catch this
const badInput = { ticker: 123 }; // Error: ticker should be string
```

2. **Validate output:**
```typescript
const response = await callLLM(config, input);
console.log("Raw response:", response);
// Check if format matches config.outputFormat
```

3. **Test with simpler input:**
```typescript
const minimalInput = {
  ticker: "AAPL",
  // Use minimal valid data
};
```

### High Costs?

1. **Check token usage:**
```typescript
console.log(`Input: ${response.usage.input_tokens}`);
console.log(`Output: ${response.usage.output_tokens}`);
```

2. **Reduce max_tokens:**
```typescript
maxTokens: 256, // Instead of 512
```

3. **Use cheaper model:**
```typescript
model: "claude-haiku-4-5-20251001", // Latest Haiku
```

## 📚 Additional Resources

- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Claude Model Comparison](https://docs.anthropic.com/claude/docs/models-overview)
- [Prompt Engineering Guide](https://docs.anthropic.com/claude/docs/prompt-engineering)

## 🤝 Contributing

When updating prompts:

1. Test thoroughly with sample data
2. Update cost estimates if model changes
3. Document any breaking changes
4. Update this README if adding new patterns

## 📄 License

See main project LICENSE file.
