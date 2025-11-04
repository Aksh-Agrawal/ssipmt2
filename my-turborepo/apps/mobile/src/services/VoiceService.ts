import { PermissionsAndroid, Platform } from 'react-native';
import { AudioRecorder, AudioPlayer } from 'react-native-nitro-sound';

class VoiceService {
  private ws: WebSocket | null = null;
  private isRecording: boolean = false;
  private audioPlayer: AudioPlayer;

  constructor() {
    this.audioPlayer = new AudioPlayer();
  }

  private async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message:
              'This app needs access to your microphone to enable voice chat.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Failed to request microphone permission', err);
        return false;
      }
    } else { // iOS
      // iOS typically handles permissions automatically on first use or via Info.plist
      return true;
    }
  }

  public async startVoiceChat(websocketUrl: string): Promise<boolean> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.warn('Microphone permission not granted.');
      return false;
    }

    if (this.isRecording) {
      console.warn('Already recording.');
      return false;
    }

    try {
      this.ws = new WebSocket(websocketUrl);

      this.ws.onopen = async () => {
        console.log('WebSocket opened.');
        // Configure and start recording
        await AudioRecorder.startRecorder({
          path: 'audio.aac', // Temporary file path, might not be needed for streaming
          audioEncoding: 'aac',
          sampleRate: 44100,
          channels: 1,
          bitRate: 128000,
        });
        this.isRecording = true;

        // Set up a timer to send audio chunks
        // This is a simplified approach; a real implementation might use a more event-driven model
        // or a dedicated streaming API from react-native-nitro-sound.
        // For demonstration, we'll simulate sending chunks.
        // In a real scenario, AudioRecorder would provide raw audio data directly.
        // This part needs to be adapted based on the actual API of react-native-nitro-sound
        // to get real-time audio data.
        // For now, we'll assume AudioRecorder.onProgress provides data.
        AudioRecorder.onProgress = (data) => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            // Assuming data.audioFile contains the audio chunk
            this.ws.send(data.audioFile);
          }
        };
      };

      this.ws.onmessage = async (event) => {
        // Handle incoming audio from agent
        console.log('Received message from WebSocket:', event.data);
        // Assuming event.data is audio data (e.g., base64 encoded or raw bytes)
        // This part needs actual implementation based on how agent sends audio
        // For now, we'll assume it's a playable audio format.
        try {
          const audioData = event.data; // This might need decoding
          await this.audioPlayer.play(audioData); // Assuming play can take raw audio data
        } catch (error) {
          console.error('Error playing incoming audio:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.stopVoiceChat();
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        this.stopVoiceChat();
      };

      return true;
    } catch (error) {
      console.error('Failed to start voice chat:', error);
      return false;
    }
  }

  public async stopVoiceChat(): Promise<void> {
    if (!this.isRecording) {
      console.warn('Not currently recording.');
      return;
    }

    try {
      await AudioRecorder.stopRecorder(); // Use stopRecorder
      this.isRecording = false;
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
      console.log('Voice chat stopped.');
    } catch (error) {
      console.error('Failed to stop voice chat:', error);
    }
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }
}

export const voiceService = new VoiceService();
