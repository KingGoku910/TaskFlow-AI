import { NextRequest, NextResponse } from 'next/server';
import { enhanceTranscript } from '@/ai/flows/transcript-enhancement';

export async function POST(request: NextRequest) {
  try {
    const { transcript, language = 'en-US' } = await request.json();

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid transcript provided' },
        { status: 400 }
      );
    }

    const result = await enhanceTranscript(transcript, language);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Transcript enhancement API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to enhance transcript' 
      },
      { status: 500 }
    );
  }
}
