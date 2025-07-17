
'use server';
/**
 * @fileOverview An enhanced AI note generation agent with iterative chat capabilities.
 *
 * - generateNotes - A function that handles the note generation process.
 * - refineNotes - A function to iteratively improve notes based on feedback.
 * - saveNotes - A function to save finalized notes to the filesystem.
 * - convertNotesToTasks - A function to convert notes into actionable tasks.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const GenerateNotesInputSchema = z.object({
  topic: z.string().describe('The topic for which notes should be generated.'),
  context: z.string().optional().describe('Additional context or specific requirements for the notes.'),
});
export type GenerateNotesInput = z.infer<typeof GenerateNotesInputSchema>;

const RefineNotesInputSchema = z.object({
  currentNotes: z.string().describe('The current version of the notes.'),
  feedback: z.string().describe('User feedback on what to improve or change.'),
  topic: z.string().describe('The original topic.'),
});
export type RefineNotesInput = z.infer<typeof RefineNotesInputSchema>;

const GenerateNotesOutputSchema = z.object({
  notes: z.string().describe('The generated notes, formatted in markdown with headings, bullet points, and key concepts.'),
  summary: z.string().describe('A brief summary of the notes content.'),
  keyPoints: z.array(z.string()).describe('Main key points extracted from the notes.'),
});
export type GenerateNotesOutput = z.infer<typeof GenerateNotesOutputSchema>;

const TaskExtractionSchema = z.object({
  tasks: z.array(z.object({
    title: z.string().describe('Clear, actionable task title'),
    description: z.string().describe('Detailed task description'),
    priority: z.enum(['high', 'medium', 'low']).describe('Task priority based on context'),
    category: z.string().describe('Category or area this task belongs to'),
    estimatedHours: z.number().optional().describe('Estimated hours to complete'),
    dependencies: z.array(z.string()).optional().describe('Other tasks this depends on'),
  })),
});
export type TaskExtractionOutput = z.infer<typeof TaskExtractionSchema>;

export async function generateNotes(input: GenerateNotesInput): Promise<GenerateNotesOutput> {
  return generateNotesFlow(input);
}

export async function refineNotes(input: RefineNotesInput): Promise<GenerateNotesOutput> {
  return refineNotesFlow(input);
}

export async function saveNotes(notes: string, topic: string, directory: string = 'generated-notes'): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    // Create directory if it doesn't exist
    const notesDir = join(process.cwd(), directory);
    await mkdir(notesDir, { recursive: true });
    
    // Generate filename from topic
    const fileName = topic.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    const filePath = join(notesDir, `${fileName}-${Date.now()}.md`);
    
    // Add metadata header to the notes
    const notesWithMetadata = `---
title: "${topic}"
created: ${new Date().toISOString()}
tags: [notes, ai-generated]
---

# ${topic}

${notes}
`;
    
    await writeFile(filePath, notesWithMetadata, 'utf-8');
    
    return { success: true, filePath };
  } catch (error) {
    console.error('Error saving notes:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

export async function convertNotesToTasks(notes: string, topic: string): Promise<TaskExtractionOutput['tasks']> {
  try {
    const prompt = `
Analyze these notes and extract actionable tasks that could be derived from the content:

Topic: ${topic}

Notes:
${notes}

Extract tasks that someone might need to do based on these notes. This could include:
- Research tasks for topics mentioned
- Implementation tasks for concepts discussed
- Learning tasks for skills referenced
- Action items suggested by the content

For each task, provide:
- Clear, actionable title (use action verbs)
- Detailed description
- Priority level (high/medium/low) based on importance
- Category/area it belongs to
- Estimated hours if applicable
- Dependencies on other tasks

Return a valid JSON object with this structure:
{
  "tasks": [
    {
      "title": "string",
      "description": "string", 
      "priority": "high|medium|low",
      "category": "string",
      "estimatedHours": number,
      "dependencies": ["string"]
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
    console.error('Error converting notes to tasks:', error);
    throw new Error('Failed to convert notes to tasks');
  }
}

const prompt = ai.definePrompt({
  name: 'generateNotesPrompt',
  input: { schema: GenerateNotesInputSchema },
  output: { schema: GenerateNotesOutputSchema },
  prompt: `You are an expert note-taking AI. Your task is to generate comprehensive and well-structured notes on a given topic.

The notes should:
- Be formatted in markdown with proper headings hierarchy
- Start with a main title for the topic
- Include relevant headings and subheadings
- Use bullet points for lists and key details
- Include code examples if relevant to the topic
- Clearly explain key concepts with definitions
- Be comprehensive yet well-organized
- Include practical examples where applicable

Topic: {{{topic}}}

Additional Context: {{{context}}}

Generate comprehensive notes, extract key points, and provide a summary.
`,
});

const refinePrompt = ai.definePrompt({
  name: 'refineNotesPrompt', 
  input: { schema: RefineNotesInputSchema },
  output: { schema: GenerateNotesOutputSchema },
  prompt: `You are an expert note-taking AI. Your task is to refine and improve existing notes based on user feedback.

Current Notes:
{{{currentNotes}}}

User Feedback:
{{{feedback}}}

Original Topic: {{{topic}}}

Improve the notes based on the feedback while maintaining the original structure and adding requested enhancements. Keep what works well and improve what the user has specifically mentioned.

Provide the refined notes, updated key points, and a summary of changes made.
`,
});

const generateNotesFlow = ai.defineFlow(
  {
    name: 'generateNotesFlow',
    inputSchema: GenerateNotesInputSchema,
    outputSchema: GenerateNotesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output?.notes) {
        return { 
          notes: "I couldn't generate notes for that topic. Please try rephrasing or providing more detail.",
          summary: "Generation failed",
          keyPoints: []
        };
    }
    return output;
  }
);

const refineNotesFlow = ai.defineFlow(
  {
    name: 'refineNotesFlow',
    inputSchema: RefineNotesInputSchema, 
    outputSchema: GenerateNotesOutputSchema,
  },
  async (input) => {
    const { output } = await refinePrompt(input);
    if (!output?.notes) {
        return {
          notes: input.currentNotes, // Return original if refinement fails
          summary: "Refinement failed - returned original notes",
          keyPoints: []
        };
    }
    return output;
  }
);
