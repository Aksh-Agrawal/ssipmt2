/**
 * Groq Chatbot Service
 * Handles conversational AI using Groq API with RAG (Retrieval Augmented Generation)
 */

import Groq from 'groq-sdk';
import { CONFIG } from './config.js';

let groqClient: Groq | null = null;

const getGroqClient = () => {
  if (!groqClient && CONFIG.GROQ_API_KEY) {
    groqClient = new Groq({
      apiKey: CONFIG.GROQ_API_KEY,
    });
  }
  return groqClient;
};

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatbotResponse {
  message: string;
  conversationId?: string;
  sources?: string[];
}

/**
 * Generate a response using Groq with context from knowledge base and traffic data
 */
export async function generateChatResponse(
  userMessage: string,
  language: string = 'en',
  context?: {
    trafficData?: any[];
    knowledgeArticles?: any[];
    conversationHistory?: ChatMessage[];
  }
): Promise<ChatbotResponse> {
  const client = getGroqClient();

  if (!client) {
    return {
      message: 'Chatbot service is not configured. Please contact administrator.',
    };
  }

  try {
    // Build system prompt with context
    const systemPrompt = buildSystemPrompt(language, context);

    // Build conversation messages
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...(context?.conversationHistory || []),
      { role: 'user', content: userMessage },
    ];

    // Call Groq API
    const completion = await client.chat.completions.create({
      model: 'llama-3.1-70b-versatile', // Fast and capable model
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 500,
      top_p: 0.9,
    });

    const responseMessage = completion.choices[0]?.message?.content || 'I apologize, I could not generate a response.';

    // Extract sources if referenced
    const sources = extractSources(context);

    return {
      message: responseMessage,
      sources,
    };
  } catch (error: any) {
    console.error('Error calling Groq API:', error);
    return {
      message: language === 'hi' || language === 'cg'
        ? 'क्षमा करें, मुझे आपकी मदद करने में समस्या हो रही है।'
        : 'Sorry, I am having trouble helping you right now.',
    };
  }
}

/**
 * Build system prompt with context
 */
function buildSystemPrompt(
  language: string,
  context?: {
    trafficData?: any[];
    knowledgeArticles?: any[];
  }
): string {
  const languageInstructions = {
    en: 'Respond in English.',
    hi: 'Respond in Hindi (हिंदी में जवाब दें).',
    cg: 'Respond in Chhattisgarhi or Hindi (छत्तीसगढ़ी या हिंदी में जवाब दें).',
  };

  let prompt = `You are a helpful civic assistant for Raipur Smart City. You help citizens with:
1. Current traffic conditions and road closures
2. Civic information (garbage collection, water supply, etc.)
3. How to report issues

${languageInstructions[language as keyof typeof languageInstructions] || languageInstructions.en}

Be concise, helpful, and friendly. If you don't know something, admit it.`;

  // Add traffic context
  if (context?.trafficData && context.trafficData.length > 0) {
    prompt += '\n\n**Current Traffic Information:**\n';
    context.trafficData.forEach((traffic: any) => {
      prompt += `- ${traffic.road_name}: ${traffic.congestion_level} congestion (${traffic.avg_speed} km/h)\n`;
    });
  }

  // Add knowledge base context
  if (context?.knowledgeArticles && context.knowledgeArticles.length > 0) {
    prompt += '\n\n**Relevant Information:**\n';
    context.knowledgeArticles.forEach((article: any) => {
      prompt += `- ${article.title}: ${article.content?.substring(0, 200)}...\n`;
    });
  }

  return prompt;
}

/**
 * Extract sources from context
 */
function extractSources(context?: {
  trafficData?: any[];
  knowledgeArticles?: any[];
}): string[] {
  const sources: string[] = [];

  if (context?.trafficData && context.trafficData.length > 0) {
    sources.push('Live Traffic Data');
  }

  if (context?.knowledgeArticles && context.knowledgeArticles.length > 0) {
    context.knowledgeArticles.forEach((article: any) => {
      if (article.title) {
        sources.push(article.title);
      }
    });
  }

  return sources;
}

/**
 * Generate auto-categorization for reports using Groq
 */
export async function categorizeReport(description: string): Promise<{
  category: string;
  priority: string;
  confidence: number;
}> {
  const client = getGroqClient();

  if (!client) {
    return {
      category: 'other',
      priority: 'medium',
      confidence: 0,
    };
  }

  try {
    const prompt = `Analyze this civic issue report and categorize it.

Report: "${description}"

Available categories:
- pothole (road damage, cracks)
- garbage (trash, waste, litter)
- streetlight (lighting issues)
- drainage (sewage, water logging)
- traffic (traffic signals, congestion)
- other

Priorities:
- urgent (immediate danger)
- high (important, affects many)
- medium (should be fixed soon)
- low (minor issue)

Respond in JSON format:
{
  "category": "category_name",
  "priority": "priority_level",
  "confidence": 0.0-1.0
}`;

    const completion = await client.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3, // Lower temperature for consistent categorization
      max_tokens: 100,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const result = JSON.parse(responseText);

    return {
      category: result.category || 'other',
      priority: result.priority || 'medium',
      confidence: result.confidence || 0.5,
    };
  } catch (error: any) {
    console.error('Error categorizing report:', error);
    return {
      category: 'other',
      priority: 'medium',
      confidence: 0,
    };
  }
}

export default {
  generateChatResponse,
  categorizeReport,
};
