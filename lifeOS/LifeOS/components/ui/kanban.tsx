// KANBAN COMPONENTS - Drag and drop task board components
// /Users/matthewsimon/Projects/LifeOS/LifeOS/components/ui/kanban.tsx

"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

export interface KanbanColumn {
  id: string;
  name: string;
  color?: string;
}

export interface KanbanData {
  id: string;
  column: string;
  title?: string;
  name?: string;
  status?: string;
  priority?: string;
  description?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
}

interface KanbanContextType {
  columns: KanbanColumn[];
  data: KanbanData[];
  onDataChange: (data: KanbanData[]) => void;
  activeId: UniqueIdentifier | null;
}

const KanbanContext = createContext<KanbanContextType | null>(null);

export function useKanban() {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error('useKanban must be used within KanbanProvider');
  }
  return context;
}

interface KanbanProviderProps {
  columns: KanbanColumn[];
  data: KanbanData[];
  onDataChange: (data: KanbanData[]) => void;
  children: (column: KanbanColumn) => ReactNode;
}

export function KanbanProvider({ 
  columns, 
  data, 
  onDataChange, 
  children 
}: KanbanProviderProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeItem = data.find(item => item.id === activeId);
    const overItem = data.find(item => item.id === overId);

    if (!activeItem) return;

    // Moving to a different column
    if (overItem && activeItem.column !== overItem.column) {
      const updatedData = data.map(item => 
        item.id === activeId 
          ? { ...item, column: overItem.column }
          : item
      );
      onDataChange(updatedData);
    }
    
    // Moving to empty column (when over is a column id)
    const targetColumn = columns.find(col => col.id === overId);
    if (targetColumn && activeItem.column !== targetColumn.id) {
      const updatedData = data.map(item => 
        item.id === activeId 
          ? { ...item, column: targetColumn.id }
          : item
      );
      onDataChange(updatedData);
    }
  }, [data, columns, onDataChange]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeItem = data.find(item => item.id === activeId);
    const overItem = data.find(item => item.id === overId);

    if (!activeItem) return;

    // If dropped on another item in the same column, reorder
    if (overItem && activeItem.column === overItem.column) {
      const columnItems = data.filter(item => item.column === activeItem.column);
      const activeIndex = columnItems.findIndex(item => item.id === activeId);
      const overIndex = columnItems.findIndex(item => item.id === overId);
      
      if (activeIndex !== overIndex) {
        const reorderedItems = arrayMove(columnItems, activeIndex, overIndex);
        const otherItems = data.filter(item => item.column !== activeItem.column);
        onDataChange([...otherItems, ...reorderedItems]);
      }
    }
  }, [data, onDataChange]);

  const contextValue = {
    columns,
    data,
    onDataChange,
    activeId,
  };

  const activeItem = activeId ? data.find(item => item.id === activeId) : null;

  return (
    <KanbanContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map(column => (
            <div key={column.id} className="flex-shrink-0 w-80">
              {children(column)}
            </div>
          ))}
        </div>
        
        <DragOverlay>
          {activeItem && (
            <div className="bg-[#252526] border border-[#2d2d2d] rounded-lg p-4 shadow-lg opacity-90">
              <div className="text-sm font-medium text-[#cccccc]">
                {activeItem.title || activeItem.name || 'Dragging...'}
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </KanbanContext.Provider>
  );
}

interface KanbanBoardProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export function KanbanBoard({ id, children, className }: KanbanBoardProps) {
  const { data } = useKanban();
  const columnItems = data.filter(item => item.column === id);
  const itemIds = columnItems.map(item => item.id);

  return (
    <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
      <div className={cn(
        "bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-4 h-fit",
        className
      )}>
        {children}
      </div>
    </SortableContext>
  );
}

interface KanbanHeaderProps {
  children: ReactNode;
  className?: string;
}

export function KanbanHeader({ children, className }: KanbanHeaderProps) {
  return (
    <div className={cn(
      "text-sm font-medium text-[#cccccc] mb-4 pb-2 border-b border-[#2d2d2d]",
      className
    )}>
      {children}
    </div>
  );
}

interface KanbanCardsProps {
  id: string;
  children: (item: KanbanData) => ReactNode;
  className?: string;
}

export function KanbanCards({ id, children, className }: KanbanCardsProps) {
  const { data } = useKanban();
  const columnItems = data.filter(item => item.column === id);

  return (
    <div className={cn("space-y-3 min-h-[100px]", className)}>
      {columnItems.map(item => children(item))}
      {columnItems.length === 0 && (
        <div className="text-xs text-[#858585] text-center py-8 border-2 border-dashed border-[#2d2d2d] rounded-lg">
          Drop tasks here
        </div>
      )}
    </div>
  );
}

interface KanbanCardProps {
  id: string;
  column: string;
  name?: string;
  children: ReactNode;
  className?: string;
}

export function KanbanCard({ id, children, className }: Omit<KanbanCardProps, 'column' | 'name'>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const dragStyle = transform ? {
    transform: CSS.Transform.toString(transform),
    transition,
  } : {};

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-[#252526] border border-[#2d2d2d] rounded-lg p-3 cursor-grab active:cursor-grabbing",
        "hover:bg-[#2d2d2d]/30 transition-colors",
        isDragging && "opacity-50",
        className
      )}
    >
      {children}
    </div>
  );
}
