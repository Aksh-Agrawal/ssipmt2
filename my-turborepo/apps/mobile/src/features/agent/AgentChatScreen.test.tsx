import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AgentChatScreen from './AgentChatScreen';

jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: View,
    PROVIDER_GOOGLE: 'google',
  };
});

describe('AgentChatScreen', () => {
  it('should render the map view', () => {
    expect(() => render(<AgentChatScreen />)).not.toThrow();
  });

  it('should render the text input field', () => {
    const { getByPlaceholderText } = render(<AgentChatScreen />);
    const input = getByPlaceholderText('Type your question...');
    expect(input).toBeTruthy();
  });

  it('should render the send button', () => {
    const { getByRole } = render(<AgentChatScreen />);
    const sendButton = getByRole('button', { name: /send/i });
    expect(sendButton).toBeTruthy();
  });

  it('should display empty state message when no messages exist', () => {
    const { getByText } = render(<AgentChatScreen />);
    const emptyMessage = getByText(/Ask me anything about traffic/i);
    expect(emptyMessage).toBeTruthy();
  });

  it('should update input text when user types', () => {
    const { getByPlaceholderText } = render(<AgentChatScreen />);
    const input = getByPlaceholderText('Type your question...');
    fireEvent.changeText(input, 'Hello agent');
    expect(input.props.value).toBe('Hello agent');
  });

  it('should add a message when send button is pressed', async () => {
    const { getByPlaceholderText, getByRole, getByText } = render(<AgentChatScreen />);
    const input = getByPlaceholderText('Type your question...');
    const sendButton = getByRole('button', { name: /send/i });
    fireEvent.changeText(input, 'What is the traffic like?');
    fireEvent.press(sendButton);
    await waitFor(() => {
      expect(getByText('What is the traffic like?')).toBeTruthy();
    });
  });

  it('should clear input field after sending a message', async () => {
    const { getByPlaceholderText, getByRole } = render(<AgentChatScreen />);
    const input = getByPlaceholderText('Type your question...');
    const sendButton = getByRole('button', { name: /send/i });
    fireEvent.changeText(input, 'Test message');
    fireEvent.press(sendButton);
    await waitFor(() => {
      expect(input.props.value).toBe('');
    });
  });

  it('should not send empty messages', () => {
    const { getByPlaceholderText, getByRole, queryByText } = render(<AgentChatScreen />);
    const input = getByPlaceholderText('Type your question...');
    const sendButton = getByRole('button', { name: /send/i });
    fireEvent.changeText(input, '   ');
    fireEvent.press(sendButton);
    expect(queryByText(/Ask me anything about traffic/i)).toBeTruthy();
  });

  it('should trim whitespace from messages', async () => {
    const { getByPlaceholderText, getByRole, getByText } = render(<AgentChatScreen />);
    const input = getByPlaceholderText('Type your question...');
    const sendButton = getByRole('button', { name: /send/i });
    fireEvent.changeText(input, '  Test message  ');
    fireEvent.press(sendButton);
    await waitFor(() => {
      expect(getByText('Test message')).toBeTruthy();
    });
  });

  it('should add multiple messages to the chat', async () => {
    const { getByPlaceholderText, getByRole, getByText } = render(<AgentChatScreen />);
    const input = getByPlaceholderText('Type your question...');
    const sendButton = getByRole('button', { name: /send/i });
    fireEvent.changeText(input, 'First message');
    fireEvent.press(sendButton);
    await waitFor(() => {
      fireEvent.changeText(input, 'Second message');
    });
    fireEvent.press(sendButton);
    await waitFor(() => {
      expect(getByText('First message')).toBeTruthy();
      expect(getByText('Second message')).toBeTruthy();
    });
  });

  it('should disable send button when input is empty', () => {
    const { getByRole } = render(<AgentChatScreen />);
    const sendButton = getByRole('button', { name: /send/i });
    expect(sendButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('should enable send button when input has text', () => {
    const { getByPlaceholderText, getByRole } = render(<AgentChatScreen />);
    const input = getByPlaceholderText('Type your question...');
    const sendButton = getByRole('button', { name: /send/i });
    fireEvent.changeText(input, 'Some text');
    expect(sendButton.props.accessibilityState?.disabled).toBe(false);
  });
});
