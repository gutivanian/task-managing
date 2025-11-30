'use client';

import { TaskWithTags } from '@/types';
import { Calendar, Clock, Zap, Tag as TagIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
  task: TaskWithTags;
  onClick: () => void;
  isTimerActive?: boolean;
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-700 border-gray-300',
  medium: 'bg-blue-100 text-blue-700 border-blue-300',
  high: 'bg-orange-100 text-orange-700 border-orange-300',
  urgent: 'bg-red-100 text-red-700 border-red-300',
};

const energyIcons = {
  low: '🌙',
  medium: '☀️',
  high: '⚡',
};

export default function TaskCard({ task, onClick, isTimerActive }: TaskCardProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer border ${
        isTimerActive ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-gray-900 flex-1 line-clamp-2">
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
        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 items-center text-xs text-gray-500">
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
  );
}
