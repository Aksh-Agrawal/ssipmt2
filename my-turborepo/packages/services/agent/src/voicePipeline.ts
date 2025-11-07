/**
 * Voice Pipeline Orchestrator
 * Handles end-to-end voice processing flow:
 * Audio → Language Detection → STT → NLP → Processing → TTS → Audio Response
 */

import { detectLanguage } from './swaramAiService.js';
import { transcribeAudio } from './deepgramSttService.js';
import { processQuery, NLPResult } from './nlpService.js';
import { synthesizeText } from './criteriaTtsService.js';
import pino from 'pino';

const logger = pino.default ? pino.default() : (pino as any)();

export interface VoicePipelineInput {
  audioBuffer: Buffer;
  userId?: string;
  context?: string; // 'report' | 'chatbot' | 'general'
}

export interface VoicePipelineOutput {
  transcription: string;
  detectedLanguage: string;
  nlpResult: NLPResult;
  responseText?: string;
  responseAudio?: Buffer;
  processingTime: number;
}

/**
 * Main voice pipeline function
 * Processes voice input through the complete pipeline
 */
export async function processVoiceInput(
  input: VoicePipelineInput
): Promise<VoicePipelineOutput> {
  const startTime = Date.now();

  try {
    logger.info({ context: input.context }, 'Starting voice pipeline');

    // Step 1: Detect Language (SARVAM AI)
    const detectedLanguage = await detectLanguage(input.audioBuffer);
    logger.info({ detectedLanguage }, 'Language detected');

    // Step 2: Speech-to-Text (Deepgram)
    const transcription = await transcribeAudio(input.audioBuffer, detectedLanguage);
    logger.info({ transcription, language: detectedLanguage }, 'Audio transcribed');

    if (!transcription || transcription.trim().length === 0) {
      logger.warn('Empty transcription received');
      return {
        transcription: '',
        detectedLanguage,
        nlpResult: { intent: 'unknown', entities: {} },
        processingTime: Date.now() - startTime,
      };
    }

    // Step 3: NLP Processing (Google Cloud)
    const nlpResult = await processQuery(transcription);
    logger.info({ nlpResult }, 'NLP processing complete');

    const processingTime = Date.now() - startTime;

    return {
      transcription,
      detectedLanguage,
      nlpResult,
      processingTime,
    };
  } catch (error) {
    logger.error({ error }, 'Error in voice pipeline');
    throw error;
  }
}

/**
 * Process voice input and generate audio response
 * Complete pipeline including response generation
 */
export async function processVoiceWithResponse(
  input: VoicePipelineInput,
  generateResponse: (nlp: NLPResult, transcription: string) => Promise<string>
): Promise<VoicePipelineOutput> {
  const startTime = Date.now();

  try {
    // First process the voice input
    const result = await processVoiceInput(input);

    // Generate text response based on NLP result
    const responseText = await generateResponse(result.nlpResult, result.transcription);
    logger.info({ responseText }, 'Response generated');

    // Convert response to speech (TTS)
    const responseAudio = await synthesizeText(responseText, result.detectedLanguage);
    logger.info({ audioSize: responseAudio.length }, 'Audio response synthesized');

    return {
      ...result,
      responseText,
      responseAudio,
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    logger.error({ error }, 'Error in voice pipeline with response');
    throw error;
  }
}

/**
 * Helper function to route based on intent
 */
export function routeByIntent(nlpResult: NLPResult): string {
  switch (nlpResult.intent) {
    case 'check_traffic':
      return 'traffic';
    case 'informational_query':
      return 'knowledge_base';
    case 'report_issue':
      return 'create_report';
    default:
      return 'general';
  }
}

/**
 * Extract report details from transcription and NLP result
 * Used for auto-filling report forms
 */
export interface ReportDetails {
  description: string;
  category?: string;
  location?: string;
  priority?: string;
}

export function extractReportDetails(
  transcription: string,
  nlpResult: NLPResult
): ReportDetails {
  // Extract location from NLP entities
  const location = nlpResult.entities.location;

  // Determine category based on keywords
  const category = categorizeFromText(transcription);

  // Determine priority based on urgency keywords
  const priority = determinePriority(transcription);

  return {
    description: transcription,
    category,
    location,
    priority,
  };
}

/**
 * Auto-categorize report based on keywords in transcription
 */
function categorizeFromText(text: string): string | undefined {
  const lower = text.toLowerCase();

  const categories: Record<string, string[]> = {
    'pothole': ['pothole', 'गड्ढा', 'road damage', 'crack'],
    'garbage': ['garbage', 'trash', 'कचरा', 'waste', 'litter'],
    'streetlight': ['streetlight', 'light', 'बत्ती', 'lamp', 'dark'],
    'drainage': ['drainage', 'drain', 'नाली', 'sewage', 'water logging'],
    'traffic': ['traffic', 'signal', 'ट्रैफिक', 'congestion'],
    'other': [],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lower.includes(keyword))) {
      return category;
    }
  }

  return undefined;
}

/**
 * Determine priority based on urgency keywords
 */
function determinePriority(text: string): string {
  const lower = text.toLowerCase();

  const urgentKeywords = ['urgent', 'emergency', 'तुरंत', 'danger', 'immediately'];
  const highKeywords = ['soon', 'important', 'जल्दी', 'serious'];
  const mediumKeywords = ['fix', 'repair', 'ठीक करो'];

  if (urgentKeywords.some(keyword => lower.includes(keyword))) {
    return 'urgent';
  }

  if (highKeywords.some(keyword => lower.includes(keyword))) {
    return 'high';
  }

  if (mediumKeywords.some(keyword => lower.includes(keyword))) {
    return 'medium';
  }

  return 'low';
}

export default {
  processVoiceInput,
  processVoiceWithResponse,
  routeByIntent,
  extractReportDetails,
};
