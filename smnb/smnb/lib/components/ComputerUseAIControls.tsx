/**
 * Enhanced AI Formatting Controls with Computer Use Integration
 * Provides AI formatting buttons that trigger computer use interactions
 * Only active when producer column is set to 'editor'
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '../../components/ui/button';
import { useProducerComputerUse, type EditorInteractionOptions } from '../components/ProducerComputerUseIntegration';

interface ComputerUseAIControlsProps {
  currentColumn: string;
  producerContent?: {
    content: string;
    metadata?: {
      title: string;
      summary: string;
      tags: string[];
      sentiment: string;
    };
  };
  apiKey?: string;
  onInteractionStart?: () => void;
  onInteractionComplete?: () => void;
  onError?: (error: Error) => void;
}

export const ComputerUseAIControls: React.FC<ComputerUseAIControlsProps> = ({
  currentColumn,
  producerContent,
  apiKey,
  onInteractionStart,
  onInteractionComplete,
  onError
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');
  
  const {
    initializeService,
    interactWithEditor,
    setEditorActive,
    isReady,
    getStatus
  } = useProducerComputerUse();

  // Initialize service when component mounts
  React.useEffect(() => {
    if (apiKey) {
      try {
        const service = initializeService(apiKey);
        service.startMonitoring();
        // Reduced logging to prevent console spam
        // console.log('🖥️ Computer use AI controls initialized');
      } catch (error) {
        console.error('❌ Failed to initialize computer use:', error);
        onError?.(error as Error);
      }
    }
  }, [apiKey, initializeService, onError]);

  // Update editor active state when column changes
  React.useEffect(() => {
    const editorActive = currentColumn === 'editor';
    setEditorActive(editorActive);
  }, [currentColumn, setEditorActive]);

  // Handle AI interaction with computer use
  const handleAIAction = useCallback(async (action: EditorInteractionOptions['action']) => {
    if (!producerContent?.content) {
      onError?.(new Error('No content available for processing'));
      return;
    }

    if (!isReady()) {
      onError?.(new Error('Computer use not ready - ensure editor column is selected'));
      return;
    }

    try {
      setIsProcessing(true);
      setLastAction(action);
      onInteractionStart?.();

      console.log(`🤖 Starting computer use AI action: ${action}`);
      console.log(`📄 Content preview:`, producerContent.content.slice(0, 200) + '...');
      console.log(`📋 Metadata:`, producerContent.metadata);

      const interactionOptions: EditorInteractionOptions = {
        action,
        content: producerContent.content,
        context: producerContent.metadata ? JSON.stringify(producerContent.metadata) : undefined
      };

      await interactWithEditor(interactionOptions);

      console.log(`✅ Computer use AI action completed: ${action}`);
      onInteractionComplete?.();

    } catch (error) {
      console.error(`❌ Computer use AI action failed: ${action}`, error);
      onError?.(error as Error);
    } finally {
      setIsProcessing(false);
      setLastAction('');
    }
  }, [producerContent, isReady, interactWithEditor, onInteractionStart, onInteractionComplete, onError]);

  const status = getStatus();
  const editorColumnActive = currentColumn === 'editor';
  const hasContent = Boolean(producerContent?.content);
  const canInteract = editorColumnActive && hasContent && status.ready && !isProcessing;

  return (
    <div className="computer-use-ai-controls flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border">
      {/* Status indicator and title */}
      <div className="flex items-center gap-2 text-xs">
        <div className={`w-1.5 h-1.5 rounded-full ${
          status.ready ? 'bg-green-500' : 'bg-gray-400'
        }`}></div>
        <span className="text-muted-foreground font-medium">AI</span>
      </div>

      {/* Vertical separator */}
      <div className="w-px h-4 bg-border"></div>

      {/* Compact AI Action Buttons */}
      <div className="flex items-center gap-1">
        <Button
          onClick={() => handleAIAction('newsletter-format')}
          disabled={!canInteract}
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs hover:bg-muted"
          title="Format as newsletter"
        >
          📧 Newsletter
        </Button>

        <Button
          onClick={() => handleAIAction('blog-post')}
          disabled={!canInteract}
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs hover:bg-muted"
          title="Analytical article"
        >
          📝 Blog Post
        </Button>

        <Button
          onClick={() => handleAIAction('enhance')}
          disabled={!canInteract}
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs hover:bg-muted"
          title="Improve content"
        >
          ✨ Enhance
        </Button>

        <Button
          onClick={() => handleAIAction('summarize')}
          disabled={!canInteract}
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs hover:bg-muted"
          title="Create summary"
        >
          📋 Summarize
        </Button>

        <Button
          onClick={() => handleAIAction('rewrite')}
          disabled={!canInteract}
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs hover:bg-muted"
          title="Fresh perspective on content"
        >
          🔄 Rewrite
        </Button>
      </div>

      {/* Status message - compact */}
      <div className="ml-auto text-xs text-muted-foreground">
        {isProcessing && (
          <span className="text-blue-600 dark:text-blue-400">
            Processing {lastAction}...
          </span>
        )}
        {!isProcessing && !canInteract && !editorColumnActive && (
          <span className="text-amber-600 dark:text-amber-400">
            Select Editor column
          </span>
        )}
        {!isProcessing && !canInteract && editorColumnActive && !hasContent && (
          <span className="text-amber-600 dark:text-amber-400">
            Select a story to format
          </span>
        )}
        {!isProcessing && canInteract && (
          <span className="text-green-600 dark:text-green-400">
            Ready{producerContent?.metadata?.title ? ` - ${producerContent.metadata.title.slice(0, 30)}...` : ''}
          </span>
        )}
      </div>

      {/* Debug info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
          Col:{currentColumn} | Content:{hasContent.toString()} | Status:{status.ready.toString()}
        </div>
      )}
    </div>
  );
};