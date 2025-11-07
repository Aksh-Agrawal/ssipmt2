/**
 * Agent service configuration helper.
 * Centralizes environment access so individual services don't read process.env directly.
 */

export interface AgentConfig {
  DEEPGRAM_API_KEY?: string;
  SARVAM_AI_API_KEY?: string;
  CARTESIA_API_KEY?: string;
  GROQ_API_KEY?: string;
  GOOGLE_CLOUD_API_KEY?: string;
}

function readEnv(name: string): string | undefined {
  const v = process.env[name];
  return v === undefined || v === '' ? undefined : v;
}

export const CONFIG: AgentConfig = {
  DEEPGRAM_API_KEY: readEnv('DEEPGRAM_API_KEY'),
  SARVAM_AI_API_KEY: readEnv('SARVAM_AI_API_KEY'),
  CARTESIA_API_KEY: readEnv('CARTESIA_API_KEY'),
  GROQ_API_KEY: readEnv('GROQ_API_KEY'),
  GOOGLE_CLOUD_API_KEY: readEnv('GOOGLE_CLOUD_API_KEY'),
};

export default CONFIG;
