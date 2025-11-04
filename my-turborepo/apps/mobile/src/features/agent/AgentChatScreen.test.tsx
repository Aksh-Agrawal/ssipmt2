import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AgentChatScreen from '../AgentChatScreen';
import { agentService } from '../../services/agentService'; // Mock agentService
import { voiceService } from '../../services/VoiceService'; // Mock voiceService

// Mock agentService
jest.mock('../../services/agentService', () => ({
  agentService: {
    sendQuery: jest.fn((query) => Promise.resolve({ response: `Agent response to: ${query}`, sources: [] })),
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

describe('AgentChatScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    const { getByPlaceholderText } = render(<AgentChatScreen />);
    expect(getByPlaceholderText('Type your question...')).toBeTruthy();
  });

  it('should call voiceService.startVoiceChat when microphone button is pressed', async () => {
    const { getByLabelText } = render(<AgentChatScreen />);
    const microphoneButton = getByLabelText('microphone');

    fireEvent.press(microphoneButton);

    await waitFor(() => {
      expect(voiceService.startVoiceChat).toHaveBeenCalled();
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
});