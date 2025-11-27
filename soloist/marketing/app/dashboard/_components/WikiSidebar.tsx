'use client';

import React from 'react';
import { 
  BookOpen, 
  Box, 
  GitBranch, 
  Database, 
  Zap, 
  Rocket, 
  AlertCircle,
  ChevronRight,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WikiPage {
  id: string;
  label: string;
  icon: React.ReactNode;
}

// WikiSection interface available for future use if needed

interface WikiSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

interface WikiItem {
  id?: string;
  label?: string;
  icon?: React.ReactNode;
  category?: string;
  items?: WikiPage[];
}

interface WikiSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const wikiStructure: WikiItem[] = [
  // Standalone top-level item
  {
    id: 'user-guide',
    label: 'User Guide',
    icon: <FileText className="w-4 h-4" />,
  },
  // Sections with dropdowns
  {
    category: 'Documentation',
    label: 'Documentation',
    icon: <BookOpen className="w-4 h-4" />,
    items: [
      {
        id: 'overview',
        label: 'System Overview',
        icon: <BookOpen className="w-4 h-4" />,
      },
      {
        id: 'architecture',
        label: 'Architecture',
        icon: <GitBranch className="w-4 h-4" />,
      },
    ],
  },
  {
    category: 'Components',
    items: [
      {
        id: 'components',
        label: 'Component Guide',
        icon: <Box className="w-4 h-4" />,
      },
      {
        id: 'state-management',
        label: 'State Management',
        icon: <Database className="w-4 h-4" />,
      },
    ],
  },
  {
    category: 'Integration',
    items: [
      {
        id: 'api-integration',
        label: 'API Integration',
        icon: <Zap className="w-4 h-4" />,
      },
    ],
  },
  {
    category: 'Operations',
    items: [
      {
        id: 'deployment',
        label: 'Deployment',
        icon: <Rocket className="w-4 h-4" />,
      },
      {
        id: 'troubleshooting',
        label: 'Troubleshooting',
        icon: <AlertCircle className="w-4 h-4" />,
      },
    ],
  },
];

export default function WikiSidebar({ activeSection, onSectionChange }: WikiSidebarProps) {
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    wikiStructure.forEach(item => {
      if (item.items) {
        const hasActivePage = item.items.some(page => page.id === activeSection);
        initialState[item.category!] = hasActivePage || item.category === 'Documentation';
      }
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
    <div className="w-64 h-full bg-[#181818] border-r border-[#2d2d2d] flex flex-col">
      {/* Header */}
      <div className="border-b border-[#2d2d2d] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-gray-400" />
          <div>
            <h2 className="text-xs font-medium text-gray-300 tracking-wide">Documentation</h2>
            <p className="text-[10px] text-gray-600 mt-0.5">Live Feed System</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pl-4 py-4 space-y-2.5">
        {wikiStructure.map((item, index) => (
          <div key={item.id || item.category || index}>
            {/* Standalone item (no dropdown) */}
            {item.id && (
              <button
                onClick={() => onSectionChange(item.id!)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm transition-colors pr-5",
                  activeSection === item.id
                    ? "bg-[#2d2d2d] text-white"
                    : "text-gray-400 hover:text-gray-300 hover:bg-[#1e1e1e]"
                )}
              >
                {item.icon}
                <span className="text-xs">{item.label}</span>
              </button>
            )}

            {/* Section with dropdown */}
            {item.category && item.items && (
              <>
                {/* Category Header */}
                <button
                  onClick={() => toggleSection(item.category!)}
                  className="w-full flex items-center justify-between px-2 py-1 pr-5 cursor-pointer group"
                >
                  <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <ChevronRight 
                    className={cn(
                      "w-3 h-3 text-gray-600 transition-transform",
                      openSections[item.category] && "rotate-90"
                    )}
                  />
                </button>

                {/* Pages */}
                {openSections[item.category] && (
                  <div className="mt-1 space-y-0.5">
                    {item.items.map((page) => (
                      <button
                        key={page.id}
                        onClick={() => onSectionChange(page.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm transition-colors pr-5",
                          activeSection === page.id
                            ? "bg-[#2d2d2d] text-white"
                            : "text-gray-400 hover:text-gray-300 hover:bg-[#1e1e1e]"
                        )}
                      >
                        {page.icon}
                        <span className="text-xs">{page.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-[#2d2d2d] px-4 py-3">
        <p className="text-[10px] text-gray-600">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
