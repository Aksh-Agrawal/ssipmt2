import pino from 'pino';
import { detectLanguage } from './swaramAiService.js';
import { transcribeAudio } from './deepgramSttService.js';
import { synthesizeAndStream } from './criteriaTtsService.js';

const logger = pino();

/**
 * Runs the minimal PipeCat-style processors for language detection + STT.
 * This is a small, testable orchestration that other services can call.
 * @param audioChunk raw audio bytes
 */
export const processAudioPipeline = async (audioChunk: Buffer) => {
  try {
    // Step 1: detect language (best-effort)
    const language = await detectLanguage(audioChunk).catch((err) => {
      logger.warn({ err }, 'Language detection failed, falling back to en');
      return 'en';
    });

    // Step 2: transcribe using detected language
    const transcription = await transcribeAudio(audioChunk, language).catch((err) => {
      logger.warn({ err }, 'Transcription failed, returning empty string');
      return '';
    });

    return { language, transcription };
  } catch (err) {
    logger.error({ err }, 'Unexpected error in audio pipeline');
    return { language: 'en', transcription: '' };
  }
};

/**
 * Outgoing audio pipeline: given response text and optional preferred language,
 * determine language/voice via SARVAM AI (if needed) and synthesize audio via Criteria TTS.
 * Returns a Buffer representing audio bytes. In future this should stream.
 */
export const processOutgoingAudioPipeline = async (text: string, preferredLanguage?: string) => {
  try {
    // Determine language/voice preference
    const language = preferredLanguage || 'en';

    // Use synthesize wrapper (currently returns Buffer)
    const audioBuffer = await synthesizeAndStream(text, language).catch((err) => {
      // Log and return an empty buffer on failure
      logger.warn({ err }, 'TTS synthesis failed, returning empty buffer');
      return Buffer.from([]);
    });

    return { language, audioBuffer };
  } catch (err) {
    logger.error({ err }, 'Unexpected error in outgoing audio pipeline');
    return { language: preferredLanguage || 'en', audioBuffer: Buffer.from([]) };
  }
};
