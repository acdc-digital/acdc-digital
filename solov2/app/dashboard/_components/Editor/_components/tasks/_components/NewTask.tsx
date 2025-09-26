'use client';

import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Save
} from 'lucide-react';

interface NewTaskProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: TaskFormData) => void;
  defaultColumn?: string;
  mode?: 'modal' | 'inline';
}

interface TaskFormData {
  name: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate: string;
  column: string;
  assignee: { name: string; avatar: string; } | null;
  tags: string[];
}

const priorities = [
  { name: 'Low', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { name: 'Medium', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { name: 'High', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { name: 'Critical', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
];

const columns = [
  { id: 'backlog', name: 'Backlog' },
  { id: 'todo', name: 'To Do' },
  { id: 'in-progress', name: 'In Progress' },
  { id: 'review', name: 'Review' },
  { id: 'done', name: 'Done' },
];

export default function NewTask({ 
  isOpen, 
  onClose, 
  onSave, 
  defaultColumn = 'todo', 
  mode = 'modal' 
}: NewTaskProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    name: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    column: defaultColumn,
    assignee: null,
    tags: []
  });

  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSave(formData);
      // Reset form
      setFormData({
        name: '',
        description: '',
        priority: 'Medium',
        dueDate: '',
        column: defaultColumn,
        assignee: null,
        tags: []
      });
      setNewTag('');
      onClose();
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  if (!isOpen) return null;

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 pb-3">
        <h3 className="text-lg font-medium text-white">Create New Task</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X size={20} />
        </button>
      </div>

      {/* Task Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Task Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter task name..."
          className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:border-[#008080] transition-colors"
          required
          autoFocus
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Add task description..."
          rows={3}
          className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:border-[#008080] transition-colors resize-none"
        />
      </div>

      {/* Priority & Column */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as TaskFormData['priority'] }))}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-[#008080] transition-colors cursor-pointer"
            title="Select task priority"
          >
            {priorities.map((priority) => (
              <option key={priority.name} value={priority.name}>
                {priority.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Column</label>
          <select
            value={formData.column}
            onChange={(e) => setFormData(prev => ({ ...prev, column: e.target.value }))}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-[#008080] transition-colors cursor-pointer"
            title="Select task column"
          >
            {columns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Due Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Due Date</label>
        <input
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
          className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-[#008080] transition-colors cursor-pointer"
          title="Select due date"
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Tags</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, addTag)}
            placeholder="Add tag..."
            className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:border-[#008080] transition-colors"
          />
          <button
            type="button"
            onClick={addTag}
            className="p-3 bg-[#008080] text-white rounded-md hover:bg-[#007070] transition-colors cursor-pointer"
            title="Add tag"
          >
            <Plus size={16} />
          </button>
        </div>
        
        {/* Tag List */}
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag) => (
              <span 
                key={tag}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-[#008080]/20 text-[#00bcd4] border border-[#008080]/40"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-white transition-colors cursor-pointer"
                  title="Remove tag"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-700">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 px-4 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 hover:text-white transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!formData.name.trim()}
          className="flex-1 py-3 px-4 bg-[#008080] text-white rounded-md hover:bg-[#007070] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          <Save size={16} />
          Create Task
        </button>
      </div>
    </form>
  );

  if (mode === 'inline') {
    return (
      <div className="bg-[#2E2A24] border border-gray-600 rounded-md p-4 mb-2">
        {formContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2E2A24] border border-gray-600 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {formContent}
      </div>
    </div>
  );
}