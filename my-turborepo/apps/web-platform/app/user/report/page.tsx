'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  PhotoCamera,
  Send,
  MyLocation,
  Delete,
} from '@mui/icons-material';
import { useUser } from '@clerk/nextjs';
import FloatingChatButton from '@/app/components/FloatingChatButton';
import VoiceRecorder from '@/app/components/VoiceRecorder';
import PhotoVerifier from '@/app/components/PhotoVerifier';

type Language = 'en' | 'hi' | 'cg';

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export default function ReportPage() {
  const { user } = useUser();
  
  // Form state
  const [language, setLanguage] = useState<Language>('en');
  const [transcription, setTranscription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Language labels
  const languageLabels = {
    en: 'English',
    hi: 'हिंदी (Hindi)',
    cg: 'छत्तीसगढ़ी (Chhattisgarhi)',
  };

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Handle photo upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPhotos = Array.from(files).slice(0, 3 - photos.length);
      setPhotos([...photos, ...newPhotos]);
    }
  };

  // Handle voice transcription from VoiceRecorder component
  const handleVoiceTranscription = (result: any) => {
    console.log('Voice transcription result:', result);
    
    setTranscription(result.transcription);
    
    // Auto-fill form fields from AI extraction
    if (result.reportDetails) {
      if (result.reportDetails.category) {
        setCategory(result.reportDetails.category);
      }
      if (result.reportDetails.priority) {
        setPriority(result.reportDetails.priority);
      }
      
      // Show AI suggestion with NLP data
      setAiSuggestion({
        ai_category: result.reportDetails.category,
        ai_priority: result.reportDetails.priority,
        ai_location: result.reportDetails.location,
        ai_intent: result.nlp?.intent,
        ai_reasoning: `Detected ${result.nlp?.intent} intent from voice input`,
      });
    }
  };

  // Remove photo
  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  // Submit report
  const handleSubmit = async () => {
    if (!transcription && !photos.length) {
      setError('Please record a voice message or upload photos');
      return;
    }

    if (!location) {
      setError('Location is required. Please enable location services.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Prepare report data
      const reportData = {
        description: transcription,
        category: category || undefined, // Let AI categorize if not provided
        location: {
          lat: location.latitude,
          lng: location.longitude,
        },
        address: location.address || '',
        photos: photos.map(p => p.name), // TODO: Upload photos to storage first
        input_method: transcription ? 'voice' : 'text',
        input_language: language,
        voice_transcription: transcription,
        use_ai_categorization: true, // Enable AI categorization
        userName: user?.fullName || 'User',
        userEmail: user?.emailAddresses?.[0]?.emailAddress || 'user@example.com',
      };

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit report');
      }

      // Show success with AI categorization insights
      if (result.ai_metadata) {
        setAiSuggestion(result.ai_metadata);
      }
      setSubmitSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setTranscription('');
        setPhotos([]);
        setCategory('');
        setPriority('');
        setAiSuggestion(null);
        setSubmitSuccess(false);
      }, 3000);
      
    } catch (err: any) {
      console.error('Error submitting report:', err);
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          📢 Report an Issue
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Use your voice or upload photos to report civic issues in your area
        </Typography>

        {submitSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="body1" fontWeight={600}>
                ✅ Report submitted successfully!
              </Typography>
              {aiSuggestion && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    🤖 <strong>AI Analysis:</strong>
                  </Typography>
                  <Typography variant="body2">
                    • Category: <strong>{aiSuggestion.ai_category}</strong>
                  </Typography>
                  <Typography variant="body2">
                    • Priority: <strong>{aiSuggestion.ai_priority}</strong>
                  </Typography>
                  <Typography variant="body2">
                    • Confidence: {Math.round(aiSuggestion.ai_confidence * 100)}%
                  </Typography>
                  {aiSuggestion.ai_reasoning && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                      💡 {aiSuggestion.ai_reasoning}
                    </Typography>
                  )}
                </Box>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                We'll notify you of updates via SMS and app notifications.
              </Typography>
            </Box>
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          {/* Language Selector */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Select Language</InputLabel>
            <Select
              value={language}
              label="Select Language"
              onChange={(e) => setLanguage(e.target.value as Language)}
            >
              <MenuItem value="en">{languageLabels.en}</MenuItem>
              <MenuItem value="hi">{languageLabels.hi}</MenuItem>
              <MenuItem value="cg">{languageLabels.cg}</MenuItem>
            </Select>
          </FormControl>

          {/* Voice Recording Section */}
          <Card variant="outlined" sx={{ mb: 3, backgroundColor: '#f5f5f5' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎤 Voice Recording
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Tap the microphone to record your report in {languageLabels[language]}
              </Typography>
              
              <VoiceRecorder 
                onTranscription={handleVoiceTranscription}
                language={language}
              />
            </CardContent>
          </Card>

          {/* Transcription Display */}
          {transcription && (
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Transcription"
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              sx={{ mb: 3 }}
              helperText="You can edit the transcription if needed"
            />
          )}

          {/* Auto-categorized */}
          {category && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Auto-detected Category:
              </Typography>
              <Chip 
                label={category.charAt(0).toUpperCase() + category.slice(1)} 
                color="primary" 
              />
            </Box>
          )}

          {/* Photo Upload Section */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📸 Photos (Optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add up to 3 photos to support your report
              </Typography>

              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
              />

              <Button
                variant="outlined"
                startIcon={<PhotoCamera />}
                onClick={() => fileInputRef.current?.click()}
                disabled={photos.length >= 3}
                fullWidth
              >
                {photos.length === 0 ? 'Add Photos' : `Add More (${photos.length}/3)`}
              </Button>

              {photos.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  {photos.map((photo, index) => (
                    <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {/* Photo Preview */}
                      <Box sx={{ position: 'relative', display: 'inline-block', width: 'fit-content' }}>
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Upload ${index + 1}`}
                          style={{
                            width: 200,
                            height: 200,
                            objectFit: 'cover',
                            borderRadius: 8,
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => removePhoto(index)}
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            backgroundColor: 'white',
                            '&:hover': { backgroundColor: '#f5f5f5' },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      {/* Photo Verification Status */}
                      {location && (
                        <PhotoVerifier 
                          file={photo}
                          expectedLatitude={location.latitude}
                          expectedLongitude={location.longitude}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Location Display */}
          {location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <MyLocation color="primary" />
              <Typography variant="body2" color="text.secondary">
                Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Typography>
            </Box>
          )}

          {/* Submit Button */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <Send />}
            onClick={handleSubmit}
            disabled={isSubmitting || (!transcription && photos.length === 0)}
            sx={{ py: 1.5 }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </Paper>
      </Box>

      {/* Floating Chat Button */}
      <FloatingChatButton />
    </Container>
  );
}
