# Editor Component Implementation Guide

## Overview

The Editor component transforms producer-generated content into visually appealing, community-ready stories. It operates as a secondary processing layer that accepts structured content from the producer, enriches it with additional data, and provides real-time AI-assisted editing capabilities.

## Architecture

### Core Components

```
Editor System
├── EditorProvider           # Main state management and orchestration
├── EditorCanvas            # TipTap editor instance with AI integration
├── EditorToolbar           # Editing tools and AI commands
├── EditorPreview           # Live preview of changes
├── EditorAnalytics         # Track edits and improvements
└── EditorPublisher         # Final publishing workflow
```

## Workflow

### 1. Content Ingestion
- Editor accepts structured content from producer
- Initial content is staged in preview immediately
- Content structure preserved: header, body, topics, sentiment, sources

### 2. Enhancement Pipeline
- Secondary data gathering (Reddit API, related posts)
- Visual formatting suggestions
- Community engagement optimization
- Real-time AI-powered improvements

### 3. Publishing
- Review changes before publishing
- Track edit history
- Publish to community with optimizations

## Implementation Plan

### Phase 1: Core Editor Setup

#### 1.1 Install Dependencies

```bash
# Core TipTap packages
npm install @tiptap/react @tiptap/starter-kit @tiptap/pm

# TipTap Pro extensions (requires authentication)
npm install @tiptap-pro/extension-ai @tiptap-pro/extension-ai-changes

# Supporting packages
npm install zod @anthropic-ai/sdk
```

#### 1.2 Create Editor Provider

```typescript
// lib/services/editor/editorProvider.ts
import { create } from 'zustand'
import type { ProducerContent, EditorState } from '@/lib/types/editor'

interface EditorStore {
  // State
  content: ProducerContent | null
  isEditing: boolean
  changes: EditorChange[]
  status: 'idle' | 'editing' | 'reviewing' | 'publishing'
  
  // Actions
  acceptContent: (content: ProducerContent) => void
  startEditing: () => void
  saveChanges: (changes: EditorChange[]) => void
  publishContent: () => Promise<void>
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  content: null,
  isEditing: false,
  changes: [],
  status: 'idle',
  
  acceptContent: (content) => {
    set({ 
      content, 
      status: 'editing',
      isEditing: true 
    })
  },
  
  startEditing: () => set({ isEditing: true }),
  
  saveChanges: (changes) => set({ changes }),
  
  publishContent: async () => {
    // Publishing logic
  }
}))
```

#### 1.3 Configure TipTap with Anthropic

```typescript
// lib/services/editor/tiptapConfig.ts
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Ai from '@tiptap-pro/extension-ai'
import AiChanges from '@tiptap-pro/extension-ai-changes'

export const createEditorInstance = (content: string) => {
  return new Editor({
    extensions: [
      StarterKit,
      Ai.configure({
        // Use Anthropic via our backend
        aiCompletionResolver: anthropicResolver,
        aiStreamResolver: anthropicStreamResolver,
        onLoading: handleAiLoading,
        onSuccess: handleAiSuccess,
        onError: handleAiError,
      }),
      AiChanges.configure({
        getCustomDecorations: customDecorationHandler
      })
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-lg focus:outline-none'
      }
    }
  })
}
```

### Phase 2: AI Integration

#### 2.1 Anthropic Resolver Implementation

```typescript
// lib/services/editor/anthropicResolver.ts
export const anthropicResolver = async ({
  action,
  text,
  textOptions,
  extensionOptions
}) => {
  const response = await fetch('/api/editor/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action,
      text,
      options: textOptions,
      context: {
        communityTarget: 'reddit',
        optimizeFor: ['engagement', 'clarity', 'visual_appeal']
      }
    })
  })
  
  if (!response.ok) {
    throw new Error('AI request failed')
  }
  
  return response.json()
}
```

#### 2.2 Backend AI Handler

```typescript
// app/api/editor/ai/route.ts
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: Request) {
  const { action, text, context } = await request.json()
  
  const systemPrompt = `
    You are an expert content editor optimizing stories for Reddit communities.
    Your goals:
    1. Enhance visual appeal with formatting
    2. Improve engagement and readability
    3. Add relevant context and connections
    4. Maintain factual accuracy
    
    Context: ${JSON.stringify(context)}
  `
  
  const response = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `${action}: ${text}`
    }]
  })
  
  return Response.json({
    content: response.content[0].text
  })
}
```

### Phase 3: Editor Commands

#### 3.1 Custom AI Commands

```typescript
// lib/services/editor/commands.ts
export const editorCommands = {
  enhanceForReddit: {
    name: 'enhance_for_reddit',
    description: 'Optimize content for Reddit community',
    handler: async (editor, selection) => {
      return runAiTextCommand(editor, 'enhance_reddit', {
        prompt: 'Make this more engaging for Reddit users',
        selection
      })
    }
  },
  
  addVisualElements: {
    name: 'add_visuals',
    description: 'Suggest visual formatting',
    handler: async (editor, selection) => {
      return runAiTextCommand(editor, 'add_visuals', {
        prompt: 'Add formatting for visual appeal',
        selection
      })
    }
  },
  
  expandContext: {
    name: 'expand_context',
    description: 'Add relevant context and connections',
    handler: async (editor, selection) => {
      return runAiTextCommand(editor, 'expand_context', {
        prompt: 'Add relevant context and related information',
        selection
      })
    }
  }
}
```

### Phase 4: UI Components

#### 4.1 Editor Canvas

```typescript
// components/editor/EditorCanvas.tsx
import { useEditor, EditorContent } from '@tiptap/react'
import { useEditorStore } from '@/lib/services/editor/editorProvider'

export function EditorCanvas() {
  const { content, isEditing } = useEditorStore()
  
  const editor = useEditor({
    extensions: [...editorExtensions],
    content: content?.body || '',
    editable: isEditing,
    onUpdate: ({ editor }) => {
      // Track changes
      handleContentUpdate(editor.getHTML())
    }
  })
  
  return (
    <div className="editor-container">
      <EditorToolbar editor={editor} />
      <EditorContent 
        editor={editor}
        className="min-h-[500px] p-6"
      />
      <EditorChangesPanel editor={editor} />
    </div>
  )
}
```

#### 4.2 Editor Toolbar

```typescript
// components/editor/EditorToolbar.tsx
export function EditorToolbar({ editor }) {
  const aiCommands = [
    { icon: '✨', label: 'Enhance', command: 'enhanceForReddit' },
    { icon: '🎨', label: 'Format', command: 'addVisualElements' },
    { icon: '🔗', label: 'Context', command: 'expandContext' },
    { icon: '📊', label: 'Stats', command: 'addStatistics' }
  ]
  
  return (
    <div className="toolbar flex gap-2 p-4 border-b">
      {aiCommands.map(cmd => (
        <button
          key={cmd.command}
          onClick={() => executeCommand(editor, cmd.command)}
          className="px-4 py-2 rounded-lg hover:bg-gray-100"
        >
          <span className="mr-2">{cmd.icon}</span>
          {cmd.label}
        </button>
      ))}
    </div>
  )
}
```

### Phase 5: Secondary Data Gathering

#### 5.1 Reddit API Integration

```typescript
// lib/services/editor/redditEnhancer.ts
export class RedditEnhancer {
  async gatherRelatedPosts(topics: string[]) {
    const relatedPosts = await Promise.all(
      topics.map(topic => 
        this.searchReddit(topic, { limit: 5 })
      )
    )
    return this.analyzeConnections(relatedPosts)
  }
  
  async enrichWithCommunityContext(subreddit: string) {
    const [rules, flairs, topPosts] = await Promise.all([
      this.getSubredditRules(subreddit),
      this.getPopularFlairs(subreddit),
      this.getTopPosts(subreddit, 'week')
    ])
    
    return {
      communityGuidelines: rules,
      recommendedFlairs: flairs,
      trendingTopics: this.extractTrends(topPosts)
    }
  }
}
```

### Phase 6: Change Tracking

#### 6.1 AI Changes Integration

```typescript
// components/editor/EditorChangesPanel.tsx
export function EditorChangesPanel({ editor }) {
  const storage = editor.extensionStorage.aiChanges
  const changes = storage.getChanges()
  
  return (
    <div className="changes-panel">
      <h3>Suggested Improvements</h3>
      {changes.map(change => (
        <ChangeCard
          key={change.id}
          change={change}
          onAccept={() => editor.commands.acceptAiChange(change.id)}
          onReject={() => editor.commands.rejectAiChange(change.id)}
        />
      ))}
      
      <div className="actions mt-4">
        <button onClick={() => editor.commands.acceptAllAiChanges()}>
          Accept All
        </button>
        <button onClick={() => editor.commands.rejectAllAiChanges()}>
          Reject All
        </button>
      </div>
    </div>
  )
}
```

## Configuration

### Environment Variables

```env
# Anthropic API
ANTHROPIC_API_KEY=your_key_here

# Reddit API
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_secret
REDDIT_USER_AGENT=SMNB_Editor/1.0

# TipTap Pro
TIPTAP_PRO_TOKEN=your_token
```

### Editor Settings

```typescript
// config/editor.config.ts
export const EDITOR_CONFIG = {
  ai: {
    model: 'claude-3-opus-20240229',
    maxTokens: 2048,
    temperature: 0.7,
    streamingEnabled: true
  },
  
  enhancement: {
    autoSuggest: true,
    suggestInterval: 5000, // 5 seconds
    maxSuggestions: 3
  },
  
  formatting: {
    enableMarkdown: true,
    enableRichText: true,
    enableCodeBlocks: true,
    enableTables: true
  },
  
  publishing: {
    requireReview: true,
    trackChanges: true,
    saveHistory: true
  }
}
```

## API Endpoints

### Editor Endpoints

```typescript
// POST /api/editor/accept-content
// Accept content from producer
{
  content: ProducerContent,
  sessionId: string
}

// POST /api/editor/ai
// Process AI commands
{
  action: string,
  text: string,
  context: object
}

// POST /api/editor/enhance
// Enhance with Reddit data
{
  contentId: string,
  enhancements: string[]
}

// POST /api/editor/publish
// Publish edited content
{
  contentId: string,
  changes: EditorChange[],
  targetSubreddit: string
}
```

## Testing Strategy

### Unit Tests
- Editor state management
- AI command execution
- Change tracking
- Content transformation

### Integration Tests
- Producer → Editor workflow
- AI enhancement pipeline
- Reddit API integration
- Publishing flow

### E2E Tests
- Complete editing session
- Change review workflow
- Multi-user editing
- Error recovery

## Performance Considerations

1. **Streaming AI Responses**: Use streaming for better UX
2. **Debounced Saving**: Auto-save every 3 seconds
3. **Chunk Large Documents**: Process in 2000 character chunks
4. **Cache Reddit Data**: 5-minute cache for API calls
5. **Optimize Re-renders**: Use React.memo for editor components

## Security

1. **API Key Management**: Store in environment variables
2. **Rate Limiting**: Implement per-user rate limits
3. **Content Validation**: Sanitize HTML before publishing
4. **CORS**: Configure for production domains only
5. **Authentication**: Require auth for editor access

## Monitoring

Track these metrics:
- Edit session duration
- AI command usage
- Enhancement acceptance rate
- Publishing success rate
- Error frequency
- API latency

## Next Steps

1. **Week 1**: Core editor setup and TipTap integration
2. **Week 2**: Anthropic AI integration
3. **Week 3**: Reddit API enhancement layer
4. **Week 4**: Change tracking and review UI
5. **Week 5**: Testing and optimization
6. **Week 6**: Production deployment

## Resources

- [TipTap Documentation](https://tiptap.dev)
- [Anthropic API Docs](https://docs.anthropic.com)
- [Reddit API Documentation](https://www.reddit.com/dev/api)
- [Convex Database Guide](https://docs.convex.dev)