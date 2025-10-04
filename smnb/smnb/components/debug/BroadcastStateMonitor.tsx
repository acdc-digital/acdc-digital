/**
 * Broadcast State Monitor Component
 * 
 * Real-time debugging panel that displays the complete state of the broadcast orchestrator
 * and all child stores. Shows state transitions, errors, and validation status.
 * 
 * Usage:
 * - Add to dashboard layout for development
 * - Conditionally render only in dev mode
 * - Provides visual feedback for state debugging
 */

'use client';

import React, { useState } from 'react';
import { 
  useBroadcastOrchestrator, 
  useBroadcastSnapshot,
  type BroadcastState 
} from '@/lib/stores/orchestrator/broadcastOrchestrator';

// ============================================================================
// COMPONENT
// ============================================================================

export function BroadcastStateMonitor() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showRawState, setShowRawState] = useState(false);
  
  const orchestrator = useBroadcastOrchestrator();
  const snapshot = useBroadcastSnapshot();
  
  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-black/90 text-white px-4 py-2 rounded-lg font-mono text-xs hover:bg-black transition-colors"
        >
          🔍 State Monitor
        </button>
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/95 text-white p-4 rounded-lg font-mono text-xs max-w-md max-h-[600px] overflow-y-auto z-50 shadow-2xl border border-neutral-800">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-neutral-700">
        <h3 className="font-bold text-sm">🔍 Broadcast State Monitor</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowRawState(!showRawState)}
            className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 transition-colors"
          >
            {showRawState ? 'Simple' : 'Raw'}
          </button>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
      
      {/* Main State Display */}
      {!showRawState ? (
        <>
          {/* Orchestrator State */}
          <Section title="Orchestrator">
            <StateRow 
              label="State" 
              value={snapshot.orchestrator.state}
              valueColor={getStateColor(snapshot.orchestrator.state)}
              isBadge
            />
            <StateRow 
              label="Previous" 
              value={snapshot.orchestrator.previousState || 'none'} 
            />
            {snapshot.orchestrator.error && (
              <StateRow 
                label="Error" 
                value={snapshot.orchestrator.error}
                valueColor="text-red-400"
              />
            )}
            {snapshot.orchestrator.lastTransition && (
              <StateRow 
                label="Last Transition" 
                value={`${snapshot.orchestrator.lastTransition.from} → ${snapshot.orchestrator.lastTransition.to}`}
              />
            )}
          </Section>
          
          {/* Host Agent */}
          <Section title="Host Agent">
            <StateRow 
              label="Active" 
              value={snapshot.host.isActive}
              valueColor={snapshot.host.isActive ? 'text-green-400' : 'text-gray-500'}
            />
            <StateRow 
              label="Initialized" 
              value={snapshot.host.isInitialized}
              valueColor={snapshot.host.isInitialized ? 'text-green-400' : 'text-red-400'}
            />
            <StateRow label="Queue Length" value={snapshot.host.queueLength} />
            <StateRow 
              label="Streaming" 
              value={snapshot.host.isStreaming}
              valueColor={snapshot.host.isStreaming ? 'text-cyan-400' : 'text-gray-500'}
            />
          </Section>
          
          {/* Producer */}
          <Section title="Producer">
            <StateRow 
              label="Active" 
              value={snapshot.producer.isActive}
              valueColor={snapshot.producer.isActive ? 'text-green-400' : 'text-gray-500'}
            />
            <StateRow 
              label="Processing" 
              value={snapshot.producer.isProcessing}
              valueColor={snapshot.producer.isProcessing ? 'text-yellow-400' : 'text-gray-500'}
            />
          </Section>
          
          {/* Live Feed */}
          <Section title="Live Feed">
            <StateRow 
              label="Live" 
              value={snapshot.liveFeed.isLive}
              valueColor={snapshot.liveFeed.isLive ? 'text-green-400' : 'text-gray-500'}
            />
            <StateRow label="Posts Count" value={snapshot.liveFeed.postsCount} />
            <StateRow 
              label="Has Content" 
              value={snapshot.liveFeed.hasContent}
              valueColor={snapshot.liveFeed.hasContent ? 'text-green-400' : 'text-red-400'}
            />
          </Section>
          
          {/* Session */}
          <Section title="Session">
            <StateRow 
              label="Active" 
              value={snapshot.session.isActive}
              valueColor={snapshot.session.isActive ? 'text-green-400' : 'text-gray-500'}
            />
            <StateRow 
              label="Duration" 
              value={formatDuration(snapshot.session.duration)} 
            />
            <StateRow 
              label="Session ID" 
              value={snapshot.session.sessionId || 'none'} 
            />
          </Section>
          
          {/* Convex Sync */}
          <Section title="Convex">
            <StateRow 
              label="Synced" 
              value={snapshot.convex.isSynced}
              valueColor={snapshot.convex.isSynced ? 'text-green-400' : 'text-yellow-400'}
            />
            <StateRow 
              label="Session ID" 
              value={snapshot.convex.sessionId || 'none'} 
            />
          </Section>
          
          {/* Computed Flags */}
          <Section title="Computed">
            <StateRow 
              label="Can Start" 
              value={snapshot.computed.canStart}
              valueColor={snapshot.computed.canStart ? 'text-green-400' : 'text-red-400'}
            />
            <StateRow 
              label="Can Stop" 
              value={snapshot.computed.canStop}
              valueColor={snapshot.computed.canStop ? 'text-green-400' : 'text-red-400'}
            />
            <StateRow 
              label="Transitioning" 
              value={snapshot.computed.isTransitioning}
              valueColor={snapshot.computed.isTransitioning ? 'text-yellow-400' : 'text-gray-500'}
            />
          </Section>
          
          {/* Actions */}
          <Section title="Actions">
            <div className="flex gap-2 flex-wrap">
              <ActionButton
                label="Initialize"
                onClick={() => orchestrator.initialize()}
                disabled={orchestrator.state !== 'idle'}
              />
              <ActionButton
                label="Start"
                onClick={() => orchestrator.startBroadcast()}
                disabled={!snapshot.computed.canStart}
                variant="success"
              />
              <ActionButton
                label="Stop"
                onClick={() => orchestrator.stopBroadcast()}
                disabled={!snapshot.computed.canStop}
                variant="danger"
              />
              <ActionButton
                label="Emergency Stop"
                onClick={() => orchestrator.emergencyStop()}
                variant="danger"
              />
              <ActionButton
                label="Recover"
                onClick={() => orchestrator.recover()}
                disabled={orchestrator.state !== 'error'}
                variant="warning"
              />
            </div>
          </Section>
        </>
      ) : (
        /* Raw State JSON */
        <pre className="text-xs overflow-x-auto bg-neutral-900 p-2 rounded">
          {JSON.stringify(snapshot, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 pb-3 border-b border-neutral-800 last:border-b-0">
      <h4 className="text-neutral-400 font-semibold mb-2 text-xs">{title}</h4>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

interface StateRowProps {
  label: string;
  value: string | number | boolean | null;
  valueColor?: string;
  isBadge?: boolean;
}

function StateRow({ label, value, valueColor = 'text-cyan-400', isBadge = false }: StateRowProps) {
  const displayValue = typeof value === 'boolean' 
    ? (value ? '✓' : '✗')
    : value?.toString() || 'null';
  
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400 text-xs">{label}:</span>
      {isBadge ? (
        <span className={`${valueColor} px-2 py-0.5 rounded text-xs font-semibold bg-neutral-800`}>
          {displayValue}
        </span>
      ) : (
        <span className={`${valueColor} text-xs font-medium`}>
          {displayValue}
        </span>
      )}
    </div>
  );
}

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'success' | 'danger' | 'warning';
}

function ActionButton({ label, onClick, disabled = false, variant = 'default' }: ActionButtonProps) {
  const variants = {
    default: 'bg-neutral-700 hover:bg-neutral-600 text-white',
    success: 'bg-green-600 hover:bg-green-500 text-white',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-500 text-white',
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-2 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`}
    >
      {label}
    </button>
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getStateColor(state: BroadcastState): string {
  const stateColors: Record<BroadcastState, string> = {
    'idle': 'text-gray-400',
    'initializing': 'text-yellow-400',
    'ready': 'text-blue-400',
    'starting': 'text-yellow-400',
    'live': 'text-green-400',
    'stopping': 'text-yellow-400',
    'error': 'text-red-400',
  };
  
  return stateColors[state] || 'text-white';
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  const s = seconds % 60;
  const m = minutes % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
