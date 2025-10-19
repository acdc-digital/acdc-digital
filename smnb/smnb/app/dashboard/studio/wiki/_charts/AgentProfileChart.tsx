"use client";

import { ReactFlow, Node, Background, Controls } from '@xyflow/react';

// Custom node component for agent cards
const AgentCardNode = ({ data }: { data: any }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 rounded-lg p-4 shadow-xl min-w-[220px]"
         style={{ borderColor: data.color }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{data.icon}</span>
        <div className="flex-1">
          <div className="font-bold text-white text-sm">{data.name}</div>
          <div className="text-xs text-gray-400">{data.id}</div>
        </div>
        <span className="text-lg">{data.status}</span>
      </div>
      <div className="text-xs text-gray-300 mb-2">{data.function}</div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">v{data.version}</span>
        <span className="px-2 py-1 rounded text-white font-medium" 
              style={{ backgroundColor: data.categoryColor }}>
          {data.category}
        </span>
      </div>
      {data.model && (
        <div className="mt-2 text-xs text-blue-400 font-mono">{data.model}</div>
      )}
      <div className="mt-2 text-xs text-gray-500">
        {data.latency} • {data.cost}
      </div>
    </div>
  );
};

const nodeTypes = {
  agentCard: AgentCardNode,
};

const initialNodes: Node[] = [
  // AI-Powered Agents (7) - Top section in grid layout
  {
    id: 'producer',
    type: 'agentCard',
    data: {
      name: 'Producer Agent',
      id: 'producer-agent',
      icon: '🎬',
      status: '🟢',
      category: 'AI-Powered',
      categoryColor: '#1e3a8a',
      color: '#3b82f6',
      function: 'Content generation from source material',
      version: '1.2.0',
      model: 'GPT-4o / Claude Opus',
      latency: '2-5s',
      cost: '$0.02-0.05',
    },
    position: { x: 50, y: 50 },
  },
  {
    id: 'editor',
    type: 'agentCard',
    data: {
      name: 'Editor Agent',
      id: 'editor-agent',
      icon: '✏️',
      status: '🟢',
      category: 'AI-Powered',
      categoryColor: '#1e3a8a',
      color: '#3b82f6',
      function: 'Content refinement and fact-checking',
      version: '1.1.0',
      model: 'GPT-4',
      latency: '1-3s',
      cost: '$0.01-0.03',
    },
    position: { x: 310, y: 50 },
  },
  {
    id: 'host',
    type: 'agentCard',
    data: {
      name: 'Host Agent',
      id: 'host-agent',
      icon: '🎙️',
      status: '🟢',
      category: 'AI-Powered',
      categoryColor: '#1e3a8a',
      color: '#3b82f6',
      function: 'Content presentation and delivery timing',
      version: '2.0.0',
      model: 'Claude 3.5 Haiku',
      latency: '500ms-1s',
      cost: '$0.001-0.005',
    },
    position: { x: 570, y: 50 },
  },
  {
    id: 'narrator',
    type: 'agentCard',
    data: {
      name: 'Narrator Agent',
      id: 'narrator-agent',
      icon: '📖',
      status: '🟢',
      category: 'AI-Powered',
      categoryColor: '#1e3a8a',
      color: '#3b82f6',
      function: 'Story narration (integrated with Host)',
      version: '1.0.0',
      model: 'GPT-4 Turbo',
      latency: '1-2s',
      cost: '$0.005-0.015',
    },
    position: { x: 830, y: 50 },
  },
  {
    id: 'sentiment',
    type: 'agentCard',
    data: {
      name: 'Sentiment Analysis',
      id: 'sentiment-agent',
      icon: '💭',
      status: '🟢',
      category: 'AI-Powered',
      categoryColor: '#1e3a8a',
      color: '#3b82f6',
      function: 'Analyzes sentiment of posts/news',
      version: '1.3.0',
      model: 'Claude 3.5 Sonnet',
      latency: '800-1200ms',
      cost: '$0.008-0.015',
    },
    position: { x: 50, y: 240 },
  },
  {
    id: 'quality',
    type: 'agentCard',
    data: {
      name: 'Quality Scoring',
      id: 'quality-agent',
      icon: '⭐',
      status: '🟢',
      category: 'AI-Powered',
      categoryColor: '#1e3a8a',
      color: '#3b82f6',
      function: 'Evaluates content quality (0-100)',
      version: '1.0.0',
      model: 'Multi-factor algorithm',
      latency: '50-100ms',
      cost: 'Negligible',
    },
    position: { x: 310, y: 240 },
  },
  {
    id: 'market',
    type: 'agentCard',
    data: {
      name: 'Market Correlation',
      id: 'market-correlation-agent',
      icon: '📈',
      status: '🟢',
      category: 'AI-Powered',
      categoryColor: '#1e3a8a',
      color: '#3b82f6',
      function: 'Correlates sentiment with MNQ1 index',
      version: '1.1.0',
      model: 'Statistical + GPT-4',
      latency: '150-300ms',
      cost: 'Negligible',
    },
    position: { x: 570, y: 240 },
  },
  
  // System Management Agents (5) - Middle section in grid layout
  {
    id: 'orchestrator',
    type: 'agentCard',
    data: {
      name: 'Orchestrator Agent',
      id: 'orchestrator-agent',
      icon: '🎯',
      status: '🟢',
      category: 'System Mgmt',
      categoryColor: '#166534',
      color: '#22c55e',
      function: 'Master pipeline coordinator',
      version: '2.0.0',
      model: null,
      latency: '10-50ms',
      cost: 'Negligible',
    },
    position: { x: 50, y: 480 },
  },
  {
    id: 'session-mgr',
    type: 'agentCard',
    data: {
      name: 'Session Manager',
      id: 'session-manager-agent',
      icon: '💬',
      status: '🟢',
      category: 'System Mgmt',
      categoryColor: '#166534',
      color: '#22c55e',
      function: 'Tracks state, costs, and history',
      version: '2.0.0',
      model: null,
      latency: '20-100ms',
      cost: 'Negligible',
    },
    position: { x: 310, y: 480 },
  },
  {
    id: 'whistleblower',
    type: 'agentCard',
    data: {
      name: 'Whistleblower',
      id: 'whistleblower-agent',
      icon: '🚨',
      status: '🟢',
      category: 'System Mgmt',
      categoryColor: '#166534',
      color: '#22c55e',
      function: 'Rate limit monitor and circuit breaker',
      version: '1.0.0',
      model: null,
      latency: '5-20ms',
      cost: 'Negligible',
    },
    position: { x: 570, y: 480 },
  },
  {
    id: 'queue',
    type: 'agentCard',
    data: {
      name: 'Queue Manager',
      id: 'queue-manager',
      icon: '📋',
      status: '🟢',
      category: 'System Mgmt',
      categoryColor: '#166534',
      color: '#22c55e',
      function: 'Intelligent post selection algorithm',
      version: '1.2.0',
      model: null,
      latency: '30-100ms',
      cost: 'Negligible',
    },
    position: { x: 830, y: 480 },
  },
  {
    id: 'scheduler',
    type: 'agentCard',
    data: {
      name: 'Scheduler Agent',
      id: 'scheduler-agent',
      icon: '⏰',
      status: '🟢',
      category: 'System Mgmt',
      categoryColor: '#166534',
      color: '#22c55e',
      function: 'Timing and scheduling system',
      version: '1.0.0',
      model: null,
      latency: '5-15ms',
      cost: 'Negligible',
    },
    position: { x: 180, y: 670 },
  },
  
  // State Management Agents (3) - Bottom section in grid layout
  {
    id: 'threading',
    type: 'agentCard',
    data: {
      name: 'Threading Agent',
      id: 'threading-agent',
      icon: '🧵',
      status: '🟢',
      category: 'State Mgmt',
      categoryColor: '#7c2d12',
      color: '#f97316',
      function: 'Deduplication and story grouping',
      version: '1.1.0',
      model: null,
      latency: '100-250ms',
      cost: 'Negligible',
    },
    position: { x: 180, y: 910 },
  },
  {
    id: 'feed-state',
    type: 'agentCard',
    data: {
      name: 'Feed State Manager',
      id: 'feed-state-manager',
      icon: '📰',
      status: '🟢',
      category: 'State Mgmt',
      categoryColor: '#7c2d12',
      color: '#f97316',
      function: 'Live feed state management',
      version: '1.0.0',
      model: null,
      latency: '10-30ms',
      cost: 'Negligible',
    },
    position: { x: 440, y: 910 },
  },
  {
    id: 'ticker-state',
    type: 'agentCard',
    data: {
      name: 'Ticker State Manager',
      id: 'ticker-state-manager',
      icon: '💹',
      status: '🟢',
      category: 'State Mgmt',
      categoryColor: '#7c2d12',
      color: '#f97316',
      function: 'Selected ticker context management',
      version: '1.0.0',
      model: null,
      latency: '5-20ms',
      cost: 'Negligible',
    },
    position: { x: 700, y: 910 },
  },
];

export default function AgentProfileChart() {
  return (
    <div className="w-full h-full" style={{ minHeight: '1200px' }}>
      <ReactFlow
        nodes={initialNodes}
        edges={[]}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background color="#333" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
