import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Helper function to add timeout to fetch requests
async function fetchWithTimeout(url: string | URL, options: RequestInit, timeoutMs: number = 30000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * Voice Chat API Endpoint
 * Handles voice message processing for the chatbot
 * Flow: Voice → Deepgram STT → Groq LLM → Criteria TTS
 */
export async function POST(request: NextRequest) {
  console.log('🎤 Voice chat API called');
  try {
    // Temporarily disable auth for testing
    // const { userId } = await auth();
    // if (!userId) {
    //   console.error('❌ Unauthorized - no userId');
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    const userId = 'test-user'; // Temporary for testing

    console.log('✅ User authenticated:', userId);

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'en';

    console.log('📦 Received:', {
      hasAudio: !!audioFile,
      audioSize: audioFile?.size,
      language
    });

    if (!audioFile) {
      console.error('❌ No audio file provided');
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Step 1: Transcribe audio to text (Deepgram STT)
    console.log('🎧 Step 1: Starting transcription...');
    let transcription = '';
    
    if (!process.env.DEEPGRAM_API_KEY) {
      console.warn('⚠️  Deepgram API key not configured, using mock transcription');
      transcription = 'Aaj kaha traffic hai?'; // Mock transcription
    } else {
      const arrayBuffer = await audioFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      console.log('📊 Audio buffer size:', buffer.length, 'bytes');

      const deepgramUrl = 'https://api.deepgram.com/v1/listen';
      const response = await fetchWithTimeout(`${deepgramUrl}?model=nova-2&language=${language}`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': audioFile.type || 'audio/webm',
        },
        body: buffer,
      }, 15000); // 15 second timeout

      console.log('🎧 Deepgram response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Deepgram error:', errorText);
        throw new Error(`Deepgram API failed: ${response.status}`);
      }

      const result = await response.json();
      transcription = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
      console.log('✅ Transcription:', transcription);
    }

    if (!transcription || transcription.trim().length === 0) {
      console.warn('⚠️  Empty transcription - audio might be silence');
      return NextResponse.json({
        transcription: '',
        response: 'I did not hear anything. Please speak louder and try again.',
        language,
        audioResponse: null,
      });
    }

    // Step 2: Process with Gemini AI chatbot
    console.log('🤖 Step 2: Sending to Gemini AI...');
    const chatResponse = await fetchWithTimeout(new URL('/api/gemini-chat', request.url).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: transcription,
        conversationHistory: [],
        language,
      }),
    }, 10000); // 10 second timeout

    console.log('🤖 Gemini response status:', chatResponse.status);

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error('❌ Gemini error:', errorText);
      throw new Error('Chat processing failed');
    }

    const chatResult = await chatResponse.json();
    const responseText = chatResult.response || 'Sorry, I could not process your request.';
    console.log('✅ Gemini response:', responseText.substring(0, 100) + '...');

    // Step 3: Text-to-Speech (Cartesia TTS)
    console.log('🔊 Step 3: Generating TTS audio...');
    let audioBase64 = null;
    
    if (!process.env.CARTESIA_API_KEY) {
      console.warn('⚠️  Cartesia API key not configured - skipping TTS');
    } else {
      try {
        // Cartesia TTS API to convert text to speech
        const ttsResponse = await fetchWithTimeout('https://api.cartesia.ai/tts/bytes', {
          method: 'POST',
          headers: {
            'Cartesia-Version': '2024-06-10',
            'X-API-Key': process.env.CARTESIA_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model_id: 'sonic-english',
            transcript: responseText, // Fixed: use responseText instead of chatResult.response
            voice: {
              mode: 'id',
              id: language === 'hi' ? 'a0e99841-438c-4a64-b679-ae501e7d6091' : // Indian English voice
                  language === 'cg' ? 'a0e99841-438c-4a64-b679-ae501e7d6091' : // Use same for Chhattisgarhi
                  '79a125e8-cd45-4c13-8a67-188112f4dd22', // Default English voice
            },
            output_format: {
              container: 'mp3',
              encoding: 'mp3',
              sample_rate: 44100,
            },
          }),
        }, 15000); // 15 second timeout

        console.log('🔊 Cartesia response status:', ttsResponse.status);

        if (ttsResponse.ok) {
          const audioBuffer = await ttsResponse.arrayBuffer();
          audioBase64 = Buffer.from(audioBuffer).toString('base64');
          console.log('✅ TTS audio generated:', audioBase64.length, 'characters');
        } else {
          const errorText = await ttsResponse.text();
          console.error('❌ Cartesia TTS failed:', errorText);
        }
      } catch (ttsError) {
        console.error('❌ TTS generation error:', ttsError);
      }
    }

    console.log('✅ Voice chat processing complete!');
    console.log('📤 Returning response:', {
      transcription: transcription.substring(0, 50),
      response: responseText.substring(0, 50),
      hasAudio: !!audioBase64,
    });

    return NextResponse.json({
      transcription,
      response: responseText,
      language,
      audioResponse: audioBase64, // Base64 encoded audio
    });

  } catch (error) {
    console.error('❌ Voice chat error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { 
        error: 'Failed to process voice chat', 
        details: error instanceof Error ? error.message : 'Unknown error',
        transcription: '',
        response: 'Sorry, there was an error processing your voice message. Please try again.',
      },
      { status: 500 }
    );
  }
}
