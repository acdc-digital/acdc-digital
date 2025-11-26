// AGENTS EXTENSIONS PANEL - Combined agents and extensions management interface
// /Users/matthewsimon/Projects/LifeOS/LifeOS/app/_components/activity/_components/agents-extensions/AgentsExtensionsPanel.tsx

"use client";

import { useState } from "react";
import { Bot, Puzzle } from "lucide-react";
import { AgentsPanel } from "../agents";
import ExtensionsPanel from "../extensions/ExtensionsPanel";

export function AgentsExtensionsPanel() {
  const [activeTab, setActiveTab] = useState<'agents' | 'extensions'>('agents');

  const tabs = [
    { id: 'agents', label: 'Agents', icon: Bot },
    { id: 'extensions', label: 'Extensions', icon: Puzzle }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[#454545]">
        <h3 className="text-[#cccccc] font-medium mb-4 flex items-center gap-2">
          <Bot className="w-4 h-4" />
          AGENTS & EXTENSIONS
        </h3>
        
        {/* Tabs */}
        <div className="flex bg-[#3c3c3c] rounded">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'agents' | 'extensions')}
                className={`flex-1 px-3 py-2 text-xs rounded flex items-center justify-center gap-1 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#007acc] text-white'
                    : 'text-[#858585] hover:text-[#cccccc] hover:bg-[#404040]'
                }`}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {activeTab === 'agents' ? (
          <div className="flex-1 flex flex-col">
            {/* Agents content - we'll embed the existing AgentsPanel */}
            <div className="flex-1 overflow-hidden">
              <AgentsPanel />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Extensions content - we'll embed the existing ExtensionsPanel */}
            <div className="flex-1 overflow-hidden">
              <ExtensionsPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
