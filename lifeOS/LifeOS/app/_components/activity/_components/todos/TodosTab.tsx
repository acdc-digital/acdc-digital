// TODOS TAB - Main tab content for task management
// /Users/matthewsimon/Projects/LifeOS/LifeOS/app/_components/activity/_components/todos/TodosTab.tsx

"use client";

import { useState, useMemo } from "react";
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Calendar,
  Tag,
  MoreHorizontal,
  Edit
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

export function TodosTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterType>('all');
  const { openTab } = useEditorStore();

  // Mock todos data
  const mockTodos: Todo[] = useMemo(() => [
    {
      id: 1,
      title: "Implement user authentication",
      description: "Set up Clerk authentication with JWT tokens and secure session management",
      status: "in-progress",
      priority: "high",
      dueDate: "2025-08-25",
      createdAt: "2025-08-20",
      tags: ["authentication", "security", "backend"]
    },
    {
      id: 2,
      title: "Design database schema",
      description: "Create Convex schema for user data, posts, and social connections with proper relationships",
      status: "completed",
      priority: "medium",
      dueDate: "2025-08-22",
      createdAt: "2025-08-19",
      tags: ["database", "convex", "schema"]
    },
    {
      id: 3,
      title: "Write API documentation",
      description: "Document all API endpoints and usage examples for the development team",
      status: "pending",
      priority: "low",
      dueDate: "2025-08-30",
      createdAt: "2025-08-21",
      tags: ["documentation", "api", "frontend"]
    },
    {
      id: 4,
      title: "Fix responsive layout",
      description: "Ensure mobile compatibility across all components and pages",
      status: "overdue",
      priority: "high",
      dueDate: "2025-08-20",
      createdAt: "2025-08-18",
      tags: ["ui", "mobile", "css"]
    },
    {
      id: 5,
      title: "Setup CI/CD pipeline",
      description: "Configure automated testing and deployment with GitHub Actions",
      status: "pending",
      priority: "medium",
      dueDate: "2025-09-01",
      createdAt: "2025-08-22",
      tags: ["devops", "automation", "testing"]
    },
    {
      id: 6,
      title: "Optimize database queries",
      description: "Review and optimize slow queries for better performance",
      status: "in-progress",
      priority: "medium",
      dueDate: "2025-08-28",
      createdAt: "2025-08-21",
      tags: ["performance", "database", "optimization"]
    }
  ], []);

  const filteredTodos = useMemo(() => {
    let filtered = mockTodos;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(todo => todo.status === filter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(todo => 
        todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  }, [filter, searchTerm, mockTodos]);

  const handleTodoClick = (todo: Todo) => {
    openTab({
      id: `todo-${todo.id}`,
      title: todo.title,
      type: 'todos'
    });
  };

  const getStatusIcon = (status: Todo['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4 text-blue-400" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusColor = (status: Todo['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-400';
      case 'in-progress':
        return 'text-blue-400';
      case 'completed':
        return 'text-green-400';
      case 'overdue':
        return 'text-red-400';
    }
  };

  const getPriorityColor = (priority: Todo['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-400/10';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'low':
        return 'text-green-400 bg-green-400/10';
    }
  };

  const getStats = () => {
    return {
      total: mockTodos.length,
      pending: mockTodos.filter(t => t.status === 'pending').length,
      inProgress: mockTodos.filter(t => t.status === 'in-progress').length,
      completed: mockTodos.filter(t => t.status === 'completed').length,
      overdue: mockTodos.filter(t => t.status === 'overdue').length
    };
  };

  const stats = getStats();

  return (
    <div className="h-full bg-[#1e1e1e] text-[#cccccc] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[#2d2d2d]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#cccccc]">To Dos</h1>
            <p className="text-sm text-[#858585] mt-1">
              Manage your tasks and track progress
            </p>
          </div>
          <button className="flex items-center gap-2 bg-[#007acc] hover:bg-[#005a9e] px-4 py-2 rounded-md text-sm font-medium text-white transition-colors">
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-[#252526] border border-[#2d2d2d] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckSquare className="w-4 h-4 text-[#858585]" />
              <span className="text-xs text-[#858585]">Total</span>
            </div>
            <div className="text-lg font-semibold text-[#cccccc]">{stats.total}</div>
          </div>
          <div className="bg-[#252526] border border-[#2d2d2d] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-[#858585]">Pending</span>
            </div>
            <div className="text-lg font-semibold text-[#cccccc]">{stats.pending}</div>
          </div>
          <div className="bg-[#252526] border border-[#2d2d2d] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-[#858585]">In Progress</span>
            </div>
            <div className="text-lg font-semibold text-[#cccccc]">{stats.inProgress}</div>
          </div>
          <div className="bg-[#252526] border border-[#2d2d2d] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs text-[#858585]">Completed</span>
            </div>
            <div className="text-lg font-semibold text-[#cccccc]">{stats.completed}</div>
          </div>
          <div className="bg-[#252526] border border-[#2d2d2d] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-[#858585]">Overdue</span>
            </div>
            <div className="text-lg font-semibold text-[#cccccc]">{stats.overdue}</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-6 border-b border-[#2d2d2d]">
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#858585]" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#252526] border border-[#2d2d2d] rounded-md pl-10 pr-3 py-2 text-sm text-[#cccccc] placeholder-[#858585] focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#858585]" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="bg-[#252526] border border-[#2d2d2d] rounded-md px-3 py-2 text-sm text-[#cccccc] focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
              title="Filter todos by status"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-auto">
        {filteredTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <CheckSquare className="w-12 h-12 text-[#858585] mb-4" />
            <h2 className="text-lg font-medium text-[#cccccc] mb-2">
              {searchTerm || filter !== 'all' ? 'No matching tasks' : 'No tasks yet'}
            </h2>
            <p className="text-sm text-[#858585] text-center max-w-md">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter to find what you\'re looking for.'
                : 'Get started by creating your first task to stay organized and productive.'
              }
            </p>
            {(!searchTerm && filter === 'all') && (
              <button className="flex items-center gap-2 bg-[#007acc] hover:bg-[#005a9e] px-4 py-2 rounded-md text-sm font-medium text-white transition-colors mt-4">
                <Plus className="w-4 h-4" />
                Create your first task
              </button>
            )}
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-3">
              {filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="bg-[#252526] border border-[#2d2d2d] rounded-lg p-4 hover:bg-[#2d2d2d]/30 transition-colors cursor-pointer"
                  onClick={() => handleTodoClick(todo)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(todo.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-[#cccccc] truncate">
                            {todo.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                            {todo.priority}
                          </span>
                        </div>
                        {todo.description && (
                          <p className="text-sm text-[#858585] mb-2 line-clamp-2">
                            {todo.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-[#858585]">
                          <span className={`flex items-center gap-1 ${getStatusColor(todo.status)}`}>
                            {getStatusIcon(todo.status)}
                            {todo.status === 'in-progress' ? 'In Progress' : todo.status.charAt(0).toUpperCase() + todo.status.slice(1)}
                          </span>
                          {todo.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Due {todo.dueDate}
                            </span>
                          )}
                          <span>Created {todo.createdAt}</span>
                        </div>
                        {todo.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <Tag className="w-3 h-3 text-[#858585]" />
                            <div className="flex gap-1">
                              {todo.tags.map((tag) => (
                                <span key={tag} className="px-2 py-1 bg-[#2d2d2d] text-xs text-[#858585] rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Edit todo
                        }}
                        className="p-1 hover:bg-[#2d2d2d] rounded transition-colors"
                        title="Edit task"
                      >
                        <Edit className="w-4 h-4 text-[#858585]" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // More options
                        }}
                        className="p-1 hover:bg-[#2d2d2d] rounded transition-colors"
                        title="More options"
                      >
                        <MoreHorizontal className="w-4 h-4 text-[#858585]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
