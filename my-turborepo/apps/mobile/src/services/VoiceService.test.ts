import { voiceService } from './VoiceService';
import { PermissionsAndroid, Platform } from 'react-native';
import { AudioRecorder, AudioPlayer } from 'react-native-nitro-sound';

// Mock react-native-nitro-sound
jest.mock('react-native-nitro-sound', () => ({
  AudioRecorder: {
    startRecorder: jest.fn(),
    stopRecorder: jest.fn(),
    onProgress: jest.fn(),
  },
  AudioPlayer: jest.fn().mockImplementation(() => ({
    play: jest.fn(),
  })),
}));

// Mock WebSocket
const mockWebSocket = {
  onopen: jest.fn(),
  onmessage: jest.fn(),
  onerror: jest.fn(),
  onclose: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1, // WebSocket.OPEN
};
global.WebSocket = jest.fn(() => mockWebSocket) as any;

// Mock PermissionsAndroid
jest.mock('react-native', () => ({
  PermissionsAndroid: {
    request: jest.fn(),
    RESULTS: {
      GRANTED: 'granted',
    },
  },
  Platform: {
    OS: 'android',
  },
}));

describe('VoiceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (PermissionsAndroid.request as jest.Mock).mockResolvedValue(PermissionsAndroid.RESULTS.GRANTED);
  });

  it('should request microphone permission on startVoiceChat', async () => {
    await voiceService.startVoiceChat('ws://localhost:8080/ws/voice');
    expect(PermissionsAndroid.request).toHaveBeenCalledWith(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      expect.any(Object)
    );
  });

  it('should not start recording if permission is not granted', async () => {
    (PermissionsAndroid.request as jest.Mock).mockResolvedValue('denied');
    const started = await voiceService.startVoiceChat('ws://localhost:8080/ws/voice');
    expect(started).toBe(false);
    expect(AudioRecorder.startRecorder).not.toHaveBeenCalled();
  });

  it('should establish WebSocket connection and start recording on successful permission', async () => {
    const started = await voiceService.startVoiceChat('ws://localhost:8080/ws/voice');
    expect(started).toBe(true);
    expect(global.WebSocket).toHaveBeenCalledWith('ws://localhost:8080/ws/voice');
    expect(mockWebSocket.onopen).toBeDefined();
    expect(mockWebSocket.onmessage).toBeDefined();
    expect(mockWebSocket.onerror).toBeDefined();
    expect(mockWebSocket.onclose).toBeDefined();

    // Simulate WebSocket open
    mockWebSocket.onopen();
    expect(AudioRecorder.startRecorder).toHaveBeenCalled();
    expect(voiceService.getIsRecording()).toBe(true);
  });

  it('should stop recording and close WebSocket on stopVoiceChat', async () => {
    await voiceService.startVoiceChat('ws://localhost:8080/ws/voice');
    mockWebSocket.onopen(); // Simulate connection open
    await voiceService.stopVoiceChat();
    expect(AudioRecorder.stopRecorder).toHaveBeenCalled();
    expect(mockWebSocket.close).toHaveBeenCalled();
    expect(voiceService.getIsRecording()).toBe(false);
  });

  it('should send audio data over WebSocket when onProgress is triggered', async () => {
    await voiceService.startVoiceChat('ws://localhost:8080/ws/voice');
    mockWebSocket.onopen(); // Simulate connection open

    const mockAudioData = { audioFile: 'base64encodedAudioData' };
    (AudioRecorder.onProgress as jest.Mock).mock.calls[0][0](mockAudioData); // Trigger the onProgress callback

    expect(mockWebSocket.send).toHaveBeenCalledWith(mockAudioData.audioFile);
  });

  it('should play incoming audio data from WebSocket', async () => {
    await voiceService.startVoiceChat('ws://localhost:8080/ws/voice');
    mockWebSocket.onopen(); // Simulate connection open

    const mockIncomingAudio = 'incomingAudioData';
    mockWebSocket.onmessage({ data: mockIncomingAudio } as MessageEvent);

    const audioPlayerInstance = (AudioPlayer as jest.Mock).mock.results[0].value;
    expect(audioPlayerInstance.play).toHaveBeenCalledWith(mockIncomingAudio);
  });
});
