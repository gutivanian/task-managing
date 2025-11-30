import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authOptions';
import { getTaskById, updateTask, deleteTask, moveTask } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const taskId = parseInt(params.id);
  const task = await getTaskById(taskId);

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const taskId = parseInt(params.id);
  const body = await request.json();

  // Convert date strings to Date objects if present
  const updateData: any = { ...body };
  if (updateData.due_date) {
    updateData.due_date = new Date(updateData.due_date);
  }
  if (updateData.completed_at) {
    updateData.completed_at = new Date(updateData.completed_at);
  }

  const task = await updateTask(taskId, updateData);

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const taskId = parseInt(params.id);
  const success = await deleteTask(taskId);

  if (!success) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
