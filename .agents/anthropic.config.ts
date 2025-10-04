/**
 * Centralized Anthropic SDK Configuration
 * Single source of truth for all AI/LLM settings across the Nexus framework
 * 
 * Reference: /.github/anthropicTS-SDK-instructions.md
 * Audit: /.agents/anthropic-sdk-compliance-audit.md
 * 
 * This is a global configuration file used by all projects in the monorepo:
 * - smnb: Session management and analytics
 * - acdc-digital: Content generation
 * - donut: Community engagement
 * - Other Nexus framework projects
 */

import Anthropic from '@anthropic-ai/sdk';

// ============================================================================
// Model Version Constants
// ============================================================================

/**
 * Current Anthropic model versions
 * Updated: January 2025
 * 
 * Reference: https://docs.anthropic.com/en/docs/models-overview
 */
export const ANTHROPIC_MODELS = {
  /** Latest Sonnet - Best for complex reasoning and content generation */
  SONNET_LATEST: 'claude-sonnet-4-5-20250929',
  
  /** Latest Haiku - Fast and cost-effective for simple tasks */
  HAIKU_LATEST: 'claude-3-5-haiku-20241022',
  
  /** Deprecated models (for reference only) */
  DEPRECATED: {
    SONNET_OCT_2024: 'claude-3-5-sonnet-20241022',
    HAIKU_OCT_2024: 'claude-3-5-haiku-20241022',
  }
} as const;

export type AnthropicModel = typeof ANTHROPIC_MODELS[keyof typeof ANTHROPIC_MODELS];

// ============================================================================
// Token Limits by Use Case
// ============================================================================

export const TOKEN_LIMITS = {
  /** Quick responses - chat, simple queries */
  QUICK_RESPONSE: 1024,
  
  /** Standard responses - analysis, explanations */
  STANDARD_RESPONSE: 4096,
  
  /** Long-form content - articles, documentation */
  LONG_FORM_CONTENT: 8000,
  
  /** Maximum allowed by API */
  MAX_ALLOWED: 8192,
} as const;

// ============================================================================
// Timeout Configuration (milliseconds)
// ============================================================================

export const TIMEOUTS = {
  /** Quick requests - 10 seconds */
  QUICK: 10 * 1000,
  
  /** Standard requests - 30 seconds */
  STANDARD: 30 * 1000,
  
  /** Long requests - 1 minute */
  LONG: 60 * 1000,
  
  /** Streaming requests - 2 minutes */
  STREAMING: 120 * 1000,
} as const;

// ============================================================================
// Retry Configuration
// ============================================================================

export const RETRY_CONFIG = {
  /** Maximum number of retry attempts */
  MAX_RETRIES: 3,
  
  /** Base delay for exponential backoff (ms) */
  BASE_DELAY: 1000,
  
  /** Maximum delay between retries (ms) */
  MAX_DELAY: 10000,
} as const;

// ============================================================================
// Client Factory
// ============================================================================

/**
 * Create configured Anthropic client for server-side use
 * 
 * @example
 * ```typescript
 * const client = createAnthropicClient();
 * const response = await client.messages.create({
 *   model: ANTHROPIC_MODELS.SONNET_LATEST,
 *   max_tokens: TOKEN_LIMITS.STANDARD_RESPONSE,
 *   messages: [{ role: 'user', content: 'Hello' }]
 * });
 * ```
 */
export function createAnthropicClient(options?: {
  maxRetries?: number;
  timeout?: number;
  apiKey?: string;
}): Anthropic {
  const apiKey = options?.apiKey || process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY not found in environment variables. ' +
      'Please add it to .env.local or pass it explicitly.'
    );
  }
  
  return new Anthropic({
    apiKey,
    maxRetries: options?.maxRetries ?? RETRY_CONFIG.MAX_RETRIES,
    timeout: options?.timeout ?? TIMEOUTS.STANDARD,
  });
}

// ============================================================================
// Pre-configured Settings by Use Case
// ============================================================================

/**
 * Configuration for Session Manager agent
 * Fast responses for analytics queries
 */
export const SESSION_MANAGER_CONFIG = {
  model: ANTHROPIC_MODELS.HAIKU_LATEST,
  maxTokens: TOKEN_LIMITS.STANDARD_RESPONSE,
  temperature: 0.7,
  timeout: TIMEOUTS.STANDARD,
  maxRetries: RETRY_CONFIG.MAX_RETRIES,
} as const;

/**
 * Configuration for content generation (editor, producer)
 * Higher quality for creative tasks
 */
export const CONTENT_GENERATOR_CONFIG = {
  model: ANTHROPIC_MODELS.SONNET_LATEST,
  maxTokens: TOKEN_LIMITS.LONG_FORM_CONTENT,
  temperature: 0.7,
  timeout: TIMEOUTS.LONG,
  maxRetries: RETRY_CONFIG.MAX_RETRIES,
} as const;

/**
 * Configuration for quick chat responses
 * Optimized for speed
 */
export const CHAT_CONFIG = {
  model: ANTHROPIC_MODELS.HAIKU_LATEST,
  maxTokens: TOKEN_LIMITS.QUICK_RESPONSE,
  temperature: 0.7,
  timeout: TIMEOUTS.QUICK,
  maxRetries: RETRY_CONFIG.MAX_RETRIES,
} as const;

/**
 * Configuration for computer use / automation
 * Higher token limit for complex interactions
 */
export const COMPUTER_USE_CONFIG = {
  model: ANTHROPIC_MODELS.SONNET_LATEST,
  maxTokens: TOKEN_LIMITS.STANDARD_RESPONSE,
  temperature: 0.7,
  timeout: TIMEOUTS.STREAMING,
  maxRetries: RETRY_CONFIG.MAX_RETRIES,
} as const;

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate that API key is configured
 * Throws error if not found
 */
export function validateApiKey(): void {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      'ANTHROPIC_API_KEY is not configured. ' +
      'Please add it to your .env.local file:\n\n' +
      'ANTHROPIC_API_KEY=sk-ant-...\n'
    );
  }
}

/**
 * Check if a model version is deprecated
 */
export function isDeprecatedModel(model: string): boolean {
  const deprecatedModels = Object.values(ANTHROPIC_MODELS.DEPRECATED);
  return deprecatedModels.includes(model as typeof deprecatedModels[number]);
}

/**
 * Get recommended model for a use case
 */
export function getRecommendedModel(useCase: 'fast' | 'quality' | 'balanced'): string {
  switch (useCase) {
    case 'fast':
      return ANTHROPIC_MODELS.HAIKU_LATEST;
    case 'quality':
      return ANTHROPIC_MODELS.SONNET_LATEST;
    case 'balanced':
      return ANTHROPIC_MODELS.HAIKU_LATEST;
    default:
      return ANTHROPIC_MODELS.HAIKU_LATEST;
  }
}

// ============================================================================
// Type Exports
// ============================================================================

export type AnthropicConfig = {
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
  maxRetries: number;
};
