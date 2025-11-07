'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Alert,
  AlertTitle,
  Typography,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  LocationOn,
  Schedule,
} from '@mui/icons-material';
import { verifyPhotoLocation, getVerificationMessage, PhotoVerificationResult } from '../utils/photoVerification';

interface PhotoVerifierProps {
  file: File;
  expectedLatitude: number;
  expectedLongitude: number;
  maxDistanceMeters?: number;
  maxAgeHours?: number;
  onVerificationComplete?: (result: PhotoVerificationResult) => void;
}

export default function PhotoVerifier({
  file,
  expectedLatitude,
  expectedLongitude,
  maxDistanceMeters = 500,
  maxAgeHours = 24,
  onVerificationComplete,
}: PhotoVerifierProps) {
  const [isVerifying, setIsVerifying] = useState(true);
  const [result, setResult] = useState<PhotoVerificationResult | null>(null);

  useEffect(() => {
    verifyPhoto();
  }, [file, expectedLatitude, expectedLongitude]);

  const verifyPhoto = async () => {
    setIsVerifying(true);
    try {
      const verificationResult = await verifyPhotoLocation(
        file,
        expectedLatitude,
        expectedLongitude,
        maxDistanceMeters,
        maxAgeHours
      );
      setResult(verificationResult);
      onVerificationComplete?.(verificationResult);
    } catch (error) {
      console.error('Error verifying photo:', error);
      setResult({
        hasGPS: false,
        isValid: false,
        warning: 'Failed to verify photo. Please try again.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Verifying photo location...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (!result) {
    return null;
  }

  const message = getVerificationMessage(result);
  const severity = message.type === 'success' ? 'success' : message.type === 'warning' ? 'warning' : 'error';
  const Icon = message.type === 'success' ? CheckCircle : message.type === 'warning' ? Warning : ErrorIcon;

  return (
    <Alert 
      severity={severity}
      icon={<Icon />}
      sx={{ mt: 2 }}
    >
      <AlertTitle>
        {message.type === 'success' ? 'Photo Verified' : 
         message.type === 'warning' ? 'Verification Warning' : 
         'Verification Failed'}
      </AlertTitle>
      <Typography variant="body2" gutterBottom>
        {message.message}
      </Typography>

      {result.hasGPS && result.location && (
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn fontSize="small" />
            <Typography variant="caption">
              Photo taken at: {result.location.latitude.toFixed(6)}, {result.location.longitude.toFixed(6)}
            </Typography>
          </Box>

          {result.location.timestamp && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Schedule fontSize="small" />
              <Typography variant="caption">
                Taken: {result.location.timestamp.toLocaleString()}
              </Typography>
            </Box>
          )}

          {result.distance !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label={`${(result.distance / 1000).toFixed(2)} km from location`}
                size="small"
                color={result.isValid ? 'success' : 'warning'}
                sx={{ fontSize: '0.7rem' }}
              />
            </Box>
          )}
        </Box>
      )}

      {!result.hasGPS && (
        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
          💡 Tip: Enable location services on your camera app to help verify your reports.
        </Typography>
      )}
    </Alert>
  );
}
