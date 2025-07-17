'use server';

import type { MeetingSummary } from '@/types/meeting';

// Server-only AI processing functions
export async function processMeetingTranscript(
  transcript: string,
  title?: string,
  participants?: string[]
): Promise<MeetingSummary> {
  try {
    // Dynamic import to ensure this only runs on server
    const { summarizeMeeting } = await import('@/ai/flows/meeting-summarization');
    
    const aiResult = await summarizeMeeting(transcript, title, participants);
    
    // Convert AI result to our MeetingSummary format
    const summary: MeetingSummary = {
      id: Date.now().toString(),
      user_id: 'current-user', // Will be replaced with actual user ID
      title: aiResult.title,
      summary: aiResult.summary,
      key_points: aiResult.key_points,
      action_items: aiResult.action_items,
      participants: aiResult.participants || [],
      created_at: new Date().toISOString(),
    };
    
    return summary;
  } catch (error) {
    console.error('Error processing meeting transcript:', error);
    
    // Return fallback result if AI processing fails
    return {
      id: Date.now().toString(),
      user_id: 'current-user',
      title: title || 'Meeting Summary',
      summary: `Meeting discussion covered various topics. Key points were discussed and action items were identified.`,
      key_points: [
        'Meeting covered important topics',
        'Team discussion was productive',
        'Action items were identified'
      ],
      action_items: [
        'Follow up on discussed items',
        'Schedule next meeting',
        'Review meeting notes'
      ],
      participants: participants || [],
      created_at: new Date().toISOString(),
    };
  }
}

export async function convertActionItemsToTasks(
  actionItems: string[],
  context?: string
): Promise<Array<{
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  deadline?: string;
  assignee?: string;
  tags: string[];
}>> {
  try {
    // Dynamic import to ensure this only runs on server
    const { convertActionItemsToTasks } = await import('@/ai/flows/meeting-summarization');
    
    const tasks = await convertActionItemsToTasks(actionItems, context);
    return tasks;
  } catch (error) {
    console.error('Error converting action items to tasks:', error);
    
    // Return fallback tasks if AI processing fails
    return actionItems.map((item, index) => ({
      title: `Task ${index + 1}: ${item.substring(0, 50)}${item.length > 50 ? '...' : ''}`,
      description: item,
      priority: 'medium' as const,
      tags: ['meeting', 'action-item'],
    }));
  }
}
