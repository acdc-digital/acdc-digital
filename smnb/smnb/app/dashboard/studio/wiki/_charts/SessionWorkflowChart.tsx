"use client";

import { ReactFlow, Node, Edge, Background, Controls } from '@xyflow/react';

const initialNodes: Node[] = [
  // User starts conversation
  {
    id: '1',
    type: 'input',
    data: { label: '👤 User Input' },
    position: { x: 300, y: 0 },
    style: { background: '#1e3a8a', color: 'white', border: '2px solid #3b82f6', width: 140 },
  },
  // Frontend processing
  {
    id: '2',
    data: { label: '⚡ Frontend Component' },
    position: { x: 275, y: 80 },
    style: { background: '#1e293b', color: 'white', border: '2px solid #475569', width: 190 },
  },
  // Convex mutation
  {
    id: '3',
    data: { label: '📝 sendMessage()' },
    position: { x: 295, y: 160 },
    style: { background: '#166534', color: 'white', border: '2px solid #22c55e', width: 150 },
  },
  // Store in database
  {
    id: '4',
    data: { label: '💾 Store in DB' },
    position: { x: 300, y: 240 },
    style: { background: '#581c87', color: 'white', border: '2px solid #a855f7', width: 140 },
  },
  // AI Processing decision point
  {
    id: '5',
    data: { label: '🤖 AI Processing' },
    position: { x: 295, y: 320 },
    style: { background: '#831843', color: 'white', border: '2px solid #ec4899', width: 150 },
  },
  // Tool execution branch
  {
    id: '6',
    data: { label: '🔧 Tool Required?' },
    position: { x: 90, y: 410 },
    style: { background: '#7c2d12', color: 'white', border: '2px solid #f97316', width: 150 },
  },
  // Tool execution flow
  {
    id: '7',
    data: { label: '⚙️ Execute Tool' },
    position: { x: 95, y: 490 },
    style: { background: '#4c1d95', color: 'white', border: '2px solid #8b5cf6', width: 140 },
  },
  // Tool results
  {
    id: '8',
    data: { label: '📊 Tool Results' },
    position: { x: 95, y: 570 },
    style: { background: '#065f46', color: 'white', border: '2px solid #10b981', width: 140 },
  },
  // MCP Server branch
  {
    id: '9',
    data: { label: '🔌 MCP Server Check' },
    position: { x: 500, y: 410 },
    style: { background: '#1e40af', color: 'white', border: '2px solid #60a5fa', width: 170 },
  },
  // MCP execution
  {
    id: '10',
    data: { label: '🌐 MCP Execute' },
    position: { x: 505, y: 490 },
    style: { background: '#6d28d9', color: 'white', border: '2px solid #a78bfa', width: 160 },
  },
  // MCP results
  {
    id: '11',
    data: { label: '📡 MCP Results' },
    position: { x: 510, y: 570 },
    style: { background: '#0e7490', color: 'white', border: '2px solid #22d3ee', width: 150 },
  },
  // Direct response
  {
    id: '12',
    data: { label: '💬 Direct Response' },
    position: { x: 285, y: 490 },
    style: { background: '#15803d', color: 'white', border: '2px solid #4ade80', width: 170 },
  },
  // Aggregate context
  {
    id: '13',
    data: { label: '🧠 Aggregate Context' },
    position: { x: 278, y: 650 },
    style: { background: '#7e22ce', color: 'white', border: '2px solid #c084fc', width: 184 },
  },
  // Generate response
  {
    id: '14',
    data: { label: '✨ Generate Response' },
    position: { x: 275, y: 730 },
    style: { background: '#be123c', color: 'white', border: '2px solid #fb7185', width: 190 },
  },
  // Store response
  {
    id: '15',
    data: { label: '💾 Store Response' },
    position: { x: 285, y: 810 },
    style: { background: '#166534', color: 'white', border: '2px solid #22c55e', width: 170 },
  },
  // Real-time update
  {
    id: '16',
    type: 'output',
    data: { label: '⚡ Real-time Update' },
    position: { x: 280, y: 890 },
    style: { background: '#1e3a8a', color: 'white', border: '2px solid #3b82f6', width: 180 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', label: 'submit', animated: true },
  { id: 'e2-3', source: '2', target: '3', label: 'mutation', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: true },
  { id: 'e4-5', source: '4', target: '5', label: 'process', animated: true },
  
  // Decision branches from AI Processing
  { id: 'e5-6', source: '5', target: '6', label: 'check tools' },
  { id: 'e5-9', source: '5', target: '9', label: 'check MCP' },
  { id: 'e5-12', source: '5', target: '12', label: 'direct answer' },
  
  // Tool execution path
  { id: 'e6-7', source: '6', target: '7', label: 'yes', animated: true },
  { id: 'e7-8', source: '7', target: '8', animated: true },
  { id: 'e8-13', source: '8', target: '13', animated: true },
  
  // MCP execution path
  { id: 'e9-10', source: '9', target: '10', label: 'yes', animated: true },
  { id: 'e10-11', source: '10', target: '11', animated: true },
  { id: 'e11-13', source: '11', target: '13', animated: true },
  
  // Direct response path
  { id: 'e12-13', source: '12', target: '13', animated: true },
  
  // Skip tool path
  { id: 'e6-13', source: '6', target: '13', label: 'no', style: { stroke: '#666' } },
  
  // Skip MCP path
  { id: 'e9-13', source: '9', target: '13', label: 'no', style: { stroke: '#666' } },
  
  // Final flow
  { id: 'e13-14', source: '13', target: '14', animated: true },
  { id: 'e14-15', source: '14', target: '15', animated: true },
  { id: 'e15-16', source: '15', target: '16', label: 'broadcast', animated: true },
];

export default function SessionWorkflowChart() {
  return (
    <div className="w-full h-full" style={{ minHeight: '1000px' }}>
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
