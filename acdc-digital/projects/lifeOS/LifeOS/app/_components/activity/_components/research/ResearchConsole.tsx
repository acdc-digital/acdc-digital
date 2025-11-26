// RESEARCH CONSOLE - Main research interface component
// /Users/matthewsimon/Projects/LifeOS/LifeOS/app/_components/activity/_components/research/ResearchConsole.tsx

'use client';

import React, { useState, useCallback } from 'react';
import { Lightbulb, Send, Loader2, AlertCircle, CheckCircle, ExternalLink, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ResearchResult {
  id: string;
  queryId: string;
  summary: string;
  keyPoints: string[];
  citations: Array<{
    title: string;
    url?: string;
    sourceType: 'web' | 'document' | 'internal' | 'academic' | 'disclosure' | 'news' | 'reference' | 'other';
    snippet?: string;
  }>;
  confidence: number;
  tokensUsed: number;
  timeElapsed: number;
  createdAt: number;
}

interface ResearchSession {
  id: string;
  query: string;
  complexity: 'simple' | 'medium' | 'complex';
  status: 'pending' | 'researching' | 'completed' | 'failed';
  result?: ResearchResult;
  error?: string;
  startTime: number;
}

export function ResearchConsole() {
  const [query, setQuery] = useState('');
  const [complexity, setComplexity] = useState<'simple' | 'medium' | 'complex'>('medium');
  const [sessions, setSessions] = useState<ResearchSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    const sessionId = `session_${Date.now()}`;
    const newSession: ResearchSession = {
      id: sessionId,
      query: query.trim(),
      complexity,
      status: 'pending',
      startTime: Date.now(),
    };

    // Add session and clear input
    setSessions(prev => [newSession, ...prev]);
    setQuery('');
    setIsLoading(true);

    try {
      // Update to researching
      setSessions(prev => 
        prev.map(s => s.id === sessionId ? { ...s, status: 'researching' as const } : s)
      );

      // Make research API call
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: newSession.query,
          complexity: newSession.complexity,
        }),
      });

      if (!response.ok) {
        throw new Error(`Research failed: ${response.statusText}`);
      }

      const result: ResearchResult = await response.json();

      // Update session with results
      setSessions(prev =>
        prev.map(s =>
          s.id === sessionId
            ? { ...s, status: 'completed' as const, result }
            : s
        )
      );
    } catch (error) {
      console.error('Research failed:', error);
      setSessions(prev =>
        prev.map(s =>
          s.id === sessionId
            ? { 
                ...s, 
                status: 'failed' as const, 
                error: error instanceof Error ? error.message : 'Unknown error' 
              }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [query, complexity]);

  const formatTimeElapsed = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-[#cccccc]">
      {/* Header */}
      <div className="border-b border-[#2d2d30] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-[#007acc]" />
          <h2 className="text-lg font-medium">Research Console</h2>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What would you like to research?"
              className="flex-1 bg-[#252526] border-[#2d2d30] text-[#cccccc] placeholder-[#6a6a6a]"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={!query.trim() || isLoading}
              className="bg-[#007acc] hover:bg-[#005a9e] text-white"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>

          {/* Complexity Selector */}
          <div className="flex gap-2">
            {(['simple', 'medium', 'complex'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setComplexity(level)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors capitalize ${
                  complexity === level
                    ? 'bg-[#007acc] border-[#007acc] text-white'
                    : 'border-[#2d2d30] text-[#cccccc] hover:border-[#007acc]/50'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Research Sessions */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {sessions.length === 0 && (
          <div className="text-center text-[#6a6a6a] py-8">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Start your research by asking a question above</p>
            <p className="text-sm mt-2">Examples: &ldquo;Latest AI trends&rdquo;, &ldquo;Market analysis for SaaS&rdquo;, &ldquo;Best practices for React&rdquo;</p>
          </div>
        )}

        {sessions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-[#6a6a6a]">Research Sessions</h3>
              <div className="text-xs text-[#6a6a6a]">
                {sessions.length} session{sessions.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        )}

        {sessions.map((session) => (
          <div 
            key={session.id} 
            className="group border border-[#2d2d30]/50 rounded-lg p-3 hover:border-[#2d2d30] hover:bg-[#252526]/20 transition-all cursor-pointer"
            onClick={() => {
              // Continue research from this session
              setQuery(session.query);
            }}
          >
            {/* Session Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {session.status === 'pending' || session.status === 'researching' ? (
                    <div className="w-2 h-2 bg-[#007acc] rounded-full animate-pulse" />
                  ) : session.status === 'completed' ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  ) : (
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </div>
                <span className="text-xs text-[#6a6a6a] capitalize">
                  {session.complexity}
                </span>
                <span className="text-xs text-[#6a6a6a]">•</span>
                <span className="text-xs text-[#6a6a6a]">
                  {new Date(session.startTime).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Toggle favorite functionality could be added here
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#252526] rounded"
                title="Add to favorites"
                aria-label="Add to favorites"
              >
                <Star className="w-3 h-3 text-[#6a6a6a] hover:text-yellow-500" />
              </button>
            </div>

            {/* Query */}
            <p className="text-sm font-medium text-[#cccccc] mb-2 line-clamp-2">
              {session.query}
            </p>

            {/* Quick Stats */}
            <div className="flex items-center gap-3 text-xs text-[#6a6a6a]">
              {session.status === 'completed' && session.result && (
                <>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {Math.round(session.result.confidence * 100)}% confidence
                  </span>
                  <span className="flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    {session.result.citations.length} sources
                  </span>
                  <span>
                    {formatTimeElapsed(session.result.timeElapsed)}
                  </span>
                </>
              )}
              {session.status === 'failed' && (
                <span className="flex items-center gap-1 text-red-500">
                  <AlertCircle className="w-3 h-3" />
                  Failed
                </span>
              )}
              {(session.status === 'pending' || session.status === 'researching') && (
                <span className="flex items-center gap-1 text-[#007acc]">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Researching...
                </span>
              )}
            </div>

            {/* Expanded Details - Show for completed sessions */}
            {session.status === 'completed' && session.result && (
              <div className="mt-3 pt-3 border-t border-[#2d2d30]/50 space-y-2">
                <p className="text-sm text-[#6a6a6a] line-clamp-2">
                  {session.result.summary}
                </p>
                
                {session.result.citations.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {session.result.citations.slice(0, 3).map((citation, index) => (
                      <a
                        key={index}
                        href={citation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-[#252526]/50 hover:bg-[#252526] rounded px-2 py-1 truncate max-w-[120px] inline-block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {citation.title || 'Source'}
                      </a>
                    ))}
                    {session.result.citations.length > 3 && (
                      <span className="text-xs text-[#6a6a6a] px-2 py-1">
                        +{session.result.citations.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Error State */}
            {session.status === 'failed' && (
              <div className="mt-3 pt-3 border-t border-[#2d2d30]/50">
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Research failed: {session.error}</span>
                </div>
              </div>
            )}

            {/* Detailed Results - Expanded view for completed sessions */}
            {session.status === 'completed' && session.result && (
              <details className="mt-3 pt-3 border-t border-[#2d2d30]/50">
                <summary className="text-xs text-[#007acc] cursor-pointer hover:text-[#005a9e] select-none">
                  Show detailed results
                </summary>
                <div className="mt-3 space-y-3">
                  {/* Full Summary */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-[#cccccc]">Summary</h4>
                    <p className="text-sm text-[#6a6a6a] leading-relaxed">{session.result.summary}</p>
                  </div>

                  {/* Key Points */}
                  {session.result.keyPoints.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-[#cccccc]">Key Points</h4>
                      <ul className="text-sm text-[#6a6a6a] space-y-1">
                        {session.result.keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="flex-shrink-0 mt-1.5 w-1 h-1 bg-[#007acc] rounded-full" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* All Sources */}
                  {session.result.citations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-[#cccccc]">All Sources</h4>
                      <div className="space-y-2">
                        {session.result.citations.map((citation, index) => (
                          <div key={index} className="border border-[#2d2d30] rounded-lg overflow-hidden bg-[#252526]/20">
                            {citation.url ? (
                              <a
                                href={citation.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-3 hover:bg-[#252526]/40 transition-colors cursor-pointer group"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="font-medium text-sm flex-1 group-hover:text-[#007acc] transition-colors">
                                    {citation.title}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      citation.sourceType === 'academic' ? 'bg-[#252526] text-[#cccccc]' :
                                      citation.sourceType === 'web' ? 'bg-[#2d2d30] text-[#cccccc]' :
                                      citation.sourceType === 'news' ? 'bg-[#2d2d30] text-[#cccccc]' :
                                      citation.sourceType === 'disclosure' ? 'bg-[#252526] text-[#cccccc]' :
                                      citation.sourceType === 'reference' ? 'bg-[#252526] text-[#cccccc]' :
                                      'bg-[#1e1e1e] text-[#6a6a6a]'
                                    }`}>
                                      {citation.sourceType}
                                    </span>
                                    <ExternalLink className="w-3 h-3 text-[#6a6a6a] group-hover:text-[#cccccc] transition-colors" />
                                  </div>
                                </div>
                                
                                <div className="text-[#007acc]/70 group-hover:text-[#007acc] text-xs mb-2 break-all">
                                  {citation.url}
                                </div>
                                
                                {citation.snippet && (
                                  <p className="text-[#6a6a6a] text-xs leading-relaxed">
                                    {citation.snippet}
                                  </p>
                                )}
                              </a>
                            ) : (
                              <div className="p-3">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="font-medium text-sm flex-1">{citation.title}</div>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    citation.sourceType === 'academic' ? 'bg-[#252526] text-[#cccccc]' :
                                    citation.sourceType === 'web' ? 'bg-[#2d2d30] text-[#cccccc]' :
                                    citation.sourceType === 'news' ? 'bg-[#2d2d30] text-[#cccccc]' :
                                    citation.sourceType === 'disclosure' ? 'bg-[#252526] text-[#cccccc]' :
                                    citation.sourceType === 'reference' ? 'bg-[#252526] text-[#cccccc]' :
                                    'bg-[#1e1e1e] text-[#6a6a6a]'
                                  }`}>
                                    {citation.sourceType}
                                  </span>
                                </div>
                                
                                {citation.snippet && (
                                  <p className="text-[#6a6a6a] text-xs leading-relaxed">
                                    {citation.snippet}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-xs text-[#6a6a6a] border-t border-[#2d2d30] pt-2">
                    <span>Confidence: {Math.round(session.result.confidence * 100)}%</span>
                    <span>Tokens: {session.result.tokensUsed.toLocaleString()}</span>
                    <span>Time: {formatTimeElapsed(session.result.timeElapsed)}</span>
                  </div>
                </div>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
