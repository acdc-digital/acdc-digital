// SEARCH DOMAIN MANAGER COMPONENT
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/app/dashboard/studio/controls/_components/SearchDomainManager.tsx

'use client';

import React from 'react';
import { FeedbackState } from './types';
import { Switch } from "@/components/ui/switch";

interface SearchDomainManagerProps {
  // Domain state
  searchDomains: string[];
  newDomain: string;
  setNewDomain: (value: string) => void;
  domainFeedback: FeedbackState;
  
  // Actions
  handleAddDomain: () => void;
  handleRemoveDomain: (domain: string) => void;
  
  // Responsive props
  showConfigInline?: boolean;
  configData?: {
    enabledDefaultsCount: number;
    customSubredditsCount: number;
    hostStats: { totalNarrations: number };
    useUserApiKey: boolean;
    setUseUserApiKey: (value: boolean) => void;
    hasValidApiKey: () => boolean;
  };
}

export default function SearchDomainManager({
  searchDomains,
  newDomain,
  setNewDomain,
  domainFeedback,
  handleAddDomain,
  handleRemoveDomain,
  showConfigInline = false,
  configData,
}: SearchDomainManagerProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground/70 uppercase tracking-wider">
        {showConfigInline ? 'Search & Config' : 'Search'}
      </div>
      <div className="space-y-1">
        {/* Search Input */}
        <div className="flex gap-1">
          <input
            type="text"
            placeholder="search"
            value={newDomain}
            onChange={(event) => setNewDomain(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleAddDomain();
              }
            }}
            disabled={domainFeedback.status === 'working'}
            className="flex-1 px-1 py-1 text-xs bg-[#1a1a1a] border border-border/20 rounded-sm text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-0"
          />
          <button
            onClick={handleAddDomain}
            disabled={
              domainFeedback.status === 'working' ||
              newDomain.trim().length === 0
            }
            className="px-1 py-1 text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
          >
            {domainFeedback.status === 'working' ? '…' : '+'}
          </button>
        </div>
        
        {/* Search Terms Container */}
        <div className="space-y-1">
          {searchDomains.length === 0 ? (
            <div className="px-2 py-1 text-xs rounded-sm bg-[#1a1a1a] text-muted-foreground/30 italic border border-border/20">
              custom domain…
            </div>
          ) : (
            searchDomains.map((domain) => (
              <div
                key={domain}
                className="px-2 py-1 text-xs rounded-sm bg-blue-500/15 text-blue-300 flex items-center justify-between gap-2 border border-blue-500/20"
              >
                <span className="truncate">{domain}</span>
                <button
                  onClick={() => handleRemoveDomain(domain)}
                  disabled={domainFeedback.status === 'working'}
                  className="w-4 h-4 flex items-center justify-center text-blue-200/70 hover:text-blue-200 transition-colors disabled:text-blue-200/30"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
        {domainFeedback.status === 'error' && (
          <div className="text-xs text-red-400">{domainFeedback.message}</div>
        )}
        
        {/* Inline config for tablet view */}
        {showConfigInline && configData && (
          <div className="space-y-1 text-xs pt-2 border-t border-border/20">
            <div className="flex justify-between">
              <span className="text-muted-foreground/70">Sources</span>
              <span className="font-mono">{configData.enabledDefaultsCount + configData.customSubredditsCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground/70">Stories</span>
              <span className="font-mono">{configData.hostStats.totalNarrations}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground/70">API</span>
              <Switch
                checked={configData.useUserApiKey}
                onCheckedChange={configData.setUseUserApiKey}
                className="scale-75"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}