"use client";

import { ReactFlow, Node, Edge, Background, Controls } from '@xyflow/react';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: '📰 News Sources' },
    position: { x: 250, y: 0 },
    style: { background: '#1e3a8a', color: 'white', border: '2px solid #3b82f6' },
  },
  {
    id: '2',
    data: { label: '🔍 Content Ingestion' },
    position: { x: 250, y: 100 },
    style: { background: '#1e293b', color: 'white', border: '2px solid #475569' },
  },
  {
    id: '3',
    data: { label: '📊 Metric Scoring (9 metrics)' },
    position: { x: 100, y: 200 },
    style: { background: '#166534', color: 'white', border: '2px solid #22c55e' },
  },
  {
    id: '4',
    data: { label: '💭 Sentiment Analysis' },
    position: { x: 400, y: 200 },
    style: { background: '#7c2d12', color: 'white', border: '2px solid #f97316' },
  },
  {
    id: '5',
    data: { label: '🎯 Priority Algorithm' },
    position: { x: 250, y: 300 },
    style: { background: '#581c87', color: 'white', border: '2px solid #a855f7' },
  },
  {
    id: '6',
    data: { label: '🤖 AI Content Generation' },
    position: { x: 250, y: 400 },
    style: { background: '#831843', color: 'white', border: '2px solid #ec4899' },
  },
  {
    id: '7',
    type: 'output',
    data: { label: '✨ Published Content' },
    position: { x: 250, y: 500 },
    style: { background: '#1e3a8a', color: 'white', border: '2px solid #3b82f6' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e2-4', source: '2', target: '4', animated: true },
  { id: 'e3-5', source: '3', target: '5', animated: true },
  { id: 'e4-5', source: '4', target: '5', animated: true },
  { id: 'e5-6', source: '5', target: '6', animated: true },
  { id: 'e6-7', source: '6', target: '7', animated: true },
];

export default function DataPipelineChart() {
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
