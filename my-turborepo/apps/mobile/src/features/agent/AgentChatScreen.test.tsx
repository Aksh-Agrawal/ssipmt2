import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AgentChatScreen from './AgentChatScreen';
import { agentService } from '../../services/agentService';
import { voiceService } from '../../services/VoiceService';

// Mock agentService
jest.mock('../../services/agentService', () => ({
  agentService: {
    sendQuery: jest.fn((query) =>
      Promise.resolve({ response: `Agent response to: ${query}`, sources: [] })
    ),
  },
}));

// Mock voiceService
jest.mock('../../services/VoiceService', () => ({
  voiceService: {
    startVoiceChat: jest.fn(() => Promise.resolve(true)),
    stopVoiceChat: jest.fn(() => Promise.resolve()),
    getIsRecording: jest.fn(() => false),
  },
}));

// Mock config
jest.mock('../../config/env', () => ({
  getVoiceWebSocketUrl: jest.fn(() => 'ws://localhost:3001/ws/voice'),
  config: {
    apiUrl: 'http://localhost:3001',
    websocketUrl: 'ws://localhost:3001',
  },
}));

describe('AgentChatScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    const { getByPlaceholderText } = render(<AgentChatScreen />);
    expect(getByPlaceholderText('Type your question...')).toBeTruthy();
  });

  it('should render voice toggle button', () => {
    const { getByLabelText } = render(<AgentChatScreen />);
    const microphoneButton = getByLabelText('microphone');
    expect(microphoneButton).toBeTruthy();
  });

  it('should call voiceService.startVoiceChat when microphone button is pressed', async () => {
    const { getByLabelText } = render(<AgentChatScreen />);
    const microphoneButton = getByLabelText('microphone');

    fireEvent.press(microphoneButton);

    await waitFor(() => {
      expect(voiceService.startVoiceChat).toHaveBeenCalledWith('ws://localhost:3001/ws/voice');
    });
  });

  it('should call voiceService.stopVoiceChat when stop button is pressed', async () => {
    // Set isRecording to true to show the stop button
    (voiceService.getIsRecording as jest.Mock).mockReturnValue(true);

    const { getByLabelText } = render(<AgentChatScreen />);
    const stopButton = getByLabelText('stop');

    fireEvent.press(stopButton);

    await waitFor(() => {
      expect(voiceService.stopVoiceChat).toHaveBeenCalled();
    });
  });

  it('should send a text message when send button is pressed', async () => {
    const { getByPlaceholderText, getByLabelText, getByText } = render(<AgentChatScreen />);
    const textInput = getByPlaceholderText('Type your question...');
    const sendButton = getByLabelText('send');

    fireEvent.changeText(textInput, 'Hello');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(agentService.sendQuery).toHaveBeenCalledWith('Hello');
      expect(getByText('Agent response to: Hello')).toBeTruthy();
    });
  });

  it('should show Alert when voice chat fails to start', async () => {
    // Mock Alert.alert
    const mockAlert = jest.spyOn(Alert, 'alert');

    // Mock voiceService to return false (connection failed)
    (voiceService.startVoiceChat as jest.Mock).mockResolvedValueOnce(false);

    const { getByLabelText } = render(<AgentChatScreen />);
    const microphoneButton = getByLabelText('microphone');

    fireEvent.press(microphoneButton);

    await waitFor(() => {
      expect(voiceService.startVoiceChat).toHaveBeenCalled();
      expect(mockAlert).toHaveBeenCalledWith(
        'Voice Chat Unavailable',
        'Could not start voice chat. Please check your microphone permissions and internet connection.',
        [{ text: 'OK' }]
      );
    });

    mockAlert.mockRestore();
  });

  it('should handle voice chat permission denial', async () => {
    // Mock voiceService to simulate permission denial
    (voiceService.startVoiceChat as jest.Mock).mockResolvedValueOnce(false);

    const { getByLabelText } = render(<AgentChatScreen />);
    const microphoneButton = getByLabelText('microphone');

    fireEvent.press(microphoneButton);

    await waitFor(() => {
      expect(voiceService.startVoiceChat).toHaveBeenCalled();
      // Voice chat should not be active when permission is denied
      // Button should still show microphone icon (not stop icon)
      expect(getByLabelText('microphone')).toBeTruthy();
    });
  });

  it('should handle network failure during voice chat', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Mock voiceService to fail
    (voiceService.startVoiceChat as jest.Mock).mockResolvedValueOnce(false);

    const { getByLabelText } = render(<AgentChatScreen />);
    const microphoneButton = getByLabelText('microphone');

    fireEvent.press(microphoneButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to start voice chat - check WebSocket connection and permissions'
      );
    });

    consoleErrorSpy.mockRestore();
  });
});
