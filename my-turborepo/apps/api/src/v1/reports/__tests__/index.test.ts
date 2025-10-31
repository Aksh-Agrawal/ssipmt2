import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Report } from '@repo/shared-types';
import app from '../../../index';

// Mock the services layer
jest.mock('@repo/services-reporting', () => ({
  submitReport: jest.fn(),
}));

describe('POST /api/v1/reports', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new report with valid payload', async () => {
    // Mock the submitReport service
    const mockReport: Report = {
      id: 'test-tracking-id',
      userId: '',
      description: 'Pothole on Main Street',
      status: 'pending' as const,
      location: { latitude: 40.7128, longitude: -74.0060 },
      photoUrls: ['https://example.com/photo.jpg'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { submitReport } = await import('@repo/services-reporting');
    (submitReport as jest.MockedFunction<typeof submitReport>).mockResolvedValue(mockReport);

    const payload = {
      description: 'Pothole on Main Street',
      photoUrl: 'https://example.com/photo.jpg',
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
      },
    };

    // Use Hono's testing capabilities
    const req = new Request('http://localhost/api/v1/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const res = await app.request(req);
    const responseData = await res.json();

    expect(res.status).toBe(201);
    expect(responseData).toEqual({
      trackingId: 'test-tracking-id',
      message: 'Report submitted successfully',
    });

    expect(submitReport).toHaveBeenCalledWith({
      description: 'Pothole on Main Street',
      photoUrl: 'https://example.com/photo.jpg',
      location: { latitude: 40.7128, longitude: -74.0060 },
    });
  });

  it('should return 400 for invalid payload', async () => {
    const invalidPayload = {
      description: '', // Invalid: empty description
      photoUrl: 'invalid-url', // Invalid: not a valid URL
    };

    const req = new Request('http://localhost/api/v1/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload),
    });

    const res = await app.request(req);
    const responseData = await res.json();

    expect(res.status).toBe(400);
    expect(responseData).toHaveProperty('error');
  });

  it('should return 400 for missing description', async () => {
    const payload = {
      photoUrl: 'https://example.com/photo.jpg',
      location: { latitude: 40.7128, longitude: -74.0060 },
    };

    const req = new Request('http://localhost/api/v1/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const res = await app.request(req);

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid location coordinates', async () => {
    const payload = {
      description: 'Valid description',
      location: {
        latitude: 91, // Invalid: > 90
        longitude: -74.0060,
      },
    };

    const req = new Request('http://localhost/api/v1/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const res = await app.request(req);

    expect(res.status).toBe(400);
  });

  it('should handle service errors gracefully', async () => {
    const { submitReport } = await import('@repo/services-reporting');
    (submitReport as jest.MockedFunction<typeof submitReport>).mockRejectedValue(
      new Error('Database connection failed')
    );

    const payload = {
      description: 'Pothole on Main Street',
      photoUrl: 'https://example.com/photo.jpg',
      location: { latitude: 40.7128, longitude: -74.0060 },
    };

    const req = new Request('http://localhost/api/v1/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const res = await app.request(req);
    const responseData = await res.json();

    expect(res.status).toBe(500);
    expect(responseData).toEqual({
      error: 'Internal server error',
    });
  });

  it('should accept report without optional fields', async () => {
    const mockReport: Report = {
      id: 'test-tracking-id',
      userId: '',
      description: 'Simple report',
      status: 'pending' as const,
      photoUrls: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { submitReport } = await import('@repo/services-reporting');
    (submitReport as jest.MockedFunction<typeof submitReport>).mockResolvedValue(mockReport);

    const payload = {
      description: 'Simple report',
    };

    const req = new Request('http://localhost/api/v1/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const res = await app.request(req);
    const responseData = await res.json();

    expect(res.status).toBe(201);
    expect(responseData).toEqual({
      trackingId: 'test-tracking-id',
      message: 'Report submitted successfully',
    });

    expect(submitReport).toHaveBeenCalledWith({
      description: 'Simple report',
      photoUrl: undefined,
      location: undefined,
    });
  });
});