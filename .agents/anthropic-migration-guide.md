# Anthropic SDK Migration Guide
## Nexus Agent Architecture Updates

**Status**: 🟡 In Progress  
**Priority**: 🔴 Critical (Security) + 🟡 High (Models)  
**Estimated Effort**: 14-22 hours

---

## Overview

This guide provides step-by-step instructions for migrating the Nexus agent architecture to comply with Anthropic TypeScript SDK best practices.

**Related Documents**:
- Audit Report: `/.agents/anthropic-sdk-compliance-audit.md`
- SDK Guidelines: `/.github/anthropicTS-SDK-instructions.md`
- Configuration: `/smnb/smnb/lib/config/anthropic.config.ts`

---

## Phase 1: Critical Security Fixes (IMMEDIATE)

### Priority: 🔴 CRITICAL
### Estimated Time: 2-4 hours

#### Issue: Browser API Key Exposure

Two files expose API keys in browser environments:
1. `lib/services/editor/editorAIService.ts`
2. `lib/services/producer/producerComputerUse.ts`

#### Step 1.1: Create Backend API Routes

**Create** `app/api/editor-ai/route.ts`:

```typescript
/**
 * Editor AI API Route
 * Server-side proxy for Anthropic API to keep keys secure
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAnthropicClient, CONTENT_GENERATOR_CONFIG } from '@/lib/config/anthropic.config';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const { action, prompt, content, context } = await request.json();
    
    const client = createAnthropicClient();
    
    // Build system prompt based on action
    const systemPrompt = buildSystemPrompt(action, context);
    
    const response = await client.messages.create({
      model: CONTENT_GENERATOR_CONFIG.model,
      max_tokens: CONTENT_GENERATOR_CONFIG.maxTokens,
      temperature: CONTENT_GENERATOR_CONFIG.temperature,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `${prompt}\n\nContent:\n${content}`
        }
      ]
    });
    
    const textContent = response.content
      .filter(block => block.type === 'text')
      .map(block => block.type === 'text' ? block.text : '')
      .join('\n');
    
    return NextResponse.json({
      success: true,
      content: textContent,
      usage: response.usage
    });
    
  } catch (err) {
    console.error('Editor AI error:', err);
    
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { 
          success: false, 
          error: err.message,
          status: err.status 
        },
        { status: err.status || 500 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(action: string, context?: string): string {
  const basePrompt = 'You are an expert content editor and writer.';
  
  switch (action) {
    case 'enhance':
      return `${basePrompt} Your task is to enhance the provided content while maintaining its core message and structure.`;
    case 'rewrite':
      return `${basePrompt} Your task is to rewrite the provided content in a different style or tone.`;
    case 'summarize':
      return `${basePrompt} Your task is to create a concise summary of the provided content.`;
    case 'blog-post':
      return `${basePrompt} Your task is to create a well-structured blog post.`;
    default:
      return basePrompt;
  }
}
```

**Create** `app/api/producer-ai/route.ts`:

```typescript
/**
 * Producer AI API Route
 * Server-side proxy for computer use features
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAnthropicClient, COMPUTER_USE_CONFIG } from '@/lib/config/anthropic.config';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const { action, content, context } = await request.json();
    
    const client = createAnthropicClient({
      timeout: COMPUTER_USE_CONFIG.timeout
    });
    
    const response = await client.beta.messages.create({
      model: COMPUTER_USE_CONFIG.model,
      max_tokens: COMPUTER_USE_CONFIG.maxTokens,
      betas: ['computer-use-2024-10-22'],
      tools: [
        {
          type: 'computer_20241022',
          name: 'computer',
          display_width_px: 1280,
          display_height_px: 800,
        }
      ],
      messages: [
        {
          role: 'user',
          content: buildProducerPrompt(action, content, context)
        }
      ]
    });
    
    return NextResponse.json({
      success: true,
      response: response.content,
      usage: response.usage
    });
    
  } catch (err) {
    console.error('Producer AI error:', err);
    
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { 
          success: false, 
          error: err.message,
          status: err.status 
        },
        { status: err.status || 500 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function buildProducerPrompt(action: string, content: string, context?: string): string {
  return `Action: ${action}\n\nContent:\n${content}\n\n${context ? `Context: ${context}` : ''}`;
}
```

#### Step 1.2: Update Frontend Services

**Update** `lib/services/editor/editorAIService.ts`:

```typescript
/**
 * Editor AI Service - Frontend Proxy
 * Calls backend API instead of Anthropic directly
 */

import { AIRequest, AIResponse } from '../../types/editor';

export class EditorAIService {
  /**
   * Process AI request via backend API
   */
  async processRequest(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/editor-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: request.type,
          prompt: this.buildPrompt(request),
          content: request.input,
          context: request.context
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
      }
      
      const data = await response.json();
      
      return {
        content: data.content,
        type: 'success',
        metadata: {
          tokens: data.usage?.total_tokens || 0,
          model: 'backend-routed',
          processingTime: Date.now() - startTime
        }
      };
      
    } catch (error) {
      console.error('Editor AI error:', error);
      
      return {
        content: '',
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          tokens: 0,
          model: 'backend-routed',
          processingTime: Date.now() - startTime
        }
      };
    }
  }
  
  private buildPrompt(request: AIRequest): string {
    // Your existing prompt building logic
    return `Perform ${request.type} on the content`;
  }
}
```

**Update** `lib/services/producer/producerComputerUse.ts`:

```typescript
/**
 * Producer Computer Use Service - Frontend Proxy
 * Calls backend API instead of Anthropic directly
 */

export class ProducerComputerUseService {
  async interactWithEditor(options: EditorInteractionOptions): Promise<void> {
    try {
      const response = await fetch('/api/producer-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: options.action,
          content: options.content,
          context: options.context
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Producer AI request failed');
      }
      
      const data = await response.json();
      console.log('Producer AI response:', data);
      
    } catch (error) {
      console.error('Producer AI error:', error);
      throw error;
    }
  }
}
```

#### Step 1.3: Remove Security Violations

```bash
# Search for all instances
grep -r "dangerouslyAllowBrowser" smnb/

# Expected output (should be 0 after fixes):
# (no matches)
```

**Verify**:
- [ ] No `dangerouslyAllowBrowser` in codebase
- [ ] All Anthropic API calls route through backend
- [ ] Frontend only makes fetch requests to `/api/*`
- [ ] API keys only in environment variables

#### Step 1.4: Remove API Key Logging

**Update** `app/api/claude/route.ts` (lines 24-28):

```typescript
// ❌ DELETE these lines
console.log('🔑 SERVER: Using client-provided API key:', apiKey.slice(0, 12) + '...');
console.log('🔑 SERVER: Using environment API key:', process.env.ANTHROPIC_API_KEY.slice(0, 12) + '...');

// ✅ REPLACE with
console.log('🔑 SERVER: API key configured');
```

---

## Phase 2: Model Version Updates

### Priority: 🟡 HIGH
### Estimated Time: 4-6 hours

#### Step 2.1: Import Configuration

**Update** `lib/agents/nexus/SessionManagerAgent.ts`:

```typescript
// Add at top
import { 
  createAnthropicClient, 
  SESSION_MANAGER_CONFIG,
  ANTHROPIC_MODELS 
} from '@/lib/config/anthropic.config';

// Replace global client creation (line 30)
const anthropic = createAnthropicClient({
  timeout: SESSION_MANAGER_CONFIG.timeout
});
```

#### Step 2.2: Update All Model References

**Search and replace** across all files:

```bash
# Find all model references
grep -r "claude-3-5-haiku-20241022" smnb/ --include="*.ts"
grep -r "claude-3-5-sonnet-20241022" smnb/ --include="*.ts"
```

**Files to update** (10 files total):

1. **SessionManagerAgent.ts** (3 instances):
   ```typescript
   // Line 277, 447, 485
   model: ANTHROPIC_MODELS.HAIKU_LATEST
   ```

2. **editorAIService.ts** (6+ instances):
   ```typescript
   import { CONTENT_GENERATOR_CONFIG } from '@/lib/config/anthropic.config';
   
   // All model references
   model: CONTENT_GENERATOR_CONFIG.model
   ```

3. **producerComputerUse.ts**:
   ```typescript
   import { COMPUTER_USE_CONFIG } from '@/lib/config/anthropic.config';
   
   model: COMPUTER_USE_CONFIG.model
   ```

4. **sessionChatService.ts**:
   ```typescript
   import { CHAT_CONFIG } from '@/lib/config/anthropic.config';
   
   model: CHAT_CONFIG.model
   ```

5. **claudeLLMService.ts** (7 instances):
   ```typescript
   import { SESSION_MANAGER_CONFIG } from '@/lib/config/anthropic.config';
   
   model: SESSION_MANAGER_CONFIG.model
   ```

6. **producerAgentService.ts**:
   ```typescript
   import { CHAT_CONFIG } from '@/lib/config/anthropic.config';
   
   model: CHAT_CONFIG.model
   ```

7. **API route** `app/api/claude/route.ts`:
   ```typescript
   import { SESSION_MANAGER_CONFIG } from '@/lib/config/anthropic.config';
   
   model: options?.model || SESSION_MANAGER_CONFIG.model
   ```

#### Step 2.3: Verify No Hardcoded Models

```bash
# Should return 0 results
grep -r "claude-3-5-" smnb/ --include="*.ts" | grep -v "DEPRECATED" | grep -v "config"
```

---

## Phase 3: Error Handling Updates

### Priority: 🟡 HIGH  
### Estimated Time: 2-3 hours

#### Step 3.1: Remove Custom Retry Logic

**Delete** from `lib/services/editor/editorAIService.ts` (lines 80-115):

```typescript
// ❌ DELETE entire retryWithBackoff method
private async retryWithBackoff<T>(...) { ... }
```

#### Step 3.2: Update Error Handling

**Update** all try-catch blocks to use SDK error types:

```typescript
import Anthropic from '@anthropic-ai/sdk';

try {
  const response = await client.messages.create({ ... });
} catch (err) {
  if (err instanceof Anthropic.APIError) {
    // Log request ID for debugging
    console.error('Anthropic API Error:', {
      status: err.status,
      name: err.name,
      message: err.message,
      requestId: err.headers?.['request-id']
    });
    
    // Specific error handling
    if (err instanceof Anthropic.RateLimitError) {
      // Handle rate limit
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (err instanceof Anthropic.APIConnectionError) {
      // Handle connection error
      throw new Error('Connection failed. Please check your network.');
    } else if (err instanceof Anthropic.AuthenticationError) {
      // Handle auth error
      throw new Error('Authentication failed. Please check API key.');
    }
    
    throw err;
  } else {
    // Non-API error
    console.error('Non-API error:', err);
    throw err;
  }
}
```

#### Step 3.3: Add Request ID Tracking

**Update** all API calls to log request IDs:

```typescript
const message = await client.messages.create({ ... });

// Log request ID for debugging
console.log('Request ID:', message._request_id);

// Store in database if needed
await storeMessageMetadata({
  requestId: message._request_id,
  usage: message.usage,
  timestamp: Date.now()
});
```

---

## Phase 4: Optional Improvements

### Priority: 🟢 MEDIUM
### Estimated Time: 8-12 hours

#### Option A: Migrate to betaTool Helper

**Benefits**:
- Automatic TypeScript inference
- Less boilerplate
- SDK standard pattern

**Trade-offs**:
- Requires refactoring tool definitions
- May need custom layer for Nexus architecture

**Example**:

```typescript
// lib/agents/nexus/tools/sessionTools.ts

import { betaTool } from '@anthropic-ai/sdk/helpers/json-schema';

export const analyzeSessionMetricsTool = betaTool({
  name: 'analyze_session_metrics',
  description: 'Get comprehensive session metrics...',
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
    // TypeScript knows input.timeRange is one of the enum values!
    const response = await fetch(`${MCP_SERVER_URL}/tools/analyze_session_metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    return JSON.stringify(await response.json());
  }
});

export const sessionTools = [
  analyzeSessionMetricsTool,
  analyzeTokenUsageTool,
  searchSessionMessagesTool,
  // ... other tools
];
```

#### Option B: Adopt Tool Runner

**Benefits**:
- Automatic multi-turn orchestration
- Less code to maintain
- SDK handles tool execution loop

**Trade-offs**:
- May not fit custom UI chunk requirements
- Would need streaming layer for Nexus architecture

**Decision**: Evaluate based on team preference and UI needs.

---

## Testing Checklist

### Security

- [ ] No `dangerouslyAllowBrowser` in codebase
- [ ] All API calls route through backend
- [ ] No API keys in browser JavaScript
- [ ] No API keys logged to console
- [ ] Environment variables properly configured

### Functionality

- [ ] SessionManagerAgent works with new config
- [ ] Editor AI service routes through backend
- [ ] Producer computer use routes through backend
- [ ] Tool execution functions correctly
- [ ] Streaming still works
- [ ] Token tracking accurate
- [ ] Error messages display properly

### Performance

- [ ] Response times acceptable
- [ ] Retry logic working (SDK built-in)
- [ ] Timeouts configured appropriately
- [ ] Rate limiting not exceeded

### Code Quality

- [ ] No hardcoded model versions
- [ ] Centralized configuration in use
- [ ] Error types from SDK used
- [ ] Request IDs logged
- [ ] TypeScript types correct
- [ ] No linting errors

---

## Rollback Plan

If issues occur during migration:

1. **Git branches**: Work in feature branch
2. **Backup files**: Keep copies of original files
3. **Test incrementally**: Deploy Phase 1, then Phase 2, etc.
4. **Monitor errors**: Watch for API errors in logs
5. **Revert if needed**: `git revert` to previous working state

---

## Post-Migration

### Documentation

1. Update team documentation
2. Add comments explaining architecture
3. Document backend proxy pattern
4. Create runbook for common issues

### Monitoring

1. Track API errors in logs
2. Monitor token usage
3. Watch for rate limits
4. Measure response times

### Continuous Improvement

1. Explore Batch API for parallel requests
2. Consider auto-pagination for lists
3. Evaluate streaming optimizations
4. Review SDK updates regularly

---

## Questions & Support

- **SDK Documentation**: https://docs.anthropic.com/en/api/client-sdks
- **Audit Report**: `/.agents/anthropic-sdk-compliance-audit.md`
- **Configuration**: `/smnb/smnb/lib/config/anthropic.config.ts`

---

## Timeline

| Phase | Priority | Duration | Status |
|-------|----------|----------|--------|
| Phase 1: Security | 🔴 Critical | 2-4 hours | ⏳ Not Started |
| Phase 2: Models | 🟡 High | 4-6 hours | ⏳ Not Started |
| Phase 3: Errors | 🟡 High | 2-3 hours | ⏳ Not Started |
| Phase 4: Optional | 🟢 Medium | 8-12 hours | ⏳ Not Started |
| **Total** | | **14-22 hours** | |

---

**Next Steps**:
1. Review this guide with team
2. Schedule Phase 1 (security) immediately
3. Plan Phases 2-3 for next sprint
4. Evaluate Phase 4 based on ROI
