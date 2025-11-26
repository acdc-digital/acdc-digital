// KANBAN TODOS TAB - Kanban board view for task management
// /Users/matthewsimon/Projects/LifeOS/LifeOS/app/_components/activity/_components/todos/KanbanTodosTab.tsx

"use client";

import { useState, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  MoreHorizontal,
  Edit
} from "lucide-react";
import { useEditorStore } from "@/lib/store";
import { 
  KanbanProvider, 
  KanbanBoard, 
  KanbanHeader, 
  KanbanCards, 
  KanbanCard,
  type KanbanColumn,
  type KanbanData
} from "@/components/ui/kanban";

interface Todo extends KanbanData {
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  tags: string[];
}

export function KanbanTodosTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const { openTab } = useEditorStore();

  // Kanban columns
  const columns: KanbanColumn[] = [
    { id: "pending", name: "Pending", color: "#6B7280" },
    { id: "in-progress", name: "In Progress", color: "#F59E0B" },
    { id: "completed", name: "Completed", color: "#10B981" },
    { id: "overdue", name: "Overdue", color: "#EF4444" },
  ];

  // Mock todos data
  const mockTodos: Todo[] = useMemo(() => [
    {
      id: "1",
      column: "in-progress",
      title: "Implement user authentication",
      description: "Set up Clerk authentication with JWT tokens and secure session management",
      status: "in-progress",
      priority: "high",
      dueDate: "2025-08-25",
      createdAt: "2025-08-20",
      tags: ["authentication", "security", "backend"]
    },
    {
      id: "2",
      column: "completed",
      title: "Design database schema",
      description: "Create Convex schema for user data, posts, and social connections with proper relationships",
      status: "completed",
      priority: "medium",
      dueDate: "2025-08-22",
      createdAt: "2025-08-19",
      tags: ["database", "convex", "schema"]
    },
    {
      id: "3",
      column: "pending",
      title: "Write API documentation",
      description: "Document all API endpoints and usage examples for the development team",
      status: "pending",
      priority: "low",
      dueDate: "2025-08-30",
      createdAt: "2025-08-21",
      tags: ["documentation", "api", "frontend"]
    },
    {
      id: "4",
      column: "overdue",
      title: "Fix responsive layout",
      description: "Ensure mobile compatibility across all components and pages",
      status: "overdue",
      priority: "high",
      dueDate: "2025-08-20",
      createdAt: "2025-08-18",
      tags: ["ui", "mobile", "css"]
    },
    {
      id: "5",
      column: "pending",
      title: "Setup CI/CD pipeline",
      description: "Configure automated testing and deployment with GitHub Actions",
      status: "pending",
      priority: "medium",
      dueDate: "2025-09-01",
      createdAt: "2025-08-22",
      tags: ["devops", "automation", "testing"]
    },
    {
      id: "6",
      column: "in-progress",
      title: "Optimize database queries",
      description: "Review and optimize slow queries for better performance",
      status: "in-progress",
      priority: "medium",
      dueDate: "2025-08-28",
      createdAt: "2025-08-21",
      tags: ["performance", "database", "optimization"]
    }
  ], []);

  const [todos, setTodos] = useState<Todo[]>(mockTodos);

  const filteredTodos = useMemo(() => {
    if (!searchTerm) return todos;
    
    return todos.filter(todo => 
      todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      todo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      todo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [todos, searchTerm]);

  const handleTodoClick = (todo: Todo) => {
    openTab({
      id: `todo-${todo.id}`,
      title: todo.title,
      type: 'todos'
    });
  };

  const handleDataChange = (newData: KanbanData[]) => {
    const updatedTodos = newData.map(item => {
      const originalTodo = todos.find(t => t.id === item.id);
      if (!originalTodo) return item as Todo;
      
      // Update the status to match the column
      let newStatus: Todo['status'];
      switch (item.column) {
        case 'pending':
          newStatus = 'pending';
          break;
        case 'in-progress':
          newStatus = 'in-progress';
          break;
        case 'completed':
          newStatus = 'completed';
          break;
        case 'overdue':
          newStatus = 'overdue';
          break;
        default:
          newStatus = originalTodo.status;
      }
      
      return {
        ...originalTodo,
        column: item.column,
        status: newStatus,
      };
    });
    
    setTodos(updatedTodos);
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

  const getColumnColor = (columnId: string) => {
    switch (columnId) {
      case 'pending':
        return 'bg-gray-400';
      case 'in-progress':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'overdue':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStats = () => {
    return {
      total: filteredTodos.length,
      pending: filteredTodos.filter(t => t.status === 'pending').length,
      inProgress: filteredTodos.filter(t => t.status === 'in-progress').length,
      completed: filteredTodos.filter(t => t.status === 'completed').length,
      overdue: filteredTodos.filter(t => t.status === 'overdue').length
    };
  };

  const stats = getStats();

  return (
    <div className="h-full bg-[#1e1e1e] text-[#cccccc] flex flex-col">
      {/* Compact Header */}
      <div className="px-3 py-2 border-b border-[#2d2d2d]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-[13px] font-medium text-[#cccccc]">TODOS</h1>
            <div className="flex items-center gap-2 text-[11px] text-[#858585]">
              <span className="text-[#cccccc]">{stats.total}</span>
              <span className="text-[#6B7280]">{stats.pending}</span>
              <span className="text-[#F59E0B]">{stats.inProgress}</span>
              <span className="text-[#10B981]">{stats.completed}</span>
              <span className="text-[#EF4444]">{stats.overdue}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-[#858585]" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-32 h-6 bg-[#252526] border-0 rounded pl-6 pr-2 text-[11px] text-[#cccccc] placeholder-[#858585] focus:outline-none focus:ring-1 focus:ring-[#007acc]"
              />
            </div>
            <button className="flex items-center gap-1 bg-[#007acc] hover:bg-[#005a9e] px-2 py-1 rounded text-[11px] font-medium text-white transition-colors">
              <Plus className="w-3 h-3" />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-auto p-3">
        <KanbanProvider
          columns={columns}
          data={filteredTodos}
          onDataChange={handleDataChange}
        >
          {(column) => (
            <KanbanBoard id={column.id} key={column.id}>
              <KanbanHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${getColumnColor(column.id)}`} />
                    <span className="font-medium">{column.name}</span>
                  </div>
                  <span className="text-xs text-[#858585] bg-[#2d2d2d] px-2 py-1 rounded">
                    {filteredTodos.filter(todo => todo.column === column.id).length}
                  </span>
                </div>
              </KanbanHeader>
              <KanbanCards id={column.id}>
                {(item: KanbanData) => {
                  const todo = item as Todo;
                  return (
                    <KanbanCard id={todo.id} key={todo.id}>
                      <div 
                        className="space-y-2 cursor-pointer group"
                        onClick={() => handleTodoClick(todo)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1">
                            {getStatusIcon(todo.status)}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-[12px] font-medium text-[#cccccc] leading-tight line-clamp-2">
                                {todo.title}
                              </h3>
                              {todo.description && (
                                <p className="text-[11px] text-[#858585] mt-1 leading-tight line-clamp-2">
                                  {todo.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getPriorityColor(todo.priority)}`}>
                              {todo.priority.charAt(0).toUpperCase()}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // More options
                              }}
                              className="p-1 hover:bg-[#2d2d2d] rounded transition-colors opacity-0 group-hover:opacity-100"
                              title="More options"
                            >
                              <MoreHorizontal className="w-3 h-3 text-[#858585]" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-[#858585]">
                          <div className="flex items-center gap-2">
                            {todo.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTodoClick(todo);
                            }}
                            className="p-1 hover:bg-[#2d2d2d] rounded transition-colors opacity-0 group-hover:opacity-100"
                            title="Edit task"
                          >
                            <Edit className="w-3 h-3 text-[#858585]" />
                          </button>
                        </div>

                        {todo.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {todo.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="px-1.5 py-0.5 bg-[#2d2d2d] text-[10px] text-[#858585] rounded">
                                {tag}
                              </span>
                            ))}
                            {todo.tags.length > 2 && (
                              <span className="px-1.5 py-0.5 bg-[#2d2d2d] text-[10px] text-[#858585] rounded">
                                +{todo.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </KanbanCard>
                  );
                }}
              </KanbanCards>
            </KanbanBoard>
          )}
        </KanbanProvider>
      </div>
    </div>
  );
}
