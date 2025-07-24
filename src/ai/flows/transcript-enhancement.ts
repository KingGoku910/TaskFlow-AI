/**
 * AI flow for enhancing and cleaning up raw transcripts
 */

import { ai } from '../ai-instance';
import { z } from 'zod';

// Schema for transcript enhancement
const TranscriptEnhancementSchema = z.object({
  enhanced_transcript: z.string().describe('Cleaned transcript with proper grammar and punctuation'),
  speaker_segments: z.array(z.object({
    speaker: z.string().describe('Identified speaker (Speaker 1, Speaker 2, etc.)'),
    text: z.string().describe('What the speaker said'),
    timestamp: z.string().optional().describe('Relative timestamp if identifiable')
  })).describe('Segmented transcript by speaker'),
  confidence_score: z.number().min(0).max(1).describe('Confidence score of the enhancement'),
  corrections_made: z.array(z.string()).describe('List of corrections applied'),
});

type TranscriptEnhancementOutput = z.infer<typeof TranscriptEnhancementSchema>;

export async function enhanceTranscript(
  rawTranscript: string,
  language: string = 'en-US'
): Promise<TranscriptEnhancementOutput> {
  try {
    if (!rawTranscript || rawTranscript.trim().length === 0) {
      throw new Error('No transcript provided for enhancement');
    }

    const prompt = `
You are an expert transcript editor. Clean up this raw meeting transcript by:

1. Adding proper punctuation and capitalization
2. Correcting grammar and spelling errors
3. Identifying different speakers and segmenting by speaker
4. Maintaining the original meaning and context
5. Removing filler words and false starts where appropriate
6. Ensuring professional readability

Original transcript (language: ${language}):
${rawTranscript}

Instructions:
- Preserve all important content and context
- Use "Speaker 1", "Speaker 2", etc. for different voices
- Add proper sentence structure and punctuation
- Fix obvious speech-to-text errors
- Keep technical terms and proper nouns intact
- Indicate confidence level in your corrections

Return a JSON response with:
1. Enhanced transcript with proper grammar and punctuation
2. Speaker-segmented version for better readability
3. Confidence score (0.0 to 1.0) 
4. List of major corrections made

Format as valid JSON:
{
  "enhanced_transcript": "string",
  "speaker_segments": [
    {
      "speaker": "Speaker 1",
      "text": "string",
      "timestamp": "optional"
    }
  ],
  "confidence_score": 0.0-1.0,
  "corrections_made": ["string"]
}
`;

    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt,
      output: { schema: TranscriptEnhancementSchema },
    });

    if (!response.output) {
      throw new Error('No output received from AI model');
    }

    return response.output as TranscriptEnhancementOutput;
  } catch (error) {
    console.error('Error enhancing transcript:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to enhance transcript');
  }
}

// Real-time grammar correction for live transcripts
const LiveGrammarSchema = z.object({
  corrected_text: z.string().describe('Grammar-corrected version of the text'),
  corrections: z.array(z.object({
    original: z.string(),
    corrected: z.string(),
    type: z.enum(['grammar', 'punctuation', 'spelling', 'capitalization'])
  })).describe('Individual corrections made'),
});

type LiveGrammarOutput = z.infer<typeof LiveGrammarSchema>;

export async function correctGrammarLive(
  text: string,
  language: string = 'en-US'
): Promise<LiveGrammarOutput> {
  try {
    if (!text || text.trim().length === 0) {
      return {
        corrected_text: text,
        corrections: []
      };
    }

    // Skip very short text to avoid unnecessary API calls
    if (text.trim().length < 10) {
      return {
        corrected_text: text,
        corrections: []
      };
    }

    const prompt = `
Quickly correct grammar, punctuation, and spelling in this live transcript text:

"${text}"

Language: ${language}

Make minimal corrections to:
- Fix obvious grammar mistakes
- Add necessary punctuation
- Correct spelling errors
- Proper capitalization

Keep it natural and conversational. Don't over-correct.

Return JSON with corrected text and list of changes:
{
  "corrected_text": "string",
  "corrections": [
    {
      "original": "string",
      "corrected": "string", 
      "type": "grammar|punctuation|spelling|capitalization"
    }
  ]
}
`;

    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt,
      output: { schema: LiveGrammarSchema },
    });

    if (!response.output) {
      return {
        corrected_text: text,
        corrections: []
      };
    }

    return response.output as LiveGrammarOutput;
  } catch (error) {
    console.error('Error correcting grammar:', error);
    
    // Fallback to original text if grammar correction fails
    return {
      corrected_text: text,
      corrections: []
    };
  }
}
