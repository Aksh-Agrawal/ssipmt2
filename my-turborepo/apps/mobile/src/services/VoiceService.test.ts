import { voiceService } from './VoiceService';

jest.mock('./VoiceService');

describe('VoiceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call startVoiceChat', async () => {
    await voiceService.startVoiceChat('ws://localhost:8080/ws/voice');
    expect(voiceService.startVoiceChat).toHaveBeenCalledWith('ws://localhost:8080/ws/voice');
  });

  it('should call stopVoiceChat', async () => {
    await voiceService.stopVoiceChat();
    expect(voiceService.stopVoiceChat).toHaveBeenCalled();
  });

  it('should call getIsRecording', () => {
    voiceService.getIsRecording();
    expect(voiceService.getIsRecording).toHaveBeenCalled();
  });
});
