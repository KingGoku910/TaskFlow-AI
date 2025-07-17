import { NextResponse } from 'next/server';
import { autoArchiveCompletedTasks } from '@/app/dashboard/tasks/actions';

export async function POST(request: Request) {
  try {
    const { daysThreshold } = await request.json();
    
    if (!daysThreshold || typeof daysThreshold !== 'number') {
      return NextResponse.json(
        { error: 'Invalid daysThreshold parameter' },
        { status: 400 }
      );
    }

    const result = await autoArchiveCompletedTasks(daysThreshold);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Auto-archive completed successfully',
        archivedCount: result?.length || 0
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error auto-archiving tasks:', error);
    return NextResponse.json(
      { error: 'Failed to auto-archive tasks' },
      { status: 500 }
    );
  }
}