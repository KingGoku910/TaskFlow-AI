import { NextResponse } from 'next/server';
import { archiveMultipleTasks } from '@/app/dashboard/tasks/actions';

export async function POST(request: Request) {
  try {
    const { taskIds } = await request.json();
    
    if (!taskIds || !Array.isArray(taskIds)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    await archiveMultipleTasks(taskIds);
    
    return NextResponse.json(
      { success: true, message: 'Tasks archived successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error archiving tasks:', error);
    return NextResponse.json(
      { error: 'Failed to archive tasks' },
      { status: 500 }
    );
  }
}