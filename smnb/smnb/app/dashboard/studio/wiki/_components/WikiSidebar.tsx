'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Bot,
  Workflow,
  Wrench,
  GitBranch,
  Building2,
  MessageSquare,
  BarChart3,
  Network
} from 'lucide-react';

interface WikiNavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: WikiNavItem[];
}

const wikiNavigation: WikiNavItem[] = [
  {
    id: 'unified-scoring',
    label: 'Unified Scoring System',
    icon: <BarChart3 className="w-4 h-4" />,
    children: [
      {
        id: 'unified-scoring-chart',
        label: 'Scoring Matrix Chart',
        icon: <Network className="w-3 h-3" />,
      },
    ],
  },
  {
    id: 'agents',
    label: 'Agent & Tool Profiles',
    icon: <Bot className="w-4 h-4" />,
    children: [
      {
        id: 'agent-profile-chart',
        label: 'Agent Display Cards',
        icon: <Network className="w-3 h-3" />,
      },
    ],
  },
  {
    id: 'data-flow',
    label: 'Data-Flow Architecture',
    icon: <Workflow className="w-4 h-4" />,
  },
  {
    id: 'agents-tools',
    label: 'Agents & Tools Reference',
    icon: <Wrench className="w-4 h-4" />,
  },
  {
    id: 'data-flow-chart',
    label: 'Data Flow Chart',
    icon: <GitBranch className="w-4 h-4" />,
  },
  {
    id: 'nasdaq-100',
    label: 'NASDAQ-100 Companies',
    icon: <Building2 className="w-4 h-4" />,
  },
  {
    id: 'session-manager',
    label: 'Session Manager',
    icon: <MessageSquare className="w-4 h-4" />,
    children: [
      {
        id: 'session-workflow-chart',
        label: 'Conversational Workflow',
        icon: <Workflow className="w-3 h-3" />,
      },
    ],
  },
];

interface WikiSidebarProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export default function WikiSidebar({ activeSection, onSectionChange }: WikiSidebarProps) {
  const renderNavItem = (item: WikiNavItem, level = 0) => {
    const isActive = activeSection === item.id;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <button
          onClick={() => onSectionChange(item.id)}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
            "hover:bg-white/5",
            isActive && "bg-white/10 text-white font-medium",
            !isActive && "text-gray-400",
            level > 0 && "pl-8"
          )}
        >
          {item.icon && <span>{item.icon}</span>}
          <span>{item.label}</span>
        </button>
        {hasChildren && (
          <div className="ml-2">
            {item.children!.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 h-full bg-[#0a0a0a] border-r border-white/10 p-4 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-1">Documentation</h2>
        <p className="text-xs text-gray-500">Metrics & Content Generation</p>
      </div>
      <nav className="space-y-1">
        {wikiNavigation.map(item => renderNavItem(item))}
      </nav>
    </div>
  );
}