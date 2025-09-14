// TODOS CONSOLE - Task management interface for sidebar
// /Users/matthewsimon/Projects/LifeOS/LifeOS/app/_components/activity/_components/todos/TodosConsole.tsx

"use client";

import { useState } from "react";
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Filter
} from "lucide-react";
import { useEditorStore } from "@/lib/store";

interface Todo {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  tags: string[];
}

type FilterType = 'all' | 'pending' | 'in-progress' | 'completed' | 'overdue';

export function TodosConsole() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [filter, setFilter] = useState<FilterType>('all');
  const { openTab } = useEditorStore();

  // Mock todos data
  const mockTodos: Todo[] = [
    {
      id: 1,
      title: "Implement user authentication",
      description: "Set up Clerk authentication with JWT tokens",
      status: "in-progress",
      priority: "high",
      dueDate: "2025-08-25",
      createdAt: "2025-08-20",
      tags: ["authentication", "security"]
    },
    {
      id: 2,
      title: "Design database schema",
      description: "Create Convex schema for user data",
      status: "completed",
      priority: "medium",
      dueDate: "2025-08-22",
      createdAt: "2025-08-19",
      tags: ["database", "convex"]
    },
    {
      id: 3,
      title: "Write API documentation",
      description: "Document all API endpoints and usage",
      status: "pending",
      priority: "low",
      dueDate: "2025-08-30",
      createdAt: "2025-08-21",
      tags: ["documentation", "api"]
    },
    {
      id: 4,
      title: "Fix responsive layout",
      description: "Ensure mobile compatibility",
      status: "overdue",
      priority: "high",
      dueDate: "2025-08-20",
      createdAt: "2025-08-18",
      tags: ["ui", "mobile"]
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleTodoClick = (todo: Todo) => {
    openTab({
      id: `todo-${todo.id}`,
      title: todo.title,
      type: 'todos'
    });
  };

  // Group todos by status
  const pendingTodos = mockTodos.filter(todo => todo.status === 'pending');
  const inProgressTodos = mockTodos.filter(todo => todo.status === 'in-progress');
  const completedTodos = mockTodos.filter(todo => todo.status === 'completed');
  const overdueTodos = mockTodos.filter(todo => todo.status === 'overdue');

  const getFilterStats = () => {
    return {
      all: mockTodos.length,
      pending: mockTodos.filter(t => t.status === 'pending').length,
      'in-progress': mockTodos.filter(t => t.status === 'in-progress').length,
      completed: mockTodos.filter(t => t.status === 'completed').length,
      overdue: mockTodos.filter(t => t.status === 'overdue').length
    };
  };

  const stats = getFilterStats();

  const getStatusIcon = (status: Todo['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'in-progress':
        return <AlertCircle className="w-3 h-3 text-blue-400" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'overdue':
        return <AlertCircle className="w-3 h-3 text-red-400" />;
    }
  };

  const getPriorityColor = (priority: Todo['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-green-400';
    }
  };

  return (
    <div className="h-full bg-[#181818] text-[#cccccc] flex flex-col">
      <div className="p-2">
        <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
          <span>To Dos</span>
        </div>

        {/* Todo Management Sections */}
        <div className="space-y-1 mt-2">

          {/* Overview */}
          <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
            <button
              onClick={() => toggleSection('overview')}
              className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
            >
              {expandedSections.has('overview') ? 
                <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
                <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
              }
              <CheckSquare className="w-3.5 h-3.5 text-[#858585]" />
              <span className="text-xs font-medium flex-1 text-left">Overview</span>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-400" />
              </div>
            </button>
            
            {expandedSections.has('overview') && (
              <div className="px-2 pb-2 space-y-2">
                <div className="h-px bg-[#2d2d2d]" />
                
                {/* Overview Statistics */}
                <div className="text-[10px] text-[#858585] space-y-1">
                  <div className="flex justify-between">
                    <span>Total Tasks:</span>
                    <span className="text-[#cccccc]">{mockTodos.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>In Progress:</span>
                    <span className="text-[#cccccc]">{stats['in-progress']}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed:</span>
                    <span className="text-[#cccccc]">{stats.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending:</span>
                    <span className="text-[#cccccc]">{stats.pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overdue:</span>
                    <span className="text-[#cccccc]">{stats.overdue}</span>
                  </div>
                </div>

                <div className="h-px bg-[#2d2d2d]" />

                {/* Quick Actions */}
                <div className="space-y-1">
                  <div className="text-xs text-[#858585] mb-1 px-1">Quick Actions</div>
                  <button className="w-full flex items-center gap-2 px-1 py-1 text-xs text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d2d]/30 rounded transition-colors">
                    <Plus className="w-3 h-3" />
                    <span>Add New Task</span>
                  </button>
                  <button className="w-full flex items-center gap-2 px-1 py-1 text-xs text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d2d]/30 rounded transition-colors">
                    <Search className="w-3 h-3" />
                    <span>Search Tasks</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
            <button
              onClick={() => toggleSection('filters')}
              className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
            >
              {expandedSections.has('filters') ? 
                <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
                <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
              }
              <Filter className="w-3.5 h-3.5 text-[#858585]" />
              <span className="text-xs font-medium flex-1 text-left">Status Filter</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-[#858585] capitalize">{filter === 'in-progress' ? 'In Progress' : filter}</span>
              </div>
            </button>
            
            {expandedSections.has('filters') && (
              <div className="px-2 pb-2 space-y-2">
                <div className="h-px bg-[#2d2d2d]" />
                
                {/* Filter Actions */}
                <div className="space-y-1">
                  <div className="text-xs text-[#858585] mb-1 px-1">Task Status</div>
                  
                  {[
                    { id: 'all', label: 'All Tasks', icon: CheckSquare },
                    { id: 'pending', label: 'Pending', icon: Clock },
                    { id: 'in-progress', label: 'In Progress', icon: AlertCircle },
                    { id: 'completed', label: 'Completed', icon: CheckCircle },
                    { id: 'overdue', label: 'Overdue', icon: AlertCircle },
                  ].map((filterOption) => {
                    const Icon = filterOption.icon;
                    const isActive = filter === filterOption.id;
                    const count = stats[filterOption.id as keyof typeof stats];
                    
                    return (
                      <div key={filterOption.id} className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <Icon className="w-3 h-3 text-[#858585]" />
                          <span className="text-xs text-[#858585]">{filterOption.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#cccccc]">{count}</span>
                          <button
                            onClick={() => setFilter(filterOption.id as FilterType)}
                            className={`text-xs underline-offset-2 hover:underline ${
                              isActive 
                                ? 'text-[#007acc] font-medium' 
                                : 'text-[#858585] hover:text-[#cccccc]'
                            }`}
                          >
                            {isActive ? 'Active' : 'Select'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* In Progress */}
          {inProgressTodos.length > 0 && (
            <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
              <button
                onClick={() => toggleSection('inProgress')}
                className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
              >
                {expandedSections.has('inProgress') ? 
                  <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
                  <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
                }
                <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-medium flex-1 text-left">In Progress</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[#cccccc]">{inProgressTodos.length}</span>
                </div>
              </button>
              
              {expandedSections.has('inProgress') && (
                <div className="px-2 pb-2 space-y-2">
                  <div className="h-px bg-[#2d2d2d]" />
                  
                  <div className="space-y-1">
                    {inProgressTodos.map((todo) => (
                      <div 
                        key={todo.id} 
                        onClick={() => handleTodoClick(todo)}
                        className="flex items-center justify-between px-1 py-1 hover:bg-[#2d2d2d]/30 rounded cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getStatusIcon(todo.status)}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-[#cccccc] truncate">{todo.title}</div>
                            <div className="text-[10px] text-[#858585] truncate">{todo.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${getPriorityColor(todo.priority)}`}>
                            {todo.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Overdue */}
          {overdueTodos.length > 0 && (
            <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
              <button
                onClick={() => toggleSection('overdue')}
                className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
              >
                {expandedSections.has('overdue') ? 
                  <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
                  <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
                }
                <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs font-medium flex-1 text-left">Overdue</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[#cccccc]">{overdueTodos.length}</span>
                </div>
              </button>
              
              {expandedSections.has('overdue') && (
                <div className="px-2 pb-2 space-y-2">
                  <div className="h-px bg-[#2d2d2d]" />
                  
                  <div className="space-y-1">
                    {overdueTodos.map((todo) => (
                      <div 
                        key={todo.id} 
                        onClick={() => handleTodoClick(todo)}
                        className="flex items-center justify-between px-1 py-1 hover:bg-[#2d2d2d]/30 rounded cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getStatusIcon(todo.status)}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-[#cccccc] truncate">{todo.title}</div>
                            <div className="text-[10px] text-[#858585] truncate">Due: {todo.dueDate}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${getPriorityColor(todo.priority)}`}>
                            {todo.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pending */}
          {pendingTodos.length > 0 && (
            <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
              <button
                onClick={() => toggleSection('pending')}
                className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
              >
                {expandedSections.has('pending') ? 
                  <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
                  <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
                }
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-medium flex-1 text-left">Pending</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[#cccccc]">{pendingTodos.length}</span>
                </div>
              </button>
              
              {expandedSections.has('pending') && (
                <div className="px-2 pb-2 space-y-2">
                  <div className="h-px bg-[#2d2d2d]" />
                  
                  <div className="space-y-1">
                    {pendingTodos.map((todo) => (
                      <div 
                        key={todo.id} 
                        onClick={() => handleTodoClick(todo)}
                        className="flex items-center justify-between px-1 py-1 hover:bg-[#2d2d2d]/30 rounded cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getStatusIcon(todo.status)}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-[#cccccc] truncate">{todo.title}</div>
                            <div className="text-[10px] text-[#858585] truncate">Due: {todo.dueDate}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${getPriorityColor(todo.priority)}`}>
                            {todo.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Completed */}
          {completedTodos.length > 0 && (
            <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
              <button
                onClick={() => toggleSection('completed')}
                className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
              >
                {expandedSections.has('completed') ? 
                  <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
                  <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
                }
                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs font-medium flex-1 text-left">Completed</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[#cccccc]">{completedTodos.length}</span>
                </div>
              </button>
              
              {expandedSections.has('completed') && (
                <div className="px-2 pb-2 space-y-2">
                  <div className="h-px bg-[#2d2d2d]" />
                  
                  <div className="space-y-1">
                    {completedTodos.slice(0, 5).map((todo) => (
                      <div 
                        key={todo.id} 
                        onClick={() => handleTodoClick(todo)}
                        className="flex items-center justify-between px-1 py-1 hover:bg-[#2d2d2d]/30 rounded cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getStatusIcon(todo.status)}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-[#cccccc] truncate">{todo.title}</div>
                            <div className="text-[10px] text-[#858585] truncate">{todo.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {completedTodos.length > 5 && (
                      <div className="text-xs text-[#858585] text-center pt-1">
                        +{completedTodos.length - 5} more completed
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {mockTodos.length === 0 && (
            <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d] p-4">
              <div className="text-center">
                <CheckSquare className="w-8 h-8 text-[#858585] mx-auto mb-2" />
                <p className="text-sm text-[#858585] mb-1">No tasks found</p>
                <p className="text-xs text-[#858585]">
                  Create your first task to get started
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
