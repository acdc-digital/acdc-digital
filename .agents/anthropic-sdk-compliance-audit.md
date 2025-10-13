# Anthropic TypeScript SDK Compliance Audit
## ACDC Agent Architecture Review

**Date**: January 2025  
**Scope**: SMNB ACDC Agent Architecture  
**Reference**: `/Users/matthewsimon/Projects/acdc-digital/.github/anthropicTS-SDK-instructions.md`

---

## Executive Summary

This audit reviews the ACDC agent architecture against Anthropic's official TypeScript SDK best practices. The codebase demonstrates good architectural patterns overall, but several areas need updates to align with modern SDK recommendations.

### Overall Assessment: 🟡 NEEDS ATTENTION

- ✅ **Strengths**: Manual tool orchestration, proper message formatting, token tracking
- ⚠️ **Critical Issues**: Outdated models, security concerns, missing helper utilities
- 🔄 **Improvements Needed**: Adopt betaTool, streaming helpers, error types

---

## 1. API Client Initialization

### Current Status: 🟡 MIXED

#### ✅ Good Practices Found

**SessionManagerAgent.ts** (lines 30-32):
```typescript
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});
```
✅ Uses environment variable (best practice)  
✅ Default configuration pattern

**API Route** (lines 56):
```typescript
const anthropic = new Anthropic(anthropicConfig);
```
✅ Configuration object pattern  
✅ Supports dynamic API key selection

#### ⚠️ Issues Found

**editorAIService.ts** (lines 64-67):
```typescript
this.anthropic = new Anthropic({
  apiKey,
  dangerouslyAllowBrowser: true // Note: In production, route through your backend
});
```
🔴 **SECURITY RISK**: `dangerouslyAllowBrowser: true` in production code  
🔴 **VIOLATION**: SDK explicitly warns against this in production

**producerComputerUse.ts** (lines 34-36):
```typescript
this.client = new Anthropic({ 
  apiKey: config.apiKey,
  dangerouslyAllowBrowser: true 
});
```
🔴 **SECURITY RISK**: Same issue, no comment acknowledging risk

### Recommendations

#### 🔧 Fix 1: Remove Browser-Based Clients

**Before**:
```typescript
// ❌ BAD - Exposes API keys in browser
this.anthropic = new Anthropic({
  apiKey,
  dangerouslyAllowBrowser: true
});
```

**After**:
```typescript
// ✅ GOOD - Use backend proxy
// Remove client-side Anthropic initialization entirely
// Route all requests through /api/claude or /api/editor-ai
```

**Action Required**:
1. Remove `dangerouslyAllowBrowser` from `editorAIService.ts`
2. Remove `dangerouslyAllowBrowser` from `producerComputerUse.ts`
3. Refactor to use API routes exclusively
4. Add architecture documentation explaining the backend-proxy pattern

---

## 2. Model Configuration

### Current Status: 🔴 OUTDATED

#### Issues Found

**Outdated Model Versions** across multiple files:

1. **SessionManagerAgent.ts** (3 instances):
   ```typescript
   model: 'claude-3-5-haiku-20241022'  // ❌ OLD
   ```

2. **editorAIService.ts** (6+ instances):
   ```typescript
   model: 'claude-3-5-sonnet-20241022'  // ❌ OLD
   ```

3. **producerComputerUse.ts**:
   ```typescript
   model: 'claude-3-5-sonnet-20241022'  // ❌ OLD
   ```

4. **sessionChatService.ts**:
   ```typescript
   model: 'claude-3-5-haiku-20241022'  // ❌ OLD
   ```

5. **claudeLLMService.ts** (7 instances):
   ```typescript
   model: 'claude-3-5-haiku-20241022'  // ❌ OLD
   ```

#### ⚠️ Impact

- Missing performance improvements from newer models
- Not following SDK documentation standards
- Potential incompatibility with newer features

### Recommendations

#### 🔧 Fix 2: Update to Latest Model Versions

Per SDK best practices documentation, use:
```typescript
model: 'claude-sonnet-4-5-20250929'  // ✅ Current recommended version
```

**Action Required**:

1. **Create Model Configuration Constant** (new file):
   ```typescript
   // lib/config/anthropic-models.ts
   
   /**
    * Anthropic Model Configuration
    * Updated: January 2025
    * Reference: https://docs.anthropic.com/en/docs/models-overview
    */
   
   export const ANTHROPIC_MODELS = {
     // Latest Sonnet - Best for complex tasks
     SONNET_LATEST: 'claude-sonnet-4-5-20250929',
     
     // Latest Haiku - Fast for simple tasks
     HAIKU_LATEST: 'claude-3-5-haiku-20241022',
     
     // Deprecated models (for reference)
     DEPRECATED: {
       SONNET_OCT_2024: 'claude-3-5-sonnet-20241022',
       HAIKU_OCT_2024: 'claude-3-5-haiku-20241022'
     }
   } as const;
   
   export type AnthropicModel = typeof ANTHROPIC_MODELS[keyof typeof ANTHROPIC_MODELS];
   ```

2. **Update SessionManagerAgent.ts**:
   ```typescript
   import { ANTHROPIC_MODELS } from '@/lib/config/anthropic-models';
   
   const response = await anthropic.messages.create({
     model: ANTHROPIC_MODELS.HAIKU_LATEST,  // ✅ Using constant
     // ... rest of config
   });
   ```

3. **Update All Other Files**:
   - `editorAIService.ts`: Use `ANTHROPIC_MODELS.SONNET_LATEST`
   - `producerComputerUse.ts`: Use `ANTHROPIC_MODELS.SONNET_LATEST`
   - `sessionChatService.ts`: Use `ANTHROPIC_MODELS.HAIKU_LATEST`
   - `claudeLLMService.ts`: Use `ANTHROPIC_MODELS.HAIKU_LATEST`
   - `producerAgentService.ts`: Use `ANTHROPIC_MODELS.HAIKU_LATEST`

---

## 3. Tool Definition Patterns

### Current Status: 🟡 FUNCTIONAL BUT NOT OPTIMAL

#### Current Implementation

**SessionManagerAgent.ts** (lines 64-219) - Manual Tool Schema:
```typescript
{
  type: 'anthropic_tool',
  identifier: 'analyze_session_metrics',
  requiresPremium: false,
  schema: {
    name: 'analyze_session_metrics',
    description: 'Get comprehensive session metrics...',
    input_schema: {
      type: 'object',
      properties: {
        timeRange: {
          type: 'string',
          enum: ['today', 'week', 'month', 'all'],
          description: 'Time range for metrics analysis'
        }
      },
      required: ['timeRange']
    }
  },
  handler: this.handleSessionMetrics.bind(this),
}
```

#### Analysis

✅ **What's Working**:
- Proper JSON Schema structure
- Clear descriptions
- Required fields specified
- Enum constraints used correctly
- Handler binding pattern

❌ **Not Following SDK Best Practices**:
- Not using `betaTool` helper from SDK
- Missing automatic TypeScript type inference
- Manual type definitions duplicated
- No compile-time type safety for tool inputs

### SDK-Recommended Pattern

```typescript
import { betaTool } from '@anthropic-ai/sdk/helpers/json-schema';

const analyzeSessionMetricsTool = betaTool({
  name: 'analyze_session_metrics',
  description: 'Get comprehensive session metrics including total sessions, active sessions, activity patterns, and averages.',
  input_schema: {
    type: 'object',
    properties: {
      timeRange: {
        type: 'string',
        enum: ['today', 'week', 'month', 'all'],
        description: 'Time range for metrics analysis'
      }
    },
    required: ['timeRange']
  },
  run: async (input) => {
    // TypeScript automatically infers input type from schema!
    const { timeRange } = input;  // ✅ Type-safe
    return await fetchSessionMetrics(timeRange);
  }
});
```

### Recommendations

#### 🔧 Fix 3: Migrate to betaTool Helper

**Benefits**:
1. **Type Safety**: Automatic TypeScript inference from JSON Schema
2. **Less Boilerplate**: Combines schema + handler in one definition
3. **SDK Standard**: Follows official documentation pattern
4. **Better DX**: IDE autocomplete for tool inputs
5. **Future-Proof**: Aligned with SDK evolution

**Migration Path**:

1. **Install/Verify SDK Version**:
   ```bash
   pnpm add @anthropic-ai/sdk@latest
   ```

2. **Create New Tool Definitions** (example):
   ```typescript
   // lib/agents/acdc/tools/sessionTools.ts
   
   import { betaTool } from '@anthropic-ai/sdk/helpers/json-schema';
   
   export const analyzeSessionMetricsTool = betaTool({
     name: 'analyze_session_metrics',
     description: 'Get comprehensive session metrics including total sessions, active sessions, activity patterns, and averages. Use this when users ask about session data, activity, or overall performance.',
     input_schema: {
       type: 'object',
       properties: {
         timeRange: {
           type: 'string',
           enum: ['today', 'week', 'month', 'all'] as const,
           description: 'Time range for metrics analysis'
         }
       },
       required: ['timeRange']
     },
     run: async (input) => {
       // Call MCP server
       const response = await fetch(`${MCP_SERVER_URL}/tools/analyze_session_metrics`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(input)
       });
       return JSON.stringify(await response.json());
     }
   });
   
   export const analyzeTokenUsageTool = betaTool({
     name: 'analyze_token_usage',
     description: 'Analyze token usage, costs, and model performance. Get breakdowns by session, model, time period. Use when users ask about tokens, costs, or API usage.',
     input_schema: {
       type: 'object',
       properties: {
         groupBy: {
           type: 'string',
           enum: ['session', 'model', 'day', 'hour'] as const,
           description: 'How to group the usage data'
         },
         timeRange: {
           type: 'string',
           enum: ['today', 'week', 'month', 'all'] as const,
           description: 'Time range for analysis'
         }
       },
       required: ['groupBy', 'timeRange']
     },
     run: async (input) => {
       const response = await fetch(`${MCP_SERVER_URL}/tools/analyze_token_usage`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(input)
       });
       return JSON.stringify(await response.json());
     }
   });
   
   // Export array for easy use with toolRunner
   export const sessionTools = [
     analyzeSessionMetricsTool,
     analyzeTokenUsageTool,
     // ... other tools
   ];
   ```

3. **Update SessionManagerAgent** to use Tool Runner:
   ```typescript
   import { sessionTools } from './tools/sessionTools';
   
   async *stream(request: AgentRequest): AsyncGenerator<AgentChunk> {
     const userMessage = request.prompt;
     
     // Use toolRunner for automatic tool execution
     const runner = anthropic.beta.messages.toolRunner({
       model: ANTHROPIC_MODELS.HAIKU_LATEST,
       max_tokens: 4096,
       messages: [{ role: 'user', content: userMessage }],
       tools: sessionTools,
       max_iterations: 5,
       stream: true,  // Enable streaming
     });
     
     // Stream each message
     for await (const messageStream of runner) {
       for await (const event of messageStream) {
         if (event.type === 'content_block_delta') {
           if (event.delta.type === 'text_delta') {
             yield this.createContentChunk(event.delta.text);
           }
         }
       }
     }
     
     const final = await runner.done();
     // Store final message in database
     await this.storeMessage(final);
   }
   ```

**Priority**: MEDIUM - Current approach works, but migration provides significant benefits

---

## 4. Streaming Implementation

### Current Status: 🟡 CUSTOM IMPLEMENTATION

#### Current Approach

**SessionManagerAgent.ts** - Manual streaming with custom orchestration:
```typescript
const response = await anthropic.messages.create({
  model: 'claude-3-5-haiku-20241022',
  max_tokens: 4096,
  temperature: 0.7,
  tools,
  messages: [{ role: 'user', content: userMessage }]
});

// Manual multi-turn tool execution loop
let currentResponse = response;
let continueConversation = true;
const MAX_TURNS = 10;

while (continueConversation && turnCount < MAX_TURNS) {
  // Process blocks manually
  for (const block of currentResponse.content) {
    if (block.type === 'text') {
      yield this.createContentChunk(block.text);
    } else if (block.type === 'tool_use') {
      const toolResult = await this.executeTool(block.name, block.input, request.context);
      toolResults.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: JSON.stringify(toolResult)
      });
    }
  }
  
  // Continue conversation
  currentResponse = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    tools,
    messages: conversationMessages
  });
}
```

**editorAIService.ts** - Uses beta streaming:
```typescript
const stream = await this.anthropic.beta.messages.stream({
  model: this.config.model,
  max_tokens: this.config.maxTokens,
  messages: [{ role: 'user', content: prompt }],
  betas: ['fine-grained-tool-streaming-2025-05-14']
});

for await (const chunk of stream) {
  if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
    const text = chunk.delta.text;
    fullContent += text;
    streamHandler?.onChunk(text);
  }
}
```

#### Analysis

✅ **What's Working**:
- Multi-turn tool execution
- Proper streaming event handling
- Custom chunk types for UI
- Token tracking across turns

❌ **Not Following SDK Best Practices**:
- Not using `messages.stream()` helper with events
- Not using `toolRunner` for automatic orchestration
- Manual conversation state management
- Reimplementing SDK functionality

### SDK-Recommended Pattern

```typescript
// Streaming with event handlers (simpler)
const stream = anthropic.messages
  .stream({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Hello' }],
  })
  .on('text', (text) => {
    console.log(text);
  })
  .on('message', (message) => {
    console.log('Complete:', message);
  });

const finalMessage = await stream.finalMessage();
```

### Recommendations

#### 🔧 Fix 4: Adopt SDK Streaming Helpers

**Option A: Keep Custom Orchestration** (if UI requires custom chunks)
- Current approach is functional for ACDC architecture
- Custom chunk types (`thinking`, `content`, `tool_call`) are valuable
- Continue using manual approach but document as intentional

**Option B: Hybrid Approach** (recommended)
- Use `toolRunner` for tool execution logic
- Add custom streaming layer on top for UI chunks
- Best of both worlds

**Example Hybrid**:
```typescript
async *stream(request: AgentRequest): AsyncGenerator<AgentChunk> {
  const runner = anthropic.beta.messages.toolRunner({
    model: ANTHROPIC_MODELS.HAIKU_LATEST,
    max_tokens: 4096,
    messages: [{ role: 'user', content: request.prompt }],
    tools: sessionTools,
    stream: true,
  });
  
  for await (const messageStream of runner) {
    messageStream
      .on('text', (text) => {
        // Convert SDK event to custom chunk
        yield this.createContentChunk(text);
      })
      .on('message', (message) => {
        // Handle complete message
        yield this.createMetadataChunk({ status: 'complete' });
      });
    
    await messageStream.finalMessage();
  }
}
```

**Priority**: LOW - Current implementation works well for custom UI needs

---

## 5. Error Handling

### Current Status: 🟡 CUSTOM RETRY, MISSING SDK TYPES

#### Current Implementation

**editorAIService.ts** (lines 80-115) - Custom retry logic:
```typescript
private async retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a retryable error (overload, rate limit, network issues)
      const errorString = JSON.stringify(error);
      const isRetryableError = error?.error?.type === 'overloaded_error' || 
                               error?.type === 'overloaded_error' ||
                               error?.message?.includes('Overloaded') ||
                               errorString.includes('overloaded_error') ||
                               // ... more string checks
      
      if (!isRetryableError || attempt === maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}
```

#### Analysis

✅ **Good Aspects**:
- Exponential backoff implemented
- Handles overload errors
- Jitter added to delay

❌ **Issues**:
- Not using SDK's built-in retry mechanism
- Error type checking via string matching (fragile)
- Not using `Anthropic.APIError` types
- `error: any` instead of proper types
- Reimplementing SDK functionality

### SDK-Recommended Pattern

```typescript
import Anthropic from '@anthropic-ai/sdk';

// Configure retries at client level
const client = new Anthropic({
  maxRetries: 3,  // SDK handles retries automatically
  timeout: 20 * 1000,  // 20 seconds
});

// Or per-request
try {
  const message = await client.messages.create(
    { 
      max_tokens: 1024, 
      messages: [{ role: 'user', content: 'Hello' }], 
      model: 'claude-sonnet-4-5-20250929' 
    },
    { 
      maxRetries: 5,  // Override default
      timeout: 30 * 1000
    }
  );
} catch (err) {
  if (err instanceof Anthropic.APIError) {
    console.log(err.status);  // 400, 401, 429, etc.
    console.log(err.name);    // RateLimitError, etc.
    console.log(err.headers); // Response headers
  } else {
    throw err;
  }
}
```

### Recommendations

#### 🔧 Fix 5: Use SDK Error Types and Built-in Retries

1. **Configure Client-Level Retries**:
   ```typescript
   // SessionManagerAgent.ts
   const anthropic = new Anthropic({
     apiKey: process.env.ANTHROPIC_API_KEY!,
     maxRetries: 3,  // ✅ SDK handles retry logic
     timeout: 20 * 1000,
   });
   ```

2. **Use Proper Error Types**:
   ```typescript
   import Anthropic from '@anthropic-ai/sdk';
   
   try {
     const response = await this.anthropic.messages.create({
       model: ANTHROPIC_MODELS.SONNET_LATEST,
       max_tokens: 4000,
       messages: [{ role: 'user', content: prompt }]
     });
   } catch (err) {
     if (err instanceof Anthropic.APIError) {
       // Specific error handling
       if (err instanceof Anthropic.RateLimitError) {
         console.log('Rate limit hit:', err.status);
         // Handle rate limit
       } else if (err instanceof Anthropic.APIConnectionError) {
         console.log('Connection failed:', err.message);
         // Handle connection error
       } else if (err instanceof Anthropic.AuthenticationError) {
         console.log('Auth failed:', err.status);
         // Handle auth error
       }
       
       // Log request ID for debugging
       console.log('Request ID:', err.headers?.['request-id']);
     } else {
       // Non-API error
       throw err;
     }
   }
   ```

3. **Remove Custom Retry Logic**:
   ```typescript
   // ❌ DELETE: retryWithBackoff method from editorAIService.ts
   // ✅ USE: SDK's built-in retry configuration
   ```

4. **Add Timeout Warnings**:
   ```typescript
   // For long-running requests, use streaming
   const stream = await client.messages.create({
     model: ANTHROPIC_MODELS.SONNET_LATEST,
     max_tokens: 8000,
     stream: true,  // ✅ Prevents timeout on long responses
     messages: [{ role: 'user', content: longPrompt }]
   });
   ```

**Priority**: MEDIUM - Improves reliability and follows SDK standards

---

## 6. Token and Usage Tracking

### Current Status: ✅ EXCELLENT

#### Current Implementation

**SessionManagerAgent.ts** (lines 344-356):
```typescript
let totalInputTokens = 0;
let totalOutputTokens = 0;

let turnCount = 0;
while (continueConversation && turnCount < MAX_TURNS) {
  turnCount++;
  
  // Track token usage from this turn
  if (currentResponse.usage) {
    totalInputTokens += currentResponse.usage.input_tokens || 0;
    totalOutputTokens += currentResponse.usage.output_tokens || 0;
  }
  
  // ... tool execution
}
```

#### Analysis

✅ **Excellent Practices**:
- Tracks usage across multi-turn conversations
- Accumulates tokens properly
- Stores in database for analytics
- Follows SDK pattern exactly

**No changes needed** - This implementation is exemplary!

---

## 7. Security Issues

### Current Status: 🔴 CRITICAL

#### Issues Found

1. **Browser API Key Exposure** (2 files):
   - `editorAIService.ts` - `dangerouslyAllowBrowser: true`
   - `producerComputerUse.ts` - `dangerouslyAllowBrowser: true`

2. **API Key Logging** (1 file):
   ```typescript
   // app/api/claude/route.ts (lines 24-26)
   console.log('🔑 SERVER: Using client-provided API key:', apiKey.slice(0, 12) + '...');
   ```
   ⚠️ Even partial key logging can be a security risk

### SDK Security Guidelines

From SDK documentation:
> **Warning**: Browser support is disabled by default to protect API credentials. Never use `dangerouslyAllowBrowser` in production. Client-side exposure of API keys is a security risk. Consider backend proxy patterns for browser applications.

### Recommendations

#### 🔧 Fix 6: Remove Browser Security Bypass

**Priority**: 🔴 CRITICAL - Must fix before production

1. **Remove Browser Clients**:
   ```typescript
   // ❌ DELETE these files or refactor:
   // - lib/services/editor/editorAIService.ts (browser initialization)
   // - lib/services/producer/producerComputerUse.ts (browser initialization)
   ```

2. **Use Backend Proxy Pattern**:
   ```typescript
   // ✅ Frontend calls backend
   const response = await fetch('/api/editor-ai', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ prompt, action, content })
   });
   
   // ✅ Backend handles Anthropic API
   // app/api/editor-ai/route.ts
   const anthropic = new Anthropic({
     apiKey: process.env.ANTHROPIC_API_KEY!,
     // ✅ No dangerouslyAllowBrowser needed
   });
   ```

3. **Remove Key Logging**:
   ```typescript
   // ❌ DELETE
   console.log('🔑 SERVER: Using client-provided API key:', apiKey.slice(0, 12) + '...');
   
   // ✅ REPLACE with generic message
   console.log('🔑 SERVER: API key configured');
   ```

4. **Add Rate Limiting**:
   ```typescript
   // Implement rate limiting on API routes
   import { Ratelimit } from "@upstash/ratelimit";
   
   const ratelimit = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(10, "1 m"),
   });
   ```

---

## 8. Configuration Best Practices

### Current Status: 🟡 NEEDS CENTRALIZATION

#### Issues

- Model versions hardcoded in 10+ files
- No central configuration
- Inconsistent timeout values
- No configuration validation

### Recommendations

#### 🔧 Fix 7: Create Centralized Configuration

Create `lib/config/anthropic.config.ts`:

```typescript
/**
 * Centralized Anthropic SDK Configuration
 * Single source of truth for all AI/LLM settings
 */

import Anthropic from '@anthropic-ai/sdk';

// Model Constants
export const ANTHROPIC_MODELS = {
  SONNET_LATEST: 'claude-sonnet-4-5-20250929',
  HAIKU_LATEST: 'claude-3-5-haiku-20241022',
} as const;

// Token Limits by Use Case
export const TOKEN_LIMITS = {
  QUICK_RESPONSE: 1024,
  STANDARD_RESPONSE: 4096,
  LONG_FORM_CONTENT: 8000,
  MAX_ALLOWED: 8192,
} as const;

// Timeout Configuration (milliseconds)
export const TIMEOUTS = {
  QUICK: 10 * 1000,      // 10 seconds
  STANDARD: 30 * 1000,   // 30 seconds
  LONG: 60 * 1000,       // 1 minute
  STREAMING: 120 * 1000, // 2 minutes
} as const;

// Retry Configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  BASE_DELAY: 1000,
  MAX_DELAY: 10000,
} as const;

/**
 * Create configured Anthropic client for server-side use
 */
export function createAnthropicClient(options?: {
  maxRetries?: number;
  timeout?: number;
}): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY not found in environment variables. ' +
      'Please add it to .env.local'
    );
  }
  
  return new Anthropic({
    apiKey,
    maxRetries: options?.maxRetries ?? RETRY_CONFIG.MAX_RETRIES,
    timeout: options?.timeout ?? TIMEOUTS.STANDARD,
  });
}

/**
 * Default configuration for session management
 */
export const SESSION_MANAGER_CONFIG = {
  model: ANTHROPIC_MODELS.HAIKU_LATEST,
  maxTokens: TOKEN_LIMITS.STANDARD_RESPONSE,
  temperature: 0.7,
  timeout: TIMEOUTS.STANDARD,
  maxRetries: RETRY_CONFIG.MAX_RETRIES,
} as const;

/**
 * Default configuration for content generation
 */
export const CONTENT_GENERATOR_CONFIG = {
  model: ANTHROPIC_MODELS.SONNET_LATEST,
  maxTokens: TOKEN_LIMITS.LONG_FORM_CONTENT,
  temperature: 0.7,
  timeout: TIMEOUTS.LONG,
  maxRetries: RETRY_CONFIG.MAX_RETRIES,
} as const;

/**
 * Validate API key is configured
 */
export function validateApiKey(): void {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      'ANTHROPIC_API_KEY is not configured. ' +
      'Please add it to your environment variables.'
    );
  }
}
```

**Usage**:
```typescript
// SessionManagerAgent.ts
import { createAnthropicClient, SESSION_MANAGER_CONFIG } from '@/lib/config/anthropic.config';

const anthropic = createAnthropicClient();

const response = await anthropic.messages.create({
  model: SESSION_MANAGER_CONFIG.model,
  max_tokens: SESSION_MANAGER_CONFIG.maxTokens,
  temperature: SESSION_MANAGER_CONFIG.temperature,
  messages: [{ role: 'user', content: prompt }]
});
```

---

## 9. Additional SDK Features Not Used

### Missing Optimizations

#### 1. Message Batches API

Not currently used, but could optimize:
```typescript
// For parallel requests
await anthropic.messages.batches.create({
  requests: [
    {
      custom_id: 'session-1',
      params: {
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        messages: [{ role: 'user', content: 'Analyze session 1' }],
      },
    },
    {
      custom_id: 'session-2',
      params: {
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        messages: [{ role: 'user', content: 'Analyze session 2' }],
      },
    },
  ],
});
```

**Use Case**: Batch session analytics queries

#### 2. Auto-Pagination

Could simplify batch result handling:
```typescript
const allBatches = [];
for await (const batch of client.messages.batches.list({ limit: 20 })) {
  allBatches.push(batch);
}
```

#### 3. Request ID Tracking

Not logging request IDs for debugging:
```typescript
const message = await client.messages.create(params);
console.log('Request ID:', message._request_id);  // For debugging
```

---

## Priority Action Items

### 🔴 Critical (Fix Immediately)

1. **Remove `dangerouslyAllowBrowser`** from production code
   - Files: `editorAIService.ts`, `producerComputerUse.ts`
   - Action: Refactor to backend-only API calls
   - Risk: API key exposure, security vulnerability

2. **Remove API Key Logging**
   - File: `app/api/claude/route.ts`
   - Action: Delete or anonymize key logging

### 🟡 High Priority (Fix Soon)

3. **Update Model Versions**
   - All files using `claude-3-5-sonnet-20241022` → `claude-sonnet-4-5-20250929`
   - Create centralized model configuration
   - Estimated impact: 10+ files

4. **Adopt SDK Error Types**
   - Replace `error: any` with `Anthropic.APIError`
   - Use specific error classes (`RateLimitError`, etc.)
   - Remove custom retry logic in favor of SDK retries

### 🟢 Medium Priority (Improve Over Time)

5. **Migrate to `betaTool` Helper**
   - Refactor tool definitions to use SDK helper
   - Gain automatic type inference
   - Improve developer experience

6. **Consider Tool Runner**
   - Evaluate if automatic orchestration fits UI needs
   - Could simplify SessionManagerAgent significantly
   - Would need custom streaming layer for UI chunks

7. **Centralize Configuration**
   - Create `anthropic.config.ts`
   - Extract all hardcoded values
   - Add configuration validation

### 🔵 Low Priority (Nice to Have)

8. **Add Request ID Tracking**
   - Log `_request_id` for debugging
   - Include in error reports

9. **Explore Batch API**
   - For parallel session analytics
   - Could reduce latency for dashboard

10. **Document Architecture Decisions**
    - Why manual orchestration vs toolRunner
    - Custom chunk types for UI
    - Backend proxy pattern

---

## Summary of Changes Required

### Files to Modify

1. ✏️ `lib/services/editor/editorAIService.ts` - Remove browser client, update models
2. ✏️ `lib/services/producer/producerComputerUse.ts` - Remove browser client, update models
3. ✏️ `lib/agents/acdc/SessionManagerAgent.ts` - Update models, add error types
4. ✏️ `app/api/claude/route.ts` - Remove key logging, add error types
5. ✏️ `lib/services/sessionManager/sessionChatService.ts` - Update models
6. ✏️ `lib/services/host/claudeLLMService.ts` - Update models (7 instances)
7. ✏️ `lib/services/producer/producerAgentService.ts` - Update models

### Files to Create

1. ➕ `lib/config/anthropic.config.ts` - Centralized configuration
2. ➕ `lib/config/anthropic-models.ts` - Model version constants
3. ➕ `lib/agents/acdc/tools/sessionTools.ts` - betaTool definitions (optional)
4. ➕ `.agents/anthropic-migration-guide.md` - Migration documentation

### Estimated Effort

- 🔴 Critical security fixes: **2-4 hours**
- 🟡 Model updates + config: **4-6 hours**
- 🟢 Tool migration (optional): **8-12 hours**
- **Total**: 14-22 hours for full compliance

---

## Testing Checklist

After implementing fixes:

- [ ] All API calls use environment variable API keys
- [ ] No `dangerouslyAllowBrowser` in production code
- [ ] All models updated to latest versions
- [ ] Centralized configuration in use
- [ ] Error handling uses SDK types
- [ ] No API keys logged to console
- [ ] Request IDs tracked for debugging
- [ ] Streaming still works with custom UI chunks
- [ ] Tool execution functions correctly
- [ ] Token tracking accurate
- [ ] Rate limiting implemented on API routes

---

## Conclusion

The ACDC agent architecture demonstrates strong foundational patterns, particularly in:
- Multi-turn conversation handling
- Token usage tracking
- Custom streaming for UI needs

However, **immediate action is required** on security issues (`dangerouslyAllowBrowser`) before any production deployment.

Model version updates and configuration centralization should follow quickly to ensure compatibility with latest SDK features and maintain code quality.

The decision on `betaTool` migration can be made based on team preference - current approach is functional, but SDK helpers provide better type safety and developer experience.

---

**Next Steps**:
1. Review this audit with the team
2. Prioritize critical security fixes
3. Create migration plan for model updates
4. Schedule time for configuration refactor
5. Document architectural decisions for future reference
