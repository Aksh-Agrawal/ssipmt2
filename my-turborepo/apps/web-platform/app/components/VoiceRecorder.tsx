'use client';

import React, { useState, useRef } from 'react';
import {
  IconButton,
  Box,
  CircularProgress,
  Typography,
  Alert,
  Paper,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import MicOffIcon from '@mui/icons-material/MicOff';

interface VoiceRecorderProps {
  onTranscription: (result: {
    transcription: string;
    language: string;
    reportDetails: {
      category: string;
      priority: string;
      location: string;
      description: string;
      confidence: number;
    };
  }) => void;
  language?: string;
}

export default function VoiceRecorder({ onTranscription, language }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setError(null);
      setPermissionDenied(false);

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000, // Deepgram recommends 16kHz
        } 
      });

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        // Process the recorded audio
        await processRecording();
      };

      mediaRecorder.start();
      setIsRecording(true);

    } catch (err: any) {
      console.error('Error starting recording:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setError('Microphone permission denied. Please allow microphone access in your browser settings.');
      } else {
        setError('Failed to start recording. Please check your microphone.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processRecording = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Create audio blob
      const audioBlob = new Blob(audioChunksRef.current, { 
        type: mediaRecorderRef.current?.mimeType || 'audio/webm' 
      });

      // Check if audio is too short
      if (audioBlob.size < 1000) {
        throw new Error('Recording too short. Please speak for at least 1 second.');
      }

      // Create FormData
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      if (language) {
        formData.append('language', language);
      }

      // Send to API
      const response = await fetch('/api/voice/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process voice input');
      }

      const result = await response.json();

      // Call the callback with transcription result
      onTranscription(result);

    } catch (err: any) {
      console.error('Error processing recording:', err);
      setError(err.message || 'Failed to process voice input. Please try again.');
    } finally {
      setIsProcessing(false);
      audioChunksRef.current = [];
    }
  };

  return (
    <Box sx={{ textAlign: 'center', my: 2 }}>
      {/* Microphone Button */}
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <IconButton
          color={isRecording ? 'error' : 'primary'}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing || permissionDenied}
          sx={{
            width: 80,
            height: 80,
            backgroundColor: isRecording ? 'error.main' : 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: isRecording ? 'error.dark' : 'primary.dark',
            },
            '&.Mui-disabled': {
              backgroundColor: 'grey.300',
              color: 'grey.500',
            },
            // Pulsing animation when recording
            ...(isRecording && {
              animation: 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': {
                  transform: 'scale(1)',
                  opacity: 1,
                },
                '50%': {
                  transform: 'scale(1.1)',
                  opacity: 0.8,
                },
              },
            }),
          }}
        >
          {isProcessing ? (
            <CircularProgress size={40} sx={{ color: 'white' }} />
          ) : permissionDenied ? (
            <MicOffIcon sx={{ fontSize: 40 }} />
          ) : isRecording ? (
            <StopIcon sx={{ fontSize: 40 }} />
          ) : (
            <MicIcon sx={{ fontSize: 40 }} />
          )}
        </IconButton>
      </Box>

      {/* Status Text */}
      <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
        {isProcessing
          ? 'Processing your voice...'
          : isRecording
          ? 'Tap to stop recording'
          : permissionDenied
          ? 'Microphone access denied'
          : 'Tap to speak (English/Hindi/Chhattisgarhi)'}
      </Typography>

      {/* Recording Indicator */}
      {isRecording && (
        <Paper
          elevation={2}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            mt: 2,
            backgroundColor: 'error.light',
            color: 'error.contrastText',
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: 'error.main',
              animation: 'blink 1s infinite',
              '@keyframes blink': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.3 },
              },
            }}
          />
          <Typography variant="caption">Recording...</Typography>
        </Paper>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mt: 2, maxWidth: 400, mx: 'auto' }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
