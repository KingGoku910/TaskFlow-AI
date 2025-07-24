/**
 * Client-safe transcript enhancement without Node.js dependencies
 * This version makes API calls to server actions instead of direct AI calls
 */

export interface TranscriptEnhancementOutput {
  enhanced_transcript: string;
  speaker_segments: Array<{
    speaker: string;
    text: string;
    timestamp?: string;
  }>;
  confidence_score: number;
  corrections_made: string[];
}

export interface LiveGrammarOutput {
  corrected_text: string;
  corrections: Array<{
    original: string;
    corrected: string;
    type: 'grammar' | 'punctuation' | 'spelling' | 'capitalization';
  }>;
}

/**
 * Client-safe transcript enhancement via API calls
 */
export async function enhanceTranscript(
  rawTranscript: string,
  language: string = 'en-US'
): Promise<TranscriptEnhancementOutput> {
  try {
    if (!rawTranscript || rawTranscript.trim().length === 0) {
      throw new Error('No transcript provided for enhancement');
    }

    const response = await fetch('/api/ai/enhance-transcript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript: rawTranscript,
        language,
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to enhance transcript');
    }

    return result.data;
  } catch (error) {
    console.error('Error enhancing transcript:', error);
    
    // Fallback response for offline or error scenarios
    return {
      enhanced_transcript: rawTranscript,
      speaker_segments: [
        {
          speaker: 'Speaker 1',
          text: rawTranscript,
        }
      ],
      confidence_score: 0.5,
      corrections_made: ['Fallback mode - no AI enhancement available'],
    };
  }
}

/**
 * Client-safe real-time grammar correction via API calls
 */
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

    const response = await fetch('/api/ai/correct-grammar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        language,
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to correct grammar');
    }

    return result.data;
  } catch (error) {
    console.error('Error correcting grammar:', error);
    
    // Fallback to original text if grammar correction fails
    return {
      corrected_text: text,
      corrections: []
    };
  }
}

// Mock functions for development/testing
export async function enhanceTranscriptMock(
  rawTranscript: string,
  language: string = 'en-US'
): Promise<TranscriptEnhancementOutput> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    enhanced_transcript: rawTranscript.charAt(0).toUpperCase() + rawTranscript.slice(1) + (rawTranscript.endsWith('.') ? '' : '.'),
    speaker_segments: [
      {
        speaker: 'Speaker 1',
        text: rawTranscript,
      }
    ],
    confidence_score: 0.85,
    corrections_made: ['Added proper capitalization', 'Added ending punctuation'],
  };
}

export async function correctGrammarLiveMock(
  text: string,
  language: string = 'en-US'
): Promise<LiveGrammarOutput> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Simple mock corrections
  const corrected = text.charAt(0).toUpperCase() + text.slice(1);
  const corrections = [];
  
  if (text.charAt(0) !== text.charAt(0).toUpperCase()) {
    corrections.push({
      original: text.charAt(0),
      corrected: text.charAt(0).toUpperCase(),
      type: 'capitalization' as const
    });
  }
  
  return {
    corrected_text: corrected,
    corrections
  };
}
