// components/tasks/TaskDetail.tsx
'use client';

import { TaskWithTags, Subtask } from '@/types';
import { Clock, Calendar, Zap, Trash2, Play, Pause, RotateCcw, Plus, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import Button from '@/components/ui/Button';
import { useTimerStore } from '@/stores/useTimerStore';
import { useEffect, useState } from 'react';

interface TaskDetailProps {
  task: TaskWithTags;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateTimeSpent: (taskId: number, timeSpent: number) => void;
  onSubtaskChange: () => Promise<void>; // Add this callback
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const energyLabels = {
  low: '🌙 Low Energy',
  medium: '☀️ Medium Energy',
  high: '⚡ High Energy',
};

export default function TaskDetail({
  task,
  onEdit,
  onDelete,
  onUpdateTimeSpent,
  onSubtaskChange,
}: TaskDetailProps) {
  const { activeTaskId, seconds, isRunning, startTimer, stopTimer, resetTimer, tick, setSeconds } =
    useTimerStore();

  const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const isActive = activeTaskId === task.id;

  // Update subtasks when task prop changes
  useEffect(() => {
    setSubtasks(task.subtasks || []);
  }, [task.subtasks]);

  useEffect(() => {
    if (isActive) {
      setSeconds(task.time_spent);
    }
  }, [task.time_spent, isActive, setSeconds]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && isActive) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isActive, tick]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartStop = () => {
    if (isActive && isRunning) {
      stopTimer();
      onUpdateTimeSpent(task.id, seconds);
    } else if (isActive && !isRunning) {
      startTimer(task.id);
    } else {
      startTimer(task.id);
    }
  };

  const handleReset = () => {
    if (confirm('Reset timer? This will save current time to the task.')) {
      onUpdateTimeSpent(task.id, seconds);
      resetTimer();
    }
  };

  const handleToggleSubtask = async (subtaskId: number) => {
    const subtask = subtasks.find(s => s.id === subtaskId);
    if (!subtask) return;

    // Optimistic update
    setSubtasks(subtasks.map(s => 
      s.id === subtaskId ? { ...s, is_completed: !s.is_completed } : s
    ));

    try {
      const response = await fetch(`/api/subtasks/${subtaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_completed: !subtask.is_completed }),
      });

      if (response.ok) {
        // Refresh parent data to update everything
        await onSubtaskChange();
      } else {
        // Revert on error
        setSubtasks(subtasks);
      }
    } catch (error) {
      console.error('Failed to toggle subtask:', error);
      // Revert on error
      setSubtasks(subtasks);
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;

    try {
      const response = await fetch('/api/subtasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: task.id,
          title: newSubtaskTitle,
          position: subtasks.length,
        }),
      });

      if (response.ok) {
        const newSubtask = await response.json();
        setSubtasks([...subtasks, newSubtask]);
        setNewSubtaskTitle('');
        setIsAddingSubtask(false);
        // Refresh parent data
        await onSubtaskChange();
      }
    } catch (error) {
      console.error('Failed to add subtask:', error);
    }
  };

  const handleDeleteSubtask = async (subtaskId: number) => {
    // Optimistic update
    const originalSubtasks = [...subtasks];
    setSubtasks(subtasks.filter(s => s.id !== subtaskId));

    try {
      const response = await fetch(`/api/subtasks/${subtaskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh parent data
        await onSubtaskChange();
      } else {
        // Revert on error
        setSubtasks(originalSubtasks);
      }
    } catch (error) {
      console.error('Failed to delete subtask:', error);
      // Revert on error
      setSubtasks(originalSubtasks);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs px-2 py-1 rounded ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{task.title}</h2>
        {task.description && (
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{task.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {task.due_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">
              Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
            </span>
          </div>
        )}

        {task.energy_level && (
          <div className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">{energyLabels[task.energy_level]}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-700 dark:text-gray-300">
            Total Time: {formatTime(task.time_spent)}
          </span>
        </div>
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {task.tags.map((tag) => (
            <span
              key={tag.id}
              className="px-3 py-1 rounded-full text-sm"
              style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Subtasks Section */}
      <div className="border-t dark:border-gray-700 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Subtasks ({subtasks.filter(s => s.is_completed).length}/{subtasks.length})
          </h3>
          <Button
            onClick={() => setIsAddingSubtask(true)}
            variant="secondary"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group"
            >
              <button
                onClick={() => handleToggleSubtask(subtask.id)}
                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  subtask.is_completed
                    ? 'bg-blue-500 border-blue-500 dark:bg-blue-600 dark:border-blue-600'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'
                }`}
              >
                {subtask.is_completed && <Check className="w-3 h-3 text-white" />}
              </button>
              <span
                className={`flex-1 text-sm ${
                  subtask.is_completed
                    ? 'line-through text-gray-500 dark:text-gray-500'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {subtask.title}
              </span>
              <button
                onClick={() => handleDeleteSubtask(subtask.id)}
                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {isAddingSubtask && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                placeholder="Enter subtask title..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                autoFocus
              />
              <Button onClick={handleAddSubtask} variant="primary" size="sm">
                <Check className="w-4 h-4" />
              </Button>
              <Button onClick={() => {
                setIsAddingSubtask(false);
                setNewSubtaskTitle('');
              }} variant="secondary" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="border-t dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Timer</h3>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
          <div className="text-4xl font-mono font-bold text-gray-900 dark:text-gray-100 mb-4">
            {formatTime(isActive ? seconds : task.time_spent)}
          </div>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={handleStartStop}
              variant={isActive && isRunning ? 'secondary' : 'primary'}
              size="sm"
            >
              {isActive && isRunning ? (
                <>
                  <Pause className="w-4 h-4 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  Start
                </>
              )}
            </Button>
            {isActive && (
              <Button onClick={handleReset} variant="secondary" size="sm">
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="border-t dark:border-gray-700 pt-6 flex gap-2">
        <Button onClick={onEdit} variant="secondary" className="flex-1">
          Edit Task
        </Button>
        <Button onClick={onDelete} variant="danger">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}