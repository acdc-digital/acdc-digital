// RESEARCH SIDEBAR - Shows completed research sessions list
// /Users/matthewsimon/Projects/LifeOS/LifeOS/app/_components/activity/_components/research/ResearchSidebar.tsx

'use client';

import React, { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronRight, Plus, ExternalLink } from 'lucide-react';
import { useResearch } from '@/lib/hooks';
import { useResearchStore } from '@/lib/store/research';
import { useUser } from '@clerk/nextjs';

interface ResearchSidebarProps {
  onSelectResearch?: (sessionId: string) => void;
}

export function ResearchSidebar({ onSelectResearch }: ResearchSidebarProps) {
  const { user } = useUser();
  const userId = user?.id || 'anonymous';
  const { researchSessions, isLoading } = useResearch(userId);
  const selectSession = useResearchStore((s) => s.selectSession);
  const selectedSessionId = useResearchStore((s) => s.selectedSessionId);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  const handleNewResearch = () => {
    // Create a new research session
    selectSession('');
    onSelectResearch?.('');
  };

  const handleSessionClick = (sessionId: string) => {
    selectSession(sessionId);
    onSelectResearch?.(sessionId);
  };

  const toggleExpanded = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'completed':
        return <div className="w-2 h-2 bg-[#007acc] rounded-full" />;
      case 'researching':
      case 'pending':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />;
      case 'failed':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-[#3c3c3c] rounded-full" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-[#2d2d30]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#007acc]" />
              <h3 className="text-[#cccccc] font-medium text-sm">RESEARCH</h3>
            </div>
          </div>
          <button className="w-full flex items-center gap-2 h-7 px-3 bg-[#cccccc] border border-[#3c3c3c] rounded text-[#000000] font-['SF_Pro_Text'] text-xs transition-colors">
            <Plus className="w-3 h-3" />
            <span>New Research</span>
          </button>
        </div>

        {/* Loading skeleton */}
        <div className="flex-1 px-4 py-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center h-8 mb-1 animate-pulse">
              <div className="w-2 h-2 bg-[#3c3c3c] rounded-full mr-2" />
              <div className="h-3 bg-[#3c3c3c] rounded flex-1 mr-2" />
              <div className="w-8 h-3 bg-[#3c3c3c] rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Sort sessions by creation date (newest first)
  const sortedSessions = researchSessions ? [...researchSessions].sort((a, b) => b.createdAt - a.createdAt) : [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-[#2d2d30]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-[#007acc]" />
            <h3 className="text-[#cccccc] font-medium text-sm">RESEARCH</h3>
          </div>
          {sortedSessions.length > 0 && (
            <div className="text-xs text-[#6a6a6a]">
              {sortedSessions.length}
            </div>
          )}
        </div>
        
        {/* New Research Button */}
        <button
          onClick={handleNewResearch}
          className="w-full flex items-center gap-2 h-7 px-3 bg-[#cccccc] border border-[#3c3c3c] rounded text-[#000000] hover:bg-[#000000] hover:text-[#cccccc] font-['SF_Pro_Text'] text-xs transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>New Research</span>
        </button>
      </div>

      {/* Research Sessions List - Compact Rows */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {sortedSessions.length > 0 ? (
          <div className="space-y-1">
            {sortedSessions.map((session) => {
              const isExpanded = expandedSessions.has(session.sessionId);
              const isSelected = selectedSessionId === session.sessionId;
              
              return (
                <div key={session._id} className="select-none">
                  {/* Compact Row */}
                  <div
                    onClick={() => handleSessionClick(session.sessionId)}
                    className={`group flex items-center h-8 px-2 rounded cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-[#252526] border border-[#3c3c3c]' 
                        : 'hover:bg-[#252526]/50'
                    }`}
                  >
                    {/* Status Indicator */}
                    <div className="mr-2">
                      {getStatusIndicator(session.status)}
                    </div>
                    
                    {/* Session Title (truncated) */}
                    <div className="flex-1 min-w-0 mr-2">
                      <span className="text-xs text-[#cccccc] font-light truncate block">
                        {session.generatedTitle || 'Untitled Research'}
                      </span>
                    </div>
                    
                    {/* Time and Expand Button */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-[#6a6a6a]">
                        {formatTimeAgo(session.createdAt)}
                      </span>
                      <button
                        onClick={(e) => toggleExpanded(session.sessionId, e)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[#3c3c3c] rounded transition-all"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3 text-[#6a6a6a]" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-[#6a6a6a]" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content Drawer */}
                  {isExpanded && (
                    <div className="ml-4 mt-1 mb-2 p-3 bg-[#252526]/30 border border-[#3c3c3c]/50 rounded text-xs">
                      {/* Research Details */}
                      <div className="space-y-2">
                        {/* Complexity and Confidence */}
                        <div className="flex items-center gap-3 text-[#6a6a6a]">
                          <span className="capitalize">{session.complexity} complexity</span>
                          {session.confidence && (
                            <>
                              <span>•</span>
                              <span>{Math.round(session.confidence * 100)}% confidence</span>
                            </>
                          )}
                        </div>
                        
                        {/* Key Points Preview */}
                        {session.keyPoints && session.keyPoints.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-[#858585] font-medium">Key Points:</div>
                            <div className="space-y-0.5">
                              {session.keyPoints.slice(0, 3).map((point, idx) => (
                                <div key={idx} className="flex items-start gap-1">
                                  <div className="w-1 h-1 bg-[#007acc] rounded-full mt-1.5 flex-shrink-0" />
                                  <span className="text-[#cccccc] leading-tight">{point}</span>
                                </div>
                              ))}
                              {session.keyPoints.length > 3 && (
                                <div className="text-[#6a6a6a] ml-2">
                                  +{session.keyPoints.length - 3} more points
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Sources */}
                        {session.citations && session.citations.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-[#858585] font-medium flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" />
                              Sources ({session.citations.length}):
                            </div>
                            <div className="space-y-0.5">
                              {session.citations.slice(0, 2).map((citation, idx) => (
                                <div key={idx} className="text-[#cccccc] truncate">
                                  {citation.title || 'Untitled Source'}
                                </div>
                              ))}
                              {session.citations.length > 2 && (
                                <div className="text-[#6a6a6a]">
                                  +{session.citations.length - 2} more sources
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-[#6a6a6a] text-xs py-8">
            <Lightbulb className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="mb-1">No research sessions yet</p>
            <p className="text-[#6a6a6a]/70">Click &ldquo;New Research&rdquo; to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
