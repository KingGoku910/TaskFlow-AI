// Server-only AI instance to prevent client-side imports
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Ensure this module only runs on the server
if (typeof window !== 'undefined') {
  throw new Error('AI instance should only be imported on the server side');
}

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});
