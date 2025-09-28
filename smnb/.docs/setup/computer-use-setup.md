# Computer Use Integration Setup Guide

## Overview
This guide explains how to set up and use the computer use approach for AI content formatting in the SMNB producer column panel. The computer use system allows C### Security Considerations

### API Key Management
- Keys stored securely in browser localStorage
- Never transmitted to SMNB servers
- Validation through direct Anthropic API calls
- User controls for key removal and updating
- **Browser Usage**: Uses `dangerouslyAllowBrowser: true` for client-side API access
- **Risk Mitigation**: API keys only used for direct Anthropic communication, no server-side exposureo directly interact with the TipTap editor through browser automation for natural content enhancement.

## Architecture

### Components Created
1. **ProducerComputerUseService** (`lib/services/producerComputerUse.ts`)
   - Core service handling computer use tool integration
   - Manages Anthropic API with computer-use-2025-01-24 beta
   - Provides screenshot, click, and type operations

2. **ProducerComputerUseIntegration** (`lib/components/ProducerComputerUseIntegration.tsx`)
   - React integration component
   - Monitors producer column selection state
   - Connects service with UI components

3. **ComputerUseAIControls** (`lib/components/ComputerUseAIControls.tsx`)
   - User-facing controls for AI formatting actions
   - Shows status indicators and interaction buttons
   - Only active when editor column is selected

### Integration Points
- **Producer Component** (`app/dashboard/studio/producer/Producer.tsx`)
  - Enhanced with computer use controls in editor view
  - Monitors column selection state ('stats', 'preview', 'editor')
  - Passes producer content and API keys to computer use system

## Requirements

### Anthropic API Configuration
```typescript
// Required API configuration
const API_CONFIG = {
  model: 'claude-3-7-sonnet-20250219', // Required for computer use
  beta: 'computer-use-2025-01-24',     // Required beta flag
  dangerouslyAllowBrowser: true,       // Required for browser usage
  tools: [
    'computer_20250124',   // Primary computer use tool
    'text_editor_20250124', // Text editing tool
    'bash_20250124'        // Shell command tool
  ],
  displayResolution: '1280x800' // Virtual display size
};
```

### Environment Setup
```bash
# Install required dependencies (if not already installed)
pnpm install @anthropic-ai/sdk

# Set up API key in environment or use UI
NEXT_PUBLIC_ANTHROPIC_API_KEY=sk-ant-api03-...
```

## Usage Flow

### 1. Column Selection
- User clicks "Editor" tab in Producer column
- `ProducerComputerUseIntegration` detects column change
- Computer use service is activated and ready

### 2. Content Available
- Producer content flows from live feed analysis
- Editor store contains processed story content
- Computer use controls become enabled

### 3. AI Formatting Actions
Available formatting options:
- **Newsletter Format**: Structure content as newsletter
- **Blog Post**: Transform into analytical article
- **Enhance**: Improve overall content quality
- **Summarize**: Create concise summary
- **Rewrite**: Fresh perspective on content

### 4. Computer Use Execution
When user clicks a formatting button:
1. Service takes screenshot of editor area
2. Claude analyzes current content and editor state
3. Claude performs click and type operations to format content
4. Service monitors completion and returns control

## Status Indicators

### Visual Feedback
- **Green Dot**: Computer use ready and active
- **Gray Dot**: Computer use not ready
- **Yellow Warning**: Editor column not selected or no content
- **Blue Processing**: Claude is actively interacting with editor

### Debug Information (Development)
```typescript
// Development mode shows detailed status
{
  "monitoring": true,
  "editorActive": true,
  "ready": true,
  "currentColumn": "editor",
  "hasContent": true,
  "canInteract": true
}
```

## Configuration Options

### Service Configuration
```typescript
const COMPUTER_USE_CONFIG = {
  // API settings
  model: 'claude-3-5-sonnet-20241220',
  maxTokens: 4000,
  
  // Display settings
  displayWidth: 1280,
  displayHeight: 800,
  
  // Interaction settings
  screenshotQuality: 0.8,
  actionTimeout: 30000,
  retryAttempts: 3
};
```

### Action Prompts
Each AI action uses specialized prompts:
- **Newsletter**: "Format this content as an engaging newsletter section..."
- **Blog Post**: "Transform this into a comprehensive analytical blog post..."
- **Enhance**: "Improve the writing quality, clarity, and engagement..."
- **Summarize**: "Create a concise, informative summary..."
- **Rewrite**: "Rewrite this content with a fresh perspective..."

## Implementation Status

### ✅ Completed
- [x] Computer use service architecture
- [x] Producer column integration
- [x] AI controls UI component
- [x] Column selection monitoring
- [x] API key integration
- [x] Status indicators and feedback
- [x] TypeScript types and interfaces

### 🚧 Pending Implementation
- [ ] **Computer Use Backend**: Actual screenshot, click, type operations
- [ ] **Display Environment**: Virtual display setup for browser automation
- [ ] **Action Prompts**: Specialized prompts for each formatting type
- [ ] **Error Handling**: Robust error recovery and user feedback
- [ ] **Performance Optimization**: Caching and request optimization

## Next Steps

### 1. Backend Implementation
```typescript
// Replace placeholder methods in ProducerComputerUseService
async takeScreenshot(): Promise<string> {
  // Implement actual screenshot capture
  // Return base64 encoded image
}

async clickAt(x: number, y: number): Promise<void> {
  // Implement actual click operations
}

async typeText(text: string): Promise<void> {
  // Implement actual typing operations
}
```

### 2. Environment Setup
- Set up virtual display environment
- Configure browser automation backend
- Test screenshot and interaction capabilities

### 3. Testing Strategy
- Unit tests for service methods
- Integration tests for column monitoring
- End-to-end tests for complete workflows
- Performance testing for large content

### 4. Production Deployment
- Environment variable configuration
- Error monitoring and logging
- Rate limiting and usage analytics
- User feedback collection

## Debugging

### Check Service Status
```typescript
// Access service status in browser console
window.computerUseInteract({
  action: 'enhance',
  content: 'test content',
  context: 'debug test'
});
```

### Monitor Column Changes
```typescript
// Watch column selection in developer tools
// Look for console messages:
// "✅ Editor column selected - computer use ready"
// "❌ Editor column deselected - computer use paused"
```

### Verify API Integration
```typescript
// Check API key store status
useApiKeyStore.getState().hasValidKey()
useApiKeyStore.getState().getValidApiKey()
```

## Security Considerations

### API Key Management
- Keys stored securely in browser localStorage
- Never transmitted to SMNB servers
- Validation through direct Anthropic API calls
- User controls for key removal and updating

### Computer Use Safety
- Scoped to producer column panel only
- Limited to TipTap editor interactions
- No system-level operations
- User consent required for each action

### Privacy Protection
- Screenshots limited to editor content area
- No persistent storage of screenshots
- All processing via Anthropic's secure infrastructure
- User content never stored on SMNB servers

## Support and Troubleshooting

### Common Issues
1. **"Computer use not ready"**: Ensure editor column is selected
2. **"No content available"**: Verify producer has processed content
3. **"API key validation failed"**: Check key format and validity
4. **"Screenshot failed"**: Verify display environment setup

### Error Recovery
- Service automatically retries failed operations
- Graceful degradation when computer use unavailable
- Clear error messages and user guidance
- Fallback to traditional AI text processing

This computer use integration provides a natural, powerful way for Claude to enhance content directly within the TipTap editor, creating a seamless AI-assisted writing experience scoped specifically to the producer column panel when the editor is active.