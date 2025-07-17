'use server';

/**
 * @fileOverview An AI task decomposition agent.
 *
 * - taskDecomposition - A function that handles the task decomposition process.
 * - TaskDecompositionInput - The input type for the taskDecomposition function.
 * - TaskDecompositionOutput - The return type for the taskDecomposition function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const TaskDecompositionInputSchema = z.object({
  objective: z.string().describe('The broad objective to be broken down into subtasks.'),
});
export type TaskDecompositionInput = z.infer<typeof TaskDecompositionInputSchema>;

// Define a schema for a single subtask including a description
const SubtaskSchema = z.object({
  title: z.string().describe('The title of the subtask.'),
  description: z.string().describe('A detailed, step-by-step description for the subtask, formatted as a markdown checklist (e.g., "- [ ] Step 1\n- [ ] Step 2"). Start with actionable steps.'),
});
export type Subtask = z.infer<typeof SubtaskSchema>;


const TaskDecompositionOutputSchema = z.object({
  subtasks: z.array(SubtaskSchema).describe('A list of detailed, actionable subtasks, each with a title and a markdown checklist description.'),
});
export type TaskDecompositionOutput = z.infer<typeof TaskDecompositionOutputSchema>;

export async function taskDecomposition(input: TaskDecompositionInput): Promise<TaskDecompositionOutput> {
  return taskDecompositionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'taskDecompositionPrompt',
  input: {
    schema: z.object({
      objective: z.string().describe('The broad objective to be broken down into subtasks.'),
    }),
  },
  output: {
    schema: z.object({
        subtasks: z.array(SubtaskSchema).describe('A list of detailed, actionable subtasks, each with a title and a markdown checklist description.'),
    }),
  },
  prompt: `You are an AI task decomposition expert. Your job is to break down a broad objective into a list of detailed, actionable subtasks.

For each subtask, provide:
1.  A concise 'title'.
2.  A 'description' containing a step-by-step guide formatted as a markdown checklist. Use the format "- [ ] Action item" for each step. Ensure the steps are clear and actionable.

Return the subtasks as a JSON array of objects, where each object has 'title' and 'description' fields.

Objective: {{{objective}}}`,
});


const taskDecompositionFlow = ai.defineFlow<
  typeof TaskDecompositionInputSchema,
  typeof TaskDecompositionOutputSchema
>({
  name: 'taskDecompositionFlow',
  inputSchema: TaskDecompositionInputSchema,
  outputSchema: TaskDecompositionOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  // Ensure output is not null and conforms to the schema, potentially adding validation
  if (!output || !Array.isArray(output.subtasks)) {
    throw new Error("AI response did not contain valid subtasks.");
  }
   // Ensure descriptions are generated, provide empty if missing
   output.subtasks = output.subtasks.map(task => ({
     ...task,
     description: task.description || '- [ ] Define initial steps', // Default if AI forgets
   }));
  return output;
});
