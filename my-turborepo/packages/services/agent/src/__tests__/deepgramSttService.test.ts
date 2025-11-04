import { transcribeAudio } from '../deepgramSttService.js';

describe('Deepgram STT Service', () => {
  it('should transcribe audio', async () => {
    const audioChunk = Buffer.from('test');
    const transcription = await transcribeAudio(audioChunk, 'en');
    expect(transcription).toBe('This is a placeholder transcription.');
  });
});
