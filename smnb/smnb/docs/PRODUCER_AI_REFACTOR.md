# Producer AI Computer Use - Backend Refactor

## Summary
Refactored the Producer Computer Use feature to use a secure backend API route instead of exposing Anthropic API credentials in the browser.

## Changes Made

### 1. New Backend API Route
**File**: `app/api/producer-ai/route.ts`

Created a new secure server-side API endpoint that:
- Handles all Anthropic API calls on the backend
- Manages API key securely via environment variables
- Supports two actions:
  - `computer-use`: Initial computer use request
  - `continue-conversation`: Continue multi-turn computer use conversations
- Includes proper error handling and rate limiting

### 2. Service Layer Refactor
**File**: `lib/services/producer/producerComputerUse.ts`

Updated the service to:
- Remove client-side Anthropic SDK instantiation
- Use `fetch()` to call the backend API endpoint
- Maintain the same interface and functionality
- No longer requires API key on the client side

**Key Changes:**
- ❌ Removed: `import Anthropic from '@anthropic-ai/sdk'`
- ❌ Removed: `private client: Anthropic`
- ✅ Added: `private apiEndpoint: string = '/api/producer-ai'`
- ✅ Updated: All API calls now use `fetch()` to backend

### 3. Component Integration Updates
**File**: `lib/components/ProducerComputerUseIntegration.tsx`

Updated the integration component:
- Removed `apiKey` prop requirement
- Backend handles all authentication
- Simplified initialization logic

**File**: `app/dashboard/studio/producer/Producer.tsx`

Updated the Producer component:
- No longer passes `apiKey` to `ProducerComputerUseIntegration`
- Cleaner component props

## Security Improvements

### Before (❌ Insecure)
```typescript
// Client-side - exposed API key to browser
this.client = new Anthropic({ 
  apiKey: config.apiKey,
  dangerouslyAllowBrowser: true // Required but dangerous
});
```

### After (✅ Secure)
```typescript
// Server-side only - API key stays on backend
const apiKey = process.env.ANTHROPIC_API_KEY;
const client = new Anthropic({ apiKey });
```

## Usage

### Backend API Endpoint
```typescript
// POST /api/producer-ai
{
  "action": "computer-use",
  "options": {
    "prompt": "Your computer use prompt...",
    "displayWidth": 1280,
    "displayHeight": 800,
    "model": "claude-3-7-sonnet-20250219",
    "maxTokens": 4000
  }
}
```

### Client-Side Usage
```tsx
// No changes needed in components - same interface
<ProducerComputerUseIntegration
  currentColumn={currentView}
  onInteractionStart={() => console.log('Started')}
  onInteractionComplete={() => console.log('Completed')}
  onError={(error) => console.error(error)}
/>
```

## Environment Variables Required

Ensure `.env.local` contains:
```bash
ANTHROPIC_API_KEY=your-api-key-here
```

## Testing

1. Verify the backend API is working:
   ```bash
   curl -X POST http://localhost:3000/api/producer-ai \
     -H "Content-Type: application/json" \
     -d '{"action": "computer-use", "options": {"prompt": "test"}}'
   ```

2. Test in the Producer UI:
   - Open Dashboard → Studio → Producer
   - Select a story
   - Switch to "editor" column
   - The computer use service should initialize without errors

## Migration Notes

- ✅ No breaking changes to public API
- ✅ Components work the same way
- ✅ No client-side API key needed anymore
- ⚠️ Ensure `ANTHROPIC_API_KEY` is set in environment
- ⚠️ Backend must be running for computer use to work

## Benefits

1. **Security**: API keys never exposed to browser
2. **Compliance**: Follows Anthropic's security best practices
3. **Maintainability**: Centralized API logic on backend
4. **Flexibility**: Easier to add rate limiting, caching, logging
5. **Cost Control**: Can implement usage tracking server-side

## Next Steps

Consider adding:
- [ ] Request caching to reduce API costs
- [ ] Usage analytics and monitoring
- [ ] Rate limiting per user/session
- [ ] Response streaming for real-time feedback
- [ ] Retry logic with exponential backoff
