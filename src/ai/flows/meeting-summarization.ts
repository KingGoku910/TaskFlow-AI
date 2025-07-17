/**
 * AI flow for processing meeting transcripts and generating structured summaries
 */

import { ai } from '../ai-instance';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/client';

// Input schema for meeting transcript
const MeetingTranscriptSchema = z.object({
  transcript: z.string().describe('The raw meeting transcript text'),
  title: z.string().optional().describe('Optional meeting title'),
  participants: z.array(z.string()).optional().describe('Optional list of participants'),
  userId: z.string().optional().describe('User ID for authentication'),
});

// Output schema for meeting summary
const MeetingSummarySchema = z.object({
  title: z.string().describe('Generated or refined meeting title'),
  summary: z.string().describe('Concise meeting summary (2-3 paragraphs)'),
  key_points: z.array(z.string()).describe('List of main discussion points'),
  action_items: z.array(z.string()).describe('Actionable tasks and follow-ups'),
  participants: z.array(z.string()).describe('Identified or confirmed participants'),
  topics: z.array(z.string()).describe('Main topics discussed'),
  decisions: z.array(z.string()).describe('Decisions made during the meeting'),
  next_steps: z.array(z.string()).describe('Next steps and follow-up actions'),
});

type MeetingTranscriptInput = z.infer<typeof MeetingTranscriptSchema>;
type MeetingSummaryOutput = z.infer<typeof MeetingSummarySchema>;

export async function summarizeMeeting(
  transcript: string,
  title?: string,
  participants?: string[],
  userId?: string
): Promise<MeetingSummaryOutput> {
  try {
    // Verify authentication if userId is provided
    if (userId) {
      const supabase = await createClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        throw new Error('User not authenticated. Please sign in again.');
      }
      
      if (session.user.id !== userId) {
        throw new Error('Authentication mismatch. Please sign in again.');
      }
    }

    const input: MeetingTranscriptInput = {
      transcript,
      title,
      participants,
      userId,
    };

    const prompt = `
You are an expert meeting analyst. Analyze this meeting transcript and provide a comprehensive summary.

Meeting Transcript:
${input.transcript}

${input.title ? `Meeting Title: ${input.title}` : ''}
${input.participants ? `Known Participants: ${input.participants.join(', ')}` : ''}

Please provide a JSON response with:
1. A clear, descriptive title if none provided or improve the existing one
2. A concise 2-3 paragraph summary of the meeting
3. Key discussion points (array of strings)
4. Action items with clear ownership when possible (array of strings)
5. Identified participants (array of strings, extract from transcript if not provided)
6. Main topics covered (array of strings)
7. Decisions made (array of strings)
8. Next steps and follow-up actions (array of strings)

Focus on clarity, actionability, and completeness. Make action items specific and measurable when possible.

Return a valid JSON object matching this structure:
{
  "title": "string",
  "summary": "string",
  "key_points": ["string"],
  "action_items": ["string"],
  "participants": ["string"],
  "topics": ["string"],
  "decisions": ["string"],
  "next_steps": ["string"]
}
`;

    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt,
      output: { schema: MeetingSummarySchema },
    });

    if (!response.output) {
      throw new Error('No output received from AI model');
    }

    return response.output as MeetingSummaryOutput;
  } catch (error) {
    console.error('Error summarizing meeting:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('not authenticated')) {
        throw new Error('Authentication required. Please sign in to use meeting summarization.');
      }
      throw error;
    }
    
    throw new Error('Failed to generate meeting summary');
  }
}

// Enhanced flow for extracting tasks from action items
const TaskExtractionSchema = z.object({
  tasks: z.array(z.object({
    title: z.string().describe('Clear, actionable task title'),
    description: z.string().describe('Detailed task description'),
    priority: z.enum(['high', 'medium', 'low']).describe('Task priority based on context'),
    deadline: z.string().optional().describe('Suggested deadline if mentioned'),
    assignee: z.string().optional().describe('Person responsible if mentioned'),
    tags: z.array(z.string()).describe('Relevant tags for categorization'),
  })),
});

type TaskExtractionOutput = z.infer<typeof TaskExtractionSchema>;

export async function convertActionItemsToTasks(
  actionItems: string[],
  context?: string,
  userId?: string
): Promise<TaskExtractionOutput['tasks']> {
  try {
    // Verify authentication if userId is provided
    if (userId) {
      const supabase = await createClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        throw new Error('User not authenticated. Please sign in again.');
      }
      
      if (session.user.id !== userId) {
        throw new Error('Authentication mismatch. Please sign in again.');
      }
    }

    const prompt = `
Convert these meeting action items into structured, actionable tasks:

Action Items:
${actionItems.map((item: string, index: number) => `${index + 1}. ${item}`).join('\n')}

${context ? `\nMeeting Context:\n${context}` : ''}

For each action item, create a task with:
- Clear, actionable title (use action verbs)
- Detailed description explaining what needs to be done
- Priority level (high/medium/low) based on urgency and importance
- Suggested deadline if timeframe was mentioned (ISO date string or null)
- Assignee if person was mentioned
- Relevant tags for organization

Make tasks specific, measurable, and actionable. Split complex action items into multiple tasks if needed.

Return a valid JSON object with this structure:
{
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "priority": "high|medium|low",
      "deadline": "string or undefined",
      "assignee": "string or undefined",
      "tags": ["string"]
    }
  ]
}
`;

    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt,
      output: { schema: TaskExtractionSchema },
    });

    if (!response.output) {
      throw new Error('No output received from AI model');
    }

    return response.output.tasks;
  } catch (error) {
    console.error('Error converting action items to tasks:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not authenticated')) {
        throw new Error('Authentication required. Please sign in to convert action items to tasks.');
      }
      throw error;
    }
    
    throw new Error('Failed to convert action items to tasks');
  }
}
