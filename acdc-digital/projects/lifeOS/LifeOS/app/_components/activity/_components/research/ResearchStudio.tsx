// RESEARCH STUDIO - Full-canvas research interface with newspaper-inspired layout
// /Users/matthewsimon/Projects/LifeOS/LifeOS/app/_components/activity/_components/research/ResearchStudio.tsx

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  Lightbulb,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { type ResearchMode } from '@/components/ai/prompt-input';
import { PromptInputWithHistory } from './PromptInputWithHistory';
import { useResearchStore } from '@/lib/store/research';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';

export function ResearchStudio() {
  const { user } = useUser();
  const [query, setQuery] = useState('');
  const [researchMode, setResearchMode] = useState<ResearchMode>('comprehensive');
  const [activeView, setActiveView] = useState<'sources' | 'response' | 'canvas' | 'settings'>('response');
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState('');
  
  // Tab and session management from store
  const selectedSessionId = useResearchStore((s) => s.selectedSessionId);
  const selectSession = useResearchStore((s) => s.selectSession);
  
  // Only log when selectedSessionId actually changes
  useEffect(() => {
    console.log('ResearchStudio: selectedSessionId changed to', selectedSessionId);
  }, [selectedSessionId]);

  // Load the selected session from sidebar
  const selectedSession = useQuery(
    api.research.getResearchSession, 
    selectedSessionId ? { sessionId: selectedSessionId } : "skip"
  );

    // Use session data as response data if available
  const responseData = useMemo(() => {
    return selectedSession ? {
      summary: selectedSession.summary,
      canvas: selectedSession.canvas,
      keyPoints: selectedSession.keyPoints,
      citations: selectedSession.citations,
      generatedTitle: selectedSession.generatedTitle,
      sessionId: selectedSession.sessionId
    } : null;
  }, [selectedSession]);
  
  const [isResearching, setIsResearching] = useState(false);

  // Simple effect to switch to response view when a session is selected
  useEffect(() => {
    if (selectedSessionId) {
      setActiveView('response');
    }
  }, [selectedSessionId]);

  const handleResearchSubmit = useCallback(async (queryText: string) => {
    if (!queryText.trim() || isResearching) return;

    setIsResearching(true);

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText.trim(),
          mode: researchMode,
          userId: user?.id || 'anonymous'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Research API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Research request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Research completed:', result);

      if (result && result.success && result.data) {
        // Auto-select the new research session and switch to response view
        if (result.data.sessionId) {
          selectSession(result.data.sessionId);
        }
        setActiveView('response');
      } else if (result && result.data) {
        // Fallback if success flag missing
        if (result.data.sessionId) {
          selectSession(result.data.sessionId);
        }
        setActiveView('response');
      }
      
    } catch (error) {
      console.error('Research error:', error);
    } finally {
      setIsResearching(false);
    }
  }, [researchMode, user?.id, isResearching, selectSession]);

  // Mutation for updating research session
  const updateResearchSession = useMutation(api.research.updateResearchSession);

  // Initialize edited summary when entering edit mode
  useEffect(() => {
    if (isEditing && responseData?.summary) {
      setEditedSummary(responseData.summary);
    }
  }, [isEditing, responseData?.summary]);

  // Handle entering edit mode
  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  // Handle canceling edit
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditedSummary('');
  }, []);

  // Handle saving edited content
  const handleSaveEdit = useCallback(async () => {
    if (!selectedSessionId || !editedSummary.trim()) return;

    try {
      await updateResearchSession({
        sessionId: selectedSessionId,
        summary: editedSummary.trim(),
      });
      
      setIsEditing(false);
      console.log('Research summary updated successfully');
    } catch (error) {
      console.error('Failed to save edited research:', error);
    }
  }, [selectedSessionId, editedSummary, updateResearchSession]);

  return (
    <div className="flex flex-col h-full max-h-screen bg-[#1e1e1e] text-[#cccccc] overflow-hidden">
      {/* Header - Command Palette Style */}
      <div className="flex-shrink-0 border-b border-[#2d2d30] bg-[#1e1e1e]">
        <div className="px-6 py-4">
          {/* Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-[#007acc]" />
              <div>
                <h1 className="text-xl font-semibold text-[#ffffff]">Research Studio</h1>
                <p className="text-sm text-[#858585]">AI-powered research assistant with intelligent insights</p>
              </div>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-[#252526] border border-[#3c3c3c] rounded p-1">
              {[
                { id: 'response', label: 'Response' },
                { id: 'canvas', label: 'Canvas' },
                { id: 'sources', label: 'Sources' },
                { id: 'settings', label: 'Settings' }
              ].map((view) => (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => setActiveView(view.id as 'sources' | 'response' | 'canvas' | 'settings')}
                  className={`flex items-center gap-2 h-8 px-3 border rounded font-['SF_Pro_Text'] text-sm transition-colors ${
                    activeView === view.id
                      ? 'bg-[#252526] border-[#3c3c3c] text-[#cccccc] hover:bg-[#3c3c3c]'
                      : 'bg-[#1e1e1e] border-[#3c3c3c] text-[#cccccc] hover:bg-[#3c3c3c]'
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Input/Response */}
      <div className="flex-1 flex flex-col p-6 pb-0 gap-4 min-h-0 overflow-hidden">
        {/* Input/Response Area */}
        <div className="flex gap-6 flex-1 min-h-0">
          {/* Left Column - Input (37.5% width) */}
          <div className="w-[37.5%] flex flex-col min-h-0">
            <PromptInputWithHistory
              value={query}
              onChange={setQuery}
              onSubmit={handleResearchSubmit}
              researchMode={researchMode}
              onModeChange={setResearchMode}
              isResearching={isResearching}
            />
          </div>

          {/* Right Column - Response Panel (62.5% width) */}
          <div className="w-[62.5%] flex flex-col min-h-0">
            <div className="bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg p-4 flex flex-col h-full min-h-0">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-[#858585]">{activeView === 'sources' ? 'Research Sources' : 'Research Response'}</span>
                <div className="flex items-center gap-2">
                  {/* Edit Controls - only show for response view when we have response data */}
                  {activeView === 'response' && responseData && (
                    <div className="flex items-center gap-1 mr-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleSaveEdit}
                            disabled={!editedSummary.trim()}
                            className="p-1.5 text-[#4fc3f7] hover:bg-[#2d2d30] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Save changes"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1.5 text-[#858585] hover:bg-[#2d2d30] rounded transition-colors"
                            title="Cancel edit"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={handleStartEdit}
                            className="p-1.5 text-[#858585] hover:bg-[#2d2d30] hover:text-white rounded transition-colors"
                            title="Edit response"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  <span className="text-xs text-[#858585] font-light">active</span>
                  <div className="w-2 h-2 bg-[#007acc] rounded-full"></div>
                </div>
              </div>
              
              {/* Content Area - Switch between Sources and Response with Scroll */}
              <div className="flex-1 overflow-y-auto min-h-0 max-h-full">
                {activeView === 'sources' ? (
                  // Sources View with Scroll
                  responseData && responseData.citations && responseData.citations.length > 0 ? (
                    <div className="space-y-3 pb-4">
                      {responseData.citations.map((citation, i) => (
                        <div key={i} className="bg-[#252526] border border-[#3c3c3c] rounded p-3">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-sm font-medium text-white truncate flex-1">
                              {citation.url ? (
                                <a href={citation.url} target="_blank" rel="noreferrer" className="text-[#4fc3f7] hover:underline">
                                  {citation.title}
                                </a>
                              ) : (
                                citation.title
                              )}
                            </h3>
                            <span className="text-xs text-[#6a6a6a] ml-2">#{i + 1}</span>
                          </div>
                          {citation.snippet && (
                            <p className="text-xs text-[#cccccc] leading-relaxed">{citation.snippet}</p>
                          )}
                          {citation.url && (
                            <div className="mt-2 text-xs text-[#6a6a6a]">
                              <span className="break-all">{citation.url}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="text-[#444444] mb-2">Sources</div>
                      <p className="text-xs text-[#6a6a6a]">Research sources will appear here</p>
                    </div>
                  )
                ) : activeView === 'canvas' ? (
                  // Canvas View - Master Document
                  responseData ? (
                    <div className="space-y-4 pb-4">
                      {responseData.generatedTitle && (
                        <h2 className="text-sm font-semibold text-white leading-tight border-b border-[#3c3c3c] pb-2 mb-4">
                          {responseData.generatedTitle} - Master Canvas
                        </h2>
                      )}

                      <div className="text-sm text-[#cccccc] leading-relaxed">
                        {responseData.canvas ? (
                          <div className="whitespace-pre-wrap bg-[#252526] border border-[#3c3c3c] rounded p-4">
                            {responseData.canvas}
                          </div>
                        ) : responseData.summary ? (
                          <div className="whitespace-pre-wrap bg-[#252526] border border-[#3c3c3c] rounded p-4">
                            {responseData.summary}
                          </div>
                        ) : (
                          <div className="text-[#858585] italic text-center py-8">
                            No canvas content available yet. Start researching to build your master document.
                          </div>
                        )}
                      </div>

                      {/* Canvas-specific features could go here */}
                      <div className="text-xs text-[#6a6a6a] italic border-t border-[#3c3c3c] pt-3">
                        💡 Canvas view shows your evolving research document. Follow-up research is integrated seamlessly into this master document.
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="text-[#444444] mb-2">Canvas</div>
                      <p className="text-xs text-[#6a6a6a]">Your research canvas will appear here</p>
                    </div>
                  )
                ) : (
                  // Response View - Latest Response
                  responseData ? (
                    <div className="space-y-4 pb-4">
                      {responseData.generatedTitle && (
                        <h2 className="text-sm font-semibold text-white leading-tight">{responseData.generatedTitle}</h2>
                      )}

                      {responseData.summary && (
                        <div className="text-sm text-[#cccccc] leading-relaxed">
                          {isEditing ? (
                            <textarea
                              value={editedSummary}
                              onChange={(e) => setEditedSummary(e.target.value)}
                              className="w-full min-h-[200px] p-3 bg-[#252526] border border-[#3c3c3c] rounded text-sm text-[#cccccc] resize-y focus:outline-none focus:border-[#007acc] transition-colors"
                              placeholder="Edit the research summary..."
                            />
                          ) : (
                            <div className="whitespace-pre-wrap">
                              {responseData.summary}
                            </div>
                          )}
                        </div>
                      )}

                      {responseData.keyPoints && responseData.keyPoints.length > 0 && (
                        <div>
                          <div className="text-xs text-[#858585] uppercase font-medium mb-2">Key Points</div>
                          <ul className="space-y-2">
                            {responseData.keyPoints.map((kp, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-[#007acc] rounded-full mt-2 flex-shrink-0" />
                                <span className="text-sm text-[#cccccc] leading-relaxed">{kp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Additional content sections can be added here */}
                      {responseData.citations && responseData.citations.length > 0 && (
                        <div>
                          <div className="text-xs text-[#858585] uppercase font-medium mb-2">Research Sources</div>
                          <div className="space-y-2">
                            {responseData.citations.map((citation, i) => (
                              <div key={i} className="text-xs text-[#6a6a6a] flex items-center gap-2">
                                <span className="text-[#007acc]">[{i + 1}]</span>
                                {citation.url ? (
                                  <a href={citation.url} target="_blank" rel="noreferrer" className="text-[#4fc3f7] hover:underline truncate">
                                    {citation.title || citation.url}
                                  </a>
                                ) : (
                                  <span className="truncate">{citation.title}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="text-[#444444] mb-2">AI</div>
                      <p className="text-xs text-[#6a6a6a]">AI responses will appear here</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Research Cockpit - Bottom Position */}
        <div className="bg-[#1e1e1e] border border-[#3c3c3c] rounded p-3 mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#858585] uppercase tracking-wide">Cockpit</span>
            <div className="flex items-center gap-4">
              {/* Focus Switches */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-[#6a6a6a] mr-2">Focus:</span>
                {[
                  { id: 'trends', label: 'TRD' },
                  { id: 'data', label: 'DATA' },
                  { id: 'analysis', label: 'ANA' },
                  { id: 'sources', label: 'SRC' }
                ].map((area) => (
                  <button
                    key={area.id}
                    type="button"
                    className="h-6 px-2 text-xs bg-[#cccccc] border border-[#3c3c3c] rounded text-[#000000] hover:bg-[#000000] hover:text-[#cccccc] transition-colors"
                  >
                    {area.label}
                  </button>
                ))}
              </div>
              
              {/* Format Radio Indicators */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-[#6a6a6a] mr-2">Format:</span>
                {[
                  { id: 'report', label: 'RPT' },
                  { id: 'points', label: 'PTS' },
                  { id: 'story', label: 'STY' }
                ].map((format) => (
                  <label key={format.id} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="outputFormat"
                      value={format.id}
                      className="sr-only"
                    />
                    <div className="h-6 px-2 text-xs bg-[#cccccc] border border-[#3c3c3c] rounded text-[#000000] hover:bg-[#000000] hover:text-[#cccccc] transition-colors flex items-center">
                      {format.label}
                    </div>
                  </label>
                ))}
              </div>
              
              {/* Action Switches */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-[#6a6a6a] mr-2">Actions:</span>
                <button className="h-6 px-2 text-xs bg-[#cccccc] border border-[#3c3c3c] rounded text-[#000000] hover:bg-[#000000] hover:text-[#cccccc] transition-colors">
                  SAVE
                </button>
                <button className="h-6 px-2 text-xs bg-[#cccccc] border border-[#3c3c3c] rounded text-[#000000] hover:bg-[#000000] hover:text-[#cccccc] transition-colors">
                  EXPORT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
