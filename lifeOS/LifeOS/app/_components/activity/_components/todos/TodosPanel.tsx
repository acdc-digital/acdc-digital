// TODOS PANEL - Individual task detail view
// /Users/matthewsimon/Projects/LifeOS/LifeOS/app/_components/activity/_components/todos/TodosPanel.tsx

"use client";

import { useState } from "react";
import { 
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Tag,
  Edit,
  Save,
  X,
  ArrowLeft
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
  updatedAt?: string;
  tags: string[];
}

interface TodosPanelProps {
  todoId?: string;
}

export function TodosPanel({ todoId }: TodosPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { openTab } = useEditorStore();

  // Mock todo data - in real app, fetch by todoId
  const mockTodo: Todo = {
    id: todoId ? parseInt(todoId.replace('todo-', '')) : 1,
    title: "Implement user authentication",
    description: "Set up Clerk authentication with JWT tokens and secure session management. This includes implementing proper user registration, login, logout, and session validation. Need to ensure proper error handling and user feedback for authentication failures.",
    status: "in-progress",
    priority: "high",
    dueDate: "2025-08-25",
    createdAt: "2025-08-20",
    updatedAt: "2025-08-22",
    tags: ["authentication", "security", "backend"]
  };

  const [editedTodo, setEditedTodo] = useState<Todo>(mockTodo);

  const getStatusIcon = (status: Todo['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-400" />;
      case 'in-progress':
        return <AlertCircle className="w-5 h-5 text-blue-400" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getStatusColor = (status: Todo['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-400 bg-gray-400/10';
      case 'in-progress':
        return 'text-blue-400 bg-blue-400/10';
      case 'completed':
        return 'text-green-400 bg-green-400/10';
      case 'overdue':
        return 'text-red-400 bg-red-400/10';
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

  const handleSave = () => {
    // In real app, save to database
    console.log('Saving todo:', editedTodo);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTodo(mockTodo);
    setIsEditing(false);
  };

  const handleBackToTodos = () => {
    openTab({
      id: 'todos-main',
      title: 'To Dos',
      type: 'todos'
    });
  };

  return (
    <div className="h-full bg-[#1e1e1e] text-[#cccccc] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[#2d2d2d]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToTodos}
              className="p-2 hover:bg-[#2d2d2d] rounded-md transition-colors"
              title="Back to todos"
            >
              <ArrowLeft className="w-4 h-4 text-[#858585]" />
            </button>
            <div className="flex items-center gap-3">
              {getStatusIcon(editedTodo.status)}
              <div>
                <h1 className="text-xl font-semibold text-[#cccccc]">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedTodo.title}
                      onChange={(e) => setEditedTodo({ ...editedTodo, title: e.target.value })}
                      className="bg-[#252526] border border-[#2d2d2d] rounded px-2 py-1 text-xl font-semibold text-[#cccccc] focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
                      placeholder="Enter task title"
                      title="Task title"
                    />
                  ) : (
                    editedTodo.title
                  )}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(editedTodo.status)}`}>
                    {editedTodo.status === 'in-progress' ? 'In Progress' : editedTodo.status.charAt(0).toUpperCase() + editedTodo.status.slice(1)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(editedTodo.priority)}`}>
                    {editedTodo.priority.charAt(0).toUpperCase() + editedTodo.priority.slice(1)} Priority
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-[#007acc] hover:bg-[#005a9e] px-3 py-2 rounded-md text-sm font-medium text-white transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 bg-[#2d2d2d] hover:bg-[#3d3d3d] px-3 py-2 rounded-md text-sm font-medium text-[#cccccc] transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-[#2d2d2d] hover:bg-[#3d3d3d] px-3 py-2 rounded-md text-sm font-medium text-[#cccccc] transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#252526] border border-[#2d2d2d] rounded-lg p-4">
              <h3 className="text-sm font-medium text-[#cccccc] mb-3">Task Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#858585]">Status:</span>
                  {isEditing ? (
                    <select
                      value={editedTodo.status}
                      onChange={(e) => setEditedTodo({ ...editedTodo, status: e.target.value as Todo['status'] })}
                      className="bg-[#1e1e1e] border border-[#2d2d2d] rounded px-2 py-1 text-sm text-[#cccccc] focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
                      title="Task status"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(editedTodo.status)}`}>
                      {editedTodo.status === 'in-progress' ? 'In Progress' : editedTodo.status.charAt(0).toUpperCase() + editedTodo.status.slice(1)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#858585]">Priority:</span>
                  {isEditing ? (
                    <select
                      value={editedTodo.priority}
                      onChange={(e) => setEditedTodo({ ...editedTodo, priority: e.target.value as Todo['priority'] })}
                      className="bg-[#1e1e1e] border border-[#2d2d2d] rounded px-2 py-1 text-sm text-[#cccccc] focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
                      title="Task priority"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(editedTodo.priority)}`}>
                      {editedTodo.priority.charAt(0).toUpperCase() + editedTodo.priority.slice(1)}
                    </span>
                  )}
                </div>
                {editedTodo.dueDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#858585]">Due Date:</span>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editedTodo.dueDate}
                        onChange={(e) => setEditedTodo({ ...editedTodo, dueDate: e.target.value })}
                        className="bg-[#1e1e1e] border border-[#2d2d2d] rounded px-2 py-1 text-sm text-[#cccccc] focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
                        title="Due date"
                        placeholder="Select due date"
                      />
                    ) : (
                      <span className="text-[#cccccc] flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {editedTodo.dueDate}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#252526] border border-[#2d2d2d] rounded-lg p-4">
              <h3 className="text-sm font-medium text-[#cccccc] mb-3">Timeline</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#858585]">Created:</span>
                  <span className="text-[#cccccc]">{editedTodo.createdAt}</span>
                </div>
                {editedTodo.updatedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#858585]">Last Updated:</span>
                    <span className="text-[#cccccc]">{editedTodo.updatedAt}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[#858585]">Task ID:</span>
                  <span className="text-[#858585] font-mono">#{editedTodo.id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-[#252526] border border-[#2d2d2d] rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-[#cccccc] mb-3">Description</h3>
            {isEditing ? (
              <textarea
                value={editedTodo.description || ''}
                onChange={(e) => setEditedTodo({ ...editedTodo, description: e.target.value })}
                className="w-full bg-[#1e1e1e] border border-[#2d2d2d] rounded px-3 py-2 text-sm text-[#cccccc] placeholder-[#858585] focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc] min-h-[100px] resize-vertical"
                placeholder="Add a description for this task..."
              />
            ) : (
              <div className="text-sm text-[#cccccc] leading-relaxed">
                {editedTodo.description || (
                  <span className="text-[#858585] italic">No description provided</span>
                )}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="bg-[#252526] border border-[#2d2d2d] rounded-lg p-4">
            <h3 className="text-sm font-medium text-[#cccccc] mb-3">Tags</h3>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Add tags (separated by commas)"
                  value={editedTodo.tags.join(', ')}
                  onChange={(e) => setEditedTodo({ 
                    ...editedTodo, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) 
                  })}
                  className="w-full bg-[#1e1e1e] border border-[#2d2d2d] rounded px-3 py-2 text-sm text-[#cccccc] placeholder-[#858585] focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
                />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {editedTodo.tags.length > 0 ? (
                  editedTodo.tags.map((tag, index) => (
                    <span key={index} className="flex items-center gap-1 px-3 py-1 bg-[#2d2d2d] text-xs text-[#cccccc] rounded-full">
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-[#858585] italic text-sm">No tags</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
