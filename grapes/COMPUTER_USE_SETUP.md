# Grapes Shape Analysis with Claude & Google Maps

## Overview

This system lets users **draw shapes on a Google Maps embed**, then uses **Claude AI** with the **Google Maps API** to analyze those shapes and calculate their geographic area, identify regions, and provide insights.

## Workflow

```
1. User draws shape on map (rectangle/circle)
   ↓
2. Click "🔍 Analyze" button on toolbar
   ↓
3. Pixel coordinates → Lat/Lng conversion
   ↓
4. Send to Claude with Google Maps API tool
   ↓
5. Claude calculates area & identifies region
   ↓
6. Results displayed in chat panel
```

## Quick Start

1. **Get API Keys**
   
   **Anthropic API:**
   - Visit: https://console.anthropic.com/settings/keys
   - Copy your API key
   
   **Google Maps API:**
   - Visit: https://console.cloud.google.com/apis/credentials
   - Create or select a project
   - Enable these APIs:
     - Geocoding API
     - Maps JavaScript API (optional, for advanced features)
   - Create credentials → API key
   - Copy your API key

2. **Configure Environment**
   ```bash
   # In /grapes/grapes/.env.local
   ANTHROPIC_API_KEY=sk-ant-api03-...your-actual-key...
   GOOGLE_MAPS_API_KEY=AIzaSy...your-actual-key...
   ```

3. **Restart Dev Server**
   ```bash
   cd grapes/grapes
   pnpm dev
   ```

4. **Test It**
   - Visit: http://localhost:8010/demo
   - Draw a shape on the Canada map (use toolbar buttons)
   - Click **🔍 Analyze** button
   - Type your question: "What region is this and how big is the area?"
   - See Claude's analysis with area calculations!

## How It Works

### Architecture

```
User Prompt → Computer Use Panel → API Route → Claude API
                                                    ↓
User Sees Response ← Stream Display ← SSE Stream ←
```

### Files

1. **`/app/api/computer-use/route.ts`**
   - Next.js API route handling Computer Use requests
   - Streams responses using Server-Sent Events
   - Tool definition: 1024x768 virtual display
   - System prompt with map context (toolbar positions, buttons)

2. **`/components/ai/computer-use-panel.tsx`**
   - UI for entering prompts and executing
   - Displays streaming responses from Claude
   - Shows tool use actions
   - Calls `onActionExecute` callback with computer actions

3. **`/app/demo/page.tsx`**
   - Integrates Computer Use panel in sidebar
   - Displays map with overlay in main area
   - `handleComputerAction` logs actions (needs real implementation)

### Tool Actions

Claude can use these computer actions:
- `mouse_move(x, y)` - Move cursor to position
- `left_click` - Click at current position
- `left_click_drag(x1, y1, x2, y2)` - Click and drag
- `key(text)` - Type text
- `screenshot` - Capture current display

### System Context

Claude knows:
- Display: 1024x768px
- Map: Canada (zoomed out)
- Toolbar: Top-left at (16, 16)
- Buttons: Rectangle, Circle, Colors, Clear, Drag
- Drawing workflow: Click tool → Click and drag → Auto-deselect

## Current Status

✅ **Completed:**
- API route with streaming
- UI panel with prompt input
- Integration in demo page
- Environment setup

🔄 **In Progress:**
- Tool action bridge (currently just logs to console)

⏳ **Next Steps:**
- Implement real action execution:
  - Simulate mouse clicks on toolbar buttons
  - Simulate drag gestures for drawing shapes
  - Update map overlay state programmatically
- Add screenshot capture for feedback loop
- Handle multi-turn tool use conversations

## Example Prompts

Try these prompts once your API key is configured:

```
Draw a red circle around Ontario

Mark Vancouver with a blue rectangle

Draw shapes to highlight the three territories: Yukon, Northwest Territories, and Nunavut

Create a green rectangle around Quebec and a yellow circle around Montreal
```

## Troubleshooting

**"Error: ANTHROPIC_API_KEY is not set"**
- Make sure you've added the key to `.env.local`
- Restart your dev server after adding the key

**"No response from Claude"**
- Check your API key is valid
- Check console for API errors
- Verify you have API credits

**"Tool use actions not working"**
- Currently expected - action bridge is not implemented yet
- Actions are logged to console for now
- Need to implement `handleComputerAction` in demo page

## Resources

- [Anthropic Computer Use Docs](https://docs.anthropic.com/claude/docs/computer-use)
- [Claude API Reference](https://docs.anthropic.com/claude/reference/messages_post)
- [Beta Features Guide](https://docs.anthropic.com/claude/docs/beta-features)
