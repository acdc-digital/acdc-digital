'use client';

import { useState } from 'react';
import { 
  LayoutList, 
  LayoutGrid, 
  GanttChart, 
  Table, 
  Search, 
  Filter, 
  Plus,
  MoreVertical
} from 'lucide-react';
import KanbanView from './_components/kanban';
// Import future components
// import ListView from './_components/list';
// import GanttView from './_components/gantt';
// import TableView from './_components/table';

type ViewType = 'kanban' | 'list' | 'gantt' | 'table';

interface TasksProps {
  className?: string;
}

export default function Tasks({ className = '' }: TasksProps) {
  const [activeView, setActiveView] = useState<ViewType>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const views = [
    { id: 'list', name: 'List', icon: LayoutList },
    { id: 'kanban', name: 'Board', icon: LayoutGrid },
    { id: 'gantt', name: 'Timeline', icon: GanttChart },
    { id: 'table', name: 'Table', icon: Table },
  ] as const;

  const renderView = () => {
    switch (activeView) {
      case 'kanban':
        return <KanbanView />;
      case 'list':
        return (
          <div className="flex items-center justify-center h-full text-[#858585]">
            <div className="text-center">
              <LayoutList size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">List view coming soon</p>
            </div>
          </div>
        );
      case 'gantt':
        return (
          <div className="flex items-center justify-center h-full text-[#858585]">
            <div className="text-center">
              <GanttChart size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">Timeline view coming soon</p>
            </div>
          </div>
        );
      case 'table':
        return (
          <div className="flex items-center justify-center h-full text-[#858585]">
            <div className="text-center">
              <Table size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">Table view coming soon</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`h-full flex flex-col bg-[#1e1e1e] ${className}`}>
      {/* Controls Row */}
      <div className="border-b border-[#2d2d2d] px-6 py-4">
        <div className="flex items-center justify-between">
          {/* View Switcher */}
          <div className="flex items-center bg-[#1a1a1a] rounded-lg p-1">
            {views.map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id as ViewType)}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-all cursor-pointer
                    ${activeView === view.id 
                      ? 'bg-[#008080] text-white' 
                      : 'text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d2d]'
                    }
                  `}
                  title={`${view.name} view`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{view.name}</span>
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#858585]" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
                  pl-9 pr-3 py-1.5 bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg
                  text-sm text-[#cccccc] placeholder-[#858585]
                  focus:outline-none focus:border-[#008080] transition-colors
                  w-48 lg:w-64
                "
              />
            </div>

            {/* Filter */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer
                ${isFilterOpen 
                  ? 'bg-[#008080] border-[#008080] text-white' 
                  : 'bg-[#1a1a1a] border-[#2d2d2d] text-[#858585] hover:text-[#cccccc] hover:border-[#3d3d3d]'
                }
              `}
            >
              <Filter size={16} />
              <span className="text-sm hidden sm:inline">Filter</span>
            </button>

            {/* Add Task */}
            <button
              className="
                flex items-center gap-2 px-3 py-1.5 bg-[#008080] text-white rounded-lg
                hover:bg-[#007070] transition-colors cursor-pointer
              "
            >
              <Plus size={16} />
              <span className="text-sm hidden sm:inline">Add Task</span>
            </button>

            {/* More Options */}
            <button
              className="
                p-1.5 rounded-lg text-[#858585] hover:text-[#cccccc] 
                hover:bg-[#2d2d2d] transition-colors cursor-pointer
              "
              title="More options"
            >
              <MoreVertical size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* View Content */}
      <div className="flex-1 h-0">
        {renderView()}
      </div>
    </div>
  );
}
