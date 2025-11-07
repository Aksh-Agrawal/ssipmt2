import pino from 'pino';
import { CONFIG } from './config.js';
import axios from 'axios';
import FormData from 'form-data';

const logger = pino.default ? pino.default() : (pino as any)();

const SARVAM_API_BASE = 'https://api.sarvam.ai';

/**
 * Detects the language of a given audio chunk using SARVAM AI.
 * @param audioChunk The audio data to analyze.
 * @returns The detected language code (e.g., 'en', 'hi', 'cg').
 */
export const detectLanguage = async (audioChunk: Buffer): Promise<string> => {
  if (!CONFIG.SARVAM_AI_API_KEY) {
    logger.warn('SARVAM AI API key not configured. Falling back to default language.');
    return 'en'; // Default language
  }

  try {
    logger.info({ audioSize: audioChunk.length }, 'Detecting language with SARVAM AI...');

    // SARVAM AI language detection endpoint
    const formData = new FormData();
    formData.append('audio', audioChunk, {
      filename: 'audio.wav',
      contentType: 'audio/wav',
    });

    const response = await axios.post(
      `${SARVAM_API_BASE}/language-detection`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${CONFIG.SARVAM_AI_API_KEY}`,
          ...formData.getHeaders(),
        },
        timeout: 10000, // 10 second timeout
      }
    );

    const detectedLanguage = response.data?.language || 'en';
    
    // Map SARVAM response to our language codes
    const langMap: Record<string, string> = {
      'english': 'en',
      'hindi': 'hi',
      'chhattisgarhi': 'cg',
      'en-IN': 'en',
      'hi-IN': 'hi',
    };

    const mappedLanguage = langMap[detectedLanguage.toLowerCase()] || detectedLanguage;
    logger.info({ detectedLanguage: mappedLanguage, confidence: response.data?.confidence }, 
      'SARVAM AI language detection successful');

    return mappedLanguage;
  } catch (error: any) {
    logger.error({ 
      error: error.message, 
      status: error.response?.status,
      data: error.response?.data 
    }, 'Error calling SARVAM AI API, falling back to English');
    
    // Fall back to English on error
    return 'en';
  }
};

/**
 * Detects language from text using SARVAM AI (alternative method)
 * @param text The text to analyze
 * @returns The detected language code
 */
export const detectLanguageFromText = async (text: string): Promise<string> => {
  if (!CONFIG.SARVAM_AI_API_KEY || !text) {
    return 'en';
  }

  try {
    // Simple heuristic: check for Devanagari script
    const hasDevanagari = /[\u0900-\u097F]/.test(text);
    
    if (hasDevanagari) {
      // Further analysis needed to distinguish Hindi vs Chhattisgarhi
      // For now, default to Hindi
      logger.info({ text: text.substring(0, 50) }, 'Detected Hindi/Chhattisgarhi script');
      return 'hi';
    }

    logger.info({ text: text.substring(0, 50) }, 'Detected English text');
    return 'en';
  } catch (error) {
    logger.error({ error }, 'Error in text-based language detection');
    return 'en';
  }
};
