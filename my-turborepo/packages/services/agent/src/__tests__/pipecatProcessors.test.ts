import { processAudioPipeline } from '../pipecatProcessors.js';

describe('PipeCat processors (language detection -> STT)', () => {
  it('should return detected language and transcription', async () => {
    const audioChunk = Buffer.from('test-audio');
    const result = await processAudioPipeline(audioChunk);
    expect(result).toHaveProperty('language');
    expect(result).toHaveProperty('transcription');
    // With the current placeholders, language should be 'en' and transcription placeholder exists
    expect(result.language).toBe('en');
    expect(typeof result.transcription).toBe('string');
  });
});
