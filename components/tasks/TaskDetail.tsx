'use client';

import { TaskWithTags } from '@/types';
import { Clock, Calendar, Zap, Trash2, Play, Pause, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import Button from '@/components/ui/Button';
import { useTimerStore } from '@/stores/useTimerStore';
import { useEffect } from 'react';

interface TaskDetailProps {
  task: TaskWithTags;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateTimeSpent: (taskId: number, timeSpent: number) => void;
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
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
}: TaskDetailProps) {
  const { activeTaskId, seconds, isRunning, startTimer, stopTimer, resetTimer, tick, setSeconds } =
    useTimerStore();

  const isActive = activeTaskId === task.id;

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

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs px-2 py-1 rounded ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h2>
        {task.description && (
          <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {task.due_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">
              Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
            </span>
          </div>
        )}

        {task.energy_level && (
          <div className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">{energyLabels[task.energy_level]}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-gray-700">
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

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Timer</h3>
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <div className="text-4xl font-mono font-bold text-gray-900 mb-4">
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

      <div className="border-t pt-6 flex gap-2">
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
