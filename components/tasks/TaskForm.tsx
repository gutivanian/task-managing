'use client';

import { useState, useEffect } from 'react';
import { TaskWithTags, Tag } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface TaskFormProps {
  task?: TaskWithTags | null;
  columnId: number;
  onSubmit: (data: {
    title: string;
    description: string;
    priority: string;
    due_date: string;
    energy_level: string;
    column_id: number;
  }) => Promise<void>;
  onCancel: () => void;
}

export default function TaskForm({ task, columnId, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [energyLevel, setEnergyLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setDueDate(task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '');
      setEnergyLevel(task.energy_level || 'medium');
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        title,
        description,
        priority,
        due_date: dueDate,
        energy_level: energyLevel,
        column_id: task?.column_id || columnId,
      });

      if (!task) {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDueDate('');
        setEnergyLevel('medium');
      }
    } catch (error) {
      console.error('Error submitting task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        required
        autoFocus
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Energy Level
          </label>
          <select
            value={energyLevel}
            onChange={(e) => setEnergyLevel(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="low">🌙 Low</option>
            <option value="medium">☀️ Medium</option>
            <option value="high">⚡ High</option>
          </select>
        </div>
      </div>

      <Input
        label="Due Date"
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
