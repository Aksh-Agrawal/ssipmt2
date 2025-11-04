import pino from 'pino';
import { detectLanguage } from './swaramAiService.js';
import { transcribeAudio } from './deepgramSttService.js';

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
