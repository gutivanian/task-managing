// components/kanban/TaskCard.tsx
'use client';

import { TaskWithTags } from '@/types';
import { Calendar, Clock, Zap, Tag as TagIcon, CheckSquare, GripVertical, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
  task: TaskWithTags;
  onClick: () => void;
  isTimerActive?: boolean;
  isMoving?: boolean;
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
  medium: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700',
  high: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700',
  urgent: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300 dark:border-red-700',
};

const energyIcons = {
  low: '🌙',
  medium: '☀️',
  high: '⚡',
};

export default function TaskCard({ task, onClick, isTimerActive, isMoving }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const completedSubtasks = task.subtasks?.filter(s => s.is_completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMoving) {
      onClick();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm hover:shadow-md transition-all border flex gap-2 relative ${
        isTimerActive ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200 dark:border-gray-700'
      } ${isMoving ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 flex-shrink-0 pt-1"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Loading Overlay */}
      {isMoving && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 rounded-lg flex items-center justify-center z-10">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        </div>
      )}

      <div onClick={handleClick} className="flex-1 cursor-pointer">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-1 line-clamp-2">
            {task.title}
          </h4>
          <span
            className={`text-xs px-2 py-0.5 rounded border ${
              priorityColors[task.priority]
            }`}
          >
            {task.priority}
          </span>
        </div>

        {task.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 items-center text-xs text-gray-500 dark:text-gray-400">
          {task.due_date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(task.due_date), 'MMM d')}</span>
            </div>
          )}

          {task.time_spent > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{Math.floor(task.time_spent / 60)}m</span>
            </div>
          )}

          {task.energy_level && (
            <div className="flex items-center gap-1">
              <span>{energyIcons[task.energy_level]}</span>
            </div>
          )}

          {totalSubtasks > 0 && (
            <div className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3" />
              <span>{completedSubtasks}/{totalSubtasks}</span>
            </div>
          )}
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${tag.color}20`,
                  color: tag.color,
                }}
              >
                <TagIcon className="w-3 h-3" />
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}