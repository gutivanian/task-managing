// app\api\projects\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authOptions';
import {
  getProjectsByUserId,
  createProject,
  updateProject,
  deleteProject,
  createColumn,
} from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = parseInt(session.user.id);
  const projects = await getProjectsByUserId(userId);

  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = parseInt(session.user.id);
  const body = await request.json();

  const { title, description, color } = body;

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const project = await createProject(userId, title, description || null, color || '#3B82F6');

  // Create default columns for new project
  const defaultColumns = [
    { title: 'Inbox', position: 0, color: '#6B7280', type: 'action' },
    { title: 'To Plan', position: 1, color: '#8B5CF6', type: 'action' },
    { title: 'To Do', position: 2, color: '#3B82F6', type: 'action' },
    { title: 'In Progress', position: 3, color: '#F59E0B', type: 'action' },
    { title: 'Waiting', position: 4, color: '#EC4899', type: 'waiting' },
    { title: 'Done', position: 5, color: '#10B981', type: 'completed' },
    { title: 'Archived', position: 6, color: '#6B7280', type: 'completed' },
  ];

  for (const col of defaultColumns) {
    await createColumn(project.id, col.title, col.position, col.color, null, col.type);
  }

  return NextResponse.json(project, { status: 201 });
}
