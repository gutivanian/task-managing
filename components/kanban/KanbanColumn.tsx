'use client';

import { ColumnWithTasks } from '@/types';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface KanbanColumnProps {
  column: ColumnWithTasks;
  onAddTask: (columnId: number) => void;
  onTaskClick: (taskId: number) => void;
  activeTimerTaskId: number | null;
}

export default function KanbanColumn({
  column,
  onAddTask,
  onTaskClick,
  activeTimerTaskId,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const taskIds = column.tasks.map((task) => task.id);

  return (
    <div className="flex flex-col bg-gray-50 rounded-lg p-3 min-w-[280px] max-w-[320px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="font-semibold text-gray-900">{column.title}</h3>
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
            {column.tasks.length}
            {column.task_limit && `/${column.task_limit}`}
          </span>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          title="Add task"
        >
          <Plus className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 space-y-2 min-h-[200px] overflow-y-auto max-h-[calc(100vh-300px)]"
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task.id)}
              isTimerActive={activeTimerTaskId === task.id}
            />
          ))}
        </SortableContext>

        {column.tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            No tasks yet
          </div>
        )}
      </div>
    </div>
  );
}
