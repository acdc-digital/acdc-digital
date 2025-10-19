"use client";

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
    nodeId: "1-2-3"
  },
  {
    step: 2,
    phase: "Client Hook",
    component: "useACDCAgent.ts",
    action: "sendMessage() called",
    details: "Sets isStreaming=true, adds user message to state, creates empty assistant message",
    output: "POST to /api/agents/stream",
    nodeId: "3"
  },
  {
    step: 3,
    phase: "API Route",
    component: "/api/agents/stream/route.ts",
    action: "Receives POST request",
    details: "Validates agentId and API key, creates SessionManagerAgent instance",
    output: "SSE stream initialized",
    nodeId: "4-5"
  },
  {
    step: 4,
    phase: "Flash Memory",
    component: "getConversationHistory query",
    action: "Retrieve last 10 messages from sessionManagerChats",
    details: "🧠 STAGE #1 IMPLEMENTATION: Query Convex for conversation history by sessionId, ordered chronologically. Provides short-term memory for context-aware follow-up questions.",
    output: "Array of last 10 messages (user + assistant)",
    nodeId: "4"
  },
  {
    step: 5,
    phase: "Agent Init",
    component: "SessionManagerAgent.ts",
    action: "stream() method called with history",
    details: "Builds messages array: flash memory (last 10) + current message. Adds system prompt + 7 available tools",
    output: "Request to Claude API with conversation history",
    nodeId: "5"
  },
  {
    step: 6,
    phase: "Claude Decision",
    component: "Claude 3.5 Haiku",
    action: "Analyzes message + conversation history + decides response strategy",
    details: "Flash memory provides last 10 messages for context-aware responses. Options: Direct text, tool execution, or MCP query",
    output: "Stream of chunks (thinking/content/tool_use)",
    nodeId: "5-6-9-12",
    subSteps: [
      {
        subStep: "6.1",
        title: "Context Analysis",
        description: "Claude receives system prompt defining agent role as 'Session Manager AI' with capabilities for analytics, token tracking, cost analysis, and monitoring. FLASH MEMORY: Last 10 messages included for conversation continuity.",
        technical: "System prompt + last 10 messages (flash memory) + current message + 7 tool schemas passed to Claude API"
      },
      {
        subStep: "6.2",
        title: "Intent Classification",
        description: "Claude analyzes user query in context of conversation history to determine intent: informational (metrics, stats), operational (search, health), conversational (general chat), or follow-up (referencing previous context)",
        technical: "Natural language understanding via transformer attention mechanisms with conversation history context"
      },
      {
        subStep: "6.3",
        title: "Strategy Selection",
        description: "Based on intent, Claude chooses: (A) Direct response for simple queries, (B) Single tool for specific data needs, (C) Multiple tools for complex analysis, (D) MCP server for advanced analytics",
        technical: "Tool schema matching + confidence scoring → tool_use blocks or text content"
      },
      {
        subStep: "6.4",
        title: "Response Planning",
        description: "Claude structures response format: Will it need thinking section? Which data points to highlight? How to present tool results naturally?",
        technical: "Internal reasoning mapped to thinking chunks, content chunks, and metadata"
      },
      {
        subStep: "6.5",
        title: "Execution Initiation",
        description: "Claude begins streaming response - starts with thinking (if complex), then tool calls (if needed), then content generation",
        technical: "SSE stream starts: thinking → tool_use → content → metadata (complete)"
      }
    ]
  },
  {
    step: 7,
    phase: "Tool Execution",
    component: "Tool Handlers",
    action: "Execute chosen tool (if needed)",
    details: "7 tools available: metrics, tokens, search, sessions, engagement, health, costs",
    output: "Tool result data",
    nodeId: "6-7-8"
  },
  {
    step: 8,
    phase: "MCP Query",
    component: "MCP Server",
    action: "Query external MCP server (if needed)",
    details: "HTTP request to MCP endpoints → Convex analytics queries",
    output: "Analytics data",
    nodeId: "9-10-11"
  },
  {
    step: 9,
    phase: "Response Gen",
    component: "Claude API",
    action: "Generate natural language response",
    details: "Combines tool results + context + conversation history → coherent answer",
    output: "Content chunks streamed",
    nodeId: "13-14"
  },
  {
    step: 10,
    phase: "Chunk Processing",
    component: "useACDCAgent.ts",
    action: "processChunk() for each SSE chunk",
    details: "Updates thinking/content/toolCalls in currentMessageRef. Callbacks fire: onMessageReceived when complete",
    output: "React state updates",
    nodeId: "13-14-15"
  },
  {
    step: 11,
    phase: "UI Render",
    component: "ACDCChatMessage.tsx",
    action: "Display message with live updates",
    details: "Shows thinking (collapsible), content (markdown), tool executions (expandable)",
    output: "Rendered chat message",
    nodeId: "16"
  }
];

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
    <div className="flex w-full h-screen gap-4 p-4 bg-neutral-950 overflow-hidden">
      {/* Left Panel - Conversation Flow Legend */}
      <div className="w-[500px] flex-shrink-0 flex flex-col bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden">
        <div className="bg-neutral-900 border-b border-neutral-800 p-4">
          <h3 className="text-lg font-semibold text-white mb-1">Session Manager Conversation Flow</h3>
          <p className="text-sm text-neutral-400">Detailed walkthrough of message processing</p>
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
        
        {/* Legend Footer */}
        <div className="bg-neutral-900 border-t border-neutral-800 p-4">
          <div className="space-y-3">
            {/* Flash Memory Badge */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-lg">🧠</div>
                <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Flash Memory - Stage #1</h4>
              </div>
              <p className="text-[10px] text-neutral-300 leading-relaxed">
                Conversation history (last 10 messages) provides short-term context for follow-up questions and coherent multi-turn conversations.
              </p>
            </div>

            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Key Components</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <span className="text-neutral-400">User Interface</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-600"></div>
                <span className="text-neutral-400">Data Storage</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-600"></div>
                <span className="text-neutral-400">AI Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                <span className="text-neutral-400">Tool Execution</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-600"></div>
                <span className="text-neutral-400">MCP Server</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                <span className="text-neutral-400">Decision Point</span>
              </div>
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
