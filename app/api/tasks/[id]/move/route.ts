import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authOptions';
import { moveTask } from '@/lib/db/queries';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const taskId = parseInt(params.id);
  const body = await request.json();
  const { column_id, position } = body;

  if (column_id === undefined || position === undefined) {
    return NextResponse.json(
      { error: 'Column ID and position are required' },
      { status: 400 }
    );
  }

  const task = await moveTask(taskId, column_id, position);

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  return NextResponse.json(task);
}
