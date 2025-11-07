import pino from 'pino';
import { CONFIG } from './config.js';
import { Readable } from 'stream';
import axios from 'axios';

const logger = pino.default ? pino.default() : (pino as any)();

const CARTESIA_API_BASE = 'https://api.cartesia.ai';

// Voice IDs for different languages (Cartesia multilingual voices)
const VOICE_MAP: Record<string, string> = {
  'en': 'a0e99841-438c-4a64-b679-ae501e7d6091', // English voice
  'hi': 'bf991597-6c13-47e4-8411-91ea7a3a1dd2', // Hindi voice
  'cg': 'bf991597-6c13-47e4-8411-91ea7a3a1dd2', // Chhattisgarhi (use Hindi voice)
};

/**
 * Synthesizes speech for given text using Cartesia TTS.
 * @param text The text to synthesize
 * @param language Language code (e.g., 'en', 'hi', 'cg')
 * @param voice Optional voice identifier
 * @returns A Buffer with audio data
 */
export const synthesizeText = async (
  text: string,
  language = 'en',
  voice?: string
): Promise<Buffer> => {
  if (!CONFIG.CARTESIA_API_KEY) {
    logger.warn('CARTESIA_API_KEY not configured. Returning silence placeholder.');
    return Buffer.from([]);
  }

  try {
    logger.info({ language, voice, textLength: text.length }, 'Calling Cartesia TTS to synthesize text');

    const voiceId = voice || VOICE_MAP[language] || VOICE_MAP['en'];

    const response = await axios.post(
      `${CARTESIA_API_BASE}/tts/bytes`,
      {
        model_id: 'sonic-english', // Cartesia's high-quality model
        transcript: text,
        voice: {
          mode: 'id',
          id: voiceId,
        },
        output_format: {
          container: 'raw',
          encoding: 'pcm_s16le',
          sample_rate: 24000,
        },
        language: language,
      },
      {
        headers: {
          'X-API-Key': CONFIG.CARTESIA_API_KEY,
          'Cartesia-Version': '2024-06-10',
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
        timeout: 30000, // 30 second timeout for TTS
      }
    );

    const audioBuffer = Buffer.from(response.data);
    logger.info({ audioSize: audioBuffer.length }, 'Cartesia TTS synthesis successful');

    return audioBuffer;
  } catch (error: any) {
    logger.error({ 
      error: error.message,
      status: error.response?.status,
      data: error.response?.data 
    }, 'Error calling Cartesia TTS API');
    
    // Return empty buffer on error
    return Buffer.from([]);
  }
};

/**
 * Streams synthesized audio using Cartesia TTS streaming API.
 * In production this returns a ReadableStream from the TTS provider.
 */
export const synthesizeAndStream = async (
  text: string,
  language = 'en',
  voice?: string
): Promise<Readable | Buffer> => {
  if (!CONFIG.CARTESIA_API_KEY) {
    logger.warn('CARTESIA_API_KEY not configured');
    return Buffer.from([]);
  }

  try {
    const voiceId = voice || VOICE_MAP[language] || VOICE_MAP['en'];

    logger.info({ language, voice: voiceId }, 'Starting Cartesia TTS streaming');

    // Use Cartesia streaming endpoint
    const response = await axios.post(
      `${CARTESIA_API_BASE}/tts/sse`,
      {
        model_id: 'sonic-english',
        transcript: text,
        voice: {
          mode: 'id',
          id: voiceId,
        },
        output_format: {
          container: 'raw',
          encoding: 'pcm_s16le',
          sample_rate: 24000,
        },
        language: language,
      },
      {
        headers: {
          'X-API-Key': CONFIG.CARTESIA_API_KEY,
          'Cartesia-Version': '2024-06-10',
          'Content-Type': 'application/json',
        },
        responseType: 'stream',
        timeout: 30000,
      }
    );

    // Return the stream directly
    return response.data as Readable;
  } catch (error: any) {
    logger.error({ error: error.message }, 'Error in Cartesia TTS streaming');
    
    // Fall back to non-streaming
    const audioBuffer = await synthesizeText(text, language, voice);
    const stream = new Readable();
    stream.push(audioBuffer);
    stream.push(null);
    return stream;
  }
};

export default { synthesizeText, synthesizeAndStream };
