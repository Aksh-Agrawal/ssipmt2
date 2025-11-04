import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ChatInterface from '../app/components/ChatInterface';

describe('ChatInterface Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('renders the chat interface with all required elements', () => {
    render(<ChatInterface />);

    // Check for messages area
    expect(screen.getByTestId('messages-area')).toBeInTheDocument();

    // Check for input field
    const input = screen.getByTestId('message-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Type your message...');

    // Check for send button
    const sendButton = screen.getByTestId('send-button');
    expect(sendButton).toBeInTheDocument();
    expect(sendButton).toHaveTextContent('Send');
  });

  it('displays empty state message when no messages exist', () => {
    render(<ChatInterface />);
    expect(
      screen.getByText(/Start a conversation by typing a message below/i)
    ).toBeInTheDocument();
  });

  it('disables send button when input is empty', () => {
    render(<ChatInterface />);
    const sendButton = screen.getByTestId('send-button');
    expect(sendButton).toBeDisabled();
  });

  it('enables send button when input has text', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ChatInterface />);

    const input = screen.getByTestId('message-input');
    const sendButton = screen.getByTestId('send-button');

    await user.type(input, 'Hello');

    expect(sendButton).not.toBeDisabled();
  });

  it('sends a message when send button is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ChatInterface />);

    const input = screen.getByTestId('message-input');
    const sendButton = screen.getByTestId('send-button');

    await user.type(input, 'Test message');
    await user.click(sendButton);

    // Check that the message appears in the UI
    expect(screen.getByText('Test message')).toBeInTheDocument();

    // Check that the input is cleared
    expect(input).toHaveValue('');
  });

  it('sends a message when Enter key is pressed', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ChatInterface />);

    const input = screen.getByTestId('message-input');

    await user.type(input, 'Test message{Enter}');

    // Check that the message appears in the UI
    expect(screen.getByText('Test message')).toBeInTheDocument();

    // Check that the input is cleared
    expect(input).toHaveValue('');
  });

  it('does not send empty messages', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ChatInterface />);

    const input = screen.getByTestId('message-input');
    const sendButton = screen.getByTestId('send-button');

    // Try to send empty message
    await user.click(sendButton);

    // Empty state should still be visible
    expect(
      screen.getByText(/Start a conversation by typing a message below/i)
    ).toBeInTheDocument();

    // Try to send message with only spaces
    await user.type(input, '   ');
    await user.click(sendButton);

    // Empty state should still be visible
    expect(
      screen.getByText(/Start a conversation by typing a message below/i)
    ).toBeInTheDocument();
  });

  it('displays user messages with correct styling', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ChatInterface />);

    const input = screen.getByTestId('message-input');
    await user.type(input, 'User message{Enter}');

    const userMessage = screen.getByTestId('message-user');
    expect(userMessage).toBeInTheDocument();
    expect(userMessage).toHaveTextContent('User message');
  });

  it('displays bot response after user message', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ChatInterface />);

    const input = screen.getByTestId('message-input');
    await user.type(input, 'Hello bot{Enter}');

    // Fast-forward time to trigger bot response
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      const botMessage = screen.getByTestId('message-bot');
      expect(botMessage).toBeInTheDocument();
      expect(botMessage).toHaveTextContent(
        'Thank you for your message. This is a placeholder response.'
      );
    });
  });

  it('displays multiple messages in order', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ChatInterface />);

    const input = screen.getByTestId('message-input');

    // Send first message
    await user.type(input, 'First message{Enter}');

    // Send second message
    await user.type(input, 'Second message{Enter}');

    // Check both messages are displayed
    expect(screen.getByText('First message')).toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
  });

  it('has proper ARIA labels for accessibility', () => {
    render(<ChatInterface />);

    const input = screen.getByLabelText('Message input');
    expect(input).toBeInTheDocument();

    const sendButton = screen.getByLabelText('Send message');
    expect(sendButton).toBeInTheDocument();
  });

  it('displays timestamp for messages', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ChatInterface />);

    const input = screen.getByTestId('message-input');
    await user.type(input, 'Test message{Enter}');

    // Check that a timestamp is displayed (format: HH:MM)
    const messageElement = screen.getByTestId('message-user');
    expect(messageElement.textContent).toMatch(/\d{1,2}:\d{2}/);
  });
});
