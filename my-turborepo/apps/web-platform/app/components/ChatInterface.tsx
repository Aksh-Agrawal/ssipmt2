'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdCounter = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() === '') return;

    const newMessage: Message = {
      id: `msg-${++messageIdCounter.current}`,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');

    // Simulate agent response (placeholder for future integration)
    setTimeout(() => {
      const agentMessage: Message = {
        id: `msg-${++messageIdCounter.current}`,
        text: 'This is the Civic Information Agent. How can I help you find civic information today?',
        sender: 'agent',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <Paper
      sx={{
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: 3,
      }}
    >
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }} data-testid="messages-area">
        {messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Start a conversation by typing a message below.
            </Typography>
          </Box>
        ) : (
          <List>
            {messages.map((message) => (
              <ListItem
                key={message.id}
                sx={{
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  px: 0,
                }}
              >
                <Paper
                  variant="outlined"
                  data-testid={`message-${message.sender}`}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    maxWidth: '70%',
                    backgroundColor: message.sender === 'user' ? 'primary.light' : 'grey.200',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                  }}
                >
                  <ListItemText
                    primary={message.text}
                    secondary={message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    primaryTypographyProps={{ color: 'inherit' }}
                    secondaryTypographyProps={{ fontSize: '0.75rem', color: 'inherit' }}
                  />
                </Paper>
              </ListItem>
            ))}
          </List>
        )}
        <div ref={messagesEndRef} />
      </Box>
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          aria-label="Message input"
          inputProps={{ 'data-testid': 'message-input' }}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={inputValue.trim() === ''}
          aria-label="Send message"
          data-testid="send-button"
        >
          Send
        </Button>
      </Box>
    </Paper>
  );
}
