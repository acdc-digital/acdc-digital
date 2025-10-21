"use client";

import { useState } from 'react';
import { ReactFlow, Node, Edge, Background, Controls } from '@xyflow/react';

// Detailed conversation flow legend data
const conversationFlowSteps = [
  {
    step: 1,
    phase: "User Input",
    component: "ACDCChat.tsx",
    action: "User types message and clicks send",
    details: "Message validated (not empty, not streaming)",
    output: "User message text",
    nodeId: "1"
  },
  {
    step: 2,
    phase: "Store Message",
    component: "sendMessage mutation",
    action: "Save user message to database",
    details: "Creates message record in sessionManagerChats table with sessionId, role='user', content",
    output: "Message stored in Convex",
    nodeId: "2"
  },
  {
    step: 3,
    phase: "Flash Memory (Stage #1)",
    component: "getConversationHistory query",
    action: "Retrieve last 10 messages from sessionManagerChats",
    details: "🧠 SHORT-TERM MEMORY STAGE #1: Query Convex for conversation history by sessionId, ordered chronologically. Provides immediate conversational context for follow-up questions.",
    output: "Array of last 10 messages (user + assistant)",
    nodeId: "3"
  },
  {
    step: 4,
    phase: "Vector Retrieval (Stage #2)",
    component: "retrieveContext action",
    action: "Hybrid vector search across chat + documents",
    details: "🔍 SHORT-TERM MEMORY STAGE #2: Knowledge base & vector store retrieval. Generates query embedding (text-embedding-3-small, 1536 dims), searches session-scoped chat embeddings + global document embeddings using cosine similarity. Filters results by similarity threshold (0.3). Returns top relevant chunks with scores.",
    output: "Retrieved context: chat messages + document chunks with similarity scores",
    nodeId: "4"
  },
  {
    step: 5,
    phase: "Context Aggregation",
    component: "SessionManagerAgent.ts",
    action: "Build complete context for Claude",
    details: "Combines: System prompt + Flash memory (10 messages) + Vector context (semantic results) + Current message + Tool schemas (7 tools)",
    output: "Complete context package ready for AI",
    nodeId: "5"
  },
  {
    step: 6,
    phase: "AI Analysis",
    component: "Claude 3.5 Haiku",
    action: "Analyze context and classify intent",
    details: "Evaluates all available context (flash + vector + tools) to understand user intent and determine response strategy",
    output: "Decision: Direct answer, tool execution, or MCP query",
    nodeId: "6",
    subSteps: [
      {
        subStep: "6.1",
        title: "Context Analysis",
        description: "Claude receives complete context: System prompt + Flash memory (10 msgs) + Vector context (semantic search) + Current message + 7 tool schemas",
        technical: "All context passed to Claude API with structured tool definitions"
      },
      {
        subStep: "6.2",
        title: "Intent Classification",
        description: "Determines if query is: informational (metrics/stats), operational (search/health), document-based (from PDFs), conversational (chat), or follow-up (referencing history)",
        technical: "Natural language understanding via transformer attention with multi-tier context"
      },
      {
        subStep: "6.3",
        title: "Strategy Selection",
        description: "Chooses response path: (A) Direct text answer, (B) Tool execution for data, (C) MCP for analytics, (D) Document-based from vector context",
        technical: "Tool schema matching + confidence scoring + context relevance analysis"
      }
    ]
  },
  {
    step: 7,
    phase: "Tool Execution",
    component: "Tool Handlers",
    action: "Execute chosen tool (if needed)",
    details: "If Claude decides tools are needed: metrics, tokens, search, sessions, engagement, health, costs. Returns structured data.",
    output: "Tool result data (or skip to next step)",
    nodeId: "7"
  },
  {
    step: 8,
    phase: "MCP Query",
    component: "MCP Server",
    action: "Query external MCP server (if needed)",
    details: "If Claude decides MCP needed: HTTP request to MCP endpoints → Convex analytics queries. Returns advanced analytics.",
    output: "MCP analytics data (or skip to next step)",
    nodeId: "8"
  },
  {
    step: 9,
    phase: "Response Generation",
    component: "Claude API",
    action: "Generate natural language response",
    details: "Synthesizes all available information: Flash memory + Vector context + Tool results + MCP data → coherent, natural answer. Prioritizes document context with similarity > 0.6.",
    output: "SSE stream of response chunks (thinking/content/metadata)",
    nodeId: "9"
  },
  {
    step: 10,
    phase: "Stream Processing",
    component: "useACDCAgent.ts",
    action: "Process SSE chunks in real-time",
    details: "Client receives and processes each chunk: Updates thinking text, appends content, tracks tool calls. Fires callbacks when complete.",
    output: "Real-time React state updates",
    nodeId: "10"
  },
  {
    step: 11,
    phase: "Store Response",
    component: "Convex mutation",
    action: "Save assistant response to database",
    details: "Creates message record with role='assistant', stores thinking, content, toolCalls, metadata",
    output: "Response persisted in sessionManagerChats",
    nodeId: "11"
  },
  {
    step: 12,
    phase: "UI Render",
    component: "ACDCChatMessage.tsx",
    action: "Display message with live updates",
    details: "Renders message in real-time: thinking (collapsible), content (markdown), tool executions (expandable)",
    output: "User sees live-streaming response",
    nodeId: "12"
  }
];

const initialNodes: Node[] = [
  // User input
  {
    id: '1',
    type: 'input',
    data: { label: '👤 User Input' },
    position: { x: 300, y: 0 },
    style: { background: '#1e3a8a', color: 'white', border: '2px solid #3b82f6', width: 140 },
  },
  // Store message
  {
    id: '2',
    data: { label: '💾 Store Message' },
    position: { x: 290, y: 80 },
    style: { background: '#581c87', color: 'white', border: '2px solid #a855f7', width: 160 },
  },
  // Flash memory
  {
    id: '3',
    data: { label: '🧠 Flash Memory' },
    position: { x: 285, y: 160 },
    style: { background: '#166534', color: 'white', border: '2px solid #22c55e', width: 170 },
  },
  // Vector search
  {
    id: '4',
    data: { label: '� Vector Search' },
    position: { x: 285, y: 240 },
    style: { background: '#0e7490', color: 'white', border: '2px solid #06b6d4', width: 170 },
  },
  // Context aggregation
  {
    id: '5',
    data: { label: '� Context Aggregation' },
    position: { x: 270, y: 320 },
    style: { background: '#7e22ce', color: 'white', border: '2px solid #c084fc', width: 200 },
  },
  // AI analysis/decision
  {
    id: '6',
    data: { label: '🤖 AI Analysis' },
    position: { x: 295, y: 400 },
    style: { background: '#831843', color: 'white', border: '2px solid #ec4899', width: 150 },
  },
  // Tool execution
  {
    id: '7',
    data: { label: '⚙️ Tool Execution' },
    position: { x: 95, y: 490 },
    style: { background: '#4c1d95', color: 'white', border: '2px solid #8b5cf6', width: 150 },
  },
  // MCP query
  {
    id: '8',
    data: { label: '🌐 MCP Query' },
    position: { x: 510, y: 490 },
    style: { background: '#1e40af', color: 'white', border: '2px solid #60a5fa', width: 140 },
  },
  // Response generation
  {
    id: '9',
    data: { label: '✨ Response Generation' },
    position: { x: 265, y: 570 },
    style: { background: '#be123c', color: 'white', border: '2px solid #fb7185', width: 210 },
  },
  // Stream processing
  {
    id: '10',
    data: { label: '⚡ Stream Processing' },
    position: { x: 270, y: 650 },
    style: { background: '#ea580c', color: 'white', border: '2px solid #fb923c', width: 200 },
  },
  // Store response
  {
    id: '11',
    data: { label: '💾 Store Response' },
    position: { x: 280, y: 730 },
    style: { background: '#166534', color: 'white', border: '2px solid #22c55e', width: 180 },
  },
  // UI render
  {
    id: '12',
    type: 'output',
    data: { label: '🎨 UI Render' },
    position: { x: 300, y: 810 },
    style: { background: '#1e3a8a', color: 'white', border: '2px solid #3b82f6', width: 140 },
  },
];

const initialEdges: Edge[] = [
  // Linear preparation flow
  { id: 'e1-2', source: '1', target: '2', label: 'submit', animated: true },
  { id: 'e2-3', source: '2', target: '3', label: 'load history', animated: true },
  { id: 'e3-4', source: '3', target: '4', label: 'search', animated: true },
  { id: 'e4-5', source: '4', target: '5', label: 'combine', animated: true },
  { id: 'e5-6', source: '5', target: '6', label: 'analyze', animated: true },
  
  // Decision branches from AI Analysis
  { id: 'e6-7', source: '6', target: '7', label: 'tools needed', animated: true },
  { id: 'e6-8', source: '6', target: '8', label: 'MCP needed', animated: true },
  { id: 'e6-9', source: '6', target: '9', label: 'direct answer', animated: true },
  
  // Tool & MCP results feed back to response
  { id: 'e7-9', source: '7', target: '9', label: 'results', animated: true },
  { id: 'e8-9', source: '8', target: '9', label: 'results', animated: true },
  
  // Linear output flow
  { id: 'e9-10', source: '9', target: '10', label: 'stream', animated: true },
  { id: 'e10-11', source: '10', target: '11', label: 'persist', animated: true },
  { id: 'e11-12', source: '11', target: '12', label: 'render', animated: true },
];

export default function SessionWorkflowChart() {
  const [isMemoryExpanded, setIsMemoryExpanded] = useState(false);

  return (
    <div className="flex w-full h-screen gap-4 p-4 bg-neutral-950 overflow-hidden">
      {/* Left Panel - Conversation Flow Legend */}
      <div className="w-[320px] flex-shrink-0 flex flex-col bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden">
        <div className="bg-neutral-900 border-b border-neutral-800 p-4">
          <h3 className="text-lg font-semibold text-white mb-1">Conversation Workflow</h3>
        </div>

        {/* Memory Banner - Collapsible */}
        <div className="border-b border-neutral-800 bg-gradient-to-r from-cyan-500/5 to-purple-500/5">
          {/* Header - Always Visible */}
          <button
            onClick={() => setIsMemoryExpanded(!isMemoryExpanded)}
            className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-neutral-900/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🧠</span>
              <span className="text-sm font-semibold text-white">Memory</span>
              <span className="text-xs text-neutral-500 font-mono">
                Short-Term (Two-Stage)
              </span>
            </div>
            <svg
              className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                isMemoryExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Expandable Content */}
          {isMemoryExpanded && (
            <div className="px-4 pb-3 space-y-3">
              {/* Stage #1 */}
              <div className="bg-neutral-900/50 rounded-lg p-3 border border-cyan-500/20">
                <div className="flex items-start gap-2 mb-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-semibold text-cyan-400 mb-1">
                      Stage #1: Flash Memory
                    </h4>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Last 10 messages retrieved for immediate conversation continuity and context.
                    </p>
                  </div>
                </div>
                <div className="ml-8 mt-2 px-2 py-1 bg-neutral-950 rounded border border-neutral-800">
                  <p className="text-[10px] text-neutral-500 font-mono">
                    getConversationHistory → Last 10 messages by sessionId
                  </p>
                </div>
              </div>

              {/* Stage #2 */}
              <div className="bg-neutral-900/50 rounded-lg p-3 border border-purple-500/20">
                <div className="flex items-start gap-2 mb-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-semibold text-purple-400 mb-1">
                      Stage #2: Knowledge Base & Vector Store
                    </h4>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Hybrid semantic search (RAG) across session chat history + global document knowledge base. 
                      Uses text-embedding-3-small (1536 dims), cosine similarity, threshold 0.3. 
                      Returns relevant chunks with scores.
                    </p>
                  </div>
                </div>
                <div className="ml-8 mt-2 space-y-1">
                  <div className="px-2 py-1 bg-neutral-950 rounded border border-neutral-800">
                    <p className="text-[10px] text-neutral-500 font-mono">
                      retrieveContext → Query embedding → Vector search
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <div className="flex-1 px-2 py-1 bg-neutral-950 rounded border border-cyan-500/30">
                      <p className="text-[10px] text-cyan-400 font-mono">
                        Chat embeddings (session-scoped)
                      </p>
                    </div>
                    <div className="flex-1 px-2 py-1 bg-neutral-950 rounded border border-purple-500/30">
                      <p className="text-[10px] text-purple-400 font-mono">
                        Document embeddings (global)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Context Flow */}
              <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
                <span className="font-mono">Flash</span>
                <span>→</span>
                <span className="font-mono">Vector</span>
                <span>→</span>
                <span className="font-mono">Aggregation</span>
                <span>→</span>
                <span className="font-mono text-cyan-400">Claude API</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {conversationFlowSteps.map((item, index) => (
            <div
              key={index}
              className="bg-neutral-800 rounded-lg p-4 border border-neutral-700 hover:border-cyan-500/50 transition-colors"
            >
              {/* Step Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500 text-black font-bold text-sm flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">{item.phase}</h4>
                    <p className="text-xs text-neutral-400 font-mono">{item.component}</p>
                  </div>
                </div>
                <div className="text-xs text-neutral-500 font-mono">
                  Node {item.nodeId}
                </div>
              </div>
              
              {/* Step Details */}
              <div className="space-y-2 ml-11">
                <div>
                  <span className="text-xs font-semibold text-cyan-400">Action:</span>
                  <p className="text-sm text-neutral-300 mt-1">{item.action}</p>
                </div>
                
                <div>
                  <span className="text-xs font-semibold text-purple-400">Details:</span>
                  <p className="text-xs text-neutral-400 mt-1">{item.details}</p>
                </div>
                
                <div>
                  <span className="text-xs font-semibold text-emerald-400">Output:</span>
                  <p className="text-xs text-neutral-300 mt-1 font-mono">{item.output}</p>
                </div>
              </div>

              {/* Sub-Steps (if present) */}
              {item.subSteps && item.subSteps.length > 0 && (
                <div className="mt-4 ml-11 space-y-2 border-l-2 border-cyan-500/30 pl-4">
                  <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-3">
                    Detailed Breakdown
                  </div>
                  {item.subSteps.map((subStep, subIndex) => (
                    <div
                      key={subIndex}
                      className="bg-neutral-900/50 rounded p-3 border border-neutral-700/50"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono font-bold text-cyan-400">
                          {subStep.subStep}
                        </span>
                        <span className="text-xs font-semibold text-white">
                          {subStep.title}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed mb-2">
                        {subStep.description}
                      </p>
                      <div className="bg-neutral-950 rounded px-2 py-1 border border-neutral-800">
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {subStep.technical}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Legend Footer - Compact */}
        <div className="bg-neutral-900 border-t border-neutral-800 px-4 py-3">
          <div className="grid grid-cols-3 gap-x-3 gap-y-1.5 text-[10px]">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></div>
              <span className="text-neutral-400">User Interface</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-600 flex-shrink-0"></div>
              <span className="text-neutral-400">Data Storage</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-pink-600 flex-shrink-0"></div>
              <span className="text-neutral-400">AI Processing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-600 flex-shrink-0"></div>
              <span className="text-neutral-400">Tool Execution</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-cyan-600 flex-shrink-0"></div>
              <span className="text-neutral-400">MCP Server</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-orange-600 flex-shrink-0"></div>
              <span className="text-neutral-400">Decision Point</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - React Flow Chart */}
      <div className="flex-1 bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden">
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          fitView
          className="bg-neutral-950 w-full h-full"
        >
          <Background color="#333" gap={16} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
