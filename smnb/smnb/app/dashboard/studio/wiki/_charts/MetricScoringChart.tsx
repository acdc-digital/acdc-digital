"use client";

import { ReactFlow, Node, Edge, Background, Controls } from '@xyflow/react';

const initialNodes: Node[] = [
  // Category Headers
  {
    id: 'cat1',
    data: { label: '📊 Measurability (40%)' },
    position: { x: 50, y: 0 },
    style: { background: '#1e3a8a', color: 'white', border: '2px solid #3b82f6', fontWeight: 'bold', width: 200 },
  },
  {
    id: 'cat2',
    data: { label: '⚡ Actionability (30%)' },
    position: { x: 300, y: 0 },
    style: { background: '#166534', color: 'white', border: '2px solid #22c55e', fontWeight: 'bold', width: 200 },
  },
  {
    id: 'cat3',
    data: { label: '🎯 Relevance (30%)' },
    position: { x: 550, y: 0 },
    style: { background: '#7c2d12', color: 'white', border: '2px solid #f97316', fontWeight: 'bold', width: 200 },
  },
  // Measurability Metrics
  {
    id: 'm1',
    data: { label: 'Quantifiability' },
    position: { x: 75, y: 100 },
    style: { background: '#1e293b', color: 'white', border: '1px solid #3b82f6', width: 150 },
  },
  {
    id: 'm2',
    data: { label: 'Timeframe' },
    position: { x: 75, y: 160 },
    style: { background: '#1e293b', color: 'white', border: '1px solid #3b82f6', width: 150 },
  },
  {
    id: 'm3',
    data: { label: 'Frequency' },
    position: { x: 75, y: 220 },
    style: { background: '#1e293b', color: 'white', border: '1px solid #3b82f6', width: 150 },
  },
  // Actionability Metrics
  {
    id: 'm4',
    data: { label: 'Clarity' },
    position: { x: 325, y: 100 },
    style: { background: '#1e293b', color: 'white', border: '1px solid #22c55e', width: 150 },
  },
  {
    id: 'm5',
    data: { label: 'Feasibility' },
    position: { x: 325, y: 160 },
    style: { background: '#1e293b', color: 'white', border: '1px solid #22c55e', width: 150 },
  },
  {
    id: 'm6',
    data: { label: 'Control' },
    position: { x: 325, y: 220 },
    style: { background: '#1e293b', color: 'white', border: '1px solid #22c55e', width: 150 },
  },
  // Relevance Metrics
  {
    id: 'm7',
    data: { label: 'Impact' },
    position: { x: 575, y: 100 },
    style: { background: '#1e293b', color: 'white', border: '1px solid #f97316', width: 150 },
  },
  {
    id: 'm8',
    data: { label: 'Alignment' },
    position: { x: 575, y: 160 },
    style: { background: '#1e293b', color: 'white', border: '1px solid #f97316', width: 150 },
  },
  {
    id: 'm9',
    data: { label: 'Balance' },
    position: { x: 575, y: 220 },
    style: { background: '#1e293b', color: 'white', border: '1px solid #f97316', width: 150 },
  },
  // Priority Algorithm
  {
    id: 'algo',
    type: 'output',
    data: { label: '🎯 Weighted Priority Score' },
    position: { x: 300, y: 320 },
    style: { background: '#581c87', color: 'white', border: '2px solid #a855f7', fontWeight: 'bold', width: 220 },
  },
];

const initialEdges: Edge[] = [
  // Measurability connections
  { id: 'e-cat1-m1', source: 'cat1', target: 'm1' },
  { id: 'e-cat1-m2', source: 'cat1', target: 'm2' },
  { id: 'e-cat1-m3', source: 'cat1', target: 'm3' },
  // Actionability connections
  { id: 'e-cat2-m4', source: 'cat2', target: 'm4' },
  { id: 'e-cat2-m5', source: 'cat2', target: 'm5' },
  { id: 'e-cat2-m6', source: 'cat2', target: 'm6' },
  // Relevance connections
  { id: 'e-cat3-m7', source: 'cat3', target: 'm7' },
  { id: 'e-cat3-m8', source: 'cat3', target: 'm8' },
  { id: 'e-cat3-m9', source: 'cat3', target: 'm9' },
  // All metrics to algorithm
  { id: 'e-m1-algo', source: 'm1', target: 'algo', animated: true },
  { id: 'e-m2-algo', source: 'm2', target: 'algo', animated: true },
  { id: 'e-m3-algo', source: 'm3', target: 'algo', animated: true },
  { id: 'e-m4-algo', source: 'm4', target: 'algo', animated: true },
  { id: 'e-m5-algo', source: 'm5', target: 'algo', animated: true },
  { id: 'e-m6-algo', source: 'm6', target: 'algo', animated: true },
  { id: 'e-m7-algo', source: 'm7', target: 'algo', animated: true },
  { id: 'e-m8-algo', source: 'm8', target: 'algo', animated: true },
  { id: 'e-m9-algo', source: 'm9', target: 'algo', animated: true },
];

export default function MetricScoringChart() {
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
