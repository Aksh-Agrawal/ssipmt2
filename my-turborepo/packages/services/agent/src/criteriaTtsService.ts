import pino from 'pino';
import { CONFIG } from './config.js';

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
  if (!CONFIG.CRITERIA_TTS_API_KEY) {
    logger.warn(
      'CRITERIA_TTS_API_KEY not configured (packages/services/agent/src/config.ts). Returning silence placeholder.'
    );
    // Return empty buffer as placeholder
    return Buffer.from([]);
  }

  // Placeholder for real API call to Criteria TTS
  logger.info({ language, voice }, 'Calling Criteria TTS to synthesize text');
  await new Promise((resolve) => setTimeout(resolve, 150));

  // Return a fake audio buffer for tests / local execution
  const fakeAudio = `AUDIO(${language}:${voice || 'default'}): ${text}`;
  return Buffer.from(fakeAudio);
};

/**
 * Streams synthesized audio to a destination. For now this is a convenience wrapper that returns a Buffer.
 * In production this would return a ReadableStream or use a streaming API.
 */
export const synthesizeAndStream = async (
  text: string,
  language = 'en',
  voice?: string
): Promise<Buffer> => {
  const audio = await synthesizeText(text, language, voice);
  // Streaming integration point - left as buffer return for tests
  return audio;
};

export default { synthesizeText, synthesizeAndStream };
