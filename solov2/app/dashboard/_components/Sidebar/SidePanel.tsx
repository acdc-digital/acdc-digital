// SIDE PANEL COMPONENT - Collapsible sidebar for Soloist dashboard
// /Users/matthewsimon/Projects/acdc-digital/solov2/app/dashbo         <button

"use client";

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, File, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileTreeItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileTreeItem[];
}

const mockFileTree: FileTreeItem[] = [
  {
    id: '1',
    name: 'Projects',
    type: 'folder',
    children: [
      { id: '2', name: 'dashboard.tsx', type: 'file' },
      { id: '3', name: 'components', type: 'folder', children: [
        { id: '4', name: 'Header.tsx', type: 'file' },
        { id: '5', name: 'Sidebar.tsx', type: 'file' },
      ]},
    ]
  },
  {
    id: '6',
    name: 'Analytics',
    type: 'folder',
    children: [
      { id: '7', name: 'heatmap.ts', type: 'file' },
      { id: '8', name: 'forecast.ts', type: 'file' },
    ]
  },
];

interface FileTreeProps {
  items: FileTreeItem[];
  level?: number;
}

function FileTree({ items, level = 0 }: FileTreeProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['1', '3']));

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  return (
    <div>
      {items.map((item) => {
        const isExpanded = expandedItems.has(item.id);
        const hasChildren = item.children && item.children.length > 0;

        return (
          <div key={item.id}>
            <div
              className={`flex items-center h-8 px-3 hover:bg-[#2d2d2d] cursor-pointer text-sm text-[#cccccc]`}
              style={{ paddingLeft: `${level * 16 + 12}px` }}
              onClick={() => {
                if (hasChildren) {
                  toggleExpanded(item.id);
                }
              }}
            >
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="w-4 h-4 mr-2 text-[#858585]" />
                ) : (
                  <ChevronRight className="w-4 h-4 mr-2 text-[#858585]" />
                )
              ) : (
                <div className="w-6 mr-2" />
              )}
              
              {item.type === 'folder' ? (
                <Folder className="w-4 h-4 mr-3 text-[#858585]" />
              ) : (
                <File className="w-4 h-4 mr-3 text-[#858585]" />
              )}
              
              <span className="truncate">{item.name}</span>
            </div>
            
            {hasChildren && isExpanded && item.children && (
              <FileTree items={item.children} level={level + 1} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function SidePanel() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <div className="w-8 bg-[#1e1e1e] border-r border-[#2d2d2d] flex flex-col">
        <button
          onClick={() => setIsCollapsed(false)}
          className="w-full h-10 rounded-none text-[#FBB041] hover:text-[#F8D194] cursor-pointer flex items-center justify-center"
          title="Expand Sidebar"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 bg-[#1e1e1e] border-r border-[#2d2d2d] flex flex-col">
      {/* Panel Header */}
      <div className="h-[35px] bg-[#1e1e1e] border-b border-[#2d2d2d] flex items-center px-4">
        <span className="text-sm text-[#cccccc] font-medium uppercase tracking-wider">
          Explorer
        </span>
        <button
          onClick={() => setIsCollapsed(true)}
          className="ml-auto w-7 h-7 rounded-none text-[#FBB041] hover:text-white cursor-pointer flex items-center justify-center"
          title="Collapse Sidebar"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-auto py-2">
        <FileTree items={mockFileTree} />
      </div>
    </div>
  );
}