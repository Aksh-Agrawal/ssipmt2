import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Platform, Image } from 'react-native';
import { Title, Button, TextInput, Card, Paragraph, IconButton } from 'react-native-paper';
import Voice from '@react-native-community/voice';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import Geolocation from 'react-native-geolocation-service';
import { reportService } from '../../services/reportService';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

interface PhotoData {
  uri: string;
  fileName?: string;
  type?: string;
  fileSize?: number;
}

const ReportSubmissionScreen: React.FC = () => {
  const [transcription, setTranscription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoData | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);

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

  const requestCameraPermission = async () => {
    try {
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.CAMERA 
        : PERMISSIONS.ANDROID.CAMERA;

      const result = await request(permission);
      
      if (result === RESULTS.GRANTED) {
        return true;
      } else {
        Alert.alert(
          'Permission Required',
          'Camera access is required to take photos. Please enable it in your device settings.',
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (error) {
      console.error('Camera permission request error:', error);
      Alert.alert('Error', 'Failed to request camera permission.');
      return false;
    }
  };

  const requestPhotoLibraryPermission = async () => {
    try {
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.PHOTO_LIBRARY 
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;

      const result = await request(permission);
      
      if (result === RESULTS.GRANTED) {
        return true;
      } else {
        Alert.alert(
          'Permission Required',
          'Photo library access is required to select photos. Please enable it in your device settings.',
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (error) {
      console.error('Photo library permission request error:', error);
      Alert.alert('Error', 'Failed to request photo library permission.');
      return false;
    }
  };

  const requestLocationPermission = async () => {
    try {
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE 
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      const result = await request(permission);
      
      if (result === RESULTS.GRANTED) {
        return true;
      } else {
        Alert.alert(
          'Permission Required',
          'Location access is required to geo-tag your photos. Please enable it in your device settings.',
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (error) {
      console.error('Location permission request error:', error);
      Alert.alert('Error', 'Failed to request location permission.');
      return false;
    }
  };

  const getCurrentLocation = async (): Promise<LocationData | null> => {
    const hasLocationPermission = await requestLocationPermission();
    if (!hasLocationPermission) {
      return null;
    }

    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          resolve(locationData);
        },
        (error) => {
          console.error('Location error:', error);
          Alert.alert(
            'Location Error',
            'Unable to get your current location. The photo will be attached without location data.'
          );
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  };

  const handleAttachPhoto = () => {
    Alert.alert(
      'Attach Photo',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: handleTakePhoto,
        },
        {
          text: 'Photo Library',
          onPress: handleSelectFromLibrary,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleTakePhoto = async () => {
    const hasCameraPermission = await requestCameraPermission();
    if (!hasCameraPermission) return;

    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchCamera(options, async (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        if (response.errorMessage) {
          Alert.alert('Error', response.errorMessage);
        }
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (asset.uri) {
          const photoData: PhotoData = {
            uri: asset.uri,
            fileName: asset.fileName,
            type: asset.type,
            fileSize: asset.fileSize,
          };
          
          setSelectedPhoto(photoData);
          
          // Get current location
          const location = await getCurrentLocation();
          setLocationData(location);
        }
      }
    });
  };

  const handleSelectFromLibrary = async () => {
    const hasLibraryPermission = await requestPhotoLibraryPermission();
    if (!hasLibraryPermission) return;

    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, async (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        if (response.errorMessage) {
          Alert.alert('Error', response.errorMessage);
        }
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (asset.uri) {
          const photoData: PhotoData = {
            uri: asset.uri,
            fileName: asset.fileName,
            type: asset.type,
            fileSize: asset.fileSize,
          };
          
          setSelectedPhoto(photoData);
          
          // Get current location
          const location = await getCurrentLocation();
          setLocationData(location);
        }
      }
    });
  };

  const removePhoto = () => {
    setSelectedPhoto(null);
    setLocationData(null);
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
        setTranscription((prev: string) => prev.length > 0 ? `${prev} ${newText}` : newText);
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

  const handleSubmitReport = async () => {
    if (!transcription.trim()) {
      Alert.alert('Error', 'Please add a description before submitting.');
      return;
    }

    try {
      const submissionData = {
        description: transcription.trim(),
        photoUri: selectedPhoto?.uri,
        location: locationData ? {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        } : undefined,
      };

      const result = await reportService.submitReport(submissionData);
      
      Alert.alert(
        'Report Submitted!',
        `Your report has been submitted successfully. Tracking ID: ${result.trackingId}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear the form after successful submission
              setTranscription('');
              setSelectedPhoto(null);
              setLocationData(null);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Report submission error:', error);
      Alert.alert(
        'Submission Failed',
        error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    }
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

          <View style={styles.photoSection}>
            <Button
              mode="outlined"
              onPress={handleAttachPhoto}
              icon="camera"
              style={styles.attachPhotoButton}
            >
              Attach Photo
            </Button>

            {selectedPhoto && (
              <View style={styles.photoContainer}>
                <Image source={{ uri: selectedPhoto.uri }} style={styles.photoThumbnail} />
                <View style={styles.photoInfo}>
                  <Paragraph style={styles.photoFileName}>
                    {selectedPhoto.fileName || 'Photo attached'}
                  </Paragraph>
                  {locationData && (
                    <Paragraph style={styles.locationInfo}>
                      📍 Lat: {locationData.latitude.toFixed(6)}, Lng: {locationData.longitude.toFixed(6)}
                    </Paragraph>
                  )}
                  <Button
                    mode="text"
                    onPress={removePhoto}
                    icon="close"
                    compact
                    style={styles.removePhotoButton}
                  >
                    Remove
                  </Button>
                </View>
              </View>
            )}
          </View>

          {transcription.length > 0 && (
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                onPress={handleSubmitReport}
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
  photoSection: {
    marginBottom: 24,
  },
  attachPhotoButton: {
    marginBottom: 16,
  },
  photoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  photoThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  photoInfo: {
    flex: 1,
  },
  photoFileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  locationInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  removePhotoButton: {
    alignSelf: 'flex-start',
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