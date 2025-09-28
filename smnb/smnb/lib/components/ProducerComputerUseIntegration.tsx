/**
 * Producer Computer Use Integration
 * Connects the computer use service with the producer column panel
 * Monitors column selection and triggers computer use when editor is active
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { getComputerUseService, type EditorInteractionOptions } from '../services/producer/producerComputerUse';

// Re-export the type for easier imports
export type { EditorInteractionOptions };

interface ProducerComputerUseProps {
  currentColumn: string;
  apiKey?: string;
  onInteractionStart?: () => void;
  onInteractionComplete?: () => void;
  onError?: (error: Error) => void;
}

export const ProducerComputerUseIntegration: React.FC<ProducerComputerUseProps> = ({
  currentColumn,
  apiKey,
  onInteractionStart,
  onInteractionComplete,
  onError
}) => {
  const serviceRef = useRef<ReturnType<typeof getComputerUseService> | null>(null);
  const isInitialized = useRef(false);

  // Initialize the computer use service
  useEffect(() => {
    if (!apiKey || isInitialized.current) return;

    try {
      serviceRef.current = getComputerUseService({
        apiKey,
        model: 'claude-3-7-sonnet-20250219',
        maxTokens: 4000,
        displayWidth: 1280,
        displayHeight: 800
      });

      serviceRef.current.startMonitoring();
      isInitialized.current = true;

      console.log('🖥️ Producer computer use integration initialized');
    } catch (error) {
      console.error('❌ Failed to initialize computer use service:', error);
      onError?.(error as Error);
    }
  }, [apiKey, onError]);

  // Monitor column changes
  useEffect(() => {
    if (!serviceRef.current) return;

    const isEditorActive = currentColumn === 'editor';
    serviceRef.current.setEditorColumnActive(isEditorActive);

    if (isEditorActive) {
      console.log('✅ Editor column selected - computer use ready');
    } else {
      console.log('❌ Editor column deselected - computer use paused');
    }
  }, [currentColumn]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (serviceRef.current) {
        serviceRef.current.stopMonitoring();
        console.log('🖥️ Producer computer use integration cleaned up');
      }
    };
  }, []);

  // Expose interaction methods to parent components
  const handleInteraction = async (options: EditorInteractionOptions) => {
    if (!serviceRef.current) {
      throw new Error('Computer use service not initialized');
    }

    if (!serviceRef.current.isReady()) {
      throw new Error('Computer use service not ready - ensure editor column is selected');
    }

    try {
      onInteractionStart?.();
      console.log(`🤖 Starting computer use interaction: ${options.action}`);
      
      await serviceRef.current.interactWithEditor(options);
      
      console.log('✅ Computer use interaction completed successfully');
      onInteractionComplete?.();
    } catch (error) {
      console.error('❌ Computer use interaction failed:', error);
      onError?.(error as Error);
      throw error;
    }
  };

  // Expose interaction method for external use
  React.useEffect(() => {
    if (serviceRef.current && typeof window !== 'undefined') {
      // Make interaction method available globally for debugging/external access
      (window as any).computerUseInteract = handleInteraction;
    }
  }, []);

  const status = serviceRef.current?.getStatus();

  return (
    <div className="computer-use-integration">
      {/* Computer use integration runs silently in background */}
    </div>
  );
};

/**
 * Hook for using computer use functionality in components
 */
export const useProducerComputerUse = () => {
  const serviceRef = useRef<ReturnType<typeof getComputerUseService> | null>(null);

  const initializeService = (apiKey: string) => {
    if (!serviceRef.current) {
      serviceRef.current = getComputerUseService({
        apiKey,
        model: 'claude-3-7-sonnet-20250219',
        maxTokens: 4000,
        displayWidth: 1280,
        displayHeight: 800
      });
    }
    return serviceRef.current;
  };

  const interactWithEditor = async (options: EditorInteractionOptions) => {
    if (!serviceRef.current) {
      throw new Error('Computer use service not initialized');
    }

    return await serviceRef.current.interactWithEditor(options);
  };

  const setEditorActive = (active: boolean) => {
    if (serviceRef.current) {
      serviceRef.current.setEditorColumnActive(active);
    }
  };

  const isReady = () => {
    return serviceRef.current?.isReady() || false;
  };

  const getStatus = () => {
    return serviceRef.current?.getStatus() || {
      monitoring: false,
      editorActive: false,
      ready: false
    };
  };

  return {
    initializeService,
    interactWithEditor,
    setEditorActive,
    isReady,
    getStatus
  };
};