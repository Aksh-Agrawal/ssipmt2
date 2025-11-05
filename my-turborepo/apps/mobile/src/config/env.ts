/**
 * Environment configuration for the mobile app
 * 
 * In development, these values default to localhost
 * In production, these should be set via environment variables
 */

export const config = {
  /**
   * API base URL
   * Defaults to localhost:3001 for development
   */
  apiUrl: 'http://localhost:3001',
  
  /**
   * WebSocket base URL (derived from API URL)
   */
  get websocketUrl(): string {
    return this.apiUrl.replace(/^http/, 'ws');
  },
};

/**
 * Get the full WebSocket URL for voice chat
 * @returns WebSocket URL with /ws/voice endpoint
 */
export const getVoiceWebSocketUrl = (): string => {
  return `${config.websocketUrl}/ws/voice`;
};
