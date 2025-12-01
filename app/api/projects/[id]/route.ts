// app\api\projects\[id]\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authOptions';
import {
  getProjectById,
  updateProject,
  deleteProject,
  getColumnsWithTasks,
} from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = parseInt(session.user.id);
  const projectId = parseInt(params.id);

  const project = await getProjectById(projectId, userId);

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const columns = await getColumnsWithTasks(projectId);

  return NextResponse.json({ project, columns });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = parseInt(session.user.id);
  const projectId = parseInt(params.id);
  const body = await request.json();

  const project = await updateProject(projectId, userId, body);

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = parseInt(session.user.id);
  const projectId = parseInt(params.id);

  const success = await deleteProject(projectId, userId);

  if (!success) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
