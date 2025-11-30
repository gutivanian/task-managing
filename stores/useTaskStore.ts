import { create } from 'zustand';
import { Task, Column, TaskWithTags, ColumnWithTasks } from '@/types';

interface TaskStore {
  tasks: TaskWithTags[];
  columns: ColumnWithTasks[];
  setTasks: (tasks: TaskWithTags[]) => void;
  setColumns: (columns: ColumnWithTasks[]) => void;
  addTask: (task: TaskWithTags) => void;
  updateTask: (id: number, data: Partial<Task>) => void;
  moveTask: (taskId: number, columnId: number | null, position: number) => void;
  deleteTask: (id: number) => void;
  addColumn: (column: Column) => void;
  updateColumn: (id: number, data: Partial<Column>) => void;
  deleteColumn: (id: number) => void;
  reorderColumns: (columns: Column[]) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  columns: [],

  setTasks: (tasks) => set({ tasks }),

  setColumns: (columns) => set({ columns }),

  addTask: (task) =>
    set((state) => {
      const newTasks = [...state.tasks, task];
      const updatedColumns = state.columns.map((col) =>
        col.id === task.column_id
          ? { ...col, tasks: [...col.tasks, task] }
          : col
      );
      return { tasks: newTasks, columns: updatedColumns };
    }),

  updateTask: (id, data) =>
    set((state) => {
      const updatedTasks = state.tasks.map((t) =>
        t.id === id ? { ...t, ...data, updated_at: new Date() } : t
      );
      const updatedColumns = state.columns.map((col) => ({
        ...col,
        tasks: col.tasks.map((t) =>
          t.id === id ? { ...t, ...data, updated_at: new Date() } : t
        ),
      }));
      return { tasks: updatedTasks, columns: updatedColumns };
    }),

  moveTask: (taskId, columnId, position) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return state;

      const updatedTask = { ...task, column_id: columnId, position };
      const updatedTasks = state.tasks.map((t) =>
        t.id === taskId ? updatedTask : t
      );

      const updatedColumns = state.columns.map((col) => {
        if (col.id === task.column_id) {
          return {
            ...col,
            tasks: col.tasks.filter((t) => t.id !== taskId),
          };
        }
        if (col.id === columnId) {
          return {
            ...col,
            tasks: [...col.tasks, updatedTask].sort((a, b) => a.position - b.position),
          };
        }
        return col;
      });

      return { tasks: updatedTasks, columns: updatedColumns };
    }),

  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      columns: state.columns.map((col) => ({
        ...col,
        tasks: col.tasks.filter((t) => t.id !== id),
      })),
    })),

  addColumn: (column) =>
    set((state) => ({
      columns: [...state.columns, { ...column, tasks: [] }].sort(
        (a, b) => a.position - b.position
      ),
    })),

  updateColumn: (id, data) =>
    set((state) => ({
      columns: state.columns.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),

  deleteColumn: (id) =>
    set((state) => ({
      columns: state.columns.filter((c) => c.id !== id),
    })),

  reorderColumns: (columns) =>
    set((state) => {
      const columnMap = new Map(state.columns.map((c) => [c.id, c]));
      return {
        columns: columns.map((c) => columnMap.get(c.id) || { ...c, tasks: [] }),
      };
    }),
}));
