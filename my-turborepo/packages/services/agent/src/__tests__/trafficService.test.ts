/**
 * Integration tests for Traffic Service
 * Uses nock to mock HTTP requests to Google Maps Routes API
 */

import nock from 'nock';
import { getTrafficData, TrafficServiceError } from '../trafficService.js';

describe('trafficService', () => {
  const ROUTES_API_BASE_URL = 'https://routes.googleapis.com';
  const ROUTES_API_PATH = '/directions/v2:computeRoutes';

  // Store original env var
  const originalEnv = process.env.GOOGLE_MAPS_API_KEY;

  beforeAll(() => {
    // Set mock API key for tests
    process.env.GOOGLE_MAPS_API_KEY = 'test-api-key-12345';
  });

  afterAll(() => {
    // Restore original env var
    process.env.GOOGLE_MAPS_API_KEY = originalEnv;
  });

  afterEach(() => {
    // Clean up any pending nock interceptors
    nock.cleanAll();
  });

  describe('getTrafficData', () => {
    it('should successfully fetch and parse traffic data', async () => {
      // Mock successful API response
      const mockResponse = {
        routes: [
          {
            duration: '1234s',
            distanceMeters: 5200,
            polyline: {
              encodedPolyline: 'encoded_polyline_string_here',
            },
            legs: [
              {
                steps: [
                  { trafficCondition: 'CLEAR' },
                  { trafficCondition: 'MODERATE' },
                ],
              },
            ],
          },
        ],
      };

      nock(ROUTES_API_BASE_URL)
        .post(ROUTES_API_PATH)
        .reply(200, mockResponse);

      const result = await getTrafficData({
        origin: 'San Francisco, CA',
        destination: 'Oakland, CA',
      });

      expect(result).toEqual({
        origin: 'San Francisco, CA',
        destination: 'Oakland, CA',
        durationSeconds: 1234,
        durationText: '20 mins',
        distanceMeters: 5200,
        distanceText: '5.2 km',
        trafficCondition: 'MODERATE',
        polyline: 'encoded_polyline_string_here',
      });
    });

    it('should use DRIVE as default travel mode', async () => {
      const mockResponse = {
        routes: [
          {
            duration: '600s',
            distanceMeters: 3000,
            legs: [{ steps: [{ trafficCondition: 'CLEAR' }] }],
          },
        ],
      };

      const scope = nock(ROUTES_API_BASE_URL)
        .post(ROUTES_API_PATH, (body) => {
          return body.travelMode === 'DRIVE';
        })
        .reply(200, mockResponse);

      await getTrafficData({
        origin: 'Point A',
        destination: 'Point B',
      });

      expect(scope.isDone()).toBe(true);
    });

    it('should accept custom travel mode', async () => {
      const mockResponse = {
        routes: [
          {
            duration: '1800s',
            distanceMeters: 2500,
            legs: [{ steps: [] }],
          },
        ],
      };

      const scope = nock(ROUTES_API_BASE_URL)
        .post(ROUTES_API_PATH, (body) => {
          return body.travelMode === 'BICYCLE';
        })
        .reply(200, mockResponse);

      await getTrafficData({
        origin: 'Point A',
        destination: 'Point B',
        travelMode: 'BICYCLE',
      });

      expect(scope.isDone()).toBe(true);
    });

    it('should format duration correctly for hours and minutes', async () => {
      const mockResponse = {
        routes: [
          {
            duration: '5430s', // 1 hour 30 minutes 30 seconds
            distanceMeters: 45000,
            legs: [{ steps: [] }],
          },
        ],
      };

      nock(ROUTES_API_BASE_URL)
        .post(ROUTES_API_PATH)
        .reply(200, mockResponse);

      const result = await getTrafficData({
        origin: 'City A',
        destination: 'City B',
      });

      expect(result.durationText).toBe('1 hr 30 mins');
    });

    it('should format distance correctly for meters', async () => {
      const mockResponse = {
        routes: [
          {
            duration: '300s',
            distanceMeters: 850,
            legs: [{ steps: [] }],
          },
        ],
      };

      nock(ROUTES_API_BASE_URL)
        .post(ROUTES_API_PATH)
        .reply(200, mockResponse);

      const result = await getTrafficData({
        origin: 'Point A',
        destination: 'Point B',
      });

      expect(result.distanceText).toBe('850 m');
    });

    it('should determine worst traffic condition from route steps', async () => {
      const mockResponse = {
        routes: [
          {
            duration: '2000s',
            distanceMeters: 10000,
            legs: [
              {
                steps: [
                  { trafficCondition: 'CLEAR' },
                  { trafficCondition: 'MODERATE' },
                  { trafficCondition: 'HEAVY' },
                  { trafficCondition: 'MODERATE' },
                ],
              },
            ],
          },
        ],
      };

      nock(ROUTES_API_BASE_URL)
        .post(ROUTES_API_PATH)
        .reply(200, mockResponse);

      const result = await getTrafficData({
        origin: 'Start',
        destination: 'End',
      });

      expect(result.trafficCondition).toBe('HEAVY');
    });

    it('should identify SEVERE traffic as worst condition', async () => {
      const mockResponse = {
        routes: [
          {
            duration: '3000s',
            distanceMeters: 8000,
            legs: [
              {
                steps: [
                  { trafficCondition: 'MODERATE' },
                  { trafficCondition: 'SEVERE' },
                  { trafficCondition: 'HEAVY' },
                ],
              },
            ],
          },
        ],
      };

      nock(ROUTES_API_BASE_URL)
        .post(ROUTES_API_PATH)
        .reply(200, mockResponse);

      const result = await getTrafficData({
        origin: 'Start',
        destination: 'End',
      });

      expect(result.trafficCondition).toBe('SEVERE');
    });

    it('should default to TRAFFIC_UNSPECIFIED when no traffic data available', async () => {
      const mockResponse = {
        routes: [
          {
            duration: '1000s',
            distanceMeters: 5000,
            legs: [{ steps: [] }],
          },
        ],
      };

      nock(ROUTES_API_BASE_URL)
        .post(ROUTES_API_PATH)
        .reply(200, mockResponse);

      const result = await getTrafficData({
        origin: 'Start',
        destination: 'End',
      });

      expect(result.trafficCondition).toBe('TRAFFIC_UNSPECIFIED');
    });

    it('should throw error when origin is empty', async () => {
      await expect(
        getTrafficData({
          origin: '',
          destination: 'Some Destination',
        })
      ).rejects.toThrow(TrafficServiceError);

      await expect(
        getTrafficData({
          origin: '   ',
          destination: 'Some Destination',
        })
      ).rejects.toThrow('Origin is required and cannot be empty');
    });

    it('should throw error when destination is empty', async () => {
      await expect(
        getTrafficData({
          origin: 'Some Origin',
          destination: '',
        })
      ).rejects.toThrow(TrafficServiceError);

      await expect(
        getTrafficData({
          origin: 'Some Origin',
          destination: '   ',
        })
      ).rejects.toThrow('Destination is required and cannot be empty');
    });

    it('should handle HTTP 400 error from API', async () => {
      nock(ROUTES_API_BASE_URL)
        .post(ROUTES_API_PATH)
        .reply(400, { error: { message: 'Invalid request' } });

      await expect(
        getTrafficData({
          origin: 'Invalid Origin',
          destination: 'Invalid Destination',
        })
      ).rejects.toThrow(TrafficServiceError);

      try {
        await getTrafficData({
          origin: 'Invalid Origin',
          destination: 'Invalid Destination',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(TrafficServiceError);
        expect((error as TrafficServiceError).statusCode).toBe(400);
        expect((error as TrafficServiceError).message).toContain('Bad Request');
      }
    });

    it('should handle HTTP 401 unauthorized error', async () => {
      nock(ROUTES_API_BASE_URL)
        .post(ROUTES_API_PATH)
        .reply(401, { error: { message: 'Invalid API key' } });

      await expect(
        getTrafficData({
          origin: 'Point A',
          destination: 'Point B',
        })
      ).rejects.toThrow(TrafficServiceError);

      try {
        await getTrafficData({
          origin: 'Point A',
          destination: 'Point B',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(TrafficServiceError);
        expect((error as TrafficServiceError).statusCode).toBe(401);
      }
    });

    it('should handle HTTP 429 rate limit error', async () => {
      nock(ROUTES_API_BASE_URL)
        .post(ROUTES_API_PATH)
        .reply(429, { error: { message: 'Rate limit exceeded' } });

      await expect(
        getTrafficData({
          origin: 'Point A',
          destination: 'Point B',
        })
      ).rejects.toThrow(TrafficServiceError);

      try {
        await getTrafficData({
          origin: 'Point A',
          destination: 'Point B',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(TrafficServiceError);
        expect((error as TrafficServiceError).statusCode).toBe(429);
      }
    });

    it('should handle HTTP 500 server error', async () => {
      nock(ROUTES_API_BASE_URL)
        .post(ROUTES_API_PATH)
        .reply(500, { error: { message: 'Internal server error' } });

      await expect(
        getTrafficData({
          origin: 'Point A',
          destination: 'Point B',
        })
      ).rejects.toThrow(TrafficServiceError);

      try {
        await getTrafficData({
          origin: 'Point A',
          destination: 'Point B',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(TrafficServiceError);
        expect((error as TrafficServiceError).statusCode).toBe(500);
      }
    });

    it('should handle empty routes array in response', async () => {
      const mockResponse = {
        routes: [],
      };

      nock(ROUTES_API_BASE_URL)
        .post(ROUTES_API_PATH)
        .reply(200, mockResponse);

      await expect(
        getTrafficData({
          origin: 'Point A',
          destination: 'Point B',
        })
      ).rejects.toThrow('No routes found in API response');
    });

    it('should handle missing routes field in response', async () => {
      const mockResponse = {
        someOtherField: 'data',
      };

      nock(ROUTES_API_BASE_URL)
        .post(ROUTES_API_PATH)
        .reply(200, mockResponse);

      await expect(
        getTrafficData({
          origin: 'Point A',
          destination: 'Point B',
        })
      ).rejects.toThrow('No routes found in API response');
    });

    it('should handle incomplete route data (missing duration)', async () => {
      const mockResponse = {
        routes: [
          {
            distanceMeters: 5000,
            // duration is missing
          },
        ],
      };

      nock(ROUTES_API_BASE_URL)
        .post(ROUTES_API_PATH)
        .reply(200, mockResponse);

      await expect(
        getTrafficData({
          origin: 'Point A',
          destination: 'Point B',
        })
      ).rejects.toThrow('Incomplete route data in API response');
    });

    it('should handle incomplete route data (missing distance)', async () => {
      const mockResponse = {
        routes: [
          {
            duration: '1000s',
            // distanceMeters is missing
          },
        ],
      };

      nock(ROUTES_API_BASE_URL)
        .post(ROUTES_API_PATH)
        .reply(200, mockResponse);

      await expect(
        getTrafficData({
          origin: 'Point A',
          destination: 'Point B',
        })
      ).rejects.toThrow('Incomplete route data in API response');
    });

    it('should handle network errors', async () => {
      nock(ROUTES_API_BASE_URL)
        .post(ROUTES_API_PATH)
        .replyWithError('Network error occurred');

      await expect(
        getTrafficData({
          origin: 'Point A',
          destination: 'Point B',
        })
      ).rejects.toThrow('Failed to fetch traffic data');
    });

    it('should send correct request headers', async () => {
      const mockResponse = {
        routes: [
          {
            duration: '500s',
            distanceMeters: 2000,
            legs: [{ steps: [] }],
          },
        ],
      };

      const scope = nock(ROUTES_API_BASE_URL, {
        reqheaders: {
          'content-type': 'application/json',
          'x-goog-api-key': 'test-api-key-12345',
          'x-goog-fieldmask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.steps.trafficCondition',
        },
      })
        .post(ROUTES_API_PATH)
        .reply(200, mockResponse);

      await getTrafficData({
        origin: 'Point A',
        destination: 'Point B',
      });

      expect(scope.isDone()).toBe(true);
    });

    it('should include polyline when available in response', async () => {
      const mockResponse = {
        routes: [
          {
            duration: '800s',
            distanceMeters: 4000,
            polyline: {
              encodedPolyline: 'test_polyline_encoded_string',
            },
            legs: [{ steps: [] }],
          },
        ],
      };

      nock(ROUTES_API_BASE_URL)
        .post(ROUTES_API_PATH)
        .reply(200, mockResponse);

      const result = await getTrafficData({
        origin: 'Point A',
        destination: 'Point B',
      });

      expect(result.polyline).toBe('test_polyline_encoded_string');
    });

    it('should handle missing polyline gracefully', async () => {
      const mockResponse = {
        routes: [
          {
            duration: '800s',
            distanceMeters: 4000,
            legs: [{ steps: [] }],
            // polyline is missing
          },
        ],
      };

      nock(ROUTES_API_BASE_URL)
        .post(ROUTES_API_PATH)
        .reply(200, mockResponse);

      const result = await getTrafficData({
        origin: 'Point A',
        destination: 'Point B',
      });

      expect(result.polyline).toBeUndefined();
    });
  });
});
