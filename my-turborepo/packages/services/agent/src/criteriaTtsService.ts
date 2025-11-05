import pino from 'pino';
import { CONFIG } from './config.js';
import { Readable } from 'stream';

const logger = pino();

/**
 * Synthesizes speech for given text using Criteria TTS (placeholder implementation).
 * @param text The text to synthesize
 * @param language Language code (e.g., 'en', 'hi')
 * @param voice Optional voice identifier
 * @returns A Buffer with audio data (PCM/MP3 placeholder)
 */
export const synthesizeText = async (
  text: string,
  language = 'en',
  voice?: string
): Promise<Buffer> => {
  if (!CONFIG.CARTESIA_API_KEY) {
    logger.warn(
      'CARTESIA_API_KEY not configured. Returning silence placeholder.'
    );
    return Buffer.from([]);
  }

  // TODO: [FUNC-001] Real API Integration
  // Replace this placeholder with the actual Criteria TTS API call.
  // The API should return an audio buffer.
  // Refer to Criteria TTS documentation for details.
  logger.info({ language, voice }, 'Calling Criteria TTS to synthesize text (placeholder)');
  await new Promise((resolve) => setTimeout(resolve, 150)); // Simulate network latency

  // Return a fake audio buffer for local execution without real API keys
  const fakeAudio = `FAKE_AUDIO(${language}:${voice || 'default'}): ${text}`;
  return Buffer.from(fakeAudio);
};

/**
 * Streams synthesized audio.
 * In production this should return a ReadableStream from the TTS provider.
 * Currently returns a Buffer for placeholder purposes.
 */
export const synthesizeAndStream = async (
  text: string,
  language = 'en',
  voice?: string
): Promise<Readable | Buffer> => {
  const audioBuffer = await synthesizeText(text, language, voice);

  // TODO: [FUNC-001] Streaming Implementation
  // When the real TTS API is integrated, this function should be updated
  // to return a ReadableStream directly from the API response if possible.
  // For now, we convert the buffer to a stream as a placeholder.
  const stream = new Readable();
  stream.push(audioBuffer);
  stream.push(null); // Signal end of stream

  // In the final implementation, you might return the stream from the API call directly.
  // For now, we return the buffer-based stream.
  return stream;
};

export default { synthesizeText, synthesizeAndStream };
