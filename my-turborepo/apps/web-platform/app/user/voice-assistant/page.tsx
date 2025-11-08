'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  List,
  ListItem,
  Paper,
  Chip,
} from '@mui/material';
import {
  Send,
  Stop,
  SmartToy,
  Person,
} from '@mui/icons-material';

type Language = 'en' | 'hi' | 'cg';
type SessionState = 'idle' | 'connecting' | 'connected' | 'error';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

const BACKEND_URL = 'http://localhost:8001';

export default function VoiceAssistantPage() {
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [language, setLanguage] = useState<Language>('en');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const languageLabels: Record<Language, string> = {
    en: 'English',
    hi: 'हिंदी (Hindi)',
    cg: 'छत्तीसगढ़ी (Chhattisgarhi)',
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const addMessage = (role: 'user' | 'assistant' | 'system', content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const startSession = () => {
    setError(null);
    setMessages([]);
    setSessionState('connecting');

    try {
      const ws = new WebSocket(`ws://localhost:8001/voice/ws/${language}`);
      
      ws.onopen = () => {
        console.log('WebSocket connected successfully!');
        setSessionState('connected');
        addMessage('system', 'Connected to AI assistant! Type your message below.');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received from server:', data);

          if (data.type === 'connected') {
            addMessage('system', data.message);
          } else if (data.type === 'text') {
            addMessage('assistant', data.content);
          } else if (data.type === 'error') {
            setError(data.message);
          }
        } catch (e) {
          console.error('Error parsing message:', e);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error event:', event);
        console.error('WebSocket readyState:', ws.readyState);
        setError(`Connection error. Backend: ${BACKEND_URL}. Check if server is running on port 8001.`);
        setSessionState('error');
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed. Code:', event.code, 'Reason:', event.reason);
        setSessionState('idle');
        if (event.code === 1006) {
          addMessage('system', 'Connection failed. Please check if backend server is running.');
        } else {
          addMessage('system', 'Session ended.');
        }
      };

      wsRef.current = ws;
    } catch (e) {
      console.error('Error starting session:', e);
      setError('Failed to start session');
      setSessionState('error');
    }
  };

  const endSession = () => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'end' }));
      wsRef.current.close();
      wsRef.current = null;
    }
    setSessionState('idle');
  };

  const sendMessage = () => {
    if (!inputText.trim() || !wsRef.current) return;

    const userMessage = inputText.trim();
    setInputText('');

    addMessage('user', userMessage);

    wsRef.current.send(JSON.stringify({
      type: 'text',
      content: userMessage,
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom align="center">
         Voice AI Assistant
      </Typography>
      
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Smart City Civic Engagement Assistant
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }} disabled={sessionState !== 'idle'}>
            <InputLabel>Language</InputLabel>
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              label="Language"
            >
              {Object.entries(languageLabels).map(([code, label]) => (
                <MenuItem key={code} value={code}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Chip 
            label={sessionState.toUpperCase()} 
            color={sessionState === 'connected' ? 'success' : sessionState === 'error' ? 'error' : 'default'}
            sx={{ ml: 'auto' }}
          />
        </Box>

        {sessionState === 'idle' && (
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={startSession}
            startIcon={<SmartToy />}
          >
            Start Session
          </Button>
        )}

        {sessionState !== 'idle' && (
          <Button
            variant="outlined"
            size="large"
            fullWidth
            color="error"
            onClick={endSession}
            startIcon={<Stop />}
          >
            End Session
          </Button>
        )}
      </Card>

      {messages.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, maxHeight: 400, overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Conversation
          </Typography>
          <List>
            {messages.map((msg, index) => (
              <Box key={msg.id}>
                <ListItem 
                  sx={{ 
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: msg.role === 'user' ? 'primary.light' : msg.role === 'assistant' ? 'success.light' : 'grey.200',
                      color: msg.role === 'system' ? 'text.primary' : 'white',
                      borderRadius: 2,
                      p: 2,
                      maxWidth: '70%',
                      ml: msg.role === 'user' ? 1 : 0,
                      mr: msg.role === 'user' ? 0 : 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      {msg.role === 'user' ? <Person fontSize="small" /> : msg.role === 'assistant' ? <SmartToy fontSize="small" /> : null}
                      <Typography variant="caption">
                        {msg.role === 'user' ? 'You' : msg.role === 'assistant' ? 'AI Assistant' : 'System'}
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {msg.content}
                    </Typography>
                  </Box>
                </ListItem>
                {index < messages.length - 1 && <Box sx={{ my: 1 }} />}
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </List>
        </Paper>
      )}

      {sessionState === 'connected' && (
        <Card sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder="Type your message here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sessionState !== 'connected'}
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              disabled={!inputText.trim() || sessionState !== 'connected'}
              startIcon={<Send />}
            >
              Send
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Press Enter to send, Shift+Enter for new line
          </Typography>
        </Card>
      )}

      <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
           How to Use
        </Typography>
        <Typography variant="body2" component="div">
          <ol>
            <li>Select your preferred language (English, Hindi, or Chhattisgarhi)</li>
            <li>Click "Start Session" to connect to the AI assistant</li>
            <li>Type your question or civic issue in the text box</li>
            <li>The AI will respond with helpful information</li>
            <li>Click "End Session" when done</li>
          </ol>
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>Note:</strong> This is a text-based interface. Voice input/output will be added in Phase 2!
        </Alert>
      </Box>
    </Container>
  );
}
