# Chat-to-Canvas Component Generation

## Overview
The stdio canvas now includes an AI-powered chat interface that generates React components using Claude 3.5 Sonnet. Users can describe components in natural language, and the AI will generate complete, production-ready React code with Tailwind CSS styling.

## Setup

### 1. Install Dependencies
Dependencies are already installed:
- `ai@^3.4.33` - Vercel AI SDK v3 for streaming chat with useChat hook
- `@ai-sdk/anthropic` - Anthropic provider for Claude

### 2. Environment Variables
Create a `.env.local` file in the stdio directory:

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=your_convex_url_here

# Anthropic API for component generation
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Get your Anthropic API key from: https://console.anthropic.com/

### 3. Start the Development Server
```bash
npm run dev
```

The canvas will be available at http://localhost:9998

## Architecture

### Files Created/Modified

#### New Files:
1. **`lib/prompts/systemPrompts.ts`**
   - System prompts for Claude
   - Instructions for Tailwind CSS component generation
   - XML output format specification
   - Example components (Button, FeatureCard)

2. **`app/api/chat/route.ts`**
   - Edge API route for chat requests
   - Anthropic Claude 3.5 Sonnet integration
   - Streaming response handling

3. **`app/_components/chat/ChatInterface.tsx`**
   - Chat UI component
   - Message display with auto-scroll
   - Component extraction from streaming responses
   - Loading states and error handling

#### Modified Files:
1. **`app/_components/canvas/ComponentCanvas.tsx`**
   - Added chat panel (35% width) on the left
   - Integrated chat with canvas
   - Added `isGenerating` state
   - Added `handleComponentGenerated` callback

2. **`app/_components/canvas/CanvasControls.tsx`**
   - Added `isGenerating` prop
   - Shows spinner during generation
   - Loader2 icon replaces RefreshCw when generating

## How It Works

### User Flow:
1. User types a component description in the chat (e.g., "Create a pricing card with three tiers")
2. Message is sent to `/api/chat` endpoint
3. Claude streams a response with the component code wrapped in XML tags
4. ChatInterface extracts the code using regex
5. Code is injected into the canvas editor
6. Preview automatically updates with the new component
7. User can edit the code, save it to Convex, or request modifications

### XML Format:
Claude returns components in this format:

```xml
<stdioArtifact id="component-123" title="Pricing Card">
  <stdioAction type="component">
    function App() {
      return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Pricing</h2>
          {/* Component code here */}
        </div>
      );
    }
    
    ReactDOM.render(<App />, document.getElementById('root'));
  </stdioAction>
</stdioArtifact>
```

### Code Extraction:
ChatInterface uses regex to extract:
- Component title from `<stdioArtifact title="...">`
- Code from `<stdioAction type="component">...</stdioAction>`

### State Management:
- `isGenerating`: Controls spinner visibility during generation
- `code`: Current component code in the editor
- `title`: Component title (extracted from XML or manual edit)
- `refreshKey`: Forces preview refresh when new code is generated

## Component Guidelines

### What Claude Can Generate:
- Single-file React components
- Tailwind CSS styling only (no inline styles)
- Interactive components (buttons, forms, etc.)
- Data visualization (charts, tables)
- Layout components (cards, grids, etc.)
- Animation and transitions

### Limitations:
- Single component per request (no multi-file apps)
- React only (framework is hardcoded to "react")
- Must use standard React patterns (hooks, functional components)
- No external API calls in the component itself
- No external npm packages beyond React and Tailwind

## Example Prompts

### Simple Components:
- "Create a button with primary and secondary variants"
- "Make a card component with an image, title, and description"
- "Build a navigation bar with logo and menu items"

### Complex Components:
- "Create a pricing table with 3 tiers, each showing features and a CTA button"
- "Build a dashboard card with a chart showing monthly revenue"
- "Make a testimonial carousel with auto-rotation"

### Modifications:
- "Add a hover effect that scales the card"
- "Change the color scheme to purple"
- "Add a loading skeleton state"

## Troubleshooting

### TypeScript Error: `Cannot find module 'ai/react'`
1. Clear Next.js cache: `rm -rf .next node_modules/.cache`
2. Restart the dev server: `npm run dev`
3. If error persists, reinstall dependencies: `npm install`

### Chat Not Responding:
1. Check that `ANTHROPIC_API_KEY` is set in `.env.local`
2. Verify the API key is valid at https://console.anthropic.com/
3. Check browser console for errors
4. Check terminal for API errors

### Code Not Appearing in Canvas:
1. Check that the XML format is correct in the response
2. Verify the regex patterns in ChatInterface.tsx
3. Check browser console for extraction errors

### Preview Not Updating:
1. Check for syntax errors in the generated code
2. Verify PreviewFrame is rendering correctly
3. Check that `refreshKey` is updating

## Future Enhancements

Potential improvements:
- Support for Vue.js and other frameworks
- Multi-file component generation
- Component library/templates
- Code formatting/linting
- Export components as npm packages
- Share components with team
- Version history
- AI-powered code review

## Technical Details

### API Configuration:
- Model: `claude-3-5-sonnet-20241022`
- Temperature: `0.7` (balanced creativity/consistency)
- Max Tokens: `4000` (enough for complex components)
- Runtime: Edge (fast global deployment)

### Chat Configuration:
- Streaming: Enabled for real-time feedback
- Auto-scroll: Messages scroll to bottom automatically
- Loading states: Shows "Generating..." message
- Error handling: Displays error messages inline

### Canvas Integration:
- Split layout: 35% chat, 65% canvas
- Responsive: Works on desktop and tablet
- Real-time updates: Preview updates as code is generated
- Persistent state: Code persists between chat sessions
