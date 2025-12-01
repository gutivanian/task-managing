export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string | null;
  created_at: Date;
}

export interface Project {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  color: string;
  created_at: Date;
  updated_at: Date;
}

export interface Column {
  id: number;
  project_id: number;
  title: string;
  position: number;
  color: string;
  task_limit: number | null;
  column_type: 'action' | 'waiting' | 'completed';
  created_at: Date;
}

export interface Task {
  id: number;
  project_id: number;
  column_id: number | null;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: Date | null;
  position: number;
  energy_level: 'low' | 'medium' | 'high' | null;
  time_spent: number;
  is_archived: boolean;
  created_at: Date;
  updated_at: Date;
  completed_at: Date | null;
}

export interface Tag {
  id: number;
  user_id: number;
  name: string;
  color: string;
}

export interface TaskTag {
  task_id: number;
  tag_id: number;
}

export interface ActivityLog {
  id: number;
  task_id: number;
  user_id: number;
  action: string;
  from_column_id: number | null;
  to_column_id: number | null;
  duration: number | null;
  created_at: Date;
}

// Tambahkan interface baru setelah interface Tag (sekitar baris 52)

export interface Subtask {
  id: number;
  task_id: number;
  title: string;
  is_completed: boolean;
  position: number;
  created_at: Date;
  updated_at: Date;
}

// Update interface TaskWithTags (sekitar baris 70)
export interface TaskWithTags extends Task {
  tags: Tag[];
  subtasks?: Subtask[]; // tambahkan ini
}

export interface ColumnWithTasks extends Column {
  tasks: TaskWithTags[];
}

export interface ProjectWithColumns extends Project {
  columns: ColumnWithTasks[];
}

export type CreateProjectInput = Pick<Project, 'title' | 'description' | 'color'>;
export type UpdateProjectInput = Partial<CreateProjectInput>;

export type CreateTaskInput = Pick<Task, 'title' | 'description' | 'priority' | 'due_date' | 'energy_level' | 'column_id'>;
export type UpdateTaskInput = Partial<CreateTaskInput>;

export type CreateColumnInput = Pick<Column, 'title' | 'position' | 'color' | 'task_limit' | 'column_type'>;
export type UpdateColumnInput = Partial<CreateColumnInput>;
