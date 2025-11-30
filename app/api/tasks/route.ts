import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authOptions';
import { createTask, getTasksByProjectId } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
  }

  const tasks = await getTasksByProjectId(parseInt(projectId));
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const {
    project_id,
    column_id,
    title,
    description,
    priority,
    due_date,
    energy_level,
    position,
  } = body;

  if (!project_id || !title) {
    return NextResponse.json(
      { error: 'Project ID and title are required' },
      { status: 400 }
    );
  }

  const task = await createTask(
    project_id,
    column_id || null,
    title,
    description || null,
    priority || 'medium',
    due_date ? new Date(due_date) : null,
    energy_level || null,
    position || 0
  );

  return NextResponse.json(task, { status: 201 });
}
