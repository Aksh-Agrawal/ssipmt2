import { processOutgoingAudioPipeline } from './pipecatProcessors.js';

async function main() {
  const text = 'Test synthesis for verification.';
  const res = await processOutgoingAudioPipeline(text, 'en');
  console.log('verify-tts result language:', res.language);
  console.log('verify-tts audio length:', res.audioBuffer.length);
  console.log(
    'verify-tts audio preview:',
    res.audioBuffer.toString('utf8', 0, Math.min(200, res.audioBuffer.length))
  );
}

main().catch((err) => {
  console.error('verify-tts error', err);
  process.exit(1);
});
