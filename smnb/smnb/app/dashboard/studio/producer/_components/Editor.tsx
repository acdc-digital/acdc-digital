/**
 * Clean Newsletter Editor Component
 * Only handles newsletter generation with AI streaming
 * Now includes Convex newsletter persistence
 */

'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { Newspaper } from 'lucide-react';
import NewsletterDisplay from '@/app/components/editor/NewsletterDisplay';
import { useEditorActions, useEditorContent } from '@/lib/stores/editor/editorStore';
import { useEditorStore } from '@/lib/stores/editor/editorStore';
import { useStorySelectionStore } from '@/lib/stores/livefeed/storySelectionStore';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export default function Editor() {
  // Removed isGenerating state - not needed for pure newsletter display
  const { receiveFromProducer, requestAI } = useEditorActions();
  const content = useEditorContent();
  const isAIProcessing = useEditorStore((state) => state.isAIProcessing);
  
  // Story selection state for producer integration
  const { selectedStory } = useStorySelectionStore();

  // Newsletter persistence hooks - check existing newsletter in editor_documents
  const storyHasValidId = selectedStory?.id && selectedStory.id.length > 10; // Basic validation
  const existingDocument = useQuery(api.editor.documents.getEditorDocument, 
    storyHasValidId ? { storyId: selectedStory.id } : "skip"
  );
  const saveContent = useMutation(api.editor.documents.updateEditorContent);

  // Debug logging for existing document
  useEffect(() => {
    if (selectedStory) {
      console.log('📄 Document query result for story:', selectedStory.id, existingDocument);
    }
  }, [selectedStory, existingDocument]);
  
  const [hasLoadedExisting, setHasLoadedExisting] = useState(false);

  // Newsletter is automatically saved by the editor system in editor_documents table
  // No need for separate saving logic

  const generateNewsletter = useCallback(async () => {
    if (!selectedStory) return;
    
    console.log('🚀 generateNewsletter called for story:', selectedStory.title);
    
    try {
      // Use the AI service to generate newsletter with proper formatting
      console.log('📡 Calling requestAI with newsletter-format type');
      await requestAI({
        type: 'newsletter-format',
        input: selectedStory.narrative || selectedStory.summary || '',
        context: JSON.stringify({
          title: selectedStory.title,
          summary: selectedStory.summary,
          topics: selectedStory.topics,
          sentiment: selectedStory.sentiment,
          priority: selectedStory.priority,
          date: new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        })
      }, undefined, true); // Enable streaming
      
      console.log('🎯 Newsletter generation requested - content will be saved automatically when complete');
      
    } catch (error) {
      console.error('❌ Newsletter generation failed:', error);
    }
  }, [selectedStory, requestAI]);

  const handleStoryLoad = useCallback(async () => {
    if (!selectedStory) return;
    
    // Prevent multiple executions for the same story
    if (selectedStory.id === useEditorStore.getState().currentStoryId && hasLoadedExisting) {
      console.log('⏸️ Story already loaded, skipping handleStoryLoad');
      return;
    }
    
    try {
      // Check if existing newsletter exists and load it
      if (existingDocument?.newsletter_content && !hasLoadedExisting) {
        console.log(`📰 Loading existing newsletter for story: ${selectedStory.title}`);
        
        // Set up producer content with existing newsletter
        const producerContent = {
          storyId: selectedStory.id as Id<"story_history">,
          content: existingDocument.newsletter_content || '', // Load saved newsletter content
          metadata: {
            title: selectedStory.title || 'Newsletter',
            summary: selectedStory.summary || '',
            tags: selectedStory.topics || [],
            sentiment: (selectedStory.sentiment || 'neutral') as 'positive' | 'negative' | 'neutral',
            priority: selectedStory.priority === 'high' ? 1 : selectedStory.priority === 'medium' ? 0.7 : 0.3
          },
          handoffTimestamp: Date.now()
        };
        
        console.log('🔄 Setting up editor with EXISTING newsletter content');
        receiveFromProducer(producerContent);
        
        setHasLoadedExisting(true);
        console.log(`✅ Loaded existing newsletter (${existingDocument.newsletter_content?.length || 0} chars)`);
        return;
        return;
      }
      
      // No existing newsletter - set up producer content but don't load raw content yet
      const producerContent = {
        storyId: selectedStory.id as Id<"story_history">,
        content: '', // Don't load raw content to avoid markdown flash
        metadata: {
          title: selectedStory.title || 'Untitled Story',
          summary: selectedStory.summary || '',
          tags: selectedStory.topics || [],
          sentiment: (selectedStory.sentiment || 'neutral') as 'positive' | 'negative' | 'neutral',
          priority: selectedStory.priority === 'high' ? 1 : selectedStory.priority === 'medium' ? 0.7 : 0.3
        },
        handoffTimestamp: Date.now()
      };
      
      console.log('🔄 Setting up editor with EMPTY content for AI processing');
      
      // Only set up empty content if we don't already have generated content
      const currentContent = useEditorStore.getState().content.html;
      if (!currentContent || currentContent.length < 100) {
        receiveFromProducer(producerContent);
      } else {
        console.log('⏸️ Skipping receiveFromProducer - already have content');
      }
      
      // Auto-generate newsletter if none exists
      if (!existingDocument?.newsletter_content) {
        console.log('🤖 Starting AI newsletter generation...');
        await generateNewsletter();
        console.log('📝 Newsletter generation completed for story:', selectedStory.title);
      }
      
    } catch (error) {
      console.error('❌ Error loading story:', error);
    }
  }, [selectedStory, existingDocument, hasLoadedExisting, receiveFromProducer, generateNewsletter, setHasLoadedExisting]);

  // Auto-generate newsletter when story is selected
  useEffect(() => {
    console.log('🔄 Story selection effect triggered, selectedStory:', selectedStory?.title);
    if (selectedStory) {
      handleStoryLoad();
    }
  }, [selectedStory, handleStoryLoad]);

  // Debug content changes
  useEffect(() => {
    console.log('📝 Content changed:', {
      htmlLength: content.html?.length || 0,
      htmlPreview: content.html?.substring(0, 100) + '...',
      isAIProcessing,
      hasSelectedStory: !!selectedStory
    });
  }, [content.html, isAIProcessing, selectedStory]);

  // Auto-save newsletter when content is generated and AI processing is complete
  useEffect(() => {
    const saveGenerated = async () => {
      console.log('🔍 Save check conditions:', {
        hasSelectedStory: !!selectedStory,
        hasContent: !!content.html,
        contentLength: content.html?.length || 0,
        isAIProcessing,
        hasExistingNewsletter: !!existingDocument?.newsletter_content,
        hasLoadedExisting,
        storyId: selectedStory?.id
      });

      if (
        selectedStory &&
        content.html &&
        content.html.length > 100 && // Ensure substantial content
        !isAIProcessing && // AI is finished
        !existingDocument?.newsletter_content && // Don't overwrite existing
        !hasLoadedExisting && // Haven't loaded existing content
        content.html.includes('<h1>') // Ensure it's actually formatted content
      ) {
        try {
          console.log('💾 Attempting to save newsletter to database...');
          const docId = await saveContent({
            storyId: selectedStory.id,
            contentType: 'newsletter',
            content: content.html,
          });
          setHasLoadedExisting(true); // Prevent multiple notifications
          console.log('✅ Newsletter saved to editor_documents with ID:', docId);
        } catch (error) {
          console.error('❌ Failed to save newsletter:', error);
        }
      } else {
        console.log('⏸️ Save conditions not met, skipping save');
      }
    };
    saveGenerated();
  }, [selectedStory, content.html, isAIProcessing, existingDocument, hasLoadedExisting, saveContent]);

  // View tracking will be added later when incrementViews function is available

  if (!selectedStory) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <Newspaper className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-sm text-muted-foreground">Select a story to generate newsletter</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Minimal Header - Only show during generation */}
      {isAIProcessing && !content.html && (
        <div className="flex-shrink-0 bg-white border-b px-4 py-2">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-gray-600">Generating Newsletter...</span>
            </div>
          </div>
        </div>
      )}

      {/* Newsletter Content - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        <NewsletterDisplay content={content.html} isLoading={isAIProcessing} />
      </div>

    </div>
  );
}

console.log('📝 Clean Newsletter Editor loaded');
