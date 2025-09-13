/**
 * Custom AI Extension for TipTap Editor
 * Provides TipTap Content AI-style interface with Anthropic Claude backend
 * No subscription required - implements custom aiCompletionResolver and aiStreamResolver
 */

import { Extension, Editor } from '@tiptap/core';
import { Plugin, PluginKey, Transaction, EditorState } from '@tiptap/pm/state';
import { Decoration, DecorationSet, EditorView } from '@tiptap/pm/view';
import Anthropic from '@anthropic-ai/sdk';

// Types for our custom AI system
export interface AIConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIRequestOptions {
  action: string;
  text: string;
  selection?: { from: number; to: number };
  options?: Record<string, any>;
}

export interface AIResolver {
  (options: AIRequestOptions): Promise<string>;
}

export interface AIStreamResolver {
  (options: AIRequestOptions): Promise<ReadableStream<Uint8Array>>;
}

export interface CustomAIOptions {
  config: AIConfig;
  aiCompletionResolver?: AIResolver;
  aiStreamResolver?: AIStreamResolver;
  onError?: (error: Error) => void;
}

// Plugin key for state management
export const customAIPluginKey = new PluginKey('customAI');

// Custom AI Extension
export const CustomAI = Extension.create<CustomAIOptions>({
  name: 'customAI',

  addOptions() {
    return {
      config: {
        apiKey: '',
        model: 'claude-3-5-sonnet-20241022',
        maxTokens: 4000,
        temperature: 0.7,
      },
      aiCompletionResolver: undefined,
      aiStreamResolver: undefined,
      onError: (error: Error) => {
        console.error('❌ Custom AI Error:', error);
      },
    };
  },

  addCommands() {
    return {
      // Generic AI command runner
      runAICommand:
        (action: string, options: Record<string, any> = {}) =>
        ({ editor, tr, state }) => {
          const { selection } = state;
          const selectedText = state.doc.textBetween(selection.from, selection.to);

          // Prepare request options
          const requestOptions: AIRequestOptions = {
            action,
            text: selectedText || editor.getHTML(),
            selection: { from: selection.from, to: selection.to },
            options,
          };

          // Use completion resolver
          if (this.options.aiCompletionResolver) {
            this.runCompletion(requestOptions, editor);
          }

          return true;
        },

      // Stream AI command
      streamAICommand:
        (action: string, options: Record<string, any> = {}) =>
        ({ editor, state }) => {
          const { selection } = state;
          const selectedText = state.doc.textBetween(selection.from, selection.to);

          const requestOptions: AIRequestOptions = {
            action,
            text: selectedText || editor.getHTML(),
            selection: { from: selection.from, to: selection.to },
            options,
          };

          // Use stream resolver
          if (this.options.aiStreamResolver) {
            this.runStream(requestOptions, editor);
          }

          return true;
        },

      // Specific AI enhancement commands
      aiEnhance: (options = {}) => ({ editor }) => {
        return editor.commands.runAICommand('enhance', options);
      },

      aiNewsletterFormat: (options = {}) => ({ editor }) => {
        return editor.commands.runAICommand('newsletter-format', options);
      },

      aiBlogPost: (options = {}) => ({ editor }) => {
        return editor.commands.runAICommand('blog-post', options);
      },

      aiRewrite: (options = {}) => ({ editor }) => {
        return editor.commands.runAICommand('rewrite', options);
      },

      aiSummarize: (options = {}) => ({ editor }) => {
        return editor.commands.runAICommand('summarize', options);
      },

      // Streaming versions
      aiEnhanceStream: (options = {}) => ({ editor }) => {
        return editor.commands.streamAICommand('enhance', options);
      },

      aiNewsletterFormatStream: (options = {}) => ({ editor }) => {
        return editor.commands.streamAICommand('newsletter-format', options);
      },

      aiBlogPostStream: (options = {}) => ({ editor }) => {
        return editor.commands.streamAICommand('blog-post', options);
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: customAIPluginKey,
        state: {
          init() {
            return {
              isProcessing: false,
              decorations: DecorationSet.empty,
            };
          },
          apply(tr, value) {
            return {
              isProcessing: tr.getMeta('aiProcessing') ?? value.isProcessing,
              decorations: value.decorations.map(tr.mapping, tr.doc),
            };
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)?.decorations;
          },
        },
      }),
    ];
  },

  // Helper method to run completion
  runCompletion(requestOptions: AIRequestOptions, editor: any) {
    if (!this.options.aiCompletionResolver) {
      throw new Error('aiCompletionResolver not configured');
    }

    // Set processing state
    editor.view.dispatch(
      editor.view.state.tr.setMeta('aiProcessing', true)
    );

    // Add loading decoration
    this.addLoadingDecoration(editor, requestOptions.selection);

    this.options.aiCompletionResolver(requestOptions)
      .then((result) => {
        // Remove loading decoration
        this.removeLoadingDecoration(editor);

        // Insert or replace content
        if (requestOptions.selection && requestOptions.selection.from !== requestOptions.selection.to) {
          // Replace selection
          editor.commands.deleteRange(requestOptions.selection);
          editor.commands.insertContent(result);
        } else {
          // Insert at cursor or replace all content for full document operations
          if (requestOptions.action === 'newsletter-format' || requestOptions.action === 'blog-post') {
            editor.commands.setContent(result);
          } else {
            editor.commands.insertContent(result);
          }
        }

        // Clear processing state
        editor.view.dispatch(
          editor.view.state.tr.setMeta('aiProcessing', false)
        );
      })
      .catch((error) => {
        this.removeLoadingDecoration(editor);
        editor.view.dispatch(
          editor.view.state.tr.setMeta('aiProcessing', false)
        );
        this.options.onError?.(error);
      });
  },

  // Helper method to run streaming
  runStream(requestOptions: AIRequestOptions, editor: any) {
    if (!this.options.aiStreamResolver) {
      throw new Error('aiStreamResolver not configured');
    }

    // Set processing state
    editor.view.dispatch(
      editor.view.state.tr.setMeta('aiProcessing', true)
    );

    // Add loading decoration
    this.addLoadingDecoration(editor, requestOptions.selection);

    this.options.aiStreamResolver(requestOptions)
      .then((stream) => {
        this.handleStreamResponse(stream, editor, requestOptions);
      })
      .catch((error) => {
        this.removeLoadingDecoration(editor);
        editor.view.dispatch(
          editor.view.state.tr.setMeta('aiProcessing', false)
        );
        this.options.onError?.(error);
      });
  },

  // Handle streaming response
  async handleStreamResponse(stream: ReadableStream<Uint8Array>, editor: any, requestOptions: AIRequestOptions) {
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    // Remove loading decoration
    this.removeLoadingDecoration(editor);

    // Clear content if it's a full document operation
    if (requestOptions.action === 'newsletter-format' || requestOptions.action === 'blog-post') {
      editor.commands.setContent('');
    } else if (requestOptions.selection && requestOptions.selection.from !== requestOptions.selection.to) {
      // Clear selection
      editor.commands.deleteRange(requestOptions.selection);
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        
        // Insert chunk at current cursor position
        editor.commands.insertContent(chunk);
      }
    } catch (error) {
      this.options.onError?.(error as Error);
    } finally {
      // Clear processing state
      editor.view.dispatch(
        editor.view.state.tr.setMeta('aiProcessing', false)
      );
    }
  },

  // Add loading decoration
  addLoadingDecoration(editor: any, selection?: { from: number; to: number }) {
    const { state } = editor.view;
    const { from, to } = selection || state.selection;

    const decoration = Decoration.widget(from, () => {
      const span = document.createElement('span');
      span.className = 'ai-loading-indicator animate-pulse text-blue-500';
      span.textContent = '🤖 AI processing...';
      return span;
    });

    const decorationSet = DecorationSet.create(state.doc, [decoration]);
    
    editor.view.dispatch(
      state.tr.setMeta(customAIPluginKey, { decorations: decorationSet })
    );
  },

  // Remove loading decoration
  removeLoadingDecoration(editor: any) {
    const { state } = editor.view;
    editor.view.dispatch(
      state.tr.setMeta(customAIPluginKey, { decorations: DecorationSet.empty })
    );
  },
});

// Default Anthropic Claude resolver implementation
export const createAnthropicResolver = (config: AIConfig): AIResolver => {
  const anthropic = new Anthropic({ apiKey: config.apiKey });

  return async ({ action, text, options }: AIRequestOptions): Promise<string> => {
    console.log(`🤖 AI Request (${action}):`, text.substring(0, 100) + '...');

    const prompt = buildPromptForAction(action, text, options);

    try {
      const response = await anthropic.messages.create({
        model: config.model || 'claude-3-5-sonnet-20241022',
        max_tokens: config.maxTokens || 4000,
        temperature: config.temperature || 0.7,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        // Convert markdown to HTML if needed
        return convertToHTML(content.text);
      }

      throw new Error('Unexpected response format from Claude');
    } catch (error) {
      console.error('❌ Anthropic API error:', error);
      throw error;
    }
  };
};

// Default Anthropic Claude stream resolver implementation
export const createAnthropicStreamResolver = (config: AIConfig): AIStreamResolver => {
  const anthropic = new Anthropic({ apiKey: config.apiKey });

  return async ({ action, text, options }: AIRequestOptions): Promise<ReadableStream<Uint8Array>> => {
    console.log(`🤖 AI Stream Request (${action}):`, text.substring(0, 100) + '...');

    const prompt = buildPromptForAction(action, text, options);

    const response = await anthropic.messages.create({
      model: config.model || 'claude-3-5-sonnet-20241022',
      max_tokens: config.maxTokens || 4000,
      temperature: config.temperature || 0.7,
      stream: true,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const htmlChunk = convertToHTML(chunk.delta.text);
              controller.enqueue(new TextEncoder().encode(htmlChunk));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
  };
};

// Build prompt for different actions
function buildPromptForAction(action: string, text: string, options?: Record<string, any>): string {
  const baseContext = options?.context ? `Context: ${options.context}\n\n` : '';

  switch (action) {
    case 'enhance':
      return `${baseContext}Please enhance and improve the following content while maintaining its core meaning and tone. Focus on clarity, flow, and engagement. Return formatted HTML:

${text}

Return only the enhanced HTML version without explanations.`;

    case 'newsletter-format':
      return `${baseContext}CRITICAL: Convert this content into a newsletter format and return it as properly formatted HTML with the following structure:

SOURCE CONTENT:
${text}

REQUIRED NEWSLETTER HTML STRUCTURE:
- Use proper HTML headings (h1, h2, h3)
- Apply newsletter styling with classes
- Include emojis and formatting
- Use <strong> for bold, <em> for emphasis
- Use <blockquote> for important callouts
- Use proper <ul>/<ol> for lists

Return only the complete formatted HTML newsletter without explanations.`;

    case 'blog-post':
      return `${baseContext}Transform this content into a comprehensive analytical blog post and return as properly formatted HTML:

SOURCE CONTENT:
${text}

Create a well-structured blog post with:
- Proper HTML headings (h1, h2, h3)
- Rich formatting with <strong>, <em>, <code>
- <blockquote> for important insights
- Proper <ul>/<ol> for structured data
- Professional tone with analytical depth

Return only the complete formatted HTML blog post without explanations.`;

    case 'rewrite':
      return `${baseContext}Completely rewrite the following content with a fresh perspective while preserving core information. Return as formatted HTML:

${text}

Return only the rewritten HTML version without explanations.`;

    case 'summarize':
      return `${baseContext}Create a concise, compelling summary of the following content. Return as formatted HTML:

${text}

Return only the HTML summary without explanations.`;

    default:
      return `${baseContext}Process the following content for the "${action}" action. Return as formatted HTML:

${text}

Return only the processed HTML content without explanations.`;
  }
}

// Simple markdown to HTML converter for Claude responses
function convertToHTML(text: string): string {
  return text
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    
    // Bold and Italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Code
    .replace(/`(.*?)`/g, '<code>$1</code>')
    
    // Blockquotes
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    
    // Lists (basic implementation)
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li>$1</li>')
    
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    
    // Wrap in paragraphs
    .replace(/^(?!<[h|l|b])(.+)/gim, '<p>$1</p>')
    
    // Clean up
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<h[1-6]>.*<\/h[1-6]>)<\/p>/g, '$1')
    .replace(/<p>(<blockquote>.*<\/blockquote>)<\/p>/g, '$1');
}