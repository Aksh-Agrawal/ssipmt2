/**
 * Traffic Service - Google Maps Routes API Integration
 * 
 * This service provides an abstraction layer for the Google Maps Routes API,
 * handling authentication, request formatting, response parsing, and error handling.
 */

// Google Maps Routes API configuration
const ROUTES_API_BASE_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';

/**
 * Get the Google Maps API key from environment variables
 * @throws Error if API key is not configured
 */
function getApiKey(): string {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'Missing required environment variable: GOOGLE_MAPS_API_KEY. ' +
      'Please add it to your .env file.'
    );
  }
  
  return apiKey;
}

/**
 * Simplified traffic data structure returned by the service
 */
export interface TrafficData {
  /** Origin location */
  origin: string;
  /** Destination location */
  destination: string;
  /** Estimated travel time in seconds */
  durationSeconds: number;
  /** Human-readable duration (e.g., "15 mins") */
  durationText: string;
  /** Distance in meters */
  distanceMeters: number;
  /** Human-readable distance (e.g., "5.2 km") */
  distanceText: string;
  /** Traffic condition: TRAFFIC_UNSPECIFIED, CLEAR, MODERATE, HEAVY, SEVERE */
  trafficCondition: string;
  /** Route polyline (encoded) for map display */
  polyline?: string;
}

/**
 * Request parameters for getting traffic data
 */
export interface TrafficRequest {
  /** Origin address or place name */
  origin: string;
  /** Destination address or place name */
  destination: string;
  /** Travel mode: DRIVE, BICYCLE, WALK, TWO_WHEELER, TRANSIT */
  travelMode?: 'DRIVE' | 'BICYCLE' | 'WALK' | 'TWO_WHEELER' | 'TRANSIT';
}

/**
 * Custom error class for traffic service errors
 */
export class TrafficServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'TrafficServiceError';
  }
}

/**
 * Get traffic data between two locations using Google Maps Routes API
 * 
 * @param request - Origin and destination information
 * @returns Simplified traffic data with travel time and conditions
 * @throws TrafficServiceError on API failures or invalid responses
 */
export async function getTrafficData(request: TrafficRequest): Promise<TrafficData> {
  const { origin, destination, travelMode = 'DRIVE' } = request;

  // Validate inputs
  if (!origin || origin.trim() === '') {
    throw new TrafficServiceError('Origin is required and cannot be empty');
  }
  if (!destination || destination.trim() === '') {
    throw new TrafficServiceError('Destination is required and cannot be empty');
  }

  // Get API key (validates it's configured)
  const apiKey = getApiKey();

  try {
    // Construct request body according to Google Maps Routes API spec
    const requestBody = {
      origin: {
        address: origin,
      },
      destination: {
        address: destination,
      },
      travelMode,
      routingPreference: 'TRAFFIC_AWARE', // Get real-time traffic data
      computeAlternativeRoutes: false,
      languageCode: 'en-US',
      units: 'METRIC',
    };

    // Make the API request
    const response = await fetch(ROUTES_API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.steps.trafficCondition',
      },
      body: JSON.stringify(requestBody),
    });

    // Handle HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      throw new TrafficServiceError(
        `Google Maps API request failed: ${response.statusText}`,
        response.status,
        errorText
      );
    }

    // Parse JSON response
    const data = await response.json();

    // Validate response structure
    if (!data.routes || !Array.isArray(data.routes) || data.routes.length === 0) {
      throw new TrafficServiceError(
        'No routes found in API response. Please check the origin and destination addresses.',
        200,
        data
      );
    }

    // Extract the primary route
    const route = data.routes[0];

    // Validate required fields
    if (!route.duration || !route.distanceMeters) {
      throw new TrafficServiceError(
        'Incomplete route data in API response',
        200,
        route
      );
    }

    // Parse duration (format: "123s" or "123.45s")
    const durationSeconds = parseInt(route.duration.replace('s', ''), 10);
    const durationText = formatDuration(durationSeconds);

    // Parse distance
    const distanceMeters = route.distanceMeters;
    const distanceText = formatDistance(distanceMeters);

    // Extract traffic condition from route legs
    let trafficCondition = 'TRAFFIC_UNSPECIFIED';
    if (route.legs && route.legs.length > 0) {
      const leg = route.legs[0];
      if (leg.steps && leg.steps.length > 0) {
        // Find the worst traffic condition in the route
        const conditions = leg.steps
          .map((step: { trafficCondition?: string }) => step.trafficCondition)
          .filter((condition: string | undefined) => condition && condition !== 'TRAFFIC_UNSPECIFIED');
        
        if (conditions.includes('SEVERE')) trafficCondition = 'SEVERE';
        else if (conditions.includes('HEAVY')) trafficCondition = 'HEAVY';
        else if (conditions.includes('MODERATE')) trafficCondition = 'MODERATE';
        else if (conditions.includes('CLEAR')) trafficCondition = 'CLEAR';
      }
    }

    // Extract polyline for map display
    const polyline = route.polyline?.encodedPolyline;

    // Return simplified, consistent data structure
    return {
      origin,
      destination,
      durationSeconds,
      durationText,
      distanceMeters,
      distanceText,
      trafficCondition,
      polyline,
    };
  } catch (error) {
    // Re-throw TrafficServiceError as-is
    if (error instanceof TrafficServiceError) {
      throw error;
    }

    // Wrap network errors and other exceptions
    if (error instanceof Error) {
      throw new TrafficServiceError(
        `Failed to fetch traffic data: ${error.message}`,
        undefined,
        error
      );
    }

    // Handle non-Error exceptions
    throw new TrafficServiceError(
      'An unexpected error occurred while fetching traffic data',
      undefined,
      error
    );
  }
}

/**
 * Format duration in seconds to human-readable text
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "15 mins", "1 hr 30 mins")
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    if (minutes > 0) {
      return `${hours} hr ${minutes} min${minutes !== 1 ? 's' : ''}`;
    }
    return `${hours} hr${hours !== 1 ? 's' : ''}`;
  }

  if (minutes > 0) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  }

  return `${seconds} sec${seconds !== 1 ? 's' : ''}`;
}

/**
 * Format distance in meters to human-readable text
 * @param meters - Distance in meters
 * @returns Formatted string (e.g., "5.2 km", "350 m")
 */
function formatDistance(meters: number): string {
  if (meters >= 1000) {
    const km = (meters / 1000).toFixed(1);
    return `${km} km`;
  }
  return `${meters} m`;
}
