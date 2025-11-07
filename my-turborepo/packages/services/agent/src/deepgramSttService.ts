import pino from 'pino';
import { CONFIG } from './config.js';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

const logger = pino.default ? pino.default() : (pino as any)();

// Initialize Deepgram client
let deepgramClient: ReturnType<typeof createClient> | null = null;

const getDeepgramClient = () => {
  if (!deepgramClient && CONFIG.DEEPGRAM_API_KEY) {
    deepgramClient = createClient(CONFIG.DEEPGRAM_API_KEY);
  }
  return deepgramClient;
};

/**
 * Transcribes an audio chunk using Deepgram STT.
 * @param audioChunk The audio data to transcribe.
 * @param language The language of the audio (en, hi, etc.)
 * @returns The transcribed text.
 */
export const transcribeAudio = async (audioChunk: Buffer, language: string = 'en'): Promise<string> => {
  if (!CONFIG.DEEPGRAM_API_KEY) {
    logger.warn('Deepgram API key not configured. Returning empty transcription.');
    return '';
  }

  try {
    const client = getDeepgramClient();
    if (!client) {
      logger.error('Failed to initialize Deepgram client');
      return '';
    }

    logger.info(`Transcribing audio with Deepgram in language: ${language}...`);

    // Map language codes to Deepgram supported languages
    const langMap: Record<string, string> = {
      'en': 'en-US',
      'hi': 'hi',
      'cg': 'hi', // Chhattisgarhi falls back to Hindi
      'hindi': 'hi',
      'english': 'en-US'
    };

    const deepgramLang = langMap[language.toLowerCase()] || 'en-US';

    // Use Deepgram pre-recorded transcription API
    const { result, error } = await client.listen.prerecorded.transcribeFile(
      audioChunk,
      {
        model: 'nova-2',
        language: deepgramLang,
        smart_format: true,
        punctuate: true,
        diarize: false,
      }
    );

    if (error) {
      logger.error({ error }, 'Deepgram transcription error');
      return '';
    }

    const transcription = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
    logger.info({ transcription, language: deepgramLang }, 'Deepgram transcription successful');

    return transcription;
  } catch (error) {
    logger.error({ error }, 'Error calling Deepgram API');
    return '';
  }
};

/**
 * Transcribes audio with streaming support for real-time use cases
 */
export const transcribeAudioStream = async (
  audioStream: AsyncIterable<Buffer>,
  language: string = 'en',
  onTranscript: (text: string) => void
): Promise<void> => {
  if (!CONFIG.DEEPGRAM_API_KEY) {
    logger.warn('Deepgram API key not configured');
    return;
  }

  try {
    const client = getDeepgramClient();
    if (!client) {
      logger.error('Failed to initialize Deepgram client');
      return;
    }

    const connection = client.listen.live({
      model: 'nova-2',
      language: language === 'hi' || language === 'cg' ? 'hi' : 'en-US',
      smart_format: true,
      punctuate: true,
    });

    connection.on(LiveTranscriptionEvents.Open, () => {
      logger.info('Deepgram streaming connection opened');
    });

    connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
      const transcript = data.channel?.alternatives?.[0]?.transcript;
      if (transcript && transcript.length > 0) {
        logger.info({ transcript }, 'Received streaming transcript');
        onTranscript(transcript);
      }
    });

    connection.on(LiveTranscriptionEvents.Error, (error: any) => {
      logger.error({ error }, 'Deepgram streaming error');
    });

    connection.on(LiveTranscriptionEvents.Close, () => {
      logger.info('Deepgram streaming connection closed');
    });

    // Send audio chunks to Deepgram
    for await (const chunk of audioStream) {
      // Convert Buffer to ArrayBuffer for WebSocket
      const arrayBuffer = chunk.buffer.slice(
        chunk.byteOffset,
        chunk.byteOffset + chunk.byteLength
      );
      connection.send(arrayBuffer);
    }

    connection.finish();
  } catch (error) {
    logger.error({ error }, 'Error in Deepgram streaming');
  }
};
