/**
 * Agent service configuration helper.
 * Centralizes environment access so individual services don't read process.env directly.
 */

export interface AgentConfig {
  DEEPGRAM_API_KEY?: string;
  SWARAM_AI_API_KEY?: string;
  CRITERIA_TTS_API_KEY?: string;
}

function readEnv(name: string): string | undefined {
  const v = process.env[name];
  return v === undefined || v === '' ? undefined : v;
}

export const CONFIG: AgentConfig = {
  DEEPGRAM_API_KEY: readEnv('DEEPGRAM_API_KEY'),
  SWARAM_AI_API_KEY: readEnv('SWARAM_AI_API_KEY'),
  CRITERIA_TTS_API_KEY: readEnv('CRITERIA_TTS_API_KEY'),
};

export default CONFIG;
