'use client';

import React from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  BackgroundVariant,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/base.css';

interface FlowDiagramProps {
  type: 'system-overview' | 'data-flow' | 'state-machine';
}

// System Overview Flow
const systemOverviewNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: '🚀 User Opens Dashboard' },
    position: { x: 250, y: 0 },
    style: { background: '#4f46e5', color: '#fff', border: '2px solid #4338ca', fontWeight: 'bold' },
  },
  {
    id: '2',
    data: { label: '⚙️ Configure Controls' },
    position: { x: 250, y: 100 },
    style: { background: '#1e1e1e', color: '#fff', border: '2px solid #2d2d2d' },
  },
  {
    id: '3',
    data: { label: '▶️ Start Monitoring' },
    position: { x: 250, y: 200 },
    style: { background: '#10b981', color: '#fff', border: '2px solid #059669', fontWeight: 'bold' },
  },
  {
    id: '4',
    data: { label: '📡 Fetch Reddit Posts' },
    position: { x: 100, y: 320 },
    style: { background: '#f59e0b', color: '#000', border: '2px solid #d97706' },
  },
  {
    id: '5',
    data: { label: '🤖 Generate AI Insights' },
    position: { x: 400, y: 320 },
    style: { background: '#8b5cf6', color: '#fff', border: '2px solid #7c3aed' },
  },
  {
    id: '6',
    data: { label: '💾 Save to Database' },
    position: { x: 250, y: 440 },
    style: { background: '#06b6d4', color: '#fff', border: '2px solid #0891b2' },
  },
  {
    id: '7',
    type: 'output',
    data: { label: '📊 Display in Feed' },
    position: { x: 250, y: 560 },
    style: { background: '#ec4899', color: '#fff', border: '2px solid #db2777', fontWeight: 'bold' },
  },
];

const systemOverviewEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#4f46e5' } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#10b981' } },
  { id: 'e3-4', source: '3', target: '4', label: 'Poll Reddit', style: { stroke: '#f59e0b' } },
  { id: 'e3-5', source: '3', target: '5', label: 'Analyze Posts', style: { stroke: '#8b5cf6' } },
  { id: 'e4-6', source: '4', target: '6', animated: true },
  { id: 'e5-6', source: '5', target: '6', animated: true },
  { id: 'e6-7', source: '6', target: '7', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 } },
  { id: 'e7-4', source: '7', target: '4', label: 'Repeat', type: 'smoothstep', animated: true, style: { stroke: '#6b7280', strokeDasharray: '5 5' } },
];

// Data Flow
const dataFlowNodes: Node[] = [
  {
    id: 'user',
    type: 'input',
    data: { label: '👤 User' },
    position: { x: 0, y: 150 },
    style: { background: '#4f46e5', color: '#fff', border: '2px solid #4338ca' },
  },
  {
    id: 'controls',
    data: { label: '🎛️ Control Panel' },
    position: { x: 150, y: 150 },
    style: { background: '#1e1e1e', color: '#fff', border: '2px solid #2d2d2d' },
  },
  {
    id: 'service',
    data: { label: '⚡ Live Feed Service' },
    position: { x: 350, y: 150 },
    style: { background: '#10b981', color: '#fff', border: '2px solid #059669' },
  },
  {
    id: 'reddit',
    data: { label: '🌐 Reddit API' },
    position: { x: 550, y: 50 },
    style: { background: '#f59e0b', color: '#000', border: '2px solid #d97706' },
  },
  {
    id: 'ai',
    data: { label: '🤖 Claude AI' },
    position: { x: 550, y: 250 },
    style: { background: '#8b5cf6', color: '#fff', border: '2px solid #7c3aed' },
  },
  {
    id: 'db',
    data: { label: '💾 Convex DB' },
    position: { x: 750, y: 150 },
    style: { background: '#06b6d4', color: '#fff', border: '2px solid #0891b2' },
  },
  {
    id: 'feed',
    type: 'output',
    data: { label: '📊 Live Feed Display' },
    position: { x: 950, y: 150 },
    style: { background: '#ec4899', color: '#fff', border: '2px solid #db2777' },
  },
];

const dataFlowEdges: Edge[] = [
  { id: 'e-user-controls', source: 'user', target: 'controls', label: 'Configure', animated: true },
  { id: 'e-controls-service', source: 'controls', target: 'service', label: 'Start/Stop', animated: true },
  { id: 'e-service-reddit', source: 'service', target: 'reddit', label: 'Fetch Posts', animated: true },
  { id: 'e-reddit-service', source: 'reddit', target: 'service', label: 'Posts Array', animated: true },
  { id: 'e-service-ai', source: 'service', target: 'ai', label: 'Analyze', animated: true },
  { id: 'e-ai-service', source: 'ai', target: 'service', label: 'Insights', animated: true },
  { id: 'e-service-db', source: 'service', target: 'db', label: 'Store', animated: true },
  { id: 'e-db-feed', source: 'db', target: 'feed', label: 'Real-time', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 } },
  { id: 'e-feed-user', source: 'feed', target: 'user', label: 'View', type: 'smoothstep', animated: true, style: { stroke: '#6b7280' } },
];

// State Machine
const stateMachineNodes: Node[] = [
  {
    id: 'stopped',
    data: { label: '⭕ Stopped\n\nReady to start\nNo polling active' },
    position: { x: 100, y: 250 },
    style: { 
      background: '#6b7280', 
      color: '#fff', 
      border: '2px solid #4b5563',
      padding: '20px',
      borderRadius: '8px',
      textAlign: 'center',
      whiteSpace: 'pre-line'
    },
  },
  {
    id: 'running',
    data: { label: '✅ Running\n\nFetching posts\nGenerating insights\nUpdating feed' },
    position: { x: 400, y: 100 },
    style: { 
      background: '#10b981', 
      color: '#fff', 
      border: '2px solid #059669',
      padding: '20px',
      borderRadius: '8px',
      textAlign: 'center',
      whiteSpace: 'pre-line',
      fontWeight: 'bold'
    },
  },
  {
    id: 'paused',
    data: { label: '⏸️ Paused\n\nRate limited\nWaiting for reset\nAuto-resumes' },
    position: { x: 400, y: 400 },
    style: { 
      background: '#f59e0b', 
      color: '#000', 
      border: '2px solid #d97706',
      padding: '20px',
      borderRadius: '8px',
      textAlign: 'center',
      whiteSpace: 'pre-line'
    },
  },
  {
    id: 'error',
    data: { label: '❌ Error\n\nAPI failure\nCheck logs\nManual restart' },
    position: { x: 700, y: 250 },
    style: { 
      background: '#ef4444', 
      color: '#fff', 
      border: '2px solid #dc2626',
      padding: '20px',
      borderRadius: '8px',
      textAlign: 'center',
      whiteSpace: 'pre-line'
    },
  },
];

const stateMachineEdges: Edge[] = [
  { 
    id: 'e-stopped-running', 
    source: 'stopped', 
    target: 'running', 
    label: '▶️ Start', 
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 2 }
  },
  { 
    id: 'e-running-stopped', 
    source: 'running', 
    target: 'stopped', 
    label: '⏹️ Stop',
    type: 'smoothstep',
    style: { stroke: '#6b7280' }
  },
  { 
    id: 'e-running-paused', 
    source: 'running', 
    target: 'paused', 
    label: '429 Error',
    animated: true,
    style: { stroke: '#f59e0b' }
  },
  { 
    id: 'e-paused-running', 
    source: 'paused', 
    target: 'running', 
    label: 'Auto Resume',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#10b981', strokeDasharray: '5 5' }
  },
  { 
    id: 'e-running-error', 
    source: 'running', 
    target: 'error', 
    label: 'Fatal Error',
    style: { stroke: '#ef4444' }
  },
  { 
    id: 'e-error-stopped', 
    source: 'error', 
    target: 'stopped', 
    label: 'Restart',
    type: 'smoothstep',
    style: { stroke: '#6b7280' }
  },
  { 
    id: 'e-running-running', 
    source: 'running', 
    target: 'running', 
    label: '🔄 Polling',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#10b981', strokeDasharray: '5 5' }
  },
];

export default function FlowDiagram({ type }: FlowDiagramProps) {
  const getFlowData = () => {
    switch (type) {
      case 'system-overview':
        return { nodes: systemOverviewNodes, edges: systemOverviewEdges };
      case 'data-flow':
        return { nodes: dataFlowNodes, edges: dataFlowEdges };
      case 'state-machine':
        return { nodes: stateMachineNodes, edges: stateMachineEdges };
      default:
        return { nodes: systemOverviewNodes, edges: systemOverviewEdges };
    }
  };

  const { nodes: initialNodes, edges: initialEdges } = getFlowData();
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <ReactFlowProvider>
      <div className="w-full h-[600px] bg-[#0d0d0d] rounded-lg border border-[#2d2d2d] my-6">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          connectionMode={ConnectionMode.Loose}
          fitView
          attributionPosition="bottom-left"
          className="bg-[#0d0d0d]"
        >
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={16} 
            size={1}
            color="#2d2d2d"
          />
          <Controls className="bg-[#1e1e1e] border border-[#2d2d2d]" />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}
