import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authOptions';
import { createSubtask } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { task_id, title, position } = body;

    if (!task_id || !title) {
      return NextResponse.json(
        { error: 'Task ID and title are required' },
        { status: 400 }
      );
    }

    const subtask = await createSubtask({
      task_id,
      title,
      position: position ?? 0,
    });

    return NextResponse.json(subtask);
  } catch (error) {
    console.error('Error creating subtask:', error);
    return NextResponse.json(
      { error: 'Failed to create subtask' },
      { status: 500 }
    );
  }
}