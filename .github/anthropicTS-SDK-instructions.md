# GitHub Copilot Instructions for Anthropic SDK Best Practices

This file provides guidelines for implementing code that follows Anthropic's best practices as demonstrated in their official TypeScript SDK.

## Core Principles

### API Client Initialization

- Always initialize the Anthropic client with environment variable configuration
- Use `process.env['ANTHROPIC_API_KEY']` as the default for API keys
- Provide TypeScript type safety for all client configurations
- Support optional configuration parameters with sensible defaults

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env['ANTHROPIC_API_KEY'], // This is the default
});
```

### Message Creation Pattern

- Always specify `max_tokens` explicitly in message requests
- Use the latest model version (e.g., `claude-sonnet-4-5-20250929`)
- Structure messages with proper `role` and `content` fields
- Leverage TypeScript types for request params and responses

```typescript
const message: Anthropic.Message = await client.messages.create({
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello, Claude' }],
  model: 'claude-sonnet-4-5-20250929',
});
```

## Streaming Best Practices

### Using Stream Helpers

- Prefer `client.messages.stream()` for full-featured streaming with helpers
- Use event handlers for granular control over stream events
- Use `client.messages.create({ stream: true })` for memory-efficient streaming
- Always handle stream cancellation properly with `break` or `stream.controller.abort()`

```typescript
// Full-featured streaming with helpers
const stream = anthropic.messages
  .stream({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Say hello!' }],
  })
  .on('text', (text) => {
    console.log(text);
  })
  .on('message', (message) => {
    console.log('Message complete:', message);
  });

const finalMessage = await stream.finalMessage();
```

### Stream Event Handling

Available events in order of priority:
1. `connect` - Initial connection established
2. `streamEvent` - Raw stream events with accumulated snapshot
3. `text` - Text deltas as they arrive
4. `inputJson` - JSON deltas with snapshot
5. `contentBlock` - Complete content blocks
6. `message` - Complete message (corresponds to `message_stop`)
7. `finalMessage` - Final message event (after `message`)
8. `error` - Error handling
9. `abort` - Abort signal received
10. `end` - Stream completion

### Memory-Efficient Streaming

```typescript
// For lower memory usage, use async iteration
const stream = await client.messages.create({
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello' }],
  model: 'claude-sonnet-4-5-20250929',
  stream: true,
});

for await (const event of stream) {
  console.log(event.type);
}
```

## Tool Use Implementation

### Tool Creation with JSON Schema

- Use `betaTool` from `@anthropic-ai/sdk/helpers/json-schema` for JSON Schema validation
- The SDK will infer TypeScript types from the JSON Schema
- Always include `type`, `properties`, and `required` fields
- Provide clear descriptions for both tools and parameters
- Use `enum` for constrained string values
- Implement `run` functions that return string results

```typescript
import { betaTool } from '@anthropic-ai/sdk/helpers/json-schema';

const weatherTool = betaTool({
  name: 'get_weather',
  input_schema: {
    type: 'object',
    properties: {
      location: { 
        type: 'string',
        description: 'The city and state, e.g. San Francisco, CA'
      },
      unit: { 
        type: 'string', 
        enum: ['celsius', 'fahrenheit'],
        description: 'The unit of temperature'
      },
    },
    required: ['location'],
  },
  description: 'Get the current weather in a given location',
  run: async (input) => {
    // TypeScript infers the shape of input from the schema
    const unit = input.unit || 'fahrenheit';
    return `The weather in ${input.location} is ${unit === 'celsius' ? '22°C' : '72°F'}`;
  },
});
```

### Calculator Tool Example

```typescript
import { betaTool } from '@anthropic-ai/sdk/helpers/json-schema';

const calculatorTool = betaTool({
  name: 'calculator',
  input_schema: {
    type: 'object',
    properties: {
      operation: { 
        type: 'string', 
        enum: ['add', 'subtract', 'multiply', 'divide'],
        description: 'The arithmetic operation to perform'
      },
      a: { 
        type: 'number',
        description: 'The first number'
      },
      b: { 
        type: 'number',
        description: 'The second number'
      },
    },
    required: ['operation', 'a', 'b'],
  },
  description: 'Perform basic arithmetic operations',
  run: (input) => {
    const { operation, a, b } = input;
    switch (operation) {
      case 'add':
        return String(a + b);
      case 'subtract':
        return String(a - b);
      case 'multiply':
        return String(a * b);
      case 'divide':
        return String(a / b);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  },
});
```

### Tool Runner Pattern

- Use `anthropic.beta.messages.toolRunner()` for automatic tool execution
- The runner handles the tool execution loop automatically
- Support both synchronous iteration and direct await
- Set `max_iterations` to prevent infinite loops

```typescript
// Simple usage - direct await
const finalMessage = await anthropic.beta.messages.toolRunner({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 1000,
  messages: [{ role: 'user', content: 'What is the weather in San Francisco?' }],
  tools: [weatherTool],
});

// Advanced usage - iterate through messages
const runner = anthropic.beta.messages.toolRunner({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 1000,
  messages: [{ role: 'user', content: 'What is the weather in San Francisco?' }],
  tools: [weatherTool],
  max_iterations: 5, // Prevent infinite loops
});

for await (const message of runner) {
  console.log('Intermediate message:', message);
}

const final = await runner.done();
```

### Tool Runner with Streaming

```typescript
const runner = anthropic.beta.messages.toolRunner({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 1000,
  messages: [{ role: 'user', content: 'Calculate 5 + 3' }],
  tools: [calculatorTool],
  stream: true,
});

// Returns BetaMessageStream for each message
for await (const messageStream of runner) {
  for await (const event of messageStream) {
    console.log('event:', event);
  }
  console.log('message:', await messageStream.finalMessage());
}
```

### Dynamic Tool Runner Control

```typescript
// Update parameters during execution
runner.setMessagesParams((prevParams) => ({
  ...prevParams,
  max_tokens: prevParams.max_tokens * 2,
}));

// Add messages to conversation
runner.pushMessages(
  { role: 'user', content: 'Additional context...' }
);

// Access current parameters
console.log('Current model:', runner.params.model);
```

### Complex Tool Schema Example

```typescript
const databaseQueryTool = betaTool({
  name: 'database_query',
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'SQL query to execute'
      },
      parameters: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            value: { 
              type: ['string', 'number', 'boolean', 'null']
            }
          },
          required: ['name', 'value']
        },
        description: 'Query parameters for safe SQL execution'
      },
      timeout: {
        type: 'number',
        description: 'Query timeout in milliseconds',
        minimum: 0,
        maximum: 30000
      }
    },
    required: ['query']
  },
  description: 'Execute a database query with optional parameters',
  run: async (input) => {
    // Execute query with parameters
    const results = await executeQuery(input.query, input.parameters, input.timeout);
    return JSON.stringify(results);
  },
});
```

## Token Usage Monitoring

- Always check the `usage` property on responses for token counts
- Monitor both `input_tokens` and `output_tokens`
- Use this data for cost tracking and optimization

```typescript
const message = await client.messages.create({
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello' }],
  model: 'claude-sonnet-4-5-20250929',
});

console.log(message.usage);
// { input_tokens: 25, output_tokens: 13 }
```

## Message Batches

### Creating Batches

- Use `client.messages.batches.create()` for batch processing
- Each request needs a unique `custom_id`
- Batch requests use the same params as standard Messages API

```typescript
await anthropic.messages.batches.create({
  requests: [
    {
      custom_id: 'my-first-request',
      params: {
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        messages: [{ role: 'user', content: 'Hello, world' }],
      },
    },
    {
      custom_id: 'my-second-request',
      params: {
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        messages: [{ role: 'user', content: 'Hi again, friend' }],
      },
    },
  ],
});
```

### Retrieving Batch Results

- Check `.processing_status === 'ended'` before retrieving results
- Use async iteration to process results
- Handle both succeeded and failed results

```typescript
const results = await anthropic.messages.batches.results(batch_id);
for await (const entry of results) {
  if (entry.result.type === 'succeeded') {
    console.log(entry.result.message.content);
  } else {
    console.error('Failed:', entry.result.error);
  }
}
```

## File Uploads

### File Upload Patterns

- Support multiple file formats: `File`, `fetch` Response, `fs.ReadStream`, `Buffer`, `Uint8Array`
- Always set explicit content-type using the `toFile` helper
- Use `fs.createReadStream()` for Node.js environments
- Use `File` API for browser environments

```typescript
import fs from 'fs';
import Anthropic, { toFile } from '@anthropic-ai/sdk';

const client = new Anthropic();

// Node.js with fs.ReadStream
await client.beta.files.upload({
  file: await toFile(fs.createReadStream('/path/to/file'), undefined, { 
    type: 'application/json' 
  }),
  betas: ['files-api-2025-04-14'],
});

// Web File API
await client.beta.files.upload({
  file: new File(['my bytes'], 'file.txt', { type: 'text/plain' }),
  betas: ['files-api-2025-04-14'],
});

// Buffer or Uint8Array
await client.beta.files.upload({
  file: await toFile(Buffer.from('my bytes'), 'file', { type: 'text/plain' }),
  betas: ['files-api-2025-04-14'],
});
```

## Error Handling

### Error Types and Status Codes

- Always wrap API calls in try-catch blocks
- Check for specific `APIError` subclasses
- Access error details via `status`, `name`, and `headers` properties

```typescript
try {
  const message = await client.messages.create({
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Hello' }],
    model: 'claude-sonnet-4-5-20250929',
  });
} catch (err) {
  if (err instanceof Anthropic.APIError) {
    console.log(err.status); // 400, 401, 403, etc.
    console.log(err.name); // BadRequestError, AuthenticationError, etc.
    console.log(err.headers); // Response headers
  } else {
    throw err;
  }
}
```

### Error Type Mapping

- 400: `BadRequestError`
- 401: `AuthenticationError`
- 403: `PermissionDeniedError`
- 404: `NotFoundError`
- 422: `UnprocessableEntityError`
- 429: `RateLimitError`
- >=500: `InternalServerError`
- Network issues: `APIConnectionError`

### Request ID Tracking

- Use `_request_id` property for debugging
- Log request IDs for failed requests
- Include in error reports to Anthropic

```typescript
const message = await client.messages.create({
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello' }],
  model: 'claude-sonnet-4-5-20250929',
});
console.log(message._request_id); // req_018EeWyXxfu5pfWkrYcMdjWG
```

## Retry and Timeout Configuration

### Retry Strategy

- Default: 2 retries with exponential backoff
- Retries apply to: connection errors, 408, 409, 429, >=500
- Configure globally on client or per-request

```typescript
// Global configuration
const client = new Anthropic({
  maxRetries: 0, // Disable retries
});

// Per-request configuration
await client.messages.create(
  { 
    max_tokens: 1024, 
    messages: [{ role: 'user', content: 'Hello' }], 
    model: 'claude-sonnet-4-5-20250929' 
  },
  { maxRetries: 5 }
);
```

### Timeout Configuration

- Default: 10 minutes for most requests
- Dynamic timeout for large `max_tokens` (up to 60 minutes)
- Override globally or per-request
- **Important**: Use streaming for long-running requests

```typescript
// Global timeout
const client = new Anthropic({
  timeout: 20 * 1000, // 20 seconds
});

// Per-request timeout
await client.messages.create(
  { 
    max_tokens: 1024, 
    messages: [{ role: 'user', content: 'Hello' }], 
    model: 'claude-sonnet-4-5-20250929' 
  },
  { timeout: 5 * 1000 }
);
```

### Long Request Handling

- **Always use streaming** for requests expected to exceed 10 minutes
- Non-streaming long requests risk idle connection drops
- Set `stream: true` or override timeout to disable long-request warnings
- TCP keep-alive is automatically configured when supported

## Auto-Pagination

### Paginated List Iteration

- Use `for await...of` for automatic pagination
- Access `.hasNextPage()` and `.getNextPage()` for manual control
- Applies to list methods like `client.messages.batches.list()`

```typescript
// Automatic pagination
const allBatches = [];
for await (const batch of client.messages.batches.list({ limit: 20 })) {
  allBatches.push(batch);
}

// Manual pagination
let page = await client.messages.batches.list({ limit: 20 });
for (const batch of page.data) {
  console.log(batch);
}

while (page.hasNextPage()) {
  page = await page.getNextPage();
  // Process page.data
}
```

## Beta Features

### Accessing Beta APIs

- Use `client.beta.*` for beta features
- Include appropriate beta headers in `betas` array
- Check [documentation](https://docs.anthropic.com/en/api/beta-features) for available betas

```typescript
const response = await client.beta.messages.create({
  max_tokens: 1024,
  model: 'claude-sonnet-4-5-20250929',
  messages: [
    {
      role: 'user',
      content: [{ type: 'text', text: "What's 4242424242 * 4242424242?" }],
    },
  ],
  tools: [
    {
      name: 'code_execution',
      type: 'code_execution_20250522',
    },
  ],
  betas: ['code-execution-2025-05-22'],
});
```

## Advanced Configuration

### Custom Headers

- Override default headers on a per-request basis
- Default `anthropic-version` is `2023-06-01`
- **Warning**: Custom headers may cause unexpected behavior

```typescript
const message = await client.messages.create(
  {
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Hello' }],
    model: 'claude-sonnet-4-5-20250929',
  },
  { headers: { 'anthropic-version': 'Custom-Version' } }
);
```

### Accessing Raw Responses

- Use `.asResponse()` for headers without consuming body
- Use `.withResponse()` to get both parsed data and raw response

```typescript
// Get raw response (doesn't consume body)
const response = await client.messages
  .create({
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Hello' }],
    model: 'claude-sonnet-4-5-20250929',
  })
  .asResponse();
console.log(response.headers.get('X-My-Header'));

// Get both parsed and raw
const { data: message, response: raw } = await client.messages
  .create({
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Hello' }],
    model: 'claude-sonnet-4-5-20250929',
  })
  .withResponse();
```

### Logging Configuration

- Set log level via `ANTHROPIC_LOG` environment variable or `logLevel` client option
- Levels: `'debug'`, `'info'`, `'warn'` (default), `'error'`, `'off'`
- **Warning**: Debug level logs may expose sensitive data
- Support custom loggers (pino, winston, bunyan, consola, etc.)

```typescript
// Built-in logger
const client = new Anthropic({
  logLevel: 'debug', // Show all log messages
});

// Custom logger
import pino from 'pino';
const logger = pino();

const client = new Anthropic({
  logger: logger.child({ name: 'Anthropic' }),
  logLevel: 'debug',
});
```

### Custom Fetch and Proxy Configuration

```typescript
// Custom fetch function
import fetch from 'my-fetch';
const client = new Anthropic({ fetch });

// Node.js proxy with undici
import * as undici from 'undici';
const proxyAgent = new undici.ProxyAgent('http://localhost:8888');
const client = new Anthropic({
  fetchOptions: {
    dispatcher: proxyAgent,
  },
});

// Bun proxy
const client = new Anthropic({
  fetchOptions: {
    proxy: 'http://localhost:8888',
  },
});

// Deno proxy
const httpClient = Deno.createHttpClient({ 
  proxy: { url: 'http://localhost:8888' } 
});
const client = new Anthropic({
  fetchOptions: {
    client: httpClient,
  },
});
```

## TypeScript Best Practices

### Type Imports

- Import types for request params and responses
- Use typed parameters for better IDE support
- Leverage docstrings for parameter documentation

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const params: Anthropic.MessageCreateParams = {
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello, Claude' }],
  model: 'claude-sonnet-4-5-20250929',
};

const message: Anthropic.Message = await client.messages.create(params);
```

### Undocumented Endpoints

- Use `client.get`, `client.post`, etc. for undocumented endpoints
- Use `// @ts-expect-error` for undocumented parameters
- Cast responses when accessing undocumented properties

```typescript
// Undocumented endpoint
await client.post('/some/path', {
  body: { some_prop: 'foo' },
  query: { some_query_arg: 'bar' },
});

// Undocumented parameter
client.messages.create({
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello' }],
  model: 'claude-sonnet-4-5-20250929',
  // @ts-expect-error experimental feature
  experimental_option: true,
});
```

## Security Best Practices

### API Key Management

- **Never** use `dangerouslyAllowBrowser` in production
- Keep API keys in environment variables
- Use server-side code for API interactions
- Rotate keys regularly and use short-lived credentials when testing

### Browser Support Warning

- Browser support is disabled by default to protect API credentials
- Only enable for internal tools or temporary development
- Client-side exposure of API keys is a security risk
- Consider backend proxy patterns for browser applications

## AWS Bedrock Integration

- Use separate `@anthropic-ai/bedrock-sdk` package
- Follow Anthropic Bedrock API documentation
- Maintain consistent patterns with standard SDK

## Requirements

- **TypeScript**: >= 4.9
- **Supported Runtimes**:
  - Node.js 20 LTS or later
  - Deno v1.28.0 or higher
  - Bun 1.0 or later
  - Cloudflare Workers
  - Vercel Edge Runtime
  - Jest 28+ with `"node"` environment
  - Nitro v2.6 or greater
- **Not Supported**: React Native, jsdom

## Code Organization Patterns

### Client Instantiation

- Create a single client instance and reuse it
- Configure client at initialization, not per-request
- Use dependency injection for testability

### Error Recovery

- Implement exponential backoff for retries
- Log all error details including request IDs
- Provide fallback responses for critical paths
- Monitor rate limits and adjust request patterns

### Performance Optimization

- Use streaming for large responses
- Implement caching for repeated queries
- Monitor token usage to optimize costs
- Use batch API for parallel requests

### Testing

- Mock the Anthropic client in tests
- Test error handling paths explicitly
- Validate stream event sequences
- Test timeout and retry behavior