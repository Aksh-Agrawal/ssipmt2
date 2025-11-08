'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Card,
  Avatar,
  Chip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import {
  Mic,
  MicOff,
  SmartToy,
  Person,
  VolumeUp,
  Call,
  CallEnd,
} from '@mui/icons-material';

type Language = 'en' | 'hi' | 'cg';
type SessionState = 'idle' | 'connecting' | 'connected' | 'speaking' | 'listening' | 'error';

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioPlayed?: boolean;
}

export default function RealTimeVoiceAssistant() {
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [language, setLanguage] = useState<Language>('en');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isContinuous, setIsContinuous] = useState(true); // Continuous conversation mode

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isProcessingRef = useRef<boolean>(false);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

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

  // Start real-time voice session with automatic voice detection
  const startVoiceSession = async () => {
    try {
      console.log('🎬 Starting voice session...');
      setSessionState('connecting');
      setError(null);

      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support microphone access. Please use Chrome or Edge.');
      }

      console.log('📱 Requesting microphone access...');

      // Request microphone permission with proper constraints
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000,
            channelCount: 1,
            // Prefer actual microphone, not system audio
            suppressLocalAudioPlayback: true,
          } 
        });
      } catch (constraintError) {
        console.warn('⚠️ Advanced audio constraints failed, trying basic audio...');
        // Fallback to basic audio if advanced constraints fail
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      
      console.log('✅ Microphone access granted');
      console.log('Audio tracks:', stream.getAudioTracks().map(t => ({
        label: t.label,
        enabled: t.enabled,
        muted: t.muted,
        settings: t.getSettings()
      })));
      
      streamRef.current = stream;
      
      // Initialize audio context for playback AND monitoring
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Setup audio level monitoring
      setupAudioLevelMonitoring(stream);

      // Start continuous listening with automatic detection
      await startAutomaticListening(stream);

      setSessionState('listening');
      setIsListening(true);
      
      // Welcome message
      addMessage({
        role: 'assistant',
        content: getWelcomeMessage(language),
      });

      // Speak welcome message
      await speakWelcomeMessage(language);

    } catch (err: any) {
      console.error('❌ Failed to start voice session:', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      
      let errorMessage = 'Could not access microphone. ';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += 'Permission denied. Please click "Allow" when browser asks for microphone access.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage += 'No microphone found. Please connect a microphone and try again.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage += 'Microphone is already in use by another application. Please close other apps using the microphone.';
      } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        errorMessage += 'Microphone does not support the required settings. Try a different microphone.';
      } else {
        errorMessage += err.message || 'Unknown error occurred.';
      }
      
      setError(errorMessage);
      setSessionState('error');
    }
  };

  // Setup audio level monitoring to verify microphone is working
  const setupAudioLevelMonitoring = (stream: MediaStream) => {
    if (!audioContextRef.current) return;

    const audioContext = audioContextRef.current;
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.8;
    
    source.connect(analyser);
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    // Monitor audio levels continuously
    const checkLevel = () => {
      if (!analyserRef.current || sessionState === 'idle') return;
      
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const level = Math.round(average);
      
      setAudioLevel(level);
      
      if (level > 10) {
        console.log('🎤 Audio detected! Level:', level);
      }
      
      requestAnimationFrame(checkLevel);
    };
    
    checkLevel();
    console.log('✅ Audio level monitoring started');
  };

  // Speak welcome message
  const speakWelcomeMessage = async (lang: Language) => {
    try {
      const welcomeTexts = {
        en: 'Hello! I am listening. Please speak your question.',
        hi: 'नमस्ते! मैं सुन रहा हूं। कृपया अपना सवाल बोलें।',
        cg: 'नमस्कार! मैं सुनत हवंव। कृपया अपन सवाल बोलव।',
      };
      
      // You can add TTS for welcome message here if needed
      console.log('Welcome:', welcomeTexts[lang]);
    } catch (err) {
      console.error('Welcome speech error:', err);
    }
  };

  // Start automatic listening with voice activity detection
  const startAutomaticListening = async (stream: MediaStream) => {
    // Check available MIME types
    let mimeType = 'audio/webm;codecs=opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4';
      }
    }
    console.log('Using MIME type:', mimeType);

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: mimeType,
      audioBitsPerSecond: 128000,
    });

    // Collect audio chunks
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        console.log('📦 Audio chunk received:', event.data.size, 'bytes');
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      console.log('⏹️  Recording stopped. Chunks collected:', audioChunksRef.current.length);
      
      // Don't process if already processing
      if (isProcessingRef.current) {
        console.log('⚠️  Already processing, skipping...');
        return;
      }

      if (audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log('🎵 Created audio blob, size:', audioBlob.size, 'bytes');
        audioChunksRef.current = []; // Clear chunks
        
        // Process the audio
        await processVoiceInput(audioBlob);
      } else {
        console.log('⚠️  No audio chunks to process');
      }
    };

    mediaRecorderRef.current = mediaRecorder;
    
    // Start recording in chunks of 3 seconds for automatic detection
    startRecordingChunk();
  };

  // Record in 3-second chunks for automatic voice detection
  const startRecordingChunk = () => {
    if (!mediaRecorderRef.current || sessionState === 'idle') return;

    // Start recording
    if (mediaRecorderRef.current.state === 'inactive') {
      mediaRecorderRef.current.start();
      setIsListening(true);
      setSessionState('listening');
    }

    // Stop after 3 seconds to check for voice
    setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    }, 3000); // 3 seconds
  };

  // Process voice input through real-time pipeline
  const processVoiceInput = async (audioBlob: Blob) => {
    console.log('📊 Audio blob received, size:', audioBlob.size, 'bytes');
    
    // Lower threshold for testing - accept smaller audio chunks
    if (audioBlob.size < 1000) {
      console.log('⚠️ Audio too small (< 1KB), likely silence. Size:', audioBlob.size, 'bytes. Restarting...');
      // Restart listening immediately
      if (isContinuous && sessionState !== 'idle') {
        setTimeout(() => startRecordingChunk(), 100);
      }
      return;
    }
    
    console.log('✅ Audio size acceptable (' + audioBlob.size + ' bytes), processing...');

    isProcessingRef.current = true;
    setSessionState('speaking');
    setIsListening(false);

    try {
      console.log('Processing audio blob, size:', audioBlob.size);

      // Send to voice-chat API (Deepgram STT + Gemini AI + Cartesia TTS)
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('language', language);

      const response = await fetch('/api/voice-chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Voice processing failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Voice chat result:', result);

      // Check if transcription is meaningful
      if (!result.transcription || result.transcription.trim().length === 0) {
        console.log('Empty transcription, restarting...');
        // Restart listening
        if (isContinuous && sessionState !== 'idle') {
          isProcessingRef.current = false;
          setTimeout(() => startRecordingChunk(), 100);
        }
        return;
      }

      // Add user message (transcription)
      addMessage({
        role: 'user',
        content: result.transcription,
      });

      // Add assistant response
      addMessage({
        role: 'assistant',
        content: result.response,
      });

      // Play TTS audio automatically
      if (result.audioResponse) {
        console.log('Playing TTS audio...');
        await playAudio(result.audioResponse);
        console.log('Audio playback finished');
      }

      setSessionState('listening');
      isProcessingRef.current = false;
      
      // Automatically start listening again after response (continuous conversation)
      if (isContinuous && sessionState !== 'idle') {
        console.log('Restarting listening for continuous conversation...');
        setTimeout(() => {
          startRecordingChunk();
        }, 500);
      }

    } catch (err: any) {
      console.error('Voice processing error:', err);
      setError(`Failed to process voice: ${err.message}`);
      setSessionState('listening');
      isProcessingRef.current = false;
      
      // Restart listening even after error
      if (isContinuous && sessionState !== 'idle') {
        setTimeout(() => startRecordingChunk(), 1000);
      }
    }
  };

  // Play TTS audio
  const playAudio = async (audioBase64: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const audioUrl = `data:audio/mp3;base64,${audioBase64}`;
        const audio = new Audio(audioUrl);
        
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error('Audio playback failed'));
        
        audio.play().catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  };

  // End voice session
  const endVoiceSession = () => {
    console.log('🛑 Ending voice session...');
    
    // Stop continuous mode
    setIsContinuous(false);
    
    // Stop recording
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      const stream = mediaRecorderRef.current.stream;
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.label);
      });
    }
    
    // Stop stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setSessionState('idle');
    setIsListening(false);
    setCurrentTranscript('');
    setAudioLevel(0);
    console.log('✅ Session ended');
  };

  // Add message to conversation
  const addMessage = (message: Omit<ConversationMessage, 'id' | 'timestamp'>) => {
    const newMessage: ConversationMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Get welcome message based on language
  const getWelcomeMessage = (lang: Language): string => {
    const messages = {
      en: '🎙️ Session started! I\'m listening automatically. Just speak your question naturally - no button needed. I\'ll respond in voice and keep listening for your next question!',
      hi: '🎙️ सत्र शुरू हो गया! मैं स्वचालित रूप से सुन रहा हूं। बस अपना सवाल स्वाभाविक रूप से बोलें - कोई बटन की जरूरत नहीं। मैं वॉइस में जवाब दूंगा और आपके अगले सवाल के लिए सुनता रहूंगा!',
      cg: '🎙️ सत्र शुरू हो गे! मैं अपने आप सुनत हवंव। बस अपन सवाल स्वाभाविक रूप ले बोलव - कोनो बटन के जरूरत नइ हे। मैं वॉइस म जवाब देहूं अउ तोर अगला सवाल बर सुनत रहिहूं!',
    };
    return messages[lang];
  };

  // Get state description
  const getStateDescription = (state: SessionState): string => {
    const descriptions = {
      idle: 'Ready to start',
      connecting: 'Connecting...',
      connected: 'Connected',
      listening: 'Listening... speak now',
      speaking: 'AI is responding...',
      error: 'Error occurred',
    };
    return descriptions[state];
  };

  // Get state color
  const getStateColor = (state: SessionState): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    const colors = {
      idle: 'default',
      connecting: 'info',
      connected: 'success',
      listening: 'primary',
      speaking: 'secondary',
      error: 'error',
    };
    return colors[state] as any;
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
              <VolumeUp sx={{ fontSize: 32 }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                Real-Time Voice Assistant
              </Typography>
              <Typography variant="body1">
                🎙️ Continuous conversation powered by Pipecat AI
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label="Real-time STT" 
              size="small" 
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
            />
            <Chip 
              label="Instant TTS" 
              size="small" 
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
            />
            <Chip 
              label="Hands-free" 
              size="small" 
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
            />
          </Box>
        </Paper>

        {/* Controls */}
        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Language</InputLabel>
              <Select
                value={language}
                label="Language"
                onChange={(e) => setLanguage(e.target.value as Language)}
                disabled={sessionState !== 'idle'}
              >
                <MenuItem value="en">{languageLabels.en}</MenuItem>
                <MenuItem value="hi">{languageLabels.hi}</MenuItem>
                <MenuItem value="cg">{languageLabels.cg}</MenuItem>
              </Select>
            </FormControl>

            {sessionState === 'idle' && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Call />}
                  onClick={startVoiceSession}
                  size="large"
                >
                  Start Voice Session
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={async () => {
                    try {
                      console.log('🧪 Testing microphone access...');
                      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                      console.log('✅ Microphone test PASSED');
                      console.log('Available tracks:', stream.getTracks());
                      alert('✅ Microphone is working! You can now start the voice session.');
                      stream.getTracks().forEach(t => t.stop());
                    } catch (err: any) {
                      console.error('❌ Microphone test FAILED:', err);
                      alert('❌ Microphone test failed: ' + err.message);
                    }
                  }}
                >
                  Test Mic
                </Button>
              </>
            )}

            {sessionState !== 'idle' && sessionState !== 'error' && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<CallEnd />}
                onClick={endVoiceSession}
                size="large"
              >
                End Session
              </Button>
            )}

            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
              {isListening && (
                <>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    bgcolor: 'error.main',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%': { opacity: 1, transform: 'scale(1)' },
                      '50%': { opacity: 0.5, transform: 'scale(1.2)' },
                      '100%': { opacity: 1, transform: 'scale(1)' },
                    }
                  }} />
                  {audioLevel > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      🎤 Level: {audioLevel}
                    </Typography>
                  )}
                </>
              )}
              <Chip 
                label={getStateDescription(sessionState)}
                color={getStateColor(sessionState)}
                icon={isListening ? <Mic /> : undefined}
              />
            </Box>
          </Box>

          {sessionState === 'idle' && !error && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <strong>Before starting:</strong>
              <br />1. Click "Test Mic" to verify your microphone works
              <br />2. Make sure your microphone is not muted in Windows settings
              <br />3. Close other apps that might be using the microphone (Zoom, Teams, etc.)
              <br />4. Use Chrome or Edge browser for best compatibility
              <br />5. Press F12 to open console and watch for debug logs
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
              <br /><br />
              <strong>Troubleshooting:</strong>
              <br />• Check Windows Settings → Privacy → Microphone → Allow apps
              <br />• Make sure microphone is not muted (right-click speaker icon)
              <br />• Try clicking "Test Mic" button first
              <br />• Open browser console (F12) to see detailed error messages
            </Alert>
          )}
        </Paper>

        {/* Conversation Messages */}
        <Paper 
          elevation={2} 
          sx={{ 
            flexGrow: 1, 
            overflow: 'auto', 
            p: 2,
            backgroundColor: '#f5f5f5',
          }}
        >
          {messages.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <SmartToy sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                {sessionState === 'idle' 
                  ? 'Start a voice session to begin conversation'
                  : 'Speak to start chatting...'}
              </Typography>
            </Box>
          )}

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
                    bgcolor: message.role === 'user' ? '#667eea' : '#764ba2',
                    width: 40,
                    height: 40,
                  }}
                >
                  {message.role === 'user' ? <Person /> : <SmartToy />}
                </Avatar>
                <Card
                  sx={{
                    p: 2,
                    backgroundColor: message.role === 'user' ? '#667eea' : 'white',
                    color: message.role === 'user' ? 'white' : 'inherit',
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Typography>
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

          {sessionState === 'speaking' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: '#764ba2' }}>
                <SmartToy />
              </Avatar>
              <Card sx={{ p: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" sx={{ ml: 1, display: 'inline' }}>
                  Processing your voice...
                </Typography>
              </Card>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Paper>

        {/* Instructions */}
        <Paper elevation={2} sx={{ p: 2, mt: 2, backgroundColor: '#e3f2fd' }}>
          <Typography variant="body2" color="text.secondary">
            💡 <strong>Automatic Conversation:</strong> Click "Start Voice Session" once and just speak naturally! 
            The AI automatically listens, responds in voice, and continues the conversation. No buttons needed - just talk like a phone call! 📞
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
