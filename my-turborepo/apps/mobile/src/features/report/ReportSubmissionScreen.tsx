import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Title, Button, TextInput, Card, Paragraph, IconButton } from 'react-native-paper';
import Voice from '@react-native-community/voice';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';

const ReportSubmissionScreen: React.FC = () => {
  const [transcription, setTranscription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // Initialize voice recognition
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechRecognized = onSpeechRecognized;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;

    return () => {
      // Cleanup
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const requestMicrophonePermission = async () => {
    try {
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.MICROPHONE 
        : PERMISSIONS.ANDROID.RECORD_AUDIO;

      const result = await request(permission);
      
      if (result === RESULTS.GRANTED) {
        setHasPermission(true);
        return true;
      } else {
        Alert.alert(
          'Permission Required',
          'Microphone access is required to use voice recording. Please enable it in your device settings.',
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (error) {
      console.error('Permission request error:', error);
      Alert.alert('Error', 'Failed to request microphone permission.');
      return false;
    }
  };

  const onSpeechStart = (e: unknown) => {
    console.log('Speech started:', e);
  };

  const onSpeechRecognized = (e: unknown) => {
    console.log('Speech recognized:', e);
  };

  const onSpeechEnd = (e: unknown) => {
    console.log('Speech ended:', e);
    setIsRecording(false);
  };

  const onSpeechError = (e: unknown) => {
    console.error('Speech error:', e);
    setIsRecording(false);
    
    // Provide more user-friendly error messages based on error type
    let errorMessage = 'There was an error with speech recognition. Please try again.';
    
    if (typeof e === 'object' && e !== null && 'error' in e) {
      const error = e as { error?: { message?: string; code?: string } };
      if (error.error?.code === 'network_error') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.error?.code === 'no_speech') {
        errorMessage = 'No speech detected. Please speak clearly and try again.';
      }
    }
    
    Alert.alert('Speech Recognition Error', errorMessage);
  };

  const onSpeechResults = (e: { value?: string[] }) => {
    console.log('Speech results:', e);
    if (e.value && e.value.length > 0) {
      const newText = e.value[0];
      if (newText) {
        // Append to existing transcription with a space if there's already text
        setTranscription(prev => prev.length > 0 ? `${prev} ${newText}` : newText);
      }
    }
  };

  const startRecording = async () => {
    try {
      if (!hasPermission) {
        const permissionGranted = await requestMicrophonePermission();
        if (!permissionGranted) return;
      }

      setIsRecording(true);
      await Voice.start('en-US');
    } catch (error) {
      console.error('Start recording error:', error);
      setIsRecording(false);
      Alert.alert('Error', 'Failed to start voice recording.');
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
      setIsRecording(false);
    } catch (error) {
      console.error('Stop recording error:', error);
      setIsRecording(false);
    }
  };

  const handleVoiceButtonPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const clearTranscription = () => {
    setTranscription('');
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Report Civic Issue</Title>
      
      <Paragraph style={styles.subtitle}>
        Tap the microphone button and describe the issue you'd like to report.
      </Paragraph>

      <Card style={styles.card}>
        <Card.Content>
          <TextInput
            mode="outlined"
            label="Issue Description"
            placeholder="Tap the microphone and speak to describe the issue..."
            value={transcription}
            onChangeText={setTranscription}
            multiline
            numberOfLines={6}
            style={styles.textInput}
            right={
              transcription ? (
                <TextInput.Icon 
                  icon="close" 
                  onPress={clearTranscription}
                />
              ) : undefined
            }
          />

          <View style={styles.voiceButtonContainer}>
            <IconButton
              icon={isRecording ? "stop" : "microphone"}
              size={48}
              mode="contained"
              iconColor={isRecording ? "#f44336" : "#ffffff"}
              containerColor={isRecording ? "#ffebee" : "#2196f3"}
              onPress={handleVoiceButtonPress}
              style={styles.voiceButton}
            />
            <Paragraph style={styles.voiceButtonLabel}>
              {isRecording ? "Tap to Stop Recording" : "Tap to Start Recording"}
            </Paragraph>
          </View>

          {transcription.length > 0 && (
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                onPress={() => Alert.alert('Submit Report', 'Report submission functionality will be implemented in future stories.')}
                style={styles.submitButton}
                icon="send"
              >
                Submit Report
              </Button>
              <Button
                mode="outlined"
                onPress={clearTranscription}
                style={styles.clearButton}
              >
                Clear
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  card: {
    flex: 1,
    elevation: 4,
    backgroundColor: '#ffffff',
  },
  textInput: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
  },
  voiceButtonContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  voiceButton: {
    marginBottom: 8,
    elevation: 6,
  },
  voiceButtonLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  submitButton: {
    flex: 2,
  },
  clearButton: {
    flex: 1,
  },
});

export default ReportSubmissionScreen;