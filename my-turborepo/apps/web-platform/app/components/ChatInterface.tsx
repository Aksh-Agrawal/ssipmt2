'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './ChatInterface.module.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

let messageIdCounter = 0;

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() === '') return;

    const newMessage: Message = {
      id: `msg-${++messageIdCounter}`,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');

    // Simulate bot response (placeholder for future integration)
    setTimeout(() => {
      const botMessage: Message = {
        id: `msg-${++messageIdCounter}`,
        text: 'Thank you for your message. This is a placeholder response.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messagesArea} data-testid="messages-area">
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Start a conversation by typing a message below.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.message} ${
                message.sender === 'user' ? styles.userMessage : styles.botMessage
              }`}
              data-testid={`message-${message.sender}`}
            >
              <div className={styles.messageContent}>{message.text}</div>
              <div className={styles.messageTime}>
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.inputArea}>
        <input
          type="text"
          className={styles.messageInput}
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          data-testid="message-input"
          aria-label="Message input"
        />
        <button
          className={styles.sendButton}
          onClick={handleSend}
          disabled={inputValue.trim() === ''}
          data-testid="send-button"
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  );
}
