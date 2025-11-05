import { detectLanguage } from '../swaramAiService.js';

describe('SARVAM AI Service', () => {
  it('should detect language', async () => {
    const audioChunk = Buffer.from('test');
    const language = await detectLanguage(audioChunk);
    expect(language).toBe('en');
  });
});
