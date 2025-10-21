"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function MemoryBanner() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-b border-neutral-800 bg-gradient-to-r from-cyan-500/5 to-purple-500/5">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-neutral-900/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🧠</span>
          <span className="text-sm font-semibold text-white">Memory</span>
          <span className="text-xs text-neutral-500 font-mono">
            Short-Term (Two-Stage)
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-4 pb-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
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
  );
}
