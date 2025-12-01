// app/(dashboard)/projects/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProjectStore } from '@/stores/useProjectStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { useTimerStore } from '@/stores/useTimerStore';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import TaskForm from '@/components/tasks/TaskForm';
import TaskDetail from '@/components/tasks/TaskDetail';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { TaskWithTags } from '@/types';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = parseInt(params.id as string);

  const { currentProject, setCurrentProject } = useProjectStore();
  const { columns, setColumns, moveTask, addTask, updateTask, deleteTask } =
    useTaskStore();
  const { activeTaskId } = useTimerStore();

  const [loading, setLoading] = useState(true);
  const [movingTaskId, setMovingTaskId] = useState<number | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskWithTags | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched project data:', data);
        console.log('Columns with tasks:', data.columns);
        setCurrentProject(data.project);
        setColumns(data.columns);
      } else {
        router.push('/projects');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      router.push('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = (columnId: number) => {
    setSelectedColumnId(columnId);
    setSelectedTask(null);
    setIsEditing(false);
    setShowTaskModal(true);
  };

  const handleTaskClick = (taskId: number) => {
    const task = columns
      .flatMap((col) => col.tasks)
      .find((t) => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setShowDetailModal(true);
    }
  };

  const handleCreateTask = async (data: any) => {
    try {
      const column = columns.find((c) => c.id === data.column_id);
      const position = column ? column.tasks.length : 0;

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          project_id: projectId,
          position,
        }),
      });

      if (response.ok) {
        const task = await response.json();
        addTask({ ...task, tags: [] });
        setShowTaskModal(false);
        setSelectedColumnId(null);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (data: any) => {
    if (!selectedTask) return;

    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        updateTask(selectedTask.id, updatedTask);
        setShowTaskModal(false);
        setShowDetailModal(false);
        setSelectedTask(null);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;

    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        deleteTask(selectedTask.id);
        setShowDetailModal(false);
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleMoveTask = async (
    taskId: number,
    columnId: number,
    position: number
  ) => {
    // Set loading state for the specific task being moved
    setMovingTaskId(taskId);

    // Optimistic update
    moveTask(taskId, columnId, position);

    try {
      const response = await fetch(`/api/tasks/${taskId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ column_id: columnId, position }),
      });

      if (response.ok) {
        // Refresh project data to get the latest state from server
        await fetchProjectData();
      } else {
        // If move failed, revert by refreshing data
        await fetchProjectData();
      }
    } catch (error) {
      console.error('Error moving task:', error);
      // Revert optimistic update on error
      await fetchProjectData();
    } finally {
      // Clear loading state
      setMovingTaskId(null);
    }
  };

  const handleUpdateTimeSpent = async (taskId: number, timeSpent: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time_spent: timeSpent }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        updateTask(taskId, updatedTask);
      }
    } catch (error) {
      console.error('Error updating time spent:', error);
    }
  };

  const handleEditTask = () => {
    setIsEditing(true);
    setShowDetailModal(false);
    setShowTaskModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentProject.title}
            </h1>
            {currentProject.description && (
              <p className="text-gray-600 mt-1">{currentProject.description}</p>
            )}
          </div>
        </div>
        <Button onClick={() => handleAddTask(columns[0]?.id || 1)}>
          <Plus className="w-4 h-4 mr-2" />
          Quick Add Task
        </Button>
      </div>

      <KanbanBoard
        columns={columns}
        onTaskMove={handleMoveTask}
        onAddTask={handleAddTask}
        onTaskClick={handleTaskClick}
        activeTimerTaskId={activeTaskId}
        movingTaskId={movingTaskId}
      />

      <Modal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setSelectedTask(null);
          setSelectedColumnId(null);
          setIsEditing(false);
        }}
        title={selectedTask && isEditing ? 'Edit Task' : 'Create New Task'}
      >
        <TaskForm
          task={selectedTask}
          columnId={selectedColumnId || columns[0]?.id || 1}
          onSubmit={selectedTask && isEditing ? handleUpdateTask : handleCreateTask}
          onCancel={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
            setSelectedColumnId(null);
            setIsEditing(false);
          }}
        />
      </Modal>

      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTask(null);
        }}
        title="Task Details"
        size="lg"
      >
        {selectedTask && (
          <TaskDetail
            task={selectedTask}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onUpdateTimeSpent={handleUpdateTimeSpent}
            onSubtaskChange={fetchProjectData}
          />
        )}
      </Modal>
    </div>
  );
}