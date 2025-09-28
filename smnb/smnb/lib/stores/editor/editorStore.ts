/**
 * Editor Store - Zustand State Management for Newsletter Editor
 * Manages editor content, status, AI integration, and visual feedback
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { nanoid } from 'nanoid';

// Auto-save debouncing
let autoSaveTimer: NodeJS.Timeout | null = null;
import {
  EditorStore,
  EditorContent,
  EditorStatus,
  AIRequest,
  AIResponse,
  EditorChange,
  ChangeHighlight,
  ProducerContent,
  EditorConfig,
  VisualFeedback,
  ChangeTracker,
  ContentType
} from '../../types/editor';
import { getAIService } from '../../services/editor/editorAIService';
import { getEditorConvexService, ContentType as ConvexContentType } from '../../services/editor/editorConvexService';

// Default editor configuration
const DEFAULT_CONFIG: EditorConfig = {
  enableAI: true,
  enableChangeTracking: true,
  enableCollaboration: false,
  autoSaveInterval: 5000,
  maxContentLength: 50000,
  placeholder: "Start writing your story...",
  theme: 'auto',
  toolbar: {
    enabled: true,
    items: [
      'bold', 'italic', 'underline',
      'h1', 'h2', 'h3',
      'bullet-list', 'ordered-list',
      'blockquote', 'code-block',
      'ai-enhance', 'ai-rewrite',
      'undo', 'redo'
    ]
  }
};

// Default content state
const createDefaultContent = (): EditorContent => ({
  html: '',
  json: {},
  markdown: '',
  text: '',
  wordCount: 0,
  characterCount: 0,
  createdAt: Date.now(),
  lastModified: Date.now()
});

// Default visual feedback state
const createDefaultVisualFeedback = (): VisualFeedback => ({
  statusColor: 'gray',
  statusMessage: 'Ready to write',
  progress: undefined,
  showTypingIndicator: false,
  showAIAnimation: false,
  highlights: []
});

// Default change tracker
const createDefaultChangeTracker = (): ChangeTracker => ({
  changes: [],
  currentChange: undefined,
  isTracking: true,
  maxChanges: 100
});

export const useEditorStore = create<EditorStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    content: createDefaultContent(),
    status: 'draft',
    isFocused: false,
    hasUnsavedChanges: false,
    isAIProcessing: false,
    selection: undefined,
    collaboration: undefined,
    changeTracker: createDefaultChangeTracker(),
    visualFeedback: createDefaultVisualFeedback(),
    producerContent: undefined,
    config: DEFAULT_CONFIG,
    aiHistory: {
      requests: [],
      responses: []
    },
    
    // Current story tracking for newsletter persistence
    currentStoryId: undefined,
    previousStoryId: undefined, // Track previous story for cleanup

    // Content Management Actions
    setContent: (newContent) => {
      set((state) => ({
        content: {
          ...state.content,
          ...newContent,
          lastModified: Date.now()
        },
        hasUnsavedChanges: true
      }));
    },

    updateContent: (html, json) => {
      const text = html.replace(/<[^>]*>/g, '');
      const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
      const characterCount = text.length;

      set((state) => ({
        content: {
          ...state.content,
          html,
          json,
          text,
          wordCount,
          characterCount,
          lastModified: Date.now()
        },
        hasUnsavedChanges: true
      }));

      // Update visual feedback based on content
      const state = get();
      if (state.status === 'draft' && html.trim()) {
        state.setStatus('editing');
      } else if (state.status === 'editing' && !html.trim()) {
        state.setStatus('draft');
      }
    },

    clearContent: () => {
      set(() => ({
        content: createDefaultContent(),
        hasUnsavedChanges: false,
        status: 'draft',
        visualFeedback: createDefaultVisualFeedback(),
        changeTracker: createDefaultChangeTracker()
      }));
    },

    // Status Management Actions
    setStatus: (status) => {
      set((state) => {
        const statusColors = {
          draft: 'gray' as const,
          editing: 'blue' as const,
          'ai-processing': 'yellow' as const,
          completed: 'green' as const,
          error: 'red' as const
        };

        const statusMessages = {
          draft: 'Ready to write',
          editing: 'Writing in progress',
          'ai-processing': 'AI is enhancing your content...',
          completed: 'Story completed',
          error: 'Something went wrong'
        };

        return {
          status,
          visualFeedback: {
            ...state.visualFeedback,
            statusColor: statusColors[status],
            statusMessage: statusMessages[status],
            showAIAnimation: status === 'ai-processing'
          }
        };
      });
    },

    setFocused: (focused) => {
      set((state) => ({
        isFocused: focused,
        visualFeedback: {
          ...state.visualFeedback,
          showTypingIndicator: focused && state.status === 'editing'
        }
      }));
    },

    setUnsavedChanges: (hasChanges) => {
      set(() => ({
        hasUnsavedChanges: hasChanges
      }));
    },

    // Persistent Content Management Actions
    setCurrentStory: (storyId) => {
      set((state) => {
        // If switching to a different story, clear editor content to prevent bleeding
        if (state.currentStoryId && state.currentStoryId !== storyId) {
          console.log(`🔄 Switching from story ${state.currentStoryId} to ${storyId} - clearing editor state`);
          
          return {
            currentStoryId: storyId,
            previousStoryId: state.currentStoryId,
            currentContentType: undefined,
            // Clear current content to prevent story bleeding
            content: createDefaultContent(),
            hasUnsavedChanges: false,
            status: 'draft' as EditorStatus,
            visualFeedback: createDefaultVisualFeedback(),
            isAIProcessing: false
          };
        }
        
        return {
          currentStoryId: storyId,
          previousStoryId: state.currentStoryId
        };
      });
    },

    loadContent: async (storyId, contentType) => {
      try {
        // Newsletter content is handled through editor_documents table

        // Check if content already exists for other types
        const convexService = getEditorConvexService();
        const hasExistingContent = await convexService.hasContent(storyId, contentType as ConvexContentType);

        if (hasExistingContent) {
          // Load existing content
          const existingContent = await convexService.getContent(storyId, contentType);

          if (existingContent) {
            set(() => ({
              content: {
                ...createDefaultContent(),
                html: existingContent,
                text: existingContent.replace(/<[^>]*>/g, ''),
                wordCount: existingContent.replace(/<[^>]*>/g, '').trim().split(/\s+/).length,
                characterCount: existingContent.replace(/<[^>]*>/g, '').length
              },
              currentStoryId: storyId,
              hasUnsavedChanges: false
            }));

            console.log(`📝 Loaded existing newsletter content for story ${storyId}`);
            return existingContent;
          }
        }

        // Content doesn't exist, return null to trigger generation
        set(() => ({
          currentStoryId: storyId
        }));
        
        return null;
      } catch (error) {
        console.error('❌ Failed to load content:', error);
        return null;
      }
    },

    saveContent: async (storyId, contentType, content) => {
      try {
        // Handle 'home' content type - store only in memory, don't persist to database
        if (contentType === 'home') {
          console.log(`📝 Home content stored in memory for story ${storyId} (not persisted to database)`);
          set(() => ({
            hasUnsavedChanges: false
          }));
          return;
        }

        // Save other content types to database
        const convexService = getEditorConvexService();
        await convexService.saveContent(storyId, contentType as ConvexContentType, content);

        set(() => ({
          hasUnsavedChanges: false
        }));
        console.log(`📝 Saved ${contentType} content for story ${storyId}`);
      } catch (error) {
        console.error('❌ Failed to save content:', error);
      }
    },

    checkContentExists: async (storyId, contentType) => {
      try {
        // Only newsletter content type supported now

        // Check database for other content types
        const convexService = getEditorConvexService();
        return await convexService.hasContent(storyId, contentType as ConvexContentType);
      } catch (error) {
        console.error('❌ Failed to check content existence:', error);
        return false;
      }
    },

    // AI Integration Actions
    requestAI: async (requestData, textEditorHandler, useStreaming = true) => {
      const { currentStoryId, currentContentType } = get();
      
      // Check if content already exists before generating
      if (currentStoryId && currentContentType) {
        const hasExisting = await get().checkContentExists(currentStoryId, currentContentType);
        if (hasExisting) {
          console.log(`⚡ Content already exists for ${currentContentType}, skipping generation`);
          // Load existing content instead
          await get().loadContent(currentStoryId, currentContentType);
          return;
        }
      }

      const request: AIRequest = {
        ...requestData,
        id: nanoid(),
        timestamp: Date.now()
      };

      set((state) => ({
        isAIProcessing: true,
        aiHistory: {
          ...state.aiHistory,
          requests: [...state.aiHistory.requests, request]
        }
      }));

      // Instead of 'ai-processing' (which shows loading screen), keep editor active
      console.log(`🚀 Starting AI request for ${request.type} - ${useStreaming ? 'streaming' : 'normal'} mode`);

      try {
        // Get API key from environment or config
        const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
        if (!apiKey) {
          throw new Error('Anthropic API key not configured');
        }

        const aiService = getAIService(apiKey);
        
        if (useStreaming) {
          // Clear content for fresh streaming
          get().setContent({
            ...createDefaultContent(),
            html: '',
            text: ''
          });
          
          // Create a streaming handler that updates content in real-time
          const streamHandler = {
            onChunk: (chunk: string) => {
              // Optimized streaming - only update HTML, defer expensive calculations
              set((state) => ({
                content: {
                  ...state.content,
                  html: state.content.html + chunk,
                  lastModified: Date.now()
                }
              }));
            },
            onComplete: (finalContent: string) => {
              // Set the final formatted content (will be processed by editorAIService)
              get().setContent({
                html: finalContent,
                text: finalContent.replace(/<[^>]*>/g, ''),
                wordCount: finalContent.replace(/<[^>]*>/g, '').trim().split(/\s+/).length,
                characterCount: finalContent.replace(/<[^>]*>/g, '').length,
                lastModified: Date.now()
              });
              
              console.log('🌊 Streaming complete - content set, handleAIResponse will handle saving');
              // NOTE: Don't save here - let handleAIResponse handle the save with proper timing
            }
          };
          
          // Process with streaming support
          const response = await aiService.processRequestWithStreaming(
            request, 
            textEditorHandler,
            streamHandler
          );
          
          get().handleAIResponse(response);
        } else {
          // Use standard processing
          const response = await aiService.processRequest(request, textEditorHandler);
          get().handleAIResponse(response);
        }

      } catch (error) {
        console.error('❌ AI Request failed:', error);
        
        // Provide user-friendly error messages for common issues
        let userMessage = 'Unknown AI error';
        if (error instanceof Error) {
          if (error.message.includes('Overloaded')) {
            userMessage = 'The AI service is currently overloaded. Please try again in a moment.';
          } else if (error.message.includes('rate limit') || error.message.includes('Rate limit')) {
            userMessage = 'Rate limit exceeded. Please wait before making another request.';
          } else if (error.message.includes('network') || error.message.includes('Network')) {
            userMessage = 'Network connection issue. Please check your internet connection.';
          } else {
            userMessage = error.message;
          }
        }
        
        const errorResponse: AIResponse = {
          requestId: request.id,
          content: '',
          success: false,
          error: userMessage,
          timestamp: Date.now()
        };
        
        get().handleAIResponse(errorResponse);
      }
    },

    handleAIResponse: async (response) => {
      console.log('🤖 Handling AI response:', response.requestId);
      
      // Update AI history first, but keep AI processing flag for now
      set((state) => ({
        aiHistory: {
          ...state.aiHistory,
          responses: [...state.aiHistory.responses, response]
        }
      }));

      if (response.success) {
        // Apply AI content to editor
        const { currentStoryId, currentContentType } = get();
        
        console.log(`🔍 DEBUG handleAIResponse - currentStoryId: ${currentStoryId}, currentContentType: ${currentContentType}`);
        
        // CRITICAL FIX: Wait for editor to stabilize and get the actual HTML content
        // Don't save response.content directly - get the processed HTML from the editor
        setTimeout(async () => {
          try {
            const latestState = get();
            const htmlContent = latestState.content.html;
            
            console.log(`🔍 Editor content for save: ${htmlContent?.substring(0, 100)}...`);
            
            // Only save if we have actual content (not empty paragraph with or without classes)
            const hasRealContent = htmlContent && 
              htmlContent.length > 50 && // More than just empty tags
              !htmlContent.match(/^<p[^>]*><\/p>$/) && // Not just empty paragraph with classes
              htmlContent.replace(/<[^>]*>/g, '').trim().length > 0; // Has actual text content
              
            if (currentStoryId && currentContentType && hasRealContent) {
              console.log(`💾 Saving AI-generated ${currentContentType} content to Convex for story ${currentStoryId} (${htmlContent.length} chars)`);
              console.log(`📝 Content preview: ${htmlContent.substring(0, 200)}...`);
              await latestState.saveContent(currentStoryId, currentContentType, htmlContent);
              console.log(`✅ Successfully saved ${currentContentType} content to Convex`);
            } else {
              console.warn(`⚠️ Skipping save - content invalid:`);
              console.warn(`   - storyId: ${!!currentStoryId}`);
              console.warn(`   - contentType: ${!!currentContentType}`);
              console.warn(`   - htmlContent: ${!!htmlContent}`);
              console.warn(`   - length: ${htmlContent?.length || 0}`);
              console.warn(`   - hasRealContent: ${hasRealContent}`);
              console.warn(`   - content preview: ${htmlContent?.substring(0, 100) || 'null'}`);
            }
            
            // Now it's safe to clear the AI processing flag
            set({ 
              isAIProcessing: false,
              status: 'editing',
              visualFeedback: {
                ...latestState.visualFeedback,
                showAIAnimation: false,
                statusMessage: 'Content generated!'
              }
            });
            
          } catch (error) {
            console.error('❌ Failed to save AI content to Convex:', error);
            // Clear AI processing flag even on error
            set({ 
              isAIProcessing: false,
              status: 'error'
            });
          }
        }, 500); // Increased delay to ensure editor content is fully processed
        
        console.log('✅ AI Response received and will be processed asynchronously:', {
          requestId: response.requestId,
          contentLength: response.content.length
        });
      } else {
        // Handle failed AI response
        const errorString = JSON.stringify(response.error);
        const isOverloadError = response.error?.type === 'overloaded_error' || 
                               errorString.includes('overloaded_error') ||
                               errorString.includes('Overloaded');
        
        if (isOverloadError) {
          console.warn('⏳ AI service is overloaded, please try again in a moment');
          // You could show a toast notification here
        } else {
          console.error('❌ AI Response error:', response.error);
        }
        
        set({ 
          isAIProcessing: false,
          status: 'error'
        });
      }
    },

    setAIProcessing: (processing) => {
      set(() => ({
        isAIProcessing: processing
      }));
    },

    // Change Tracking Actions
    addChange: (changeData) => {
      const change: EditorChange = {
        ...changeData,
        id: nanoid(),
        timestamp: Date.now()
      };

      set((state) => {
        if (!state.changeTracker.isTracking) return state;

        const newChanges = [...state.changeTracker.changes, change];
        
        // Keep only the most recent changes
        if (newChanges.length > state.changeTracker.maxChanges) {
          newChanges.splice(0, newChanges.length - state.changeTracker.maxChanges);
        }

        return {
          changeTracker: {
            ...state.changeTracker,
            changes: newChanges,
            currentChange: change
          }
        };
      });

      // Add visual highlight for the change
      if (changeData.type !== 'format') {
        get().addHighlight({
          range: changeData.position,
          color: changeData.isAIGenerated ? 'ai-suggestion' : 'modified',
          tooltip: changeData.isAIGenerated ? 'AI Enhancement' : 'Recent Edit',
          duration: 3000
        });
      }
    },

    clearChanges: () => {
      set((state) => ({
        changeTracker: {
          ...state.changeTracker,
          changes: [],
          currentChange: undefined
        }
      }));
    },

    toggleChangeTracking: () => {
      set((state) => ({
        changeTracker: {
          ...state.changeTracker,
          isTracking: !state.changeTracker.isTracking
        }
      }));
    },

    // Visual Feedback Actions
    updateVisualFeedback: (feedback) => {
      set((state) => ({
        visualFeedback: {
          ...state.visualFeedback,
          ...feedback
        }
      }));
    },

    addHighlight: (highlightData) => {
      const highlight: ChangeHighlight = {
        ...highlightData,
        id: nanoid()
      };

      set((state) => ({
        visualFeedback: {
          ...state.visualFeedback,
          highlights: [...state.visualFeedback.highlights, highlight]
        }
      }));

      // Auto-remove highlight after duration
      if (highlight.duration) {
        setTimeout(() => {
          get().removeHighlight(highlight.id);
        }, highlight.duration);
      }
    },

    removeHighlight: (id) => {
      set((state) => ({
        visualFeedback: {
          ...state.visualFeedback,
          highlights: state.visualFeedback.highlights.filter(h => h.id !== id)
        }
      }));
    },

    // Producer Integration Actions
    receiveFromProducer: (content) => {
      const previousState = get();
      const newStoryId = content.storyId;
      
      console.log(`📝 Receiving content from producer - Story: ${newStoryId}, Title: ${content.metadata.title}`);
      console.log(`📝 Previous story: ${previousState.currentStoryId}, Current content length: ${previousState.content.html.length}`);
      
      // Use setCurrentStory to handle story switching and cleanup
      get().setCurrentStory(newStoryId);
      
      set((state) => ({
        producerContent: content,
        content: {
          ...createDefaultContent(),
          html: content.content,
          text: content.content.replace(/<[^>]*>/g, ''),
          wordCount: content.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length,
          characterCount: content.content.replace(/<[^>]*>/g, '').length
        },
        status: 'editing',
        hasUnsavedChanges: true,
        // Newsletter content loaded from producer
      }));

      console.log(`✅ Editor loaded story ${newStoryId} with ${content.content.length} chars`);
    },

    completeStory: () => {
      set(() => ({
        status: 'completed',
        hasUnsavedChanges: false
      }));

      console.log('✅ Story marked as completed');
    },

    // Configuration Actions
    updateConfig: (configUpdates) => {
      set((state) => ({
        config: {
          ...state.config,
          ...configUpdates
        }
      }));
    },

    // Auto-save restoration
    restoreFromAutoSave: (storyId?: string, contentType?: ContentType) => {
      try {
        const autoSaveKey = `editor_autosave_${storyId || 'draft'}_${contentType || 'blog'}`;
        const saved = localStorage.getItem(autoSaveKey);
        
        if (saved) {
          const { content, timestamp } = JSON.parse(saved);
          
          // Only restore if it's recent (within last hour)
          if (Date.now() - timestamp < 3600000) {
            set(() => ({
              content,
              currentStoryId: storyId,
              currentContentType: contentType,
              hasUnsavedChanges: false,
              status: content.html ? ('editing' as EditorStatus) : ('draft' as EditorStatus)
            }));
            
            console.log(`🔄 Restored content from auto-save (${Math.round((Date.now() - timestamp) / 1000)}s ago)`);
            return true;
          } else {
            // Remove old auto-save
            localStorage.removeItem(autoSaveKey);
          }
        }
      } catch (error) {
        console.error('❌ Failed to restore from auto-save:', error);
      }
      
      return false;
    },

    clearAutoSave: (storyId?: string, contentType?: ContentType) => {
      try {
        const autoSaveKey = `editor_autosave_${storyId || 'draft'}_${contentType || 'blog'}`;
        localStorage.removeItem(autoSaveKey);
        console.log('🗑️ Cleared auto-save data');
      } catch (error) {
        console.error('❌ Failed to clear auto-save:', error);
      }
    },

    // Story Isolation Methods
    clearStoryState: (storyId?: string) => {
      const targetStoryId = storyId || get().currentStoryId;
      if (!targetStoryId) return;
      
      set((state) => {
        const newGeneratedContent = new Map(state.generatedContent);
        const newGenerationStatus = new Map(state.generationStatus);
        
        // Clear all content for the specified story
        newGeneratedContent.delete(targetStoryId);
        newGenerationStatus.delete(targetStoryId);
        
        return {
          generatedContent: newGeneratedContent,
          generationStatus: newGenerationStatus
        };
      });
      
      // Clear localStorage for this story
      try {
        const contentTypes = ['home', 'blog', 'newsletter', 'analysis', 'social', 'context'];
        contentTypes.forEach(contentType => {
          const autoSaveKey = `editor_autosave_${targetStoryId}_${contentType}`;
          localStorage.removeItem(autoSaveKey);
        });
      } catch (error) {
        console.error('❌ Failed to clear localStorage for story:', error);
      }
      
      console.log(`🗑️ Cleared all state for story: ${targetStoryId}`);
    },

    // Content Type Management Methods
    setCurrentContentType: (contentType: ContentType) => {
      set((state) => ({
        currentContentType: contentType
      }));
      console.log(`📝 Content type set to: ${contentType}`);
    },

    getContentForType: (contentType: ContentType) => {
      const state = get();
      const storyId = state.currentStoryId;
      if (!storyId) return undefined;
      
      const storyContent = state.generatedContent.get(storyId);
      return storyContent?.get(contentType);
    },

    preserveContentForType: (contentType: ContentType, html: string, json: any) => {
      set((state) => {
        const storyId = state.currentStoryId;
        if (!storyId) {
          console.warn('⚠️ Cannot preserve content: no current story ID');
          return state;
        }
        
        const newGeneratedContent = new Map(state.generatedContent);
        const newGenerationStatus = new Map(state.generationStatus);
        
        // Get or create story-specific content maps
        const storyContentMap = newGeneratedContent.get(storyId) || new Map();
        const storyStatusMap = newGenerationStatus.get(storyId) || new Map();
        
        // Update content for this story and content type
        storyContentMap.set(contentType, {
          isGenerated: true,
          html,
          json,
          generatedAt: Date.now()
        });
        
        storyStatusMap.set(contentType, true);
        
        // Update the main maps
        newGeneratedContent.set(storyId, storyContentMap);
        newGenerationStatus.set(storyId, storyStatusMap);
        
        return {
          generatedContent: newGeneratedContent,
          generationStatus: newGenerationStatus
        };
      });
      console.log(`💾 Content preserved for story ${get().currentStoryId}, type: ${contentType}`);
    },

    hasGeneratedContent: (contentType: ContentType) => {
      const state = get();
      const storyId = state.currentStoryId;
      if (!storyId) return false;
      
      const storyStatus = state.generationStatus.get(storyId);
      return storyStatus?.get(contentType) || false;
    },

    clearGeneratedContent: (contentType?: ContentType) => {
      set((state) => {
        const storyId = state.currentStoryId;
        const newGeneratedContent = new Map(state.generatedContent);
        const newGenerationStatus = new Map(state.generationStatus);
        
        if (contentType && storyId) {
          // Clear specific content type for current story
          const storyContentMap = newGeneratedContent.get(storyId);
          const storyStatusMap = newGenerationStatus.get(storyId);
          
          if (storyContentMap) {
            storyContentMap.delete(contentType);
            newGeneratedContent.set(storyId, storyContentMap);
          }
          
          if (storyStatusMap) {
            storyStatusMap.delete(contentType);
            newGenerationStatus.set(storyId, storyStatusMap);
          }
          
          console.log(`🗑️ Cleared ${contentType} content for story: ${storyId}`);
        } else if (!contentType && storyId) {
          // Clear all content for current story
          newGeneratedContent.delete(storyId);
          newGenerationStatus.delete(storyId);
          console.log(`🗑️ Cleared all content for story: ${storyId}`);
        } else if (!contentType && !storyId) {
          // Clear all content for all stories
          newGeneratedContent.clear();
          newGenerationStatus.clear();
          console.log('🗑️ Cleared all generated content for all stories');
        }
        
        return {
          generatedContent: newGeneratedContent,
          generationStatus: newGenerationStatus
        };
      });
    }
  }))
);

// Selector hooks for optimized component subscriptions
export const useEditorContent = () => useEditorStore((state) => state.content);
export const useEditorStatus = () => useEditorStore((state) => state.status);
export const useEditorVisualFeedback = () => useEditorStore((state) => state.visualFeedback);
export const useEditorConfig = () => useEditorStore((state) => state.config);

// Individual action selectors to prevent re-render loops
export const useEditorActions = () => {
  const setContent = useEditorStore((state) => state.setContent);
  const updateContent = useEditorStore((state) => state.updateContent);
  const clearContent = useEditorStore((state) => state.clearContent);
  const setStatus = useEditorStore((state) => state.setStatus);
  const setFocused = useEditorStore((state) => state.setFocused);
  const requestAI = useEditorStore((state) => state.requestAI);
  const addChange = useEditorStore((state) => state.addChange);
  const receiveFromProducer = useEditorStore((state) => state.receiveFromProducer);
  const completeStory = useEditorStore((state) => state.completeStory);
  const updateConfig = useEditorStore((state) => state.updateConfig);
  const restoreFromAutoSave = useEditorStore((state) => state.restoreFromAutoSave);
  const clearAutoSave = useEditorStore((state) => state.clearAutoSave);
  const setCurrentContentType = useEditorStore((state) => state.setCurrentContentType);
  const getContentForType = useEditorStore((state) => state.getContentForType);
  const preserveContentForType = useEditorStore((state) => state.preserveContentForType);
  const hasGeneratedContent = useEditorStore((state) => state.hasGeneratedContent);
  const clearGeneratedContent = useEditorStore((state) => state.clearGeneratedContent);
  const clearStoryState = useEditorStore((state) => state.clearStoryState);

  return {
    setContent,
    updateContent,
    clearContent,
    setStatus,
    setFocused,
    requestAI,
    addChange,
    receiveFromProducer,
    completeStory,
    updateConfig,
    restoreFromAutoSave,
    clearAutoSave,
    setCurrentContentType,
    getContentForType,
    preserveContentForType,
    hasGeneratedContent,
    clearGeneratedContent,
    clearStoryState
  };
};

// Auto-save functionality with AI processing guards and story isolation
useEditorStore.subscribe(
  (state) => state.hasUnsavedChanges,
  (hasUnsavedChanges) => {
    if (hasUnsavedChanges) {
      const { config, content, currentStoryId, currentContentType, isAIProcessing, status, aiHistory } = useEditorStore.getState();
      
      // CRITICAL FIX: Don't auto-save during or immediately after AI processing
      if (isAIProcessing || status === 'ai-processing') {
        console.log('⏸️ Skipping auto-save during AI processing');
        return;
      }
      
      // Check if AI just finished (within last 5 seconds)
      const lastAIResponse = aiHistory.responses[aiHistory.responses.length - 1];
      if (lastAIResponse && lastAIResponse.timestamp) {
        const timeSinceAI = Date.now() - new Date(lastAIResponse.timestamp).getTime();
        if (timeSinceAI < 5000) {
          console.log('⏸️ Skipping auto-save - AI just completed');
          return;
        }
      }
      
      // Clear any pending auto-save
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      // Debounce auto-save by 2 seconds
      autoSaveTimer = setTimeout(async () => {
        try {
          // Double-check AI processing state before saving
          const currentState = useEditorStore.getState();
          if (currentState.isAIProcessing) {
            console.log('⏸️ Skipping auto-save - AI processing started during timeout');
            return;
          }
          
          // Only auto-save if content has actually changed and is not empty
          if (content.html !== '<p></p>' && content.html.length > 10 && currentStoryId) {
            // Save to localStorage for immediate persistence with story isolation
            const autoSaveKey = `editor_autosave_${currentStoryId}_${currentContentType || 'blog'}`;
            localStorage.setItem(autoSaveKey, JSON.stringify({
              content,
              storyId: currentStoryId,
              contentType: currentContentType,
              timestamp: Date.now()
            }));
            
            // Save to Convex if we have a story context
            if (currentStoryId && currentContentType && content.html) {
              await currentState.saveContent(currentStoryId, currentContentType, content.html);
              console.log('💾 Auto-saved to Convex successfully');
            } else {
              console.log('💾 Auto-saved to localStorage (no Convex context)');
            }
            
            currentState.setUnsavedChanges(false);
          } else {
            console.log('⏸️ Skipping auto-save - content is empty or too short');
          }
        } catch (error) {
          console.error('❌ Auto-save failed:', error);
        }
      }, 2000); // Debounced by 2 seconds instead of using config.autoSaveInterval
    }
  }
);

console.log('📝 Editor store initialized with Newsletter Display integration');