import { transcribeAudio } from './deepgramSttService.js';

async function main() {
  const audio = Buffer.from('test-audio');
  const language = 'en';
  const text = await transcribeAudio(audio, language);
  console.log('verify-deepgram transcription length:', text.length);
  console.log('verify-deepgram transcription:', text);
}

main().catch((err) => {
  console.error('verify-deepgram error', err);
  process.exit(1);
});
