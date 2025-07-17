
'use server';
/**
 * @fileOverview An AI agent that can answer questions using a web search tool.
 *
 * - answerQuestion - A function that can answer a user's question, using web search if necessary.
 * - AnswerQuestionInput - The input type for the answerQuestion function.
 * - AnswerQuestionOutput - The return type for the answerQuestion function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
import { performWebSearch } from '@/services/web-search';

const AnswerQuestionInputSchema = z.object({
  question: z.string().describe('The question to be answered.'),
});
export type AnswerQuestionInput = z.infer<typeof AnswerQuestionInputSchema>;

const AnswerQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type AnswerQuestionOutput = z.infer<typeof AnswerQuestionOutputSchema>;

export async function answerQuestion(input: AnswerQuestionInput): Promise<AnswerQuestionOutput> {
  return questionAnsweringFlow(input);
}

// 1. Define the tool for the AI to use.
const webSearch = ai.defineTool(
  {
    name: 'webSearch',
    description: 'Searches the web for information on a given topic. Use this when you need up-to-date information or knowledge beyond your training data to answer a question.',
    input: { schema: z.string() },
    output: { schema: z.array(z.string()) },
  },
  async (query) => {
    console.log(`Web search tool called with query: ${query}`);
    // This calls the (currently stubbed) search service.
    // When the service is implemented for real, this tool will provide real results.
    return await performWebSearch(query);
  }
);


// 2. Define the prompt, making the tool available.
const questionAnsweringPrompt = ai.definePrompt({
  name: 'questionAnsweringPrompt',
  input: { schema: AnswerQuestionInputSchema },
  output: { schema: AnswerQuestionOutputSchema },
  tools: [webSearch], // Make the tool available to the AI
  prompt: `You are an expert question-answering AI. Your goal is to provide a concise and accurate answer to the user's question.

If you have enough information to answer the question directly, do so.

If you need to find more information, use the provided web search tool. When you use the search tool, analyze the results and use them to construct your final answer.

Question: {{{question}}}
`,
});


// 3. Define the flow that orchestrates the process.
const questionAnsweringFlow = ai.defineFlow(
  {
    name: 'questionAnsweringFlow',
    inputSchema: AnswerQuestionInputSchema,
    outputSchema: AnswerQuestionOutputSchema,
  },
  async (input) => {
    const { output } = await questionAnsweringPrompt(input);
    if (!output) {
      return { answer: "I was unable to find an answer to your question." };
    }
    return output;
  }
);
