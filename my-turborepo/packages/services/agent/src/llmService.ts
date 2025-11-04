/**
 * LLM Service
 * Handles language model integration for generating natural, context-aware responses
 * Uses OpenAI's GPT models to create responses based on retrieved documents
 */

import OpenAI from 'openai';

let llmClient: OpenAI | null = null;

/**
 * Feature flag to enable/disable LLM response generation
 * Allows rollback to basic response formatting if issues arise
 */
export function isLLMEnabled(): boolean {
  return process.env.ENABLE_LLM_RESPONSES === 'true';
}

/**
 * Get the configured LLM model name
 * Defaults to gpt-3.5-turbo for cost-effectiveness
 */
export function getLLMModel(): string {
  return process.env.LLM_MODEL || 'gpt-3.5-turbo';
}

/**
 * Get the temperature setting for LLM responses
 * Lower values (0.3-0.5) produce more consistent, factual responses
 * Higher values (0.7-1.0) produce more creative responses
 */
export function getLLMTemperature(): number {
  const temp = parseFloat(process.env.LLM_TEMPERATURE || '0.4');
  return isNaN(temp) ? 0.4 : Math.max(0, Math.min(1, temp));
}

/**
 * Get the max tokens setting for LLM responses
 * Controls the maximum length of generated responses
 */
export function getLLMMaxTokens(): number {
  const tokens = parseInt(process.env.LLM_MAX_TOKENS || '500', 10);
  return isNaN(tokens) ? 500 : Math.max(50, Math.min(2000, tokens));
}

/**
 * Get or create the OpenAI client instance for LLM operations
 * Uses singleton pattern to maintain one connection
 * 
 * @throws {Error} If OPENAI_API_KEY environment variable is not set
 * @returns {OpenAI} The configured OpenAI client instance
 */
function getLLMClient(): OpenAI {
  if (llmClient) {
    return llmClient;
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable must be set for LLM responses');
  }

  llmClient = new OpenAI({
    apiKey: apiKey,
  });

  return llmClient;
}

/**
 * Reset the LLM client instance
 * Useful for testing purposes
 */
export function resetLLMClient(): void {
  llmClient = null;
}

export interface LLMResponseOptions {
  userQuery: string;
  retrievedDocuments: Array<{
    title: string;
    content: string;
  }>;
  systemPrompt?: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  tokensUsed: number;
  latencyMs: number;
}

/**
 * Generate a natural language response using an LLM
 * Combines user query with retrieved documents to create context-aware answers
 * 
 * @param options - Configuration including user query and retrieved documents
 * @returns Promise resolving to the generated response
 * @throws {Error} If the LLM API call fails
 */
export async function generateLLMResponse(options: LLMResponseOptions): Promise<LLMResponse> {
  const startTime = Date.now();

  if (!isLLMEnabled()) {
    throw new Error('LLM responses are not enabled');
  }

  const { userQuery, retrievedDocuments, systemPrompt } = options;

  if (!userQuery || userQuery.trim().length === 0) {
    throw new Error('User query cannot be empty');
  }

  if (!retrievedDocuments || retrievedDocuments.length === 0) {
    throw new Error('At least one retrieved document is required');
  }

  const client = getLLMClient();

  // Build context from retrieved documents
  const documentsContext = retrievedDocuments
    .map((doc, index) => `Document ${index + 1}: ${doc.title}\n${doc.content}`)
    .join('\n\n---\n\n');

  // Default system prompt
  const defaultSystemPrompt = `You are a helpful civic information assistant. Your role is to provide accurate, clear, and concise information to citizens based on official documents.

Guidelines:
- Use the provided documents to answer the user's question
- Be direct and factual
- If the documents don't contain enough information, say so clearly
- Keep responses concise but complete
- Use a friendly, professional tone
- Don't make up information not present in the documents`;

  const finalSystemPrompt = systemPrompt || defaultSystemPrompt;

  try {
    const response = await client.chat.completions.create({
      model: getLLMModel(),
      temperature: getLLMTemperature(),
      max_tokens: getLLMMaxTokens(),
      messages: [
        {
          role: 'system',
          content: finalSystemPrompt,
        },
        {
          role: 'user',
          content: `Based on the following documents, please answer this question: "${userQuery}"\n\nDocuments:\n${documentsContext}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content || '';
    const tokensUsed = response.usage?.total_tokens || 0;
    const latencyMs = Date.now() - startTime;

    // Log cost and latency metrics
    console.log(`[LLM] Model: ${response.model}, Tokens: ${tokensUsed}, Latency: ${latencyMs}ms`);

    return {
      content,
      model: response.model,
      tokensUsed,
      latencyMs,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    console.error(`[LLM] Error after ${latencyMs}ms:`, error);
    throw new Error(
      `Failed to generate LLM response: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
