// RESEARCH STUDIO - Full-canvas research interface with newspaper-inspired layout
// /Users/matthewsimon/Projects/LifeOS/LifeOS/app/_components/activity/_components/research/ResearchStudio.tsx

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Lightbulb, 
  Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PromptInputModeSelect,
  ResearchMode
} from '@/components/ai/prompt-input';

export function ResearchStudio() {
  const [query, setQuery] = useState('');
  const [researchMode, setResearchMode] = useState<ResearchMode>('comprehensive');
  const [complexity, setComplexity] = useState<'simple' | 'medium' | 'complex'>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'research' | 'response' | 'canvas' | 'settings'>('research');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Keyboard shortcut for focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          complexity,
          mode: researchMode,
          userId: 'demo_user'
        }),
      });

      if (!response.ok) {
        throw new Error('Research request failed');
      }

      const result = await response.json();
      console.log('Research completed:', result);
      
    } catch (error) {
      console.error('Research error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [query, complexity, researchMode]);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-[#cccccc]">
      {/* Header - Command Palette Style */}
      <div className="flex-shrink-0 border-b border-[#2d2d30] bg-[#1e1e1e]">
        <div className="p-6">
          {/* Title */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-[#ffffff]">Research Studio</h1>
            <Badge variant="secondary" className="text-xs bg-[#3c3c3c] text-[#cccccc]">
              {isLoading ? 'researching' : 'ready'}
            </Badge>
          </div>

          {/* Main Input Area */}
          <div className="flex gap-6">
            {/* Left Column - Input (37.5% width) */}
            <div className="w-[37.5%] space-y-4">
              <div className="bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg p-4 h-[344px] flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-[#858585]">Research Prompt</span>
                  <div className="flex items-center gap-2">
                    <PromptInputModeSelect 
                      mode={researchMode}
                      onModeChange={setResearchMode}
                      size="sm"
                    />
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                  <div className="flex-1 mb-3">
                    <textarea
                      ref={textareaRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="What would you like to research?"
                      className="w-full h-full bg-transparent border-none outline-none text-[#cccccc] text-sm resize-none placeholder:text-[#6a6a6a]"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-[#3c3c3c]">
                    <span className="text-xs text-[#6a6a6a]">Cmd+Enter to research</span>
                    <Button
                      type="submit"
                      disabled={!query.trim() || isLoading}
                      size="sm"
                      className="bg-[#007acc] hover:bg-[#005a9a] text-white text-xs h-7 px-3"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Research
                        </>
                      ) : (
                        'Research'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column - Response Panel (62.5% width) */}
            <div className="w-[62.5%] space-y-4">
              <div className="bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg p-4 h-[344px] flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-[#858585]">System Response</span>
                  <div className="flex items-center gap-2">
                    {isLoading && <Loader2 className="w-3 h-3 animate-spin text-[#007acc]" />}
                    <Badge variant="secondary" className="text-xs bg-[#3c3c3c] text-[#cccccc]">
                      {isLoading ? 'researching' : 'ready'}
                    </Badge>
                  </div>
                </div>
                
                {/* Response Content Area */}
                <div className="flex-1 overflow-y-auto">
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="text-[#444444] mb-2">AI</div>
                    <p className="text-xs text-[#6a6a6a]">
                      AI responses will appear here
                    </p>
                  </div>
                </div>

                {/* Response Footer */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#3c3c3c]">
                  <span className="text-xs text-[#6a6a6a]">
                    Ready for research
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-[#858585] hover:text-[#cccccc]"
                    onClick={() => setActiveView('response')}
                  >
                    View All
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Research Cockpit - Command Palette below input */}
          <div className="mt-6 bg-[#252526] border border-[#3c3c3c] rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#858585] uppercase tracking-wide">Research Cockpit</span>
              <div className="text-xs text-[#6a6a6a]">Configure analysis parameters</div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {/* Column 1 - Analysis Controls */}
              <div className="space-y-3">
                <div className="bg-[#1e1e1e] border border-[#3c3c3c] rounded p-3">
                  <span className="text-xs text-[#858585] uppercase tracking-wide">Focus</span>
                  <div className="grid grid-cols-2 gap-1 mt-2">
                    {[
                      { id: 'trends', label: 'Trends' },
                      { id: 'data', label: 'Data' },
                      { id: 'analysis', label: 'Analysis' },
                      { id: 'sources', label: 'Sources' }
                    ].map((area) => (
                      <Button
                        key={area.id}
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d30] justify-start"
                      >
                        {area.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Column 2 - Output Controls */}
              <div className="space-y-3">
                <div className="bg-[#1e1e1e] border border-[#3c3c3c] rounded p-3">
                  <span className="text-xs text-[#858585] uppercase tracking-wide">Format</span>
                  <div className="space-y-1 mt-2">
                    {[
                      { id: 'structured', label: 'Report', desc: 'Organized sections' },
                      { id: 'bullets', label: 'Points', desc: 'Key insights' },
                      { id: 'narrative', label: 'Story', desc: 'Flowing prose' }
                    ].map((format) => (
                      <label key={format.id} className="flex items-center gap-2 cursor-pointer hover:bg-[#2d2d30] rounded px-1 py-0.5">
                        <input
                          type="radio"
                          name="outputFormat"
                          value={format.id}
                          className="w-3 h-3 accent-[#007acc]"
                        />
                        <div className="flex-1">
                          <span className="text-xs text-[#cccccc]">{format.label}</span>
                          <span className="text-xs text-[#6a6a6a] ml-1">- {format.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Column 3 - Quick Actions */}
              <div className="space-y-3">
                <div className="bg-[#1e1e1e] border border-[#3c3c3c] rounded p-3">
                  <span className="text-xs text-[#858585] uppercase tracking-wide">Quick Actions</span>
                  <div className="space-y-1 mt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full h-6 px-2 text-xs text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d30] justify-start"
                    >
                      Save Session
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full h-6 px-2 text-xs text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d30] justify-start"
                    >
                      Open Template
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full h-6 px-2 text-xs text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d30] justify-start"
                    >
                      Export Results
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <Lightbulb className="w-12 h-12 text-[#444444] mb-4 mx-auto" />
            <p className="text-sm text-[#858585]">
              Start a new research session above or view results in the sidebar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
