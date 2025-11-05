import { processOutgoingAudioPipeline } from '../pipecatProcessors.js';

describe('PipeCat outgoing TTS processors (Swaram -> Criteria TTS)', () => {
  it('should synthesize a buffer for given text and language', async () => {
    const text = 'Hello, this is a test.';
    const result = await processOutgoingAudioPipeline(text, 'en');
    expect(result).toHaveProperty('language');
    expect(result).toHaveProperty('audioBuffer');
    expect(result.language).toBe('en');
    expect(Buffer.isBuffer(result.audioBuffer)).toBe(true);
    // Buffer should contain the fake audio marker
    const str = result.audioBuffer.toString('utf8');
    expect(str).toContain('AUDIO(');
  });
});
