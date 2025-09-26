'use client';

import type { DragEndEvent } from '@/components/ui/shadcn-io/kanban';
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from '@/components/ui/shadcn-io/kanban';
import { useState } from 'react';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Circle, 
  MoreHorizontal,
  Plus,
  Calendar
} from 'lucide-react';
import NewTask from './NewTask';

interface ExtendedKanbanColumn {
  id: string;
  name: string;
  color: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const columns: ExtendedKanbanColumn[] = [
  { id: 'backlog', name: 'Backlog', color: '#6B7280', icon: Circle },
  { id: 'todo', name: 'To Do', color: '#3B82F6', icon: Circle },
  { id: 'in-progress', name: 'In Progress', color: '#F59E0B', icon: Clock },
  { id: 'review', name: 'Review', color: '#8B5CF6', icon: AlertCircle },
  { id: 'done', name: 'Done', color: '#10B981', icon: CheckCircle2 },
];

const priorities = [
  { name: 'Critical', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { name: 'High', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { name: 'Medium', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { name: 'Low', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
];

// Tasks will be managed through state or props
interface Task {
  id: string;
  name: string;
  description?: string;
  priority: string;
  dueDate?: Date;
  column: string;
  assignee?: { id: string; name: string; avatar: string; };
  tags: string[];
  taskNumber: string;
  comments: number;
  attachments: number;
}

// Tasks start empty - use "Add task" buttons to create new tasks
const initialTasks: Task[] = [];

interface KanbanViewProps {
  className?: string;
}

export default function KanbanView({ className = '' }: KanbanViewProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [defaultColumn, setDefaultColumn] = useState('todo');

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const targetColumn = columns.find(({ id }) => id === over.id);
    if (!targetColumn) return;

    setTasks(prevTasks =>
      prevTasks.map((task) => 
        task.id === active.id ? { ...task, column: targetColumn.id } : task
      )
    );
  };

  const getPriorityStyle = (priority: string) => {
    const priorityConfig = priorities.find(p => p.name === priority);
    return priorityConfig?.color || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const handleCreateTask = (taskData: {
    name: string;
    description: string;
    priority: string;
    dueDate: string;
    column: string;
    assignee: { name: string; avatar: string; } | null;
    tags: string[];
  }) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: taskData.name,
      description: taskData.description,
      priority: taskData.priority,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
      column: taskData.column,
      assignee: taskData.assignee ? { id: 'current-user', ...taskData.assignee } : { id: 'current-user', name: 'You', avatar: 'Y' },
      tags: taskData.tags,
      taskNumber: `TASK-${String(tasks.length + 1).padStart(4, '0')}`,
      comments: 0,
      attachments: 0,
    };

    setTasks(prev => [...prev, newTask]);
  };

  const openNewTask = (columnId: string) => {
    setDefaultColumn(columnId);
    setIsNewTaskOpen(true);
  };

  return (
    <div className={`h-full w-full bg-[#1a1a1] flex flex-col ${className}`}>
      <div className="flex-1 p-6 overflow-auto min-h-0">
        <KanbanProvider columns={columns} data={tasks} onDragEnd={handleDragEnd}>
          {(column) => {
            const extendedColumn = columns.find(c => c.id === column.id) as ExtendedKanbanColumn;
            const Icon = extendedColumn.icon;
            const columnTasks = tasks.filter(task => task.column === column.id);
            
            return (
              <KanbanBoard id={column.id} key={column.id}>
                <KanbanHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon 
                        size={16} 
                        className={`
                          ${column.name === 'Done' ? 'text-emerald-600' : ''}
                          ${column.name === 'In Progress' ? 'text-yellow-600' : ''}
                          ${column.name === 'Review' ? 'text-purple-600' : ''}
                          ${column.name === 'To Do' ? 'text-blue-600' : ''}
                          ${column.name === 'Backlog' ? 'text-gray-600' : ''}
                        `}
                      />
                      <span className="text-sm font-medium text-white">{column.name}</span>
                      <span className="text-xs px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded">
                        {columnTasks.length}
                      </span>
                    </div>
                    <button 
                      className="p-1 hover:bg-gray-700 rounded transition-colors cursor-pointer"
                      title="Add task"
                      onClick={() => openNewTask(column.id)}
                    >
                      <Plus size={14} className="text-gray-400" />
                    </button>
                  </div>
                </KanbanHeader>
                
                {/* Content Area - flex-1 to take remaining space */}
                <div className="flex-1 flex flex-col">
                  {columnTasks.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center py-8 text-center">
                      <p className="text-sm text-gray-400">
                        No tasks yet. Click &quot;Add task&quot; to get started.
                      </p>
                    </div>
                  ) : (
                    <KanbanCards id={column.id}>
                      {(task) => (
                      <div key={task.id} className="mb-2">
                        <div className="bg-[#2a2a2a] border border-gray-700 rounded-md hover:border-[#008080]/50 transition-all group">
                          <KanbanCard
                            column={column.name}
                            id={task.id}
                            name={task.name}
                            className="p-0 !bg-transparent border-0 shadow-none cursor-grab"
                          />
                          <div className="p-3">
                            {/* Task Header */}
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-xs text-[#00bcd4] font-mono font-medium">{task.taskNumber}</span>
                              <button 
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-700 rounded cursor-pointer"
                                title="Task options"
                              >
                                <MoreHorizontal size={12} className="text-gray-400" />
                              </button>
                            </div>
                            
                            {/* Task Title */}
                            <h4 className="text-sm font-medium text-white mb-2 line-clamp-2 leading-relaxed">
                              {task.name}
                            </h4>
                            
                            {/* Task Description */}
                            {task.description && (
                              <p className="text-xs text-gray-300 mb-3 line-clamp-2 leading-relaxed">
                                {task.description}
                              </p>
                            )}
                            
                            {/* Tags */}
                            {task.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {task.tags.slice(0, 2).map((tag: string, index: number) => (
                                  <span 
                                    key={index}
                                    className="text-xs px-2 py-1 rounded bg-[#008080]/20 text-[#00bcd4] border border-[#008080]/40 font-dm-sans"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                                {task.tags.length > 2 && (
                                  <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 font-dm-sans">
                                    +{task.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {/* Footer */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                              <div className="flex items-center gap-2">
                                {/* Priority */}
                                <span className={`text-xs px-2 py-1 rounded border font-medium ${getPriorityStyle(task.priority)}`}>
                                  {task.priority}
                                </span>
                                
                                {/* Due Date */}
                                {task.dueDate && (
                                  <span className="flex items-center gap-1 text-xs text-gray-400 font-dm-sans">
                                    <Calendar size={10} />
                                    {new Date(task.dueDate).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}
                                  </span>
                                )}
                              </div>
                              
                              {/* Assignee and Meta */}
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                  {task.comments > 0 && (
                                    <span className="flex items-center gap-1">
                                      <span>💬</span>
                                      <span>{task.comments}</span>
                                    </span>
                                  )}
                                  {task.attachments > 0 && (
                                    <span className="flex items-center gap-1 ml-1">
                                      <span>📎</span>
                                      <span>{task.attachments}</span>
                                    </span>
                                  )}
                                </div>
                                {task.assignee && (
                                  <div 
                                    className="w-6 h-6 rounded-full bg-[#008080] flex items-center justify-center text-white text-xs font-medium"
                                    title={task.assignee.name}
                                  >
                                    {task.assignee.avatar}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      )}
                    </KanbanCards>
                  )}
                </div>
                
                {/* Add Task Button - positioned at bottom */}
                <div className="mt-auto pt-3">
                  <button 
                    className="w-full p-2 border border-gray-600 rounded-lg text-gray-400 hover:text-gray-200 hover:border-gray-500 hover:bg-gray-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    title="Add new task"
                    onClick={() => openNewTask(column.id)}
                  >
                    <Plus size={14} />
                    <span className="text-xs">Add task</span>
                  </button>
                </div>
              </KanbanBoard>
            );
          }}
        </KanbanProvider>
      </div>
      
      {/* New Task Modal */}
      <NewTask
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        onSave={handleCreateTask}
        defaultColumn={defaultColumn}
        mode="modal"
      />
    </div>
  );
}
