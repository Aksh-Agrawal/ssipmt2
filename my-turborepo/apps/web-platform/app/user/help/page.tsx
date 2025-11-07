'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  Avatar,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Send,
  Mic,
  MicOff,
  SmartToy,
  Person,
} from '@mui/icons-material';

type Language = 'en' | 'hi' | 'cg';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioData?: string; // Base64 audio for TTS responses
}

export default function HelpPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your Civic Voice Assistant. How can I help you today? You can ask me about reporting issues, tracking your reports, or general civic information.',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Language labels
  const languageLabels = {
    en: 'English',
    hi: 'हिंदी',
    cg: 'छत्तीसगढ़ी',
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message to Groq API
  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call Gemini AI API
      const response = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          conversationHistory: messages.slice(1).map(m => ({
            role: m.role,
            content: m.content,
          })),
          language,
        }),
      });

      const result = await response.json();
      
      if (result.success && result.response) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.response,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(result.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: language === 'hi' 
          ? 'क्षमा करें, मुझे एक त्रुटि का सामना करना पड़ा। कृपया पुनः प्रयास करें।'
          : language === 'cg'
          ? 'माफ करव, मोला एक त्रुटि के सामना करना परिस। कृपया फेर कोशिश करव।'
          : 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        // Send to voice chat API (Deepgram STT + Groq LLM)
        await processVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Play TTS audio
  const playAudio = (audioBase64: string) => {
    try {
      // Convert base64 to audio URL
      const audioUrl = `data:audio/mp3;base64,${audioBase64}`;
      
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = audioUrl;
        audioPlayerRef.current.play().catch(err => {
          console.error('Audio playback error:', err);
        });
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  // Process voice message through API
  const processVoiceMessage = async (audioBlob: Blob) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-message.webm');
      formData.append('language', language);

      const response = await fetch('/api/voice-chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Voice processing failed');
      }

      const result = await response.json();

      // Add user message (transcription)
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: result.transcription,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
        audioData: result.audioResponse, // Store base64 audio
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Auto-play TTS audio if available
      if (result.audioResponse) {
        playAudio(result.audioResponse);
      }

    } catch (error) {
      console.error('Voice processing error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: language === 'hi' 
          ? 'क्षमा करें, मुझे वॉइस संदेश को प्रोसेस करने में त्रुटि हुई।'
          : language === 'cg'
          ? 'माफ करव, मोला वॉइस संदेश ल प्रोसेस करे म त्रुटि होइस।'
          : 'Sorry, I had trouble processing your voice message. Please try typing instead.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4, height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
        {/* Header Banner */}
        <Paper 
          elevation={3} 
          sx={{ 
            mb: 3, 
            p: 3, 
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            color: 'white',
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
              <SmartToy sx={{ fontSize: 32 }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                AI Voice Assistant
              </Typography>
              <Typography variant="body1">
                Ask about traffic, garbage schedule, how to report issues, or anything else!
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label="English" 
              size="small" 
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
            />
            <Chip 
              label="हिंदी" 
              size="small" 
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
            />
            <Chip 
              label="छत्तीसगढ़ी" 
              size="small" 
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
            />
          </Box>
        </Paper>

        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            💬 Multilingual • 🎤 Voice-ready • 🤖 AI-powered
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Language</InputLabel>
            <Select
              value={language}
              label="Language"
              onChange={(e) => setLanguage(e.target.value as Language)}
            >
              <MenuItem value="en">{languageLabels.en}</MenuItem>
              <MenuItem value="hi">{languageLabels.hi}</MenuItem>
              <MenuItem value="cg">{languageLabels.cg}</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Chat Messages */}
        <Paper 
          elevation={2} 
          sx={{ 
            flexGrow: 1, 
            overflow: 'auto', 
            p: 2, 
            mb: 2,
            backgroundColor: '#f5f5f5',
          }}
        >
          {messages.map((message) => (
            <Box
              key={message.id}
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
                <Avatar
                  sx={{
                    bgcolor: message.role === 'user' ? '#1976d2' : '#9c27b0',
                    width: 40,
                    height: 40,
                  }}
                >
                  {message.role === 'user' ? <Person /> : <SmartToy />}
                </Avatar>
                <Card
                  sx={{
                    p: 2,
                    backgroundColor: message.role === 'user' ? '#1976d2' : 'white',
                    color: message.role === 'user' ? 'white' : 'inherit',
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Typography>
                  
                  {/* Show audio player for TTS responses */}
                  {message.role === 'assistant' && message.audioData && (
                    <Box sx={{ mt: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => playAudio(message.audioData!)}
                        sx={{ 
                          color: 'primary.main',
                          opacity: 0.8,
                        }}
                      >
                        <Mic fontSize="small" />
                      </IconButton>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          ml: 1,
                          opacity: 0.7,
                        }}
                      >
                        Click to replay
                      </Typography>
                    </Box>
                  )}
                  
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block', 
                      mt: 1,
                      opacity: 0.7,
                    }}
                    suppressHydrationWarning
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </Typography>
                </Card>
              </Box>
            </Box>
          ))}
          {isLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: '#9c27b0' }}>
                <SmartToy />
              </Avatar>
              <Card sx={{ p: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" sx={{ ml: 1, display: 'inline' }}>
                  Thinking...
                </Typography>
              </Card>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Paper>

        {/* Input Area */}
        <Paper elevation={3} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder={
                language === 'hi' ? 'अपना संदेश लिखें...' :
                language === 'cg' ? 'अपन संदेश लिखव...' :
                'Type your message...'
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(inputMessage);
                }
              }}
              disabled={isLoading}
              size="small"
            />
            <IconButton
              color={isRecording ? 'error' : 'primary'}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
            >
              {isRecording ? <MicOff /> : <Mic />}
            </IconButton>
            <IconButton
              color="primary"
              onClick={() => sendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isLoading}
            >
              <Send />
            </IconButton>
          </Box>
          
          {/* Quick Actions */}
          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
            <Chip
              label={language === 'hi' ? 'रिपोर्ट कैसे करें?' : language === 'cg' ? 'रिपोर्ट कइसे करे?' : 'How to report?'}
              size="small"
              onClick={() => sendMessage(language === 'hi' ? 'रिपोर्ट कैसे करें?' : language === 'cg' ? 'रिपोर्ट कइसे करे?' : 'How to report an issue?')}
              clickable
            />
            <Chip
              label={language === 'hi' ? 'स्थिति ट्रैक करें' : language === 'cg' ? 'स्थिति ट्रैक करव' : 'Track status'}
              size="small"
              onClick={() => sendMessage(language === 'hi' ? 'अपनी रिपोर्ट की स्थिति कैसे ट्रैक करें?' : language === 'cg' ? 'अपन रिपोर्ट के स्थिति कइसे ट्रैक करे?' : 'How to track my report status?')}
              clickable
            />
            <Chip
              label={language === 'hi' ? 'आपातकाल' : language === 'cg' ? 'आपातकाल' : 'Emergency'}
              size="small"
              color="error"
              onClick={() => sendMessage(language === 'hi' ? 'आपातकाल के लिए क्या करें?' : language === 'cg' ? 'आपातकाल बर का करे?' : 'What to do in emergency?')}
              clickable
            />
          </Box>
        </Paper>

        {/* Hidden audio player for TTS */}
        <audio ref={audioPlayerRef} style={{ display: 'none' }} />
      </Box>
    </Container>
  );
}
