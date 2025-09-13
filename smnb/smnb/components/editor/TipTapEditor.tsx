/**
 * TipTap Editor Component - Rich Text Editor with AI Integration
 * Rebuilt with streaming safeguards and Newsletter Typography support
 */

'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Typography from '@tiptap/extension-typography';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import { TextAlign } from '@tiptap/extension-text-align';
import { cn } from '../../lib/utils';
import {
  useEditorStore,
  useEditorContent,
  useEditorStatus,
  useEditorVisualFeedback,
  useEditorConfig,
  useEditorActions
} from '../../lib/stores/editorStore';
import AIFormattingControls from './AIFormattingControls';
import { AnthropicTextEditorHandler } from '../../lib/services/anthropicTextEditorHandler';

// Import Newsletter Design System
import '../../styles/newsletter.css';

interface TipTapEditorProps {
  className?: string;
  autoFocus?: boolean;
}

export default function TipTapEditor({ className, autoFocus = false }: TipTapEditorProps) {
  const content = useEditorContent();
  const status = useEditorStatus();
  const visualFeedback = useEditorVisualFeedback();
  const config = useEditorConfig();
  const actions = useEditorActions();
  
  const editorRef = useRef<HTMLDivElement>(null);
  const lastUpdateRef = useRef<string>('');
  const textEditorHandlerRef = useRef<AnthropicTextEditorHandler | null>(null);

  // Initialize TipTap editor with safeguards
  const editor = useEditor({
    immediatelyRender: false, // Prevent SSR hydration issues
    editable: true, // Enable editing for AI content generation
    parseOptions: {
      preserveWhitespace: 'full',
    },
    onCreate: ({ editor }) => {
      // Initialize Anthropic text editor handler
      textEditorHandlerRef.current = new AnthropicTextEditorHandler(editor);
      console.log('📝 TipTap editor initialized with Anthropic handler');
      
      // Restore auto-save only if no active AI processing
      const currentState = useEditorStore.getState();
      if (!currentState.isAIProcessing && !currentState.content.html.trim()) {
        const restored = actions.restoreFromAutoSave();
        if (restored) {
          console.log('🔄 Auto-save content restored');
        }
      }
    },
    extensions: [
      StarterKit.configure({
        // Map heading levels to newsletter classes
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
          HTMLAttributes: {
            class: ({ level }: { level: number }) => {
              const headingClasses = {
                1: 'newsletter-h1',
                2: 'newsletter-h2', 
                3: 'newsletter-h3',
                4: 'newsletter-h4',
                5: 'newsletter-h5',
                6: 'newsletter-h6'
              };
              return headingClasses[level as keyof typeof headingClasses] || '';
            }
          }
        },
        paragraph: {
          HTMLAttributes: {
            class: 'newsletter-body'
          }
        },
        blockquote: {
          HTMLAttributes: {
            class: 'newsletter-blockquote'
          }
        },
        code: {
          HTMLAttributes: {
            class: 'newsletter-code'
          }
        },
        bulletList: {
          HTMLAttributes: {
            class: 'newsletter-list'
          }
        },
        orderedList: {
          HTMLAttributes: {
            class: 'newsletter-list newsletter-list-ordered'
          }
        }
      }),
      Typography.configure({
        // Typography enhancements - disable smart quotes for consistency
        openDoubleQuote: false,
        closeDoubleQuote: false,
        openSingleQuote: false,
        closeSingleQuote: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Placeholder.configure({
        placeholder: 'Newsletter content will appear here...',
        emptyNodeClass: 'text-gray-400 dark:text-gray-600 italic',
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-yellow-200 dark:bg-yellow-900 text-gray-900 dark:text-gray-100',
        },
      }),
    ],
    content: content.html,
    editorProps: {
      attributes: {
        class: cn(
          // Newsletter editor with design system integration
          'newsletter-editor prose prose-lg dark:prose-invert max-w-none focus:outline-none',
          'min-h-[200px] mr-2 p-2'
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const json = editor.getJSON();
      
      // Prevent infinite update loops
      if (html !== lastUpdateRef.current) {
        lastUpdateRef.current = html;
        
        // CRITICAL FIX: Don't update content during AI processing to prevent overwrites
        const currentState = useEditorStore.getState();
        if (!currentState.isAIProcessing) {
          actions.updateContent(html, json);
          
          // Track changes for change tracking
          if (config.enableChangeTracking && html !== content.html) {
            actions.addChange({
              type: 'replace',
              before: content.html,
              after: html,
              position: { from: 0, to: content.text.length },
              author: { id: 'user', name: 'User' },
              isAIGenerated: false
            });
          }
        } else {
          console.log('⏸️ Skipping content update during AI processing');
        }
      }
    },
    onFocus: () => actions.setFocused(true),
    onBlur: () => actions.setFocused(false),
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      useEditorStore.setState({ selection: { from, to } });
    },
  });

  // Update editor content when store content changes
  useEffect(() => {
    if (editor && content.html !== lastUpdateRef.current && content.html !== editor.getHTML()) {
      lastUpdateRef.current = content.html;
      
      // DEBUG: Log what HTML we're trying to set
      console.log('🎯 TipTap: Setting content HTML:', content.html.substring(0, 200) + '...');
      console.log('🎯 TipTap: HTML length:', content.html.length);
      
      // CRITICAL: Force TipTap to parse HTML correctly
      try {
        console.log('🔧 TipTap: Attempting to set HTML content...');
        
        // Clear content first to ensure clean state
        editor.commands.clearContent();
        
        // Wait a tick then set content
        setTimeout(() => {
          const success = editor.commands.setContent(content.html, { 
            emitUpdate: false
          });
          
          console.log('🔧 TipTap: setContent success:', success);
          console.log('🔧 TipTap: Editor HTML after set:', editor.getHTML().substring(0, 200) + '...');
          
          // Force editor to update its view
          editor.view.dispatch(editor.view.state.tr);
          
          // DEBUG: Verify content is actually there
          setTimeout(() => {
            console.log('🎯 TipTap: Final rendered HTML:', editor.getHTML().substring(0, 200) + '...');
            console.log('🎯 TipTap: Final JSON structure:', JSON.stringify(editor.getJSON(), null, 2));
            console.log('🎯 TipTap: Editor DOM element:', editor.view.dom);
          }, 100);
        }, 10);
        
      } catch (error) {
        console.error('❌ TipTap setContent failed:', error);
        // Simple fallback: just try setting the content again
        editor.commands.setContent(content.html || '<p>No content available</p>');
      }
    }
  }, [editor, content.html]);

  // CRITICAL: Safe streaming content updates with proper editor checks
  useEffect(() => {
    const unsubscribe = useEditorStore.subscribe(
      (state) => state.content,
      (newContent) => {
        const currentState = useEditorStore.getState();
        
        // Only update during AI streaming with comprehensive safety checks
        if (editor && 
            editor.view && 
            !editor.isDestroyed &&
            editor.view.dom &&
            document.contains(editor.view.dom) &&
            newContent.html !== lastUpdateRef.current && 
            currentState.isAIProcessing) {
          
          console.log(`🌊 Safe streaming update: ${newContent.html.length} chars`);
          console.log(`� STREAMING DEBUG: Enhanced streaming logic executing!`);
          console.log(`�🔧 Streaming HTML input:`, newContent.html.substring(0, 200) + '...');
          
          try {
            // Update content safely with enhanced HTML handling
            lastUpdateRef.current = newContent.html;
            
            // CRITICAL: Use the same enhanced content setting as the main path
            editor.commands.clearContent();
            const success = editor.commands.setContent(newContent.html, { 
              emitUpdate: false
            });
            
            console.log('🔧 Streaming setContent success:', success);
            
            // DEBUG: Test if TipTap can handle simple HTML
            if (newContent.html.includes('<h1>')) {
              console.log('🧪 Testing simple HTML parsing...');
              const testHTML = '<h1>Test Header</h1><p>Test paragraph</p>';
              editor.commands.clearContent();
              const testSuccess = editor.commands.setContent(testHTML, { emitUpdate: false });
              console.log('🧪 Simple HTML test success:', testSuccess);
              console.log('🧪 Test result JSON:', JSON.stringify(editor.getJSON(), null, 2));
              
              // Now try the actual content
              editor.commands.clearContent();
              editor.commands.setContent(newContent.html, { emitUpdate: false });
            }
            
            // If streaming setContent fails, try insertContent
            if (!success) {
              console.log('🔧 Streaming: Trying insertContent as fallback...');
              editor.commands.clearContent();
              editor.commands.insertContent(newContent.html);
            }
            
            // Focus at end with additional safety checks
            setTimeout(() => {
              if (editor && 
                  editor.view && 
                  !editor.isDestroyed &&
                  editor.view.dom &&
                  document.contains(editor.view.dom)) {
                try {
                  editor.commands.focus('end');
                  // Auto-scroll to follow streaming content
                  const editorElement = editor.view.dom.closest('.overflow-y-auto');
                  if (editorElement) {
                    editorElement.scrollTop = editorElement.scrollHeight;
                  }
                } catch (focusError) {
                  console.warn('⚠️ Focus during streaming failed (non-critical):', focusError);
                }
              }
            }, 10);
            
            console.log('✅ Streaming content updated successfully');
          } catch (error) {
            console.error('❌ Streaming update failed:', error);
            // Don't throw - let streaming continue
          }
        }
      }
    );

    return unsubscribe;
  }, [editor]);

  // Auto-generate blog post when producer content arrives
  useEffect(() => {
    const unsubscribe = useEditorStore.subscribe(
      (state) => state.producerContent,
      (producerContent) => {
        if (producerContent && config.enableAI && editor && textEditorHandlerRef.current) {
          setTimeout(() => {
            console.log('🤖 Auto-generating newsletter from story:', producerContent.metadata.title);
            
            const contextMetadata = {
              title: producerContent.metadata.title,
              tags: producerContent.metadata.tags,
              sentiment: producerContent.metadata.sentiment,
              priority: producerContent.metadata.priority > 0.8 ? 'high' : 
                       producerContent.metadata.priority > 0.5 ? 'medium' : 'low',
              source: 'social media news'
            };
            
            actions.requestAI({
              type: 'newsletter-format',
              input: producerContent.content,
              context: JSON.stringify(contextMetadata)
            }, textEditorHandlerRef.current);
          }, 1500);
        }
      }
    );

    return unsubscribe;
  }, [editor, actions, config.enableAI]);

  // Handle AI response integration
  useEffect(() => {
    const unsubscribe = useEditorStore.subscribe(
      (state) => state.aiHistory.responses,
      (responses) => {
        const latestResponse = responses[responses.length - 1];
        if (latestResponse && latestResponse.success && editor) {
          console.log('🎯 AI response processed - content already streamed via handler');
          
          // Track AI-generated change
          if (config.enableChangeTracking) {
            actions.addChange({
              type: 'ai-edit',
              before: '',
              after: latestResponse.content,
              position: { from: 0, to: 0 },
              author: { id: 'ai', name: 'Claude AI' },
              isAIGenerated: true,
              aiRequestId: latestResponse.requestId
            });
          }
        }
      }
    );

    return unsubscribe;
  }, [editor, actions, config.enableChangeTracking]);

  // Newsletter formatting keyboard shortcut
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'N') {
        event.preventDefault();
        handleNewsletterFormat();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  // Newsletter formatting handler
  const handleNewsletterFormat = useCallback(() => {
    if (!editor || !config.enableAI || !textEditorHandlerRef.current) return;
    
    const content = editor.getText();
    if (!content.trim()) return;
    
    actions.requestAI({
      type: 'newsletter-format',
      input: content,
      context: 'Convert to engaging newsletter with proper visual hierarchy, headers, and styling'
    }, textEditorHandlerRef.current);
  }, [editor, actions, config.enableAI]);

  if (!editor) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading newsletter editor...</span>
      </div>
    );
  }

  return (
    <div className={cn('overflow-hidden flex flex-col h-full', className)} ref={editorRef}>
      {/* AI Formatting Controls */}
      {config.enableAI && (
        <AIFormattingControls 
          editor={editor} 
          storyId={useEditorStore.getState().producerContent?.storyId}
        />
      )}

      {/* Editor Content with Newsletter Typography */}
      <div className="relative flex-1 min-h-0 overflow-auto">
        <EditorContent 
          editor={editor}
          className={cn(
            'w-full',
            'newsletter-content prose prose-lg max-w-none',
            'min-h-[200px]',
            visualFeedback.showAIAnimation && 'animate-pulse'
          )}
        />

        {/* AI Processing Overlay */}
        {status === 'ai-processing' && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex items-center space-x-3 bg-white rounded-lg shadow-lg p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
              <span className="text-yellow-700 font-medium">
                {visualFeedback.statusMessage || 'Generating newsletter content...'}
              </span>
            </div>
          </div>
        )}

        {/* Typing Indicator */}
        {visualFeedback.showTypingIndicator && (
          <div className="absolute bottom-4 right-4 z-20">
            <div className="flex space-x-1 bg-white rounded-full px-3 py-2 shadow-md">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce animate-delay-75"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce animate-delay-150"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

console.log('📝 TipTap Newsletter Editor loaded with streaming safeguards');
