'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { createContext, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

export interface KanbanColumn {
  id: string;
  name: string;
  color?: string;
}

export interface KanbanItem {
  id: string;
  column: string;
  [key: string]: any;
}

interface KanbanContextType {
  columns: KanbanColumn[];
  items: KanbanItem[];
  activeColumn: KanbanColumn | null;
  activeItem: KanbanItem | null;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
}

const KanbanContext = createContext<KanbanContextType | null>(null);

export function useKanban() {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }
  return context;
}

interface KanbanProviderProps {
  columns: KanbanColumn[];
  data: KanbanItem[];
  onDragEnd?: (event: DragEndEvent) => void;
  children: (column: KanbanColumn, items: KanbanItem[]) => React.ReactNode;
}

export function KanbanProvider({
  columns,
  data,
  onDragEnd,
  children,
}: KanbanProviderProps) {
  const [items, setItems] = useState(data);
  const [activeColumn, setActiveColumn] = useState<KanbanColumn | null>(null);
  const [activeItem, setActiveItem] = useState<KanbanItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeColumn = columns.find((col) => col.id === active.id);
    const activeItem = items.find((item) => item.id === active.id);

    setActiveColumn(activeColumn || null);
    setActiveItem(activeItem || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const isActiveItem = items.some((item) => item.id === activeId);
    const isOverItem = items.some((item) => item.id === overId);
    const isOverColumn = columns.some((col) => col.id === overId);

    if (!isActiveItem) return;

    // Dropping item over another item
    if (isActiveItem && isOverItem) {
      setItems((items) => {
        const activeIndex = items.findIndex((item) => item.id === activeId);
        const overIndex = items.findIndex((item) => item.id === overId);

        const activeItem = items[activeIndex];
        const overItem = items[overIndex];

        if (activeItem.column !== overItem.column) {
          activeItem.column = overItem.column;
          return arrayMove(items, activeIndex, overIndex - 1);
        }

        return arrayMove(items, activeIndex, overIndex);
      });
    }

    // Dropping item over a column
    if (isActiveItem && isOverColumn) {
      setItems((items) => {
        const activeIndex = items.findIndex((item) => item.id === activeId);
        const activeItem = items[activeIndex];

        if (activeItem.column !== overId) {
          activeItem.column = overId as string;
          return [...items];
        }

        return items;
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveItem(null);
    onDragEnd?.(event);
  };

  const contextValue = useMemo(
    () => ({
      columns,
      items,
      activeColumn,
      activeItem,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      onDragOver: handleDragOver,
    }),
    [columns, items, activeColumn, activeItem]
  );

  return (
    <KanbanContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 h-full">
          {columns.map((column) => {
            const columnItems = items.filter((item) => item.column === column.id);
            return children(column, columnItems);
          })}
        </div>
        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <div className="w-80 opacity-50">
                <KanbanBoard id={activeColumn.id}>
                  <KanbanHeader>{activeColumn.name}</KanbanHeader>
                </KanbanBoard>
              </div>
            )}
            {activeItem && (
              <div className="opacity-50">
                <KanbanCard
                  id={activeItem.id}
                  name={activeItem.name}
                  column={activeItem.column}
                />
              </div>
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </KanbanContext.Provider>
  );
}

interface KanbanBoardProps {
  id: string;
  children: React.ReactNode;
}

export function KanbanBoard({ id, children }: KanbanBoardProps) {
  const { setNodeRef } = useSortable({
    id,
    data: {
      type: 'Column',
    },
  });

  return (
    <div
      ref={setNodeRef}
      className="w-80 shrink-0 bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 flex flex-col h-full"
    >
      {children}
    </div>
  );
}

interface KanbanHeaderProps {
  children: React.ReactNode;
}

export function KanbanHeader({ children }: KanbanHeaderProps) {
  return (
    <div className="font-semibold text-sm mb-3 px-1">
      {children}
    </div>
  );
}

interface KanbanCardsProps {
  id: string;
  children: (item: KanbanItem) => React.ReactNode;
}

export function KanbanCards({ id, children }: KanbanCardsProps) {
  const { items } = useKanban();
  const columnItems = items.filter((item) => item.column === id);

  return (
    <ScrollArea className="flex-1 h-0">
      <SortableContext items={columnItems} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-0">
          {columnItems.map((item) => children(item))}
        </div>
      </SortableContext>
    </ScrollArea>
  );
}

interface KanbanCardProps {
  id: string;
  name: string;
  column: string;
  className?: string;
}

export function KanbanCard({ id, name, column, className }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      type: 'Card',
      card: { id, name, column },
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'bg-card p-3 rounded-md shadow-sm border cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50',
        className
      )}
    >
      <div className="font-medium text-sm">{name}</div>
    </div>
  );
}

export type { DragEndEvent };