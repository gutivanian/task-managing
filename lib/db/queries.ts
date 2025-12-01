// lib\db\queries.ts
import sql from './index';
import {
  User,
  Project,
  Column,
  Task,
  Tag,
  TaskWithTags,
  ColumnWithTasks,
  ActivityLog,
  Subtask,
} from '@/types';

// ==================== USER QUERIES ====================
export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await sql<User[]>`
    SELECT * FROM users WHERE email = ${email} LIMIT 1
  `;
  return users[0] || null;
}

export async function getUserById(id: number): Promise<User | null> {
  const users = await sql<User[]>`
    SELECT * FROM users WHERE id = ${id} LIMIT 1
  `;
  return users[0] || null;
}

export async function createUser(email: string, passwordHash: string, name: string): Promise<User> {
  const users = await sql<User[]>`
    INSERT INTO users (email, password_hash, name)
    VALUES (${email}, ${passwordHash}, ${name})
    RETURNING *
  `;
  return users[0];
}

// ==================== PROJECT QUERIES ====================
export async function getProjectsByUserId(userId: number): Promise<Project[]> {
  return await sql<Project[]>`
    SELECT * FROM projects 
    WHERE user_id = ${userId} 
    ORDER BY updated_at DESC
  `;
}

export async function getProjectById(id: number, userId: number): Promise<Project | null> {
  const projects = await sql<Project[]>`
    SELECT * FROM projects 
    WHERE id = ${id} AND user_id = ${userId}
    LIMIT 1
  `;
  return projects[0] || null;
}

export async function createProject(
  userId: number,
  title: string,
  description: string | null,
  color: string
): Promise<Project> {
  const projects = await sql<Project[]>`
    INSERT INTO projects (user_id, title, description, color)
    VALUES (${userId}, ${title}, ${description}, ${color})
    RETURNING *
  `;
  return projects[0];
}

export async function updateProject(
  id: number,
  userId: number,
  data: { title?: string; description?: string | null; color?: string }
): Promise<Project | null> {
  const updates: string[] = [];
  const values: any[] = [];

  if (data.title !== undefined) {
    updates.push(`title = $${updates.length + 1}`);
    values.push(data.title);
  }
  if (data.description !== undefined) {
    updates.push(`description = $${updates.length + 1}`);
    values.push(data.description);
  }
  if (data.color !== undefined) {
    updates.push(`color = $${updates.length + 1}`);
    values.push(data.color);
  }

  if (updates.length === 0) {
    return await getProjectById(id, userId);
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');

  const projects = await sql<Project[]>`
    UPDATE projects 
    SET ${sql(updates.join(', '))}
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING *
  `;
  return projects[0] || null;
}

export async function deleteProject(id: number, userId: number): Promise<boolean> {
  const result = await sql`
    DELETE FROM projects 
    WHERE id = ${id} AND user_id = ${userId}
  `;
  return result.count > 0;
}

// ==================== COLUMN QUERIES ====================
export async function getColumnsByProjectId(projectId: number): Promise<Column[]> {
  return await sql<Column[]>`
    SELECT * FROM columns 
    WHERE project_id = ${projectId} 
    ORDER BY position ASC
  `;
}

export async function createColumn(
  projectId: number,
  title: string,
  position: number,
  color: string,
  taskLimit: number | null,
  columnType: string
): Promise<Column> {
  const columns = await sql<Column[]>`
    INSERT INTO columns (project_id, title, position, color, task_limit, column_type)
    VALUES (${projectId}, ${title}, ${position}, ${color}, ${taskLimit}, ${columnType})
    RETURNING *
  `;
  return columns[0];
}

export async function updateColumn(
  id: number,
  data: { title?: string; position?: number; color?: string; task_limit?: number | null; column_type?: string }
): Promise<Column | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.title !== undefined) {
    updates.push(`title = $${paramCount++}`);
    values.push(data.title);
  }
  if (data.position !== undefined) {
    updates.push(`position = $${paramCount++}`);
    values.push(data.position);
  }
  if (data.color !== undefined) {
    updates.push(`color = $${paramCount++}`);
    values.push(data.color);
  }
  if (data.task_limit !== undefined) {
    updates.push(`task_limit = $${paramCount++}`);
    values.push(data.task_limit);
  }
  if (data.column_type !== undefined) {
    updates.push(`column_type = $${paramCount++}`);
    values.push(data.column_type);
  }

  if (updates.length === 0) return null;

  values.push(id); // Add id as last parameter

  const query = `
    UPDATE columns 
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  const columns = await sql.unsafe<Column[]>(query, values);
  return columns[0] || null;
}


export async function deleteColumn(id: number): Promise<boolean> {
  const result = await sql`
    DELETE FROM columns WHERE id = ${id}
  `;
  return result.count > 0;
}

export async function reorderColumns(updates: { id: number; position: number }[]): Promise<void> {
  for (const update of updates) {
    await sql`
      UPDATE columns 
      SET position = ${update.position}
      WHERE id = ${update.id}
    `;
  }
}

// ==================== TASK QUERIES ====================
export async function getTasksByProjectId(projectId: number): Promise<Task[]> {
  return await sql<Task[]>`
    SELECT * FROM tasks 
    WHERE project_id = ${projectId} AND is_archived = false
    ORDER BY position ASC
  `;
}

export async function getTaskById(id: number): Promise<Task | null> {
  const tasks = await sql<Task[]>`
    SELECT * FROM tasks WHERE id = ${id} LIMIT 1
  `;
  return tasks[0] || null;
}

export async function createTask(
  projectId: number,
  columnId: number | null,
  title: string,
  description: string | null,
  priority: string,
  dueDate: Date | null,
  energyLevel: string | null,
  position: number
): Promise<Task> {
  const tasks = await sql<Task[]>`
    INSERT INTO tasks (
      project_id, column_id, title, description, priority, 
      due_date, energy_level, position
    )
    VALUES (
      ${projectId}, ${columnId}, ${title}, ${description}, ${priority},
      ${dueDate}, ${energyLevel}, ${position}
    )
    RETURNING *
  `;
  return tasks[0];
}

export async function updateTask(
  id: number,
  data: {
    title?: string;
    description?: string | null;
    priority?: string;
    due_date?: Date | null;
    energy_level?: string | null;
    column_id?: number | null;
    position?: number;
    time_spent?: number;
    is_archived?: boolean;
    completed_at?: Date | null;
  }
): Promise<Task | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.title !== undefined) {
    updates.push(`title = $${paramCount++}`);
    values.push(data.title);
  }
  if (data.description !== undefined) {
    updates.push(`description = $${paramCount++}`);
    values.push(data.description);
  }
  if (data.priority !== undefined) {
    updates.push(`priority = $${paramCount++}`);
    values.push(data.priority);
  }
  if (data.due_date !== undefined) {
    updates.push(`due_date = $${paramCount++}`);
    values.push(data.due_date);
  }
  if (data.energy_level !== undefined) {
    updates.push(`energy_level = $${paramCount++}`);
    values.push(data.energy_level);
  }
  if (data.column_id !== undefined) {
    updates.push(`column_id = $${paramCount++}`);
    values.push(data.column_id);
  }
  if (data.position !== undefined) {
    updates.push(`position = $${paramCount++}`);
    values.push(data.position);
  }
  if (data.time_spent !== undefined) {
    updates.push(`time_spent = $${paramCount++}`);
    values.push(data.time_spent);
  }
  if (data.is_archived !== undefined) {
    updates.push(`is_archived = $${paramCount++}`);
    values.push(data.is_archived);
  }
  if (data.completed_at !== undefined) {
    updates.push(`completed_at = $${paramCount++}`);
    values.push(data.completed_at);
  }

  if (updates.length === 0) return null;

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id); // Add id as last parameter

  const query = `
    UPDATE tasks 
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  const tasks = await sql.unsafe<Task[]>(query, values);
  return tasks[0] || null;
}

export async function deleteTask(id: number): Promise<boolean> {
  const result = await sql`
    DELETE FROM tasks WHERE id = ${id}
  `;
  return result.count > 0;
}

export async function moveTask(
  taskId: number,
  columnId: number | null,
  position: number
): Promise<Task | null> {
  const tasks = await sql<Task[]>`
    UPDATE tasks 
    SET column_id = ${columnId}, position = ${position}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${taskId}
    RETURNING *
  `;
  return tasks[0] || null;
}

export async function reorderTasks(updates: { id: number; position: number }[]): Promise<void> {
  for (const update of updates) {
    await sql`
      UPDATE tasks 
      SET position = ${update.position}
      WHERE id = ${update.id}
    `;
  }
}

// ==================== TAG QUERIES ====================
export async function getTagsByUserId(userId: number): Promise<Tag[]> {
  return await sql<Tag[]>`
    SELECT * FROM tags WHERE user_id = ${userId} ORDER BY name ASC
  `;
}

export async function createTag(userId: number, name: string, color: string): Promise<Tag> {
  const tags = await sql<Tag[]>`
    INSERT INTO tags (user_id, name, color)
    VALUES (${userId}, ${name}, ${color})
    ON CONFLICT (user_id, name) DO UPDATE SET color = ${color}
    RETURNING *
  `;
  return tags[0];
}

export async function getTagsByTaskId(taskId: number): Promise<Tag[]> {
  return await sql<Tag[]>`
    SELECT t.* FROM tags t
    INNER JOIN task_tags tt ON t.id = tt.tag_id
    WHERE tt.task_id = ${taskId}
  `;
}

export async function addTagToTask(taskId: number, tagId: number): Promise<void> {
  await sql`
    INSERT INTO task_tags (task_id, tag_id)
    VALUES (${taskId}, ${tagId})
    ON CONFLICT (task_id, tag_id) DO NOTHING
  `;
}

export async function removeTagFromTask(taskId: number, tagId: number): Promise<void> {
  await sql`
    DELETE FROM task_tags 
    WHERE task_id = ${taskId} AND tag_id = ${tagId}
  `;
}

// ==================== ACTIVITY LOG QUERIES ====================
export async function createActivityLog(
  taskId: number,
  userId: number,
  action: string,
  fromColumnId: number | null,
  toColumnId: number | null,
  duration: number | null
): Promise<ActivityLog> {
  const logs = await sql<ActivityLog[]>`
    INSERT INTO activity_logs (task_id, user_id, action, from_column_id, to_column_id, duration)
    VALUES (${taskId}, ${userId}, ${action}, ${fromColumnId}, ${toColumnId}, ${duration})
    RETURNING *
  `;
  return logs[0];
}

export async function getActivityLogsByTaskId(taskId: number): Promise<ActivityLog[]> {
  return await sql<ActivityLog[]>`
    SELECT * FROM activity_logs 
    WHERE task_id = ${taskId}
    ORDER BY created_at DESC
    LIMIT 50
  `;
}

// ==================== COMPOSITE QUERIES ====================
export async function getTasksWithTags(projectId: number): Promise<TaskWithTags[]> {
  const tasks = await getTasksByProjectId(projectId);
  
  const tasksWithTags: TaskWithTags[] = await Promise.all(
    tasks.map(async (task) => {
      const tags = await getTagsByTaskId(task.id);
      // Try to get subtasks, but return empty array if table doesn't exist yet
      let subtasks: Subtask[] = [];
      try {
        subtasks = await getSubtasksByTaskId(task.id);
      } catch (error: any) {
        // Subtasks table might not exist yet, that's okay
        if (error.code !== '42P01') {
          console.error('Error fetching subtasks:', error);
        }
      }
      return { ...task, tags, subtasks };
    })
  );

  return tasksWithTags;
}
export async function getColumnsWithTasks(projectId: number): Promise<ColumnWithTasks[]> {
  const columns = await getColumnsByProjectId(projectId);
  const tasks = await getTasksWithTags(projectId);

  return columns.map((column) => ({
    ...column,
    tasks: tasks.filter((task) => task.column_id === column.id),
  }));
}


// ==================== SUBTASK QUERIES ====================
export async function getSubtasksByTaskId(taskId: number): Promise<Subtask[]> {
  try {
    return await sql<Subtask[]>`
      SELECT * FROM subtasks 
      WHERE task_id = ${taskId} 
      ORDER BY position ASC
    `;
  } catch (error: any) {
    // If table doesn't exist yet, return empty array
    if (error.code === '42P01') {
      console.warn('Subtasks table not found. Run migration to enable subtasks feature.');
      return [];
    }
    throw error;
  }
}

export async function createSubtask(data: {
  task_id: number;
  title: string;
  position: number;
}): Promise<Subtask> {
  const subtasks = await sql<Subtask[]>`
    INSERT INTO subtasks (task_id, title, position)
    VALUES (${data.task_id}, ${data.title}, ${data.position})
    RETURNING *
  `;
  return subtasks[0];
}

export async function updateSubtask(
  id: number,
  data: { title?: string; is_completed?: boolean; position?: number }
): Promise<Subtask | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.title !== undefined) {
    updates.push(`title = $${paramCount++}`);
    values.push(data.title);
  }
  if (data.is_completed !== undefined) {
    updates.push(`is_completed = $${paramCount++}`);
    values.push(data.is_completed);
  }
  if (data.position !== undefined) {
    updates.push(`position = $${paramCount++}`);
    values.push(data.position);
  }

  if (updates.length === 0) {
    // No updates, fetch current subtask
    const subtasks = await sql<Subtask[]>`
      SELECT * FROM subtasks WHERE id = ${id} LIMIT 1
    `;
    return subtasks[0] || null;
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id); // Add id as last parameter

  const query = `
    UPDATE subtasks 
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  const subtasks = await sql.unsafe<Subtask[]>(query, values);
  return subtasks[0] || null;
}
export async function deleteSubtask(id: number): Promise<boolean> {
  const result = await sql`
    DELETE FROM subtasks WHERE id = ${id}
  `;
  return result.count > 0;
}