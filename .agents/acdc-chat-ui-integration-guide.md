# ACDC Chat UI Integration Guide
**Version:** 1.0  
**Date:** September 30, 2025  
**Focus:** Complete UI Component Library for ACDC Agents

---

## 📋 Overview

This guide documents the **complete chat UI component system** that integrates with the ACDC Framework. These components provide a professional, production-ready interface for conversational AI applications with streaming support, auto-scrolling, reasoning displays, and more.

**Component Library:**
1. **Conversation** - Auto-scrolling message container
2. **PromptInput** - Auto-resizing textarea with submit
3. **Reasoning** - Collapsible thinking/tool execution display
4. **Response** - Streaming-optimized markdown renderer
5. **Suggestions** - Quick-start prompt chips
6. **Message** - Individual message bubbles

---

## 🎨 Part 1: Conversation Component

### Purpose
Auto-scrolling container that keeps users at the bottom during streaming while allowing them to scroll up to read history.

### Installation

Component files are installed as part of the AI Elements package:
```bash
npm install ai
```

### Basic Usage

```tsx
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai/conversation";
import { Message, MessageContent } from "@/components/ai/message";

export function ChatInterface({ messages }: { messages: Message[] }) {
  return (
    <Conversation className="relative w-full h-[500px]">
      <ConversationContent>
        {messages.map((msg) => (
          <Message key={msg.id} from={msg.role}>
            <MessageContent>{msg.content}</MessageContent>
          </Message>
        ))}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
```

### Features

- **Auto-scroll behavior**: Automatically scrolls to bottom when new messages arrive
- **Smart preservation**: Stays at current position when user scrolls up to read
- **Scroll button**: Appears when user is scrolled up, disappears at bottom
- **Smooth animations**: Configurable scroll behavior (smooth, instant, auto)
- **Responsive design**: Works on mobile and desktop
- **Keyboard navigation**: End/Home/PageUp/PageDown support

### API Reference

#### Conversation
Main container with scroll management.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initial` | `ScrollBehavior` | `"smooth"` | Initial scroll behavior |
| `resize` | `ScrollBehavior` | `"smooth"` | Behavior on resize |
| `className` | `string` | - | Additional CSS classes |
| `style` | `CSSProperties` | - | Inline styles (set height here) |

#### ConversationContent
Wrapper for messages with consistent spacing.

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Message components |
| `className` | `string` | Additional CSS classes |

#### ConversationScrollButton
Floating button to jump to bottom.

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | Additional CSS classes |

### Integration with ACDC

```tsx
"use client";

import { useACDCAgent } from '@/lib/hooks/useACDCAgent';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai/conversation";
import { Message, MessageContent } from "@/components/ai/message";
import { Response } from "@/components/ai/response";

export function ACDCConversation({ sessionId }: { sessionId: string }) {
  const { messages, isStreaming } = useACDCAgent({
    agentId: 'session-manager-agent',
    sessionId,
  });

  return (
    <Conversation className="flex-1">
      <ConversationContent>
        {messages.map((msg) => (
          <Message key={msg.id} from={msg.role}>
            <MessageContent>
              <Response>{msg.content}</Response>
            </MessageContent>
          </Message>
        ))}
        
        {isStreaming && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
```

### Best Practices

1. **Always set explicit height**: Use `h-[500px]` or `flex-1` in a flex container
2. **Test with long conversations**: Verify performance with 100+ messages
3. **Handle image loading**: Use fixed dimensions to prevent scroll jumps
4. **Mobile testing**: Verify momentum scrolling on iOS Safari
5. **Loading states**: Show skeleton or spinner while messages load

---

## ⌨️ Part 2: PromptInput Component

### Purpose
Auto-resizing textarea with Enter/Shift+Enter shortcuts and submit button with status indicators.

### Basic Usage

```tsx
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from "@/components/ai/prompt-input";

export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input);
      setInput("");
    }
  };

  return (
    <PromptInput onSubmit={handleSubmit}>
      <PromptInputTextarea
        value={input}
        onChange={(e) => setInput(e.currentTarget.value)}
        placeholder="Type your message..."
      />
      <PromptInputSubmit disabled={disabled || !input.trim()} />
    </PromptInput>
  );
}
```

### Features

- **Auto-resize**: Grows with content, respects min/max height
- **Keyboard shortcuts**: Enter to submit, Shift+Enter for new line
- **Status indicators**: Different icons for ready/streaming/error states
- **Form validation**: Prevents empty submissions
- **Focus management**: Returns focus after submit
- **Mobile-friendly**: Adapts to virtual keyboards

### API Reference

#### PromptInput
Form container.

| Prop | Type | Description |
|------|------|-------------|
| `onSubmit` | `FormEventHandler` | Form submission handler |
| `className` | `string` | Additional CSS classes |

#### PromptInputTextarea
Auto-resizing textarea.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | `string` | `"What would you like to know?"` | Placeholder text |
| `minHeight` | `number` | `48` | Minimum height in pixels |
| `maxHeight` | `number` | `164` | Maximum height in pixels |
| `value` | `string` | - | Controlled value |
| `onChange` | `ChangeEventHandler` | - | Change handler |
| `className` | `string` | - | Additional CSS classes |

#### PromptInputSubmit
Submit button with status.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `'ready' \| 'streaming' \| 'error'` | `'ready'` | Current status |
| `disabled` | `boolean` | `false` | Disabled state |
| `variant` | `ButtonVariant` | `'default'` | Button style |
| `size` | `ButtonSize` | `'icon'` | Button size |

### Advanced: Toolbar with Model Selection

```tsx
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectValue,
} from "@/components/ai/prompt-input";
import { PaperclipIcon, MicIcon } from "lucide-react";

const models = [
  { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet" },
  { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku" },
];

export function AdvancedPromptInput() {
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(models[0].id);

  return (
    <PromptInput onSubmit={handleSubmit}>
      <PromptInputTextarea
        value={input}
        onChange={(e) => setInput(e.currentTarget.value)}
        placeholder="Type your message..."
      />
      <PromptInputToolbar>
        <PromptInputTools>
          <PromptInputButton>
            <PaperclipIcon size={16} />
          </PromptInputButton>
          <PromptInputButton>
            <MicIcon size={16} />
            <span>Voice</span>
          </PromptInputButton>
          <PromptInputModelSelect
            value={selectedModel}
            onValueChange={setSelectedModel}
          >
            <PromptInputModelSelectTrigger>
              <PromptInputModelSelectValue />
            </PromptInputModelSelectTrigger>
            <PromptInputModelSelectContent>
              {models.map((model) => (
                <PromptInputModelSelectItem key={model.id} value={model.id}>
                  {model.name}
                </PromptInputModelSelectItem>
              ))}
            </PromptInputModelSelectContent>
          </PromptInputModelSelect>
        </PromptInputTools>
        <PromptInputSubmit disabled={!input.trim()} />
      </PromptInputToolbar>
    </PromptInput>
  );
}
```

### Integration with ACDC

```tsx
export function ACDCPromptInput() {
  const [input, setInput] = useState("");
  const { sendMessage, isStreaming } = useACDCAgent({
    agentId: 'session-manager-agent',
    sessionId,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  return (
    <PromptInput onSubmit={handleSubmit}>
      <PromptInputTextarea
        value={input}
        onChange={(e) => setInput(e.currentTarget.value)}
        placeholder="Ask about your session metrics..."
      />
      <PromptInputSubmit 
        disabled={!input.trim()} 
        status={isStreaming ? 'streaming' : 'ready'} 
      />
    </PromptInput>
  );
}
```

### Best Practices

1. **Clear input after submit**: Always reset to empty string
2. **Disable while streaming**: Prevent multiple concurrent requests
3. **Return focus**: Keep textarea focused for continuous conversation
4. **Validate before submit**: Check for empty or whitespace-only input
5. **Save drafts**: Consider localStorage for unsent messages
6. **Mobile keyboard**: Test Enter behavior on iOS/Android

---

## 🧠 Part 3: Reasoning Component

### Purpose
Collapsible display for AI thinking process, including tool execution details. Shows users what the AI is doing "under the hood."

### Basic Usage

```tsx
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai/reasoning";

export function ThinkingDisplay({ 
  isThinking, 
  content 
}: {
  isThinking: boolean;
  content: string;
}) {
  return (
    <Reasoning isStreaming={isThinking} defaultOpen={false}>
      <ReasoningTrigger title="Thinking" />
      <ReasoningContent>{content}</ReasoningContent>
    </Reasoning>
  );
}
```

### Features

- **Auto-open/close**: Opens when streaming starts, closes when complete
- **Manual control**: Users can toggle anytime
- **Duration tracking**: Shows "Thought for X seconds"
- **Smooth animations**: Expand/collapse transitions
- **Keyboard accessible**: Space/Enter to toggle
- **Works with streaming**: Updates content in real-time

### API Reference

#### Reasoning
Container managing reasoning state.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isStreaming` | `boolean` | `false` | Auto-opens when true |
| `open` | `boolean` | - | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Initial state |
| `onOpenChange` | `(open: boolean) => void` | - | State change callback |
| `duration` | `number` | `0` | Thinking duration in seconds |
| `className` | `string` | - | Additional CSS classes |

#### ReasoningTrigger
Clickable trigger button.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `"Reasoning"` | Custom title |
| `className` | `string` | - | Additional CSS classes |

#### ReasoningContent
Content container.

| Prop | Type | Description |
|------|------|-------------|
| `children` | `string \| ReactNode` | **Required** - Reasoning text |
| `className` | `string` | Additional CSS classes |

### Integration with ACDC: Tool Call Display

The **key innovation** for ACDC is using Reasoning components to show tool execution:

```tsx
export function ACDCMessageWithTools({ message }: { message: ACDCMessage }) {
  return (
    <Message from={message.role}>
      <MessageContent>
        {/* Main response */}
        <Response>{message.content}</Response>
        
        {/* Tool calls as reasoning blocks */}
        {message.toolCalls?.map((toolCall, idx) => (
          <Reasoning key={idx} defaultOpen={false}>
            <ReasoningTrigger title={`Tool: ${getToolLabel(toolCall.name)}`} />
            <ReasoningContent>
              <div className="space-y-3 text-sm">
                {/* Tool description */}
                <div className="text-muted-foreground">
                  {getToolDescription(toolCall.name)}
                </div>
                
                {/* Input parameters */}
                <div>
                  <div className="font-semibold mb-1">Input:</div>
                  <pre className="p-3 bg-muted rounded-md text-xs overflow-x-auto">
                    {JSON.stringify(toolCall.input, null, 2)}
                  </pre>
                </div>
                
                {/* Result data */}
                {toolCall.result && (
                  <div>
                    <div className="font-semibold mb-1">Result:</div>
                    <pre className="p-3 bg-muted rounded-md text-xs overflow-x-auto">
                      {JSON.stringify(toolCall.result, null, 2)}
                    </pre>
                  </div>
                )}
                
                {/* Execution metadata */}
                {toolCall.duration && (
                  <div className="text-xs text-muted-foreground">
                    Executed in {toolCall.duration}ms
                  </div>
                )}
              </div>
            </ReasoningContent>
          </Reasoning>
        ))}
      </MessageContent>
    </Message>
  );
}

// Helper functions for friendly labels
function getToolLabel(toolName: string): string {
  const labels: Record<string, string> = {
    analyze_session_metrics: '📊 Session Metrics',
    analyze_token_usage: '🎫 Token Usage',
    search_session_messages: '🔍 Message Search',
    get_active_sessions: '🟢 Active Sessions',
    analyze_engagement: '👥 Engagement',
    check_system_health: '💚 System Health',
    analyze_costs: '💰 Cost Analysis',
  };
  return labels[toolName] || toolName;
}

function getToolDescription(toolName: string): string {
  const descriptions: Record<string, string> = {
    analyze_session_metrics: 'Retrieved session activity data and performance metrics',
    analyze_token_usage: 'Analyzed token consumption and costs',
    search_session_messages: 'Searched through conversation history',
    get_active_sessions: 'Listed currently active sessions',
    analyze_engagement: 'Analyzed user engagement patterns',
    check_system_health: 'Checked system operational status',
    analyze_costs: 'Analyzed spending and budget',
  };
  return descriptions[toolName] || 'Executed tool';
}
```

### Advanced: Real-time Tool Streaming

For showing tools as they execute:

```tsx
export function StreamingToolDisplay() {
  const { messages, isStreaming } = useACDCAgent({
    agentId: 'session-manager-agent',
    sessionId,
    onChunk: (chunk) => {
      if (chunk.type === 'tool_call') {
        // Tool is being called right now
        console.log('Tool executing:', chunk.data);
      }
    },
  });
  
  return (
    <div>
      {messages.map((msg) => (
        <Message key={msg.id} from={msg.role}>
          <MessageContent>
            <Response>{msg.content}</Response>
            
            {/* Show in-progress tools */}
            {msg.toolCalls?.map((tool, idx) => (
              <Reasoning
                key={idx}
                isStreaming={isStreaming && !tool.result}
                defaultOpen={isStreaming && !tool.result}
              >
                <ReasoningTrigger title={`Tool: ${tool.name}`} />
                <ReasoningContent>
                  {tool.result ? (
                    <ToolResult tool={tool} />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin">⏳</div>
                      <span>Executing...</span>
                    </div>
                  )}
                </ReasoningContent>
              </Reasoning>
            ))}
          </MessageContent>
        </Message>
      ))}
    </div>
  );
}
```

### Best Practices

1. **Default closed**: Most users don't care about internals
2. **Auto-open during execution**: Shows activity for transparency
3. **Pretty-print JSON**: Use `JSON.stringify(data, null, 2)`
4. **Add context**: Explain what each tool does
5. **Show duration**: "Executed in 234ms" builds trust
6. **Limit nesting**: Don't show too many levels of detail
7. **Mobile-friendly**: Ensure JSON is scrollable on small screens

---

## 📝 Part 4: Response Component

### Purpose
Markdown renderer optimized for streaming AI responses. Handles incomplete formatting gracefully.

### Basic Usage

```tsx
import { Response } from "@/components/ai/response";

export function AIResponse({ content }: { content: string }) {
  return <Response>{content}</Response>;
}
```

### Features

- **Streaming-optimized**: Auto-completes incomplete formatting
- **Rich markdown**: Headers, lists, tables, blockquotes
- **Syntax highlighting**: Multi-language code blocks with copy buttons
- **Math support**: LaTeX via rehype-katex
- **GFM features**: Tables, task lists, strikethrough
- **Smart hiding**: Incomplete links/images hidden until ready
- **Security**: XSS protection and URL validation

### API Reference

#### Response
Markdown renderer.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `string \| ReactNode` | - | **Required** - Markdown content |
| `allowedImagePrefixes` | `string[]` | `["*"]` | Allowed image URLs |
| `allowedLinkPrefixes` | `string[]` | `["*"]` | Allowed link URLs |
| `defaultOrigin` | `string` | - | Default origin for relative URLs |
| `parseIncompleteMarkdown` | `boolean` | `true` | Enable streaming optimization |
| `className` | `string` | - | Additional CSS classes |

### Streaming Optimizations

The Response component intelligently handles incomplete markdown:

**Auto-completion:**
- `**incomplete bold` → `**incomplete bold**`
- `*incomplete italic` → `*incomplete italic*`
- `` `incomplete code `` → `` `incomplete code` ``
- `~~incomplete strike` → `~~incomplete strike~~`

**Hiding incomplete:**
- `[incomplete link text` → Hidden until `]` arrives
- `![incomplete alt` → Hidden until `]` arrives
- Preserves code block boundaries

### Integration with ACDC

```tsx
export function ACDCResponse() {
  const { messages } = useACDCAgent({
    agentId: 'session-manager-agent',
    sessionId,
  });
  
  return (
    <div>
      {messages.map((msg) => (
        <Message key={msg.id} from={msg.role}>
          <MessageContent>
            <Response
              allowedImagePrefixes={[
                "https://yourdomain.com",
                "https://cdn.example.com"
              ]}
              allowedLinkPrefixes={[
                "https://",
                "mailto:"
              ]}
            >
              {msg.content}
            </Response>
          </MessageContent>
        </Message>
      ))}
    </div>
  );
}
```

### Security Configuration

**Production settings:**

```tsx
<Response
  allowedImagePrefixes={[
    "https://yourdomain.com",
    "https://images.unsplash.com",
    "data:",  // For base64 images
  ]}
  allowedLinkPrefixes={[
    "https://",  // Only HTTPS links
    "mailto:",   // Email links
    "/",         // Internal links
  ]}
  parseIncompleteMarkdown={true}
>
  {content}
</Response>
```

### Best Practices

1. **Security first**: Always restrict URL prefixes in production
2. **Test streaming**: Verify incomplete markdown is handled
3. **Code language detection**: Use proper language tags (```javascript)
4. **Image dimensions**: Provide fixed dimensions to prevent layout shift
5. **Long content**: Consider truncation or "Show more" for very long responses
6. **Math equations**: Use `$inline$` and `$$block$$` syntax

---

## ✨ Part 5: Suggestions Component

### Purpose
Horizontal scrolling suggestion chips for quick-start prompts and follow-ups.

### Basic Usage

```tsx
import { Suggestions, Suggestion } from "@/components/ai/suggestion";

export function SuggestionChips() {
  const handleClick = (suggestion: string) => {
    console.log('Clicked:', suggestion);
  };

  return (
    <Suggestions>
      <Suggestion
        suggestion="What can you help me with?"
        onClick={handleClick}
      />
      <Suggestion
        suggestion="Show me session metrics"
        onClick={handleClick}
      />
      <Suggestion
        suggestion="Analyze token usage"
        onClick={handleClick}
      />
    </Suggestions>
  );
}
```

### Features

- **Horizontal scrolling**: Clean overflow handling
- **Click-to-send**: Direct message submission
- **Customizable styling**: Variant and size options
- **Touch-friendly**: Works great on mobile
- **Hidden scrollbar**: Clean visual appearance
- **Keyboard navigation**: Tab through suggestions

### API Reference

#### Suggestions
Scrollable container.

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Suggestion components |
| `className` | `string` | Additional CSS classes |

#### Suggestion
Individual clickable chip.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `suggestion` | `string` | - | **Required** - Text to display |
| `onClick` | `(suggestion: string) => void` | - | Click handler |
| `variant` | `ButtonVariant` | `"outline"` | Button style |
| `size` | `ButtonSize` | `"sm"` | Button size |
| `className` | `string` | - | Additional CSS classes |

### Integration with ACDC: Starter Prompts

```tsx
export function ACDCStarterPrompts() {
  const { sendMessage } = useACDCAgent({
    agentId: 'session-manager-agent',
    sessionId,
  });

  const starterPrompts = [
    "How are my data metrics for the week?",
    "Show me token usage statistics",
    "What's my session activity today?",
    "List all active sessions",
    "Analyze user engagement patterns",
    "Check system health status",
  ];

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h2 className="text-2xl font-semibold mb-4">
        How can I help you today?
      </h2>
      <p className="text-muted-foreground mb-6">
        Try one of these questions to get started
      </p>
      <Suggestions>
        {starterPrompts.map((prompt) => (
          <Suggestion
            key={prompt}
            suggestion={prompt}
            onClick={sendMessage}
          />
        ))}
      </Suggestions>
    </div>
  );
}
```

### Advanced: Context-Based Follow-ups

Generate dynamic suggestions based on conversation:

```tsx
export function DynamicSuggestions() {
  const { messages, sendMessage } = useACDCAgent({
    agentId: 'session-manager-agent',
    sessionId,
  });

  const [followUps, setFollowUps] = useState<string[]>([]);

  // Generate follow-ups based on last message
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        // Generate contextual suggestions
        const suggestions = generateFollowUps(lastMessage.content);
        setFollowUps(suggestions);
      }
    }
  }, [messages]);

  if (followUps.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="text-sm text-muted-foreground mb-2">
        Follow-up questions:
      </div>
      <Suggestions>
        {followUps.map((prompt) => (
          <Suggestion
            key={prompt}
            suggestion={prompt}
            onClick={sendMessage}
          />
        ))}
      </Suggestions>
    </div>
  );
}

function generateFollowUps(content: string): string[] {
  // AI-powered or rule-based suggestion generation
  if (content.includes('session metrics')) {
    return [
      "Show me detailed breakdown",
      "Compare to last week",
      "Export this data",
    ];
  }
  if (content.includes('token usage')) {
    return [
      "What's my daily average?",
      "Show cost trends",
      "Set budget alerts",
    ];
  }
  return [];
}
```

### Best Practices

1. **Keep suggestions short**: 3-7 words maximum
2. **Use action verbs**: "Show", "Analyze", "Find", "Help with"
3. **Rotate suggestions**: Different prompts on each visit
4. **Context matters**: Show relevant follow-ups after responses
5. **Track clicks**: Analytics help improve suggestions
6. **Limit count**: 3-5 visible suggestions works best
7. **Mobile scrolling**: Test touch scrolling thoroughly

---

## 🎯 Part 6: Complete Integration Example

### Full ACDC Chat Component

```tsx
"use client";

import { useState } from "react";
import { useACDCAgent } from '@/lib/hooks/useACDCAgent';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai/conversation";
import { Message, MessageContent } from "@/components/ai/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from "@/components/ai/prompt-input";
import { Response } from "@/components/ai/response";
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai/reasoning";
import { Suggestions, Suggestion } from "@/components/ai/suggestion";

const STARTER_PROMPTS = [
  "How are my data metrics for the week?",
  "Show me token usage statistics",
  "What's my session activity?",
  "List all active sessions",
  "Check system health",
];

const TOOL_LABELS: Record<string, string> = {
  analyze_session_metrics: '📊 Session Metrics',
  analyze_token_usage: '🎫 Token Usage',
  search_session_messages: '🔍 Message Search',
  get_active_sessions: '🟢 Active Sessions',
  analyze_engagement: '👥 Engagement',
  check_system_health: '💚 System Health',
  analyze_costs: '💰 Cost Analysis',
};

export function ACDCChat({ sessionId }: { sessionId: string }) {
  const [input, setInput] = useState("");
  
  const {
    messages,
    isStreaming,
    error,
    sendMessage,
  } = useACDCAgent({
    agentId: 'session-manager-agent',
    sessionId,
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };
  
  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Empty state */}
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-6xl mb-6">🤖</div>
          <h1 className="text-3xl font-bold mb-2">
            Session Manager Agent
          </h1>
          <p className="text-lg text-muted-foreground mb-8 text-center max-w-md">
            I can help you analyze session metrics, track token usage, 
            and monitor system health.
          </p>
          <div className="w-full max-w-2xl">
            <div className="text-sm font-medium mb-3">Try asking:</div>
            <Suggestions>
              {STARTER_PROMPTS.map((prompt) => (
                <Suggestion
                  key={prompt}
                  suggestion={prompt}
                  onClick={handleSuggestionClick}
                />
              ))}
            </Suggestions>
          </div>
        </div>
      )}
      
      {/* Messages */}
      {messages.length > 0 && (
        <Conversation className="flex-1">
          <ConversationContent>
            {messages.map((msg) => (
              <Message key={msg.id} from={msg.role}>
                <MessageContent>
                  {/* Main response */}
                  <Response
                    allowedImagePrefixes={["https://", "data:"]}
                    allowedLinkPrefixes={["https://", "mailto:", "/"]}
                  >
                    {msg.content}
                  </Response>
                  
                  {/* Tool calls */}
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {msg.toolCalls.map((tool, idx) => (
                        <Reasoning key={idx} defaultOpen={false}>
                          <ReasoningTrigger 
                            title={TOOL_LABELS[tool.name] || tool.name} 
                          />
                          <ReasoningContent>
                            <div className="space-y-3 text-sm">
                              {/* Input */}
                              <div>
                                <div className="font-semibold mb-1">Input:</div>
                                <pre className="p-3 bg-muted rounded-md text-xs overflow-x-auto">
                                  {JSON.stringify(tool.input, null, 2)}
                                </pre>
                              </div>
                              
                              {/* Result */}
                              {tool.result && (
                                <div>
                                  <div className="font-semibold mb-1">Result:</div>
                                  <pre className="p-3 bg-muted rounded-md text-xs overflow-x-auto">
                                    {JSON.stringify(tool.result, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </ReasoningContent>
                        </Reasoning>
                      ))}
                    </div>
                  )}
                </MessageContent>
              </Message>
            ))}
            
            {/* Streaming indicator */}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-4 flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Analyzing...
                  </span>
                </div>
              </div>
            )}
            
            {/* Error display */}
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg">
                <div className="font-semibold mb-1">Error</div>
                <div className="text-sm">{error}</div>
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      )}
      
      {/* Input */}
      <div className="border-t bg-background p-4">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder="Ask about your session metrics..."
            minHeight={48}
            maxHeight={200}
          />
          <PromptInputSubmit 
            disabled={!input.trim()} 
            status={isStreaming ? 'streaming' : 'ready'} 
          />
        </PromptInput>
      </div>
    </div>
  );
}
```

### Tailwind CSS Setup

Add these animations to `tailwind.config.ts`:

```typescript
export default {
  theme: {
    extend: {
      animation: {
        'bounce': 'bounce 1s infinite',
      },
      keyframes: {
        bounce: {
          '0%, 100%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(-25%)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
      },
    },
  },
};
```

---

## 📱 Part 7: Mobile Optimization

### Responsive Design Checklist

- [ ] **Conversation height**: Use `h-[calc(100vh-200px)]` or similar
- [ ] **Input positioning**: Fixed at bottom on mobile
- [ ] **Suggestion scrolling**: Test horizontal scrolling with touch
- [ ] **Code blocks**: Horizontal scroll for wide content
- [ ] **Reasoning panels**: Ensure JSON is readable
- [ ] **Touch targets**: Minimum 44px tap targets
- [ ] **Virtual keyboard**: Handle keyboard appearance
- [ ] **Momentum scrolling**: Enable on iOS

### Mobile-Specific Styles

```tsx
<div className="flex flex-col h-[100dvh]">
  {/* Messages - dynamic height */}
  <Conversation className="flex-1 min-h-0">
    <ConversationContent>
      {messages.map((msg) => (
        <Message key={msg.id} from={msg.role}>
          <MessageContent className="max-w-[85vw]">
            {/* Content with max width for readability */}
            <Response>{msg.content}</Response>
          </MessageContent>
        </Message>
      ))}
    </ConversationContent>
  </Conversation>
  
  {/* Input - fixed height */}
  <div className="border-t bg-background p-4 safe-area-bottom">
    <PromptInput onSubmit={handleSubmit}>
      <PromptInputTextarea
        value={input}
        onChange={(e) => setInput(e.currentTarget.value)}
        className="text-base" // Prevents zoom on iOS
      />
      <PromptInputSubmit disabled={!input.trim()} />
    </PromptInput>
  </div>
</div>
```

---

## 🎨 Part 8: Theming & Customization

### Dark Mode Support

All components support dark mode via Tailwind's `dark:` prefix:

```tsx
// components.json configuration ensures proper theming
{
  "style": "default",
  "tailwind": {
    "baseColor": "slate",
    "cssVariables": true
  }
}
```

### Custom Styling

```tsx
// Custom message bubble colors
<Message 
  from="assistant"
  className="[&_.message-content]:bg-blue-50 dark:[&_.message-content]:bg-blue-950"
>
  <MessageContent>{content}</MessageContent>
</Message>

// Custom input styling
<PromptInputTextarea
  className="font-mono text-sm"
  placeholder="Enter command..."
/>

// Custom suggestion variants
<Suggestion
  suggestion="Premium Feature"
  variant="default"
  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
  onClick={handleClick}
/>
```

---

## ✅ Part 9: Testing Checklist

### Component Testing

- [ ] **Conversation**: Auto-scroll works on new messages
- [ ] **Conversation**: Scroll button appears when scrolled up
- [ ] **Conversation**: Preserves position when reading history
- [ ] **Input**: Enter submits, Shift+Enter adds new line
- [ ] **Input**: Auto-resizes with content
- [ ] **Input**: Disabled during streaming
- [ ] **Reasoning**: Auto-opens during execution
- [ ] **Reasoning**: Duration tracking works
- [ ] **Reasoning**: Manual toggle works
- [ ] **Response**: Markdown renders correctly
- [ ] **Response**: Code syntax highlighting works
- [ ] **Response**: Incomplete formatting handled
- [ ] **Suggestions**: Horizontal scroll works
- [ ] **Suggestions**: Click sends message
- [ ] **Suggestions**: Touch-friendly on mobile

### Integration Testing

- [ ] **Empty state**: Starter prompts display
- [ ] **First message**: Suggestion click works
- [ ] **Streaming**: Real-time updates appear
- [ ] **Tool calls**: Display as reasoning blocks
- [ ] **Tool results**: JSON pretty-printed
- [ ] **Errors**: Error messages display
- [ ] **Long conversations**: Performance is good
- [ ] **Mobile**: All features work on touch devices

---

## 📚 Part 10: Resources

### Official Documentation

- **AI Elements**: https://ai-sdk.dev/elements/overview
- **Vercel AI SDK**: https://sdk.vercel.ai/docs
- **Anthropic API**: https://docs.anthropic.com/claude/docs
- **Shadcn UI**: https://ui.shadcn.com

### Component Source

All components are open source and available in your project:
- `components/ai/conversation.tsx`
- `components/ai/prompt-input.tsx`
- `components/ai/reasoning.tsx`
- `components/ai/response.tsx`
- `components/ai/suggestion.tsx`
- `components/ai/message.tsx`

### Getting Help

- Discord: https://discord.com/invite/Z9NVtNE7bj
- GitHub Issues: Report bugs or request features
- Documentation: Detailed API references and examples

---

## 🎯 Conclusion

The ACDC Chat UI component library provides a **complete, production-ready interface** for conversational AI applications. Key benefits:

✅ **Auto-scrolling conversations** - No manual scrolling needed  
✅ **Smart input handling** - Enter/Shift+Enter works correctly  
✅ **Transparent AI reasoning** - Users see tool execution  
✅ **Streaming-optimized** - Real-time updates without flickering  
✅ **Mobile-friendly** - Works great on all devices  
✅ **Fully customizable** - Theme and style to match your brand  

These components integrate seamlessly with the ACDC Framework to create professional, trustworthy AI experiences.
