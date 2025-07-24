import { NextRequest, NextResponse } from 'next/server';
import { correctGrammarLive } from '@/ai/flows/transcript-enhancement';

export async function POST(request: NextRequest) {
  try {
    const { text, language = 'en-US' } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid text provided' },
        { status: 400 }
      );
    }

    const result = await correctGrammarLive(text, language);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Grammar correction API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to correct grammar' 
      },
      { status: 500 }
    );
  }
}
