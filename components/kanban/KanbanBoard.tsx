// components/kanban/KanbanBoard.tsx
'use client';

import { ColumnWithTasks } from '@/types';
import KanbanColumn from './KanbanColumn';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { useState } from 'react';
import TaskCard from './TaskCard';

interface KanbanBoardProps {
  columns: ColumnWithTasks[];
  onTaskMove: (taskId: number, columnId: number, position: number) => void;
  onAddTask: (columnId: number) => void;
  onTaskClick: (taskId: number) => void;
  activeTimerTaskId: number | null;
  movingTaskId?: number | null;
}

export default function KanbanBoard({
  columns,
  onTaskMove,
  onAddTask,
  onTaskClick,
  activeTimerTaskId,
  movingTaskId,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<number | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeTaskId = active.id as number;
    const overColumnId = over.id as number;

    // Find the task being dragged
    let task = null;
    for (const column of columns) {
      task = column.tasks.find((t) => t.id === activeTaskId);
      if (task) break;
    }

    if (!task) {
      setActiveId(null);
      return;
    }

    // Find the target column
    const targetColumn = columns.find((c) => c.id === overColumnId);
    if (!targetColumn) {
      setActiveId(null);
      return;
    }

    // Calculate new position (add to end of column)
    const newPosition = targetColumn.tasks.length;

    // Only move if it's a different column or different position
    if (task.column_id !== overColumnId) {
      onTaskMove(activeTaskId, overColumnId, newPosition);
    }

    setActiveId(null);
  };

  const activeTask = activeId
    ? columns.flatMap((c) => c.tasks).find((t) => t.id === activeId)
    : null;

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 px-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            onAddTask={onAddTask}
            onTaskClick={onTaskClick}
            activeTimerTaskId={activeTimerTaskId}
            movingTaskId={movingTaskId}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rotate-3">
            <TaskCard 
              task={activeTask} 
              onClick={() => {}}
              isTimerActive={activeTimerTaskId === activeTask.id}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}