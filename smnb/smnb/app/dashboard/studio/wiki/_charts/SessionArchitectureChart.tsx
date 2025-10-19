"use client";

import { ReactFlow, Node, Edge, Background, Controls } from '@xyflow/react';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: '👤 User' },
    position: { x: 250, y: 0 },
    style: { background: '#1e3a8a', color: 'white', border: '2px solid #3b82f6' },
  },
  {
    id: '2',
    data: { label: '💬 Chat Session' },
    position: { x: 250, y: 100 },
    style: { background: '#1e293b', color: 'white', border: '2px solid #475569', width: 180 },
  },
  {
    id: '3',
    data: { label: '📝 Messages Table' },
    position: { x: 50, y: 220 },
    style: { background: '#166534', color: 'white', border: '2px solid #22c55e', width: 160 },
  },
  {
    id: '4',
    data: { label: '🔧 Tools Table' },
    position: { x: 250, y: 220 },
    style: { background: '#7c2d12', color: 'white', border: '2px solid #f97316', width: 140 },
  },
  {
    id: '5',
    data: { label: '🤖 MCP Server' },
    position: { x: 430, y: 220 },
    style: { background: '#581c87', color: 'white', border: '2px solid #a855f7', width: 140 },
  },
  {
    id: '6',
    data: { label: '🧠 AI Agent' },
    position: { x: 130, y: 340 },
    style: { background: '#831843', color: 'white', border: '2px solid #ec4899', width: 120 },
  },
  {
    id: '7',
    data: { label: '⚡ Tool Execution' },
    position: { x: 350, y: 340 },
    style: { background: '#4c1d95', color: 'white', border: '2px solid #8b5cf6', width: 150 },
  },
  {
    id: '8',
    type: 'output',
    data: { label: '✅ Response' },
    position: { x: 250, y: 460 },
    style: { background: '#1e3a8a', color: 'white', border: '2px solid #3b82f6' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', label: 'creates', animated: true },
  { id: 'e2-3', source: '2', target: '3', label: 'stores', animated: true },
  { id: 'e2-4', source: '2', target: '4', label: 'references' },
  { id: 'e4-5', source: '4', target: '5', label: 'connects to', animated: true },
  { id: 'e3-6', source: '3', target: '6', label: 'processes' },
  { id: 'e5-7', source: '5', target: '7', label: 'executes', animated: true },
  { id: 'e6-8', source: '6', target: '8', animated: true },
  { id: 'e7-8', source: '7', target: '8', animated: true },
];

export default function SessionArchitectureChart() {
  return (
    <div className="w-full h-full" style={{ minHeight: '600px' }}>
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        fitView
        className="bg-background"
      >
        <Background color="#333" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
