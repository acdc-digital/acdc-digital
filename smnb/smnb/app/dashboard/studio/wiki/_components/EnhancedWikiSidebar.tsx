'use client';

import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/components/ui/collapsible';
import { 
  BookOpen,
  ChevronRight,
  Building2,
  Scale,
  Bot,
  Workflow,
  Wrench,
  GitBranch,
  MessageSquare,
  BarChart3,
  Network,
  Trophy,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WikiPage {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface WikiSection {
  category: string;
  items: WikiPage[];
}

const wikiStructure: WikiSection[] = [
  {
    category: 'Getting Started',
    items: [
      {
        id: 'getting-started',
        label: 'Overview',
        icon: <BookOpen className="w-4 h-4" />,
      },
      {
        id: 'milestones',
        label: 'Milestones',
        icon: <Trophy className="w-4 h-4" />,
      },
    ],
  },
  {
    category: 'Index & Market Data',
    items: [
      {
        id: 'nasdaq-100',
        label: 'NASDAQ-100 Companies',
        icon: <Building2 className="w-4 h-4" />,
      },
      {
        id: 'index-construction',
        label: 'Index Construction',
        icon: <Scale className="w-4 h-4" />,
      },
    ],
  },
  {
    category: 'Scoring & Metrics',
    items: [
      {
        id: 'unified-scoring',
        label: 'Unified Scoring System',
        icon: <BarChart3 className="w-4 h-4" />,
      },
      {
        id: 'unified-scoring-chart',
        label: 'Scoring Matrix Chart',
        icon: <Network className="w-4 h-4" />,
      },
    ],
  },
  {
    category: 'Architecture',
    items: [
      {
        id: 'data-flow',
        label: 'Data-Flow Architecture',
        icon: <Workflow className="w-4 h-4" />,
      },
      {
        id: 'data-flow-chart',
        label: 'Data Flow Chart',
        icon: <GitBranch className="w-4 h-4" />,
      },
    ],
  },
  {
    category: 'AI Agents & Tools',
    items: [
      {
        id: 'agents',
        label: 'Agent Profiles',
        icon: <Bot className="w-4 h-4" />,
      },
      {
        id: 'agent-profile-chart',
        label: 'Agent Display Cards',
        icon: <Network className="w-4 h-4" />,
      },
      {
        id: 'agents-tools',
        label: 'Tools Reference',
        icon: <Wrench className="w-4 h-4" />,
      },
    ],
  },
  {
    category: 'Session Management',
    items: [
      {
        id: 'session-manager',
        label: 'Session Manager',
        icon: <MessageSquare className="w-4 h-4" />,
      },
      {
        id: 'session-workflow-chart',
        label: 'Conversational Workflow',
        icon: <Workflow className="w-4 h-4" />,
      },
    ],
  },
];

interface EnhancedWikiSidebarProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export default function EnhancedWikiSidebar({ activeSection, onSectionChange }: EnhancedWikiSidebarProps) {
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>(() => {
    // Find which section contains the active page and open it by default
    const initialState: Record<string, boolean> = {};
    wikiStructure.forEach(section => {
      const hasActivePage = section.items.some(item => item.id === activeSection);
      initialState[section.category] = hasActivePage;
    });
    return initialState;
  });

  const toggleSection = (category: string) => {
    setOpenSections(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div className="w-58 h-full bg-[#181818] border-r border-white/[0.06] flex flex-col">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-gray-400" />
          <div>
            <h2 className="text-xs font-medium text-gray-300 tracking-wide">Documentation</h2>
            <p className="text-[10px] text-gray-600 mt-0.5">Wiki & Reference</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pl-4 py-4 space-y-2.5">
        {wikiStructure.map((section) => (
          <Collapsible
            key={section.category}
            open={openSections[section.category]}
            onOpenChange={() => toggleSection(section.category)}
          >
            {/* Category Header */}
            <CollapsibleTrigger className="w-full flex items-center justify-between px-2 py-1 pr-5 cursor-pointer group">
              <span className="text-[12px] font-dm-sans font-semibold text-gray-200 uppercase tracking-widest">
                {section.category}
              </span>
              <ChevronRight className={cn(
                "w-3 h-3 text-gray-600 transition-transform duration-200",
                openSections[section.category] && "rotate-90"
              )} />
            </CollapsibleTrigger>

            {/* Category Items */}
            <CollapsibleContent className="mt-1 space-y-0">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2 py-2 text-sm transition-colors duration-150 border-r-1",
                    activeSection === item.id
                      ? "border-[#007acc] text-gray-100"
                      : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700"
                  )}
                >
                  {item.icon && (
                    <span className={cn(
                      "flex-shrink-0 transition-colors",
                      activeSection === item.id ? "text-gray-300" : "text-gray-600"
                    )}>
                      {item.icon}
                    </span>
                  )}
                  <span className="flex-1 text-left text-xs font-light tracking-wide">{item.label}</span>
                </button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
