'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Chip,
  CircularProgress,
} from '@mui/material';
import Link from 'next/link';
import { ArrowBack, Send } from '@mui/icons-material';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export default function AdminAssistantPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI Assistant for traffic management and civic operations. I can help you with:\n\n• Real-time traffic conditions across Raipur\n• Report statistics and analytics\n• SLA tracking and compliance\n• Resource allocation recommendations\n• Historical data analysis\n\nWhat would you like to know?',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          conversationHistory: messages.slice(-10), // Last 10 messages for context
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    'What is the current traffic situation?',
    'Show me reports from last 24 hours',
    'Which areas have the most pending reports?',
    'Traffic hotspots right now',
    'SLA compliance statistics',
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
          color: 'white',
          p: 3,
          boxShadow: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Link href="/admin/dashboard" style={{ textDecoration: 'none', color: 'white' }}>
            <Button startIcon={<ArrowBack />} sx={{ color: 'white' }}>
              Back to Dashboard
            </Button>
          </Link>
        </Box>
        <Typography variant="h4" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          🤖 AI Traffic & Operations Assistant
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mt: 0.5 }}>
          Real-time insights for police and administrative operations
        </Typography>
      </Box>

      {/* Chat Container */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          bgcolor: '#f5f5f5',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                maxWidth: '70%',
                flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
              }}
            >
              <Typography sx={{ fontSize: '32px', lineHeight: 1 }}>
                {message.role === 'user' ? '👮' : '🤖'}
              </Typography>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  bgcolor: message.role === 'user' ? '#4F46E5' : 'white',
                  color: message.role === 'user' ? 'white' : 'text.primary',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                >
                  {message.content}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    mt: 1,
                    display: 'block',
                    color: message.role === 'user' ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                  }}
                >
                  {message.timestamp.toLocaleTimeString()}
                </Typography>
              </Paper>
            </Box>
          </Box>
        ))}

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Paper elevation={2} sx={{ p: 2, bgcolor: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: '24px' }}>🤖</Typography>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Thinking...
                </Typography>
              </Box>
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <Paper elevation={0} sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Quick questions:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {quickQuestions.map((question, index) => (
              <Chip
                key={index}
                label={question}
                onClick={() => setInputMessage(question)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              />
            ))}
          </Box>
        </Paper>
      )}

      {/* Input Area */}
      <Paper elevation={3} sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <TextField
              multiline
              rows={2}
              fullWidth
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about traffic, reports, analytics..."
              disabled={isLoading}
              variant="outlined"
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim()}
              endIcon={<Send />}
              sx={{
                minWidth: 100,
                height: 56,
                bgcolor: '#4F46E5',
                '&:hover': { bgcolor: '#4338CA' },
              }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Send'}
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
            Press Enter to send • Shift+Enter for new line
          </Typography>
        </Container>
      </Paper>
    </Box>
  );
}
