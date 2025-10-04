# Suggestions Integration Guide

## Overview
Implemented clickable suggestion chips for the Nexus Chat empty state, based on AI Elements design patterns. Users can now click pre-defined prompts instead of typing from scratch, improving discoverability and reducing friction.

## Implementation Date
September 30, 2025

## Components Created

### `/components/ai/suggestion.tsx`
A reusable component for displaying horizontally scrollable suggestion pills.

**Components:**
- `Suggestions` - Container with horizontal overflow scrolling
- `Suggestion` - Individual clickable pill button

**Key Features:**
- ✅ Horizontal scrolling with hidden scrollbar
- ✅ Snap scrolling for smooth UX
- ✅ Click-to-send functionality via callback
- ✅ Customizable button variants and sizes
- ✅ Rounded pill styling
- ✅ Hover animations (scale on hover/active)

**API:**

```tsx
<Suggestions className="justify-center">
  <Suggestion
    suggestion="Your question here"
    onClick={(text) => sendMessage(text)}
    variant="outline"
    size="sm"
    className="custom-classes"
  />
</Suggestions>
```

## Integration Points

### Modified Files

#### 1. `/lib/services/sessionManager/NexusChat.tsx`

**Added Imports:**
```tsx
import { Suggestions, Suggestion } from "@/components/ai/suggestion";
```

**Added Handler:**
```tsx
const handleSuggestionClick = async (suggestion: string) => {
  if (isStreaming || disabled) return;
  onMessageSent?.(suggestion);
  try {
    await sendMessage(suggestion);
    console.log('[NexusChat] Suggestion sent successfully:', suggestion);
  } catch (err) {
    console.error('[NexusChat] Failed to send suggestion:', err);
  }
};
```

**Replaced Empty State:**
Removed static example cards, added clickable Suggestion pills:

```tsx
<Suggestions className="justify-center">
  <Suggestion
    suggestion="How are my data metrics for the week?"
    onClick={handleSuggestionClick}
    className="bg-neutral-900 border-neutral-800 text-cyan-400 hover:bg-neutral-800 hover:border-cyan-400/50"
  />
  <Suggestion
    suggestion="Show me token usage trends"
    onClick={handleSuggestionClick}
    className="bg-neutral-900 border-neutral-800 text-purple-400 hover:bg-neutral-800 hover:border-purple-400/50"
  />
  <Suggestion
    suggestion="What's my current system health?"
    onClick={handleSuggestionClick}
    className="bg-neutral-900 border-neutral-800 text-green-400 hover:bg-neutral-800 hover:border-green-400/50"
  />
  <Suggestion
    suggestion="Analyze my engagement metrics"
    onClick={handleSuggestionClick}
    className="bg-neutral-900 border-neutral-800 text-orange-400 hover:bg-neutral-800 hover:border-orange-400/50"
  />
</Suggestions>
```

#### 2. `/app/globals.css`

**Added Utility:**
```css
@layer utilities {
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}
```

## Design System Integration

### Color Scheme
Matches existing NexusChat dark theme:
- **Background:** `bg-neutral-900`
- **Border:** `border-neutral-800`
- **Text Colors:** Color-coded by suggestion type
  - Cyan (`text-cyan-400`) - Data/Metrics queries
  - Purple (`text-purple-400`) - Token/Usage queries
  - Green (`text-green-400`) - System/Health queries
  - Orange (`text-orange-400`) - Analytics/Engagement queries

### Hover States
- Background: `hover:bg-neutral-800`
- Border: `hover:border-{color}-400/50`
- Scale: `hover:scale-[1.02]`
- Active: `active:scale-[0.98]`

### Typography
- Size: `sm` variant (h-8, px-3)
- Font: Inherits from Button component (text-sm, font-medium)
- Whitespace: `whitespace-nowrap` prevents wrapping

## User Flow

1. **Empty State:** User sees chat interface with no messages
2. **Display:** 4 suggestion pills appear below "Ask me anything" prompt
3. **Hover:** Pill scales up slightly, border and background colors highlight
4. **Click:** 
   - Suggestion text sent to `handleSuggestionClick`
   - Message appears in chat as user message
   - Agent processes and responds
   - Empty state disappears (messages.length > 0)

## Accessibility

- ✅ Keyboard navigation via Tab
- ✅ Enter/Space to activate
- ✅ Focus visible states (inherited from Button)
- ✅ ARIA attributes from Button component
- ✅ Semantic button elements

## Mobile Considerations

- ✅ Touch-friendly pill size (h-8 = 32px minimum tap target)
- ✅ Horizontal scrolling with momentum
- ✅ Snap scrolling for better alignment
- ✅ Hidden scrollbar for clean appearance

## Future Enhancements

### Dynamic Suggestions
Consider generating suggestions based on:
- User's recent queries
- Session context
- Available analytics data
- Time of day/week

**Example:**
```tsx
const [suggestions, setSuggestions] = useState(defaultSuggestions);

useEffect(() => {
  if (sessionId) {
    // Fetch contextual suggestions based on session data
    const contextualSuggestions = generateSuggestions(sessionId);
    setSuggestions(contextualSuggestions);
  }
}, [sessionId]);
```

### Follow-Up Suggestions
Show contextual suggestions after agent responses:

```tsx
{message.role === 'assistant' && message.followUpSuggestions && (
  <div className="mt-4">
    <p className="text-xs text-neutral-500 mb-2">You might also ask:</p>
    <Suggestions>
      {message.followUpSuggestions.map((suggestion, i) => (
        <Suggestion
          key={i}
          suggestion={suggestion}
          onClick={handleSuggestionClick}
          variant="ghost"
          size="sm"
        />
      ))}
    </Suggestions>
  </div>
)}
```

### Analytics Tracking
Track which suggestions get clicked:

```tsx
const handleSuggestionClick = async (suggestion: string) => {
  // Track analytics
  analytics.track('suggestion_clicked', {
    suggestion,
    sessionId,
    timestamp: Date.now(),
  });
  
  // Send message
  await sendMessage(suggestion);
};
```

### Suggestion Rotation
Show different suggestions on each visit:

```tsx
const defaultSuggestions = [
  "How are my data metrics for the week?",
  "Show me token usage trends",
  "What's my current system health?",
  "Analyze my engagement metrics",
  "Review my cost analysis",
  "Check active sessions",
  "Search recent messages",
];

const getRandomSuggestions = (count = 4) => {
  return defaultSuggestions
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
};
```

## Testing Checklist

- [x] Suggestions appear on empty chat state
- [x] Clicking suggestion sends message
- [x] Suggestions disappear when messages exist
- [x] Hover states work correctly
- [x] Colors match design system
- [x] Horizontal scrolling works (if > 4 suggestions)
- [x] Keyboard navigation works
- [x] Disabled state respected (when streaming/disabled)
- [ ] Mobile touch scrolling tested
- [ ] Screen reader announces buttons correctly
- [ ] Multi-line suggestions wrap gracefully
- [ ] Long suggestion text truncates properly

## Dependencies

**Existing:**
- `@/components/ui/button` - Base button component
- `@/lib/utils` - cn() utility for class merging
- `class-variance-authority` - Button variant system

**No New Dependencies Required** ✅

## Best Practices

1. **Keep suggestions short:** 3-7 words per suggestion
2. **Use action verbs:** "Show", "Analyze", "Check", "Review"
3. **Be specific:** Clear about what the query will do
4. **Color code:** Use colors to indicate query type
5. **Limit count:** 3-5 visible suggestions prevent overwhelm
6. **Context matters:** Tailor suggestions to user's session/state

## Related Documentation

- [AI Elements - Suggestion Component](https://ai-sdk.dev/elements/suggestion)
- [PromptInput Enhancement](./.docs/sessions/prompt-input-enhancement.md)
- [Auto-Scroll Enhancement](./.docs/sessions/auto-scroll-enhancement.md)
- [Reasoning Enhancement](./.docs/sessions/reasoning-enhancement.md)
- [Session Manager Architecture](./.docs/sessions/sessionManager.md)

## Notes

- Suggestions complement the enhanced PromptInput component
- Works seamlessly with Conversation auto-scroll
- Follows same design patterns as other AI Elements components
- No external scroll library needed (native overflow-x-auto)
- CSS scrollbar-hide utility provides clean horizontal scrolling
