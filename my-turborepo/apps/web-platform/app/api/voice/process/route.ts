import { NextRequest, NextResponse } from 'next/server';
import { detectLanguage, transcribeAudio, extractReportDetails, processQuery } from '@repo/services-agent';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const languageHint = formData.get('language') as string | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    // Step 1: Detect language (if not provided)
    let detectedLanguage = languageHint || 'en';
    if (!languageHint) {
      try {
        detectedLanguage = await detectLanguage(audioBuffer);
        console.log('Detected language:', detectedLanguage);
      } catch (error) {
        console.warn('Language detection failed, defaulting to English:', error);
        detectedLanguage = 'en';
      }
    }

    // Step 2: Transcribe audio
    const transcription = await transcribeAudio(audioBuffer, detectedLanguage);

    if (!transcription || transcription.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not transcribe audio. Please speak clearly and try again.' },
        { status: 400 }
      );
    }

    console.log('Transcription:', transcription);

    // Step 3: Process with NLP to extract entities and intent
    const nlpResult = await processQuery(transcription);

    console.log('NLP Result:', nlpResult);

    // Step 4: Extract report details using NLP
    const reportDetails = extractReportDetails(transcription, nlpResult);

    console.log('Extracted report details:', reportDetails);

    return NextResponse.json({
      success: true,
      transcription,
      language: detectedLanguage,
      reportDetails: {
        category: reportDetails.category,
        priority: reportDetails.priority,
        location: reportDetails.location,
        description: reportDetails.description || transcription,
      },
      nlp: {
        intent: nlpResult.intent,
        entities: nlpResult.entities,
      },
    });

  } catch (error: any) {
    console.error('Voice processing error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process voice input', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'voice-pipeline',
    features: [
      'Multi-language detection (EN/HI/CG)',
      'Speech-to-text transcription',
      'Auto-categorization',
      'NLP entity extraction',
    ],
  });
}
