// PRODUCER
// /Users/matthewsimon/Projects/SMNB/smnb/app/dashboard/studio/producer/Producer.tsx

/**
 * Producer Column Component
 * 
 * Displays Producer agent status and activity indicators.
 * Handles Reddit search and duplication analysis for news story context.
 */

'use client';

import React, { useEffect, useState } from "react";
import { useProducerStore } from "@/lib/stores/producer/producerStore";
import { useStorySelectionStore } from "@/lib/stores/livefeed/storySelectionStore";
import { Eye, X, UserPen } from "lucide-react";
import { StudioMode } from '../Studio';
import Editor from "./_components/Editor";
import { useEditorStatus, useEditorContent, useEditorStore } from "@/lib/stores/editor/editorStore";
import { ComputerUseAIControls } from "@/lib/components/ComputerUseAIControls";
import { ProducerComputerUseIntegration } from "@/lib/components/ProducerComputerUseIntegration";
import { useApiKeyStore } from "@/lib/stores/auth/apiKeyStore";

interface ProducerProps {
  onModeChange?: (mode: StudioMode) => void;
}

// Editor Status Indicator Component
function EditorStatusIndicator() {
  const status = useEditorStatus();
  
  return (
    <>
      <div className={`w-2 h-2 rounded-full ${
        status === 'draft' ? 'bg-white border border-gray-300' :
        status === 'editing' ? 'bg-blue-500' :
        status === 'ai-processing' ? 'bg-yellow-500' :
        status === 'completed' ? 'bg-green-500' :
        'bg-red-500'
      }`}></div>
      <span className={`text-xs font-medium ${
        status === 'draft' ? 'text-muted-foreground' :
        status === 'editing' ? 'text-blue-400' :
        status === 'ai-processing' ? 'text-yellow-400' :
        status === 'completed' ? 'text-green-400' :
        'text-red-400'
      }`}>
        {status === 'ai-processing' ? 'Processing' : 
         status === 'editing' ? 'Editing' :
         status === 'completed' ? 'Complete' :
         status === 'draft' ? 'Ready' : status}
      </span>
    </>
  );
}

// Story Footer Component - Terminal/IDE inspired compact design
function StoryFooter({ story, currentView }: { story: any, currentView: string }) {
  const content = useEditorContent();
  
  // Priority color indicator
  const getPriorityColor = () => {
    switch(story.priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };
  
  // Sentiment color indicator
  const getSentimentColor = () => {
    switch(story.sentiment) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };
  
  return (
    <div className="flex-shrink-0 bg-[#1a1a1a] border-t border-border/30 px-3 py-1 text-xs font-sans font-light">
      <div className="flex items-center justify-between">
        {/* Left side: Compact story indicators */}
        <div className="flex items-center gap-3 text-muted-foreground">
          {/* Priority indicator */}
          <span className="flex items-center gap-1">
            <span className={`${getPriorityColor()}`}>●</span>
            <span className="text-muted-foreground/70">{story.priority?.charAt(0).toUpperCase()}</span>
          </span>
          
          {/* Sentiment indicator */}
          <span className="flex items-center gap-1">
            <span className={`${getSentimentColor()}`}>●</span>
            <span className="text-muted-foreground/70">{(story.sentiment || 'neutral').charAt(0).toUpperCase()}</span>
          </span>
          
          {/* Topics indicator */}
          <span className="flex items-center gap-1">
            <span className="text-blue-400">●</span>
            <span className="text-muted-foreground/70">
              {story.topics?.length ? `${story.topics.slice(0, 2).join('/')}${story.topics.length > 2 ? `+${story.topics.length - 2}` : ''}` : 'None'}
            </span>
          </span>
          
          {/* Story title indicator */}
          <span className="flex items-center gap-1">
            <span className="text-green-400">●</span>
            <span className="text-muted-foreground/70 truncate max-w-[120px]">
              {story.title || story.originalItem?.title || 'Untitled'}
            </span>
          </span>
        </div>
        
        {/* Right side: Editor stats (only show if in editor view) */}
        {currentView === 'editor' && (
          <div className="flex items-center gap-3 text-muted-foreground/70">
            <span>{content.wordCount}w</span>
            <span>{content.characterCount}c</span>
            <span>{new Date(content.lastModified).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Producer({ onModeChange }: ProducerProps) {
  const {
    isActive,
    initializeProducer,
    startProducer,
    stopProducer,
    cleanup
  } = useProducerStore();

  const [isInitialized, setIsInitialized] = useState(false);
  const [currentView, setCurrentView] = useState<'preview' | 'editor'>('preview'); // Default to preview view
  const [userSelectedView, setUserSelectedView] = useState<'preview' | 'editor' | null>(null); // Track user's manual selection
  
  // Story selection state
  const { selectedStory, isPreviewOpen, clearSelection } = useStorySelectionStore();
  
  // Editor and API key state for computer use
  const { producerContent } = useEditorStore();
  const { getValidApiKey } = useApiKeyStore();
  
  // Feed stats synchronization - removed to fix infinite loop

  // Create producer content from selected story for computer use
  const storyBasedContent = React.useMemo(() => {
    if (!selectedStory) return undefined;
    
    return {
      content: selectedStory.narrative || selectedStory.summary || '',
      metadata: {
        title: selectedStory.title || selectedStory.originalItem?.title || 'Untitled Story',
        summary: selectedStory.summary || '',
        tags: selectedStory.topics || [],
        sentiment: selectedStory.sentiment || 'neutral',
        tone: selectedStory.tone,
        priority: selectedStory.priority,
        originalUrl: selectedStory.originalItem?.url,
        subreddit: selectedStory.originalItem?.subreddit,
        author: selectedStory.originalItem?.author,
        timestamp: selectedStory.timestamp.toISOString()
      }
    };
  }, [selectedStory]);

  // Auto-switch to preview when story is selected and preview is open
  useEffect(() => {
    if (selectedStory && isPreviewOpen) {
      // Always switch to preview when an article is clicked
      setCurrentView('preview');
      // Reset user selection so they can manually go back to stats if needed
      setUserSelectedView(null);
    }
  }, [selectedStory, isPreviewOpen]);

  // Handle manual view switching
  const handleViewChange = (view: 'preview' | 'editor') => {
    setCurrentView(view);
    setUserSelectedView(view); // Remember user's choice permanently
  };

  // Ensure producer is initialized (safe to call multiple times)
  // Global initialization happens at dashboard layout level
  // This is just a safety check in case Producer is rendered standalone
  useEffect(() => {
    if (!isInitialized) {
      initializeProducer();
      setIsInitialized(true);
    }
    // NO cleanup - managed globally at dashboard layout level
  }, [initializeProducer, isInitialized]);

  // Stats sync removed to fix infinite loop - will implement later with proper state management

  const handleToggleProducer = async () => {
    try {
      console.log('🏭 Producer: Toggle button clicked, current state:', isActive);
      if (isActive) {
        await stopProducer();
      } else {
        await startProducer();
      }
    } catch (error) {
      console.error('🏭 Producer: Error toggling producer:', error);
    }
  };



  return (
    <>
      {/* Computer Use Integration - Hidden monitoring component */}
      <ProducerComputerUseIntegration
        currentColumn={currentView}
        onInteractionStart={() => console.log('🖥️ Producer computer use started')}
        onInteractionComplete={() => console.log('✅ Producer computer use completed')}
        onError={(error) => console.error('❌ Producer computer use error:', error)}
      />
      
      <div className="h-full bg-card border border-border rounded-t-none rounded-b-lg shadow-sm flex flex-col">{/* Thin Header with Status Indicators */}
      <div className="flex bg-muted/30 items-center justify-between px-4 py-2 border-b border-border">
        {/* Left side buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewChange('preview')}
            title="Preview"
            className={`p-1 hover:bg-[#2d2d2d] rounded transition-colors border cursor-pointer ${
              currentView === 'preview' 
                ? 'border-muted-foreground text-muted-foreground' 
                : 'border-muted-foreground/70 text-muted-foreground/70'
            }`}
          >
            <Eye className="w-3 h-3" />
          </button>

          {/* <button
            onClick={() => handleViewChange('editor')}
            title="Editor"
            className={`p-1 hover:bg-[#2d2d2d] rounded transition-colors border cursor-pointer ${
              currentView === 'editor' 
                ? 'border-muted-foreground text-muted-foreground' 
                : 'border-muted-foreground/70 text-muted-foreground/70'
            }`}
          >
            <UserPen className="w-3 h-3" />
          </button> */}
        </div>

        {/* Right-side status indicator */}
        <div className="flex items-center gap-2">
          {currentView === 'editor' ? (
            <EditorStatusIndicator />
          ) : (
            <>
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-white border border-gray-300'}`}></div>
              <span className={`text-xs font-medium ${isActive ? 'text-green-400' : 'text-muted-foreground'}`}>
                {isActive ? 'Analyzing' : 'Offline'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0">{currentView === 'preview' ? (
          // Preview View - Show selected story or empty state
          <div className="h-full flex flex-col">
            {selectedStory ? (
              <>
                {/* Absolute Header */}
                <div className="flex-shrink-0 bg-card border-b border-border/20 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground/70 uppercase tracking-wider">
                        Full Story
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-xs ${
                        selectedStory.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        selectedStory.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {selectedStory.priority}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400`}>
                        {selectedStory.tone}
                      </span>
                    </div>
                    <button
                      onClick={clearSelection}
                      className="p-1 hover:bg-[#2d2d2d] rounded transition-colors text-muted-foreground/70 hover:text-muted-foreground"
                      title="Close story"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Scrollable Middle Content */}
                <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0">
                  {/* Story Title */}
                  {selectedStory.title && (
                    <h2 className="text-lg font-semibold text-foreground leading-tight mb-4">
                      {selectedStory.title}
                    </h2>
                  )}

                  {/* Story Image */}
                  {selectedStory.originalItem?.thumbnail && 
                   selectedStory.originalItem.thumbnail !== 'self' && 
                   selectedStory.originalItem.thumbnail !== 'default' && 
                   selectedStory.originalItem.thumbnail !== 'nsfw' && (
                    <div className="overflow-hidden bg-muted/20 border border-border/30 rounded mb-4">
                      <img 
                        src={selectedStory.originalItem.thumbnail}
                        alt={selectedStory.originalItem.title || selectedStory.title || 'Story image'}
                        className="w-full max-h-48 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const container = target.parentElement;
                          if (container) {
                            container.style.display = 'none';
                          }
                        }}
                      />
                    </div>
                  )}

                  {/* Full Story Content */}
                  <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap mb-4">
                    {selectedStory.narrative}
                  </div>

                  {/* Topics */}
                  {selectedStory.topics && selectedStory.topics.length > 0 && (
                    <div className="space-y-1 mb-4">
                      <div className="text-xs text-muted-foreground/70 uppercase tracking-wider">Topics</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedStory.topics.map((topic, index) => (
                          <span 
                            key={index}
                            className="px-1.5 py-0.5 bg-[#1a1a1a] rounded-sm text-xs border border-border/20 text-muted-foreground"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sentiment */}
                  {selectedStory.sentiment && (
                    <div className="space-y-1 mb-4">
                      <div className="text-xs text-muted-foreground/70 uppercase tracking-wider">Sentiment</div>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-xs ${
                        selectedStory.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                        selectedStory.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {selectedStory.sentiment}
                      </span>
                    </div>
                  )}

                  {/* Sources - Moved to middle content area */}
                  {(selectedStory.originalItem?.url || selectedStory.originalItem?.subreddit) && (
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground/70 uppercase tracking-wider">Sources</div>
                      <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                        {selectedStory.originalItem?.url && (
                          <a 
                            href={selectedStory.originalItem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-foreground transition-colors underline underline-offset-2"
                          >
                            {(() => {
                              try {
                                return new URL(selectedStory.originalItem.url).hostname;
                              } catch {
                                return 'Original Article';
                              }
                            })()}
                          </a>
                        )}
                        
                        {selectedStory.originalItem?.subreddit && (
                          <>
                            {selectedStory.originalItem?.url && <span>•</span>}
                            <a 
                              href={`https://www.reddit.com/r/${selectedStory.originalItem.subreddit}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-foreground transition-colors underline underline-offset-2"
                            >
                              r/{selectedStory.originalItem.subreddit}
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Fixed Footer */}
                <div className="flex-shrink-0 bg-card px-3 py-1 rounded-b-lg">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div>Published: {new Date(selectedStory.timestamp).toLocaleString()}</div>
                    <div>Duration: {Math.ceil(selectedStory.duration / 1000)}s</div>
                  </div>
                </div>
              </>
            ) : (
              // Empty preview state
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground/50">
                  <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Click a story in the live feed to preview</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Editor View - Show embedded editor component with proper scrolling
          <div className="h-full flex flex-col overflow-hidden">
            {/* Editor Component */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <Editor />
            </div>
          </div>
        )}
      </div>
      
      {/* Footer with story metadata and stats */}
      {selectedStory && (
        <StoryFooter story={selectedStory} currentView={currentView} />
      )}
      </div>
    </>
  );
}
