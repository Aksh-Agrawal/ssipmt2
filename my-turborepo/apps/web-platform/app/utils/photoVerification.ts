/**
 * Photo Verification Utility
 * Extracts GPS coordinates from photo EXIF data and validates location
 */

import ExifReader from 'exifreader';

export interface PhotoLocation {
  latitude: number;
  longitude: number;
  timestamp?: Date;
  altitude?: number;
}

export interface PhotoVerificationResult {
  hasGPS: boolean;
  location?: PhotoLocation;
  distance?: number; // Distance in meters from expected location
  isValid: boolean;
  warning?: string;
  exifData?: any;
}

/**
 * Extract GPS coordinates from photo EXIF data
 */
export async function extractPhotoLocation(file: File): Promise<PhotoLocation | null> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const tags = ExifReader.load(arrayBuffer);

    // Check if GPS data exists
    if (!tags.GPSLatitude || !tags.GPSLongitude) {
      return null;
    }

    // Extract latitude
    const latDegrees = tags.GPSLatitude.description;
    const latRefValue = tags.GPSLatitudeRef?.value;
    const latRef = (Array.isArray(latRefValue) ? latRefValue[0] : latRefValue) || 'N';
    const latitude = parseGPSCoordinate(latDegrees, latRef);

    // Extract longitude
    const lonDegrees = tags.GPSLongitude.description;
    const lonRefValue = tags.GPSLongitudeRef?.value;
    const lonRef = (Array.isArray(lonRefValue) ? lonRefValue[0] : lonRefValue) || 'E';
    const longitude = parseGPSCoordinate(lonDegrees, lonRef);

    // Extract timestamp if available
    let timestamp: Date | undefined;
    if (tags.DateTime || tags.DateTimeOriginal) {
      const dateStr = tags.DateTimeOriginal?.description || tags.DateTime?.description;
      if (dateStr) {
        timestamp = parseExifDate(dateStr);
      }
    }

    // Extract altitude if available
    let altitude: number | undefined;
    if (tags.GPSAltitude) {
      altitude = parseFloat(tags.GPSAltitude.description);
    }

    return {
      latitude,
      longitude,
      timestamp,
      altitude,
    };
  } catch (error) {
    console.error('Error extracting photo location:', error);
    return null;
  }
}

/**
 * Parse GPS coordinate from EXIF format to decimal degrees
 */
function parseGPSCoordinate(coordinate: any, ref: any): number {
  const coordStr = String(coordinate);
  const refStr = String(ref);
  
  // Format: "21° 15' 8.4\"" or similar
  const matches = coordStr.match(/(\d+)°\s*(\d+)'\s*([\d.]+)"/);
  
  if (!matches) {
    // Try parsing as decimal
    return parseFloat(coordStr);
  }

  const degrees = parseFloat(matches[1]!);
  const minutes = parseFloat(matches[2]!);
  const seconds = parseFloat(matches[3]!);

  let decimal = degrees + minutes / 60 + seconds / 3600;

  // Apply reference (N/S for latitude, E/W for longitude)
  if (refStr === 'S' || refStr === 'W') {
    decimal = -decimal;
  }

  return decimal;
}

/**
 * Parse EXIF date format to JavaScript Date
 */
function parseExifDate(dateStr: string): Date {
  // Format: "2024:11:07 14:30:00"
  const cleaned = dateStr.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
  return new Date(cleaned);
}

/**
 * Calculate distance between two GPS coordinates (Haversine formula)
 * Returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Verify photo location against expected location
 * @param file - Photo file to verify
 * @param expectedLat - Expected latitude
 * @param expectedLng - Expected longitude
 * @param maxDistanceMeters - Maximum allowed distance in meters (default: 500m)
 * @param maxAgeHours - Maximum allowed photo age in hours (default: 24 hours)
 */
export async function verifyPhotoLocation(
  file: File,
  expectedLat: number,
  expectedLng: number,
  maxDistanceMeters: number = 500,
  maxAgeHours: number = 24
): Promise<PhotoVerificationResult> {
  // Extract location from photo
  const location = await extractPhotoLocation(file);

  // No GPS data in photo
  if (!location) {
    return {
      hasGPS: false,
      isValid: false,
      warning: 'This photo does not contain GPS location data. Please enable location services on your camera.',
    };
  }

  // Calculate distance from expected location
  const distance = calculateDistance(
    location.latitude,
    location.longitude,
    expectedLat,
    expectedLng
  );

  // Check if photo is too old
  let ageWarning: string | undefined;
  if (location.timestamp) {
    const ageHours = (Date.now() - location.timestamp.getTime()) / (1000 * 60 * 60);
    if (ageHours > maxAgeHours) {
      ageWarning = `This photo was taken ${Math.round(ageHours)} hours ago. Please upload a recent photo.`;
    }
    if (ageHours < 0) {
      ageWarning = 'This photo has a future timestamp. Please check your camera settings.';
    }
  }

  // Check if location is within acceptable range
  const isLocationValid = distance <= maxDistanceMeters;
  const distanceKm = (distance / 1000).toFixed(2);

  let warning: string | undefined;
  if (!isLocationValid) {
    warning = `This photo was taken ${distanceKm} km away from the reported location. Please upload a photo from the actual incident location.`;
  } else if (ageWarning) {
    warning = ageWarning;
  }

  return {
    hasGPS: true,
    location,
    distance,
    isValid: isLocationValid && !ageWarning,
    warning,
  };
}

/**
 * Get human-readable warning message
 */
export function getVerificationMessage(result: PhotoVerificationResult): {
  type: 'success' | 'warning' | 'error';
  message: string;
} {
  if (!result.hasGPS) {
    return {
      type: 'error',
      message: result.warning || 'Photo does not contain location data',
    };
  }

  if (result.isValid) {
    return {
      type: 'success',
      message: `✓ Photo verified (${(result.distance! / 1000).toFixed(2)} km from location)`,
    };
  }

  return {
    type: 'warning',
    message: result.warning || 'Photo location verification failed',
  };
}
