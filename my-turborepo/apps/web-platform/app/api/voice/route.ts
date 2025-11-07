import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Voice Processing API Endpoint
 * Handles voice-to-text transcription using Deepgram
 * Returns transcribed text and detected language
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'en';

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Check if Deepgram API key is configured
    if (!process.env.DEEPGRAM_API_KEY) {
      console.warn('Deepgram API key not configured, using mock transcription');
      
      // Return mock transcription for development
      return NextResponse.json({
        transcription: 'Road near Rajkumar College has big pothole, very dangerous for two wheelers',
        language: language,
        confidence: 0.85,
        mock: true,
      });
    }

    // Convert File to Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Call Deepgram API for transcription
    const deepgramUrl = 'https://api.deepgram.com/v1/listen';
    const response = await fetch(`${deepgramUrl}?model=nova-2&language=${language}`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
        'Content-Type': audioFile.type || 'audio/webm',
      },
      body: buffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Deepgram API error:', errorText);
      throw new Error(`Deepgram API failed: ${response.status}`);
    }

    const result = await response.json();
    const transcription = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
    const confidence = result.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;

    return NextResponse.json({
      transcription,
      language,
      confidence,
      mock: false,
    });

  } catch (error) {
    console.error('Voice processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process voice input', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
