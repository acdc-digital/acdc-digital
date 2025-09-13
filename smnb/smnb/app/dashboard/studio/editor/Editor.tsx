/**
 * Editor Studio Component
 * Integrates TipTap Editor into the studio workspace for story editing
 */

'use client';

import React, { useEffect } from 'react';
import { Edit3, FileText } from 'lucide-react';
import TipTapEditor from '../../../../components/editor/TipTapEditor';
import { useEditorActions, useEditorStatus, useEditorContent } from '../../../../lib/stores/editorStore';
import { useStorySelectionStore } from '../../../../lib/stores/livefeed/storySelectionStore';

export default function Editor() {
  const { receiveFromProducer } = useEditorActions();
  const status = useEditorStatus();
  const content = useEditorContent();
  
  // Story selection state for producer integration
  const { selectedStory, clearSelection } = useStorySelectionStore();

  // Load selected story into editor when it changes  
  useEffect(() => {
    if (selectedStory) {
      try {
        const producerContent = {
          storyId: selectedStory.id as any, // TODO: Fix type compatibility with Convex ID
          content: selectedStory.narrative || '',
          metadata: {
            title: selectedStory.title || 'Untitled Story',
            summary: selectedStory.summary || '',
            tags: selectedStory.topics || [],
            sentiment: (selectedStory.sentiment || 'neutral') as 'positive' | 'negative' | 'neutral',
            priority: selectedStory.priority === 'high' ? 1 : selectedStory.priority === 'medium' ? 0.7 : 0.3
          },
          handoffTimestamp: Date.now()
        };
        
        receiveFromProducer(producerContent);
        console.log('📝 Editor received story from producer:', selectedStory.title);
      } catch (error) {
        console.error('❌ Error loading story into editor:', error);
      }
    }
  }, [selectedStory, receiveFromProducer]);



  return (
    <div className="h-full bg-card flex flex-col">

      {/* Editor Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {selectedStory ? (
          <div className="flex-1 flex flex-col p-4 min-h-0">


            {/* TipTap Editor */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <TipTapEditor 
                className="h-full"
                autoFocus={true}
              />
            </div>


          </div>
        ) : (
          // Empty editor state
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground/50">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Ready to Edit</h3>
              <p className="text-sm mb-4">Select a story from the live feed to start editing</p>
              <div className="text-xs text-muted-foreground/70 max-w-md">
                <p>• Click any story in the feed to load it into the editor</p>
                <p>• Use AI tools to enhance, rewrite, or proofread content</p>
                <p>• Visual change tracking shows your edits in real-time</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

console.log('📝 Editor studio component loaded');