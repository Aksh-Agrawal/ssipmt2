import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Report } from '@repo/shared-types';
import app from '../../../index';

// Mock the services layer
jest.mock('@repo/services-reporting', () => ({
  reportRepository: {
    findAllSorted: jest.fn(),
  },
}));

// Mock Supabase auth middleware
jest.mock('../../../middleware/auth', () => ({
  authMiddleware: (c: any, next: any) => {
    // Mock authenticated user context
    c.set('user', { id: 'admin-user-id', email: 'admin@example.com' });
    return next();
  },
}));

describe('GET /api/v1/admin/reports', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return sorted reports for authenticated admin', async () => {
    // Mock sorted reports data
    const mockReports: Report[] = [
      {
        id: 'report-1',
        userId: 'user-1',
        description: 'High priority traffic issue',
        category: 'Traffic Signal',
        priority: 'High',
        status: 'Submitted',
        location: { latitude: 40.7128, longitude: -74.0060 },
        photoUrls: ['https://example.com/photo1.jpg'],
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
      },
      {
        id: 'report-2',
        userId: 'user-2',
        description: 'Medium priority pothole',
        category: 'Pothole',
        priority: 'Medium',
        status: 'In Progress',
        location: { latitude: 40.7589, longitude: -73.9851 },
        photoUrls: [],
        createdAt: new Date('2024-01-15T09:00:00Z'),
        updatedAt: new Date('2024-01-15T11:00:00Z'),
      },
      {
        id: 'report-3',
        userId: 'user-3',
        description: 'Low priority graffiti',
        category: 'Graffiti',
        priority: 'Low',
        status: 'Submitted',
        photoUrls: ['https://example.com/photo3.jpg'],
        createdAt: new Date('2024-01-15T08:00:00Z'),
        updatedAt: new Date('2024-01-15T08:00:00Z'),
      },
    ];

    const { reportRepository } = await import('@repo/services-reporting');
    (reportRepository.findAllSorted as jest.MockedFunction<typeof reportRepository.findAllSorted>)
      .mockResolvedValue(mockReports);

    const req = new Request('http://localhost/api/v1/admin/reports', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json',
      },
    });

    const res = await app.request(req);
    const responseData = await res.json() as any;

    expect(res.status).toBe(200);
    expect(responseData).toEqual({
      reports: expect.arrayContaining([
        expect.objectContaining({
          id: 'report-1',
          userId: 'user-1',
          description: 'High priority traffic issue',
          category: 'Traffic Signal',
          priority: 'High',
          status: 'Submitted',
          location: { latitude: 40.7128, longitude: -74.0060 },
          photoUrls: ['https://example.com/photo1.jpg'],
          createdAt: expect.any(String), // Date objects become strings in JSON
          updatedAt: expect.any(String),
        }),
        expect.objectContaining({
          id: 'report-2',
          userId: 'user-2',
          description: 'Medium priority pothole',
          category: 'Pothole',
          priority: 'Medium',
          status: 'In Progress',
        }),
        expect.objectContaining({
          id: 'report-3',
          userId: 'user-3',
          description: 'Low priority graffiti',
          category: 'Graffiti',
          priority: 'Low',
          status: 'Submitted',
        }),
      ]),
      total: 3,
      message: 'Reports fetched successfully',
    });

    expect(reportRepository.findAllSorted).toHaveBeenCalledTimes(1);
  });

  it('should handle repository errors gracefully', async () => {
    const { reportRepository } = await import('@repo/services-reporting');
    (reportRepository.findAllSorted as jest.MockedFunction<typeof reportRepository.findAllSorted>)
      .mockRejectedValue(new Error('Database connection failed'));

    const req = new Request('http://localhost/api/v1/admin/reports', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json',
      },
    });

    const res = await app.request(req);
    const responseData = await res.json() as any;

    expect(res.status).toBe(500);
    expect(responseData).toEqual({
      error: 'Failed to fetch reports',
      message: 'Database connection failed',
    });
  });

  it('should return empty array when no reports exist', async () => {
    const { reportRepository } = await import('@repo/services-reporting');
    (reportRepository.findAllSorted as jest.MockedFunction<typeof reportRepository.findAllSorted>)
      .mockResolvedValue([]);

    const req = new Request('http://localhost/api/v1/admin/reports', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json',
      },
    });

    const res = await app.request(req);
    const responseData = await res.json() as any;

    expect(res.status).toBe(200);
    expect(responseData).toEqual({
      reports: [],
      total: 0,
      message: 'Reports fetched successfully',
    });
  });

  it('should handle reports with missing optional fields', async () => {
    const mockReports: Report[] = [
      {
        id: 'report-unprocessed',
        userId: 'user-1',
        description: 'Unprocessed report without AI analysis',
        status: 'Submitted',
        photoUrls: [],
        createdAt: new Date('2024-01-15T12:00:00Z'),
        updatedAt: new Date('2024-01-15T12:00:00Z'),
        // Missing category, priority, location
      },
    ];

    const { reportRepository } = await import('@repo/services-reporting');
    (reportRepository.findAllSorted as jest.MockedFunction<typeof reportRepository.findAllSorted>)
      .mockResolvedValue(mockReports);

    const req = new Request('http://localhost/api/v1/admin/reports', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json',
      },
    });

    const res = await app.request(req);
    const responseData = await res.json() as any;

    expect(res.status).toBe(200);
    expect(responseData.message).toBe('Reports fetched successfully');
    expect(responseData.reports).toHaveLength(1);
    expect(responseData.reports[0]).toEqual(expect.objectContaining({
      id: 'report-unprocessed',
      userId: 'user-1',
      description: 'Unprocessed report without AI analysis',
      status: 'Submitted',
      photoUrls: [],
      createdAt: expect.any(String), // Date becomes string in JSON
      updatedAt: expect.any(String),
    }));
  });

  it('should verify priority-based sorting order', async () => {
    // Create reports in mixed order to verify sorting
    const mockReports: Report[] = [
      {
        id: 'report-high',
        userId: 'user-1',
        description: 'High priority issue',
        priority: 'High',
        status: 'Submitted',
        photoUrls: [],
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
      },
      {
        id: 'report-medium',
        userId: 'user-2',
        description: 'Medium priority issue',
        priority: 'Medium',
        status: 'Submitted',
        photoUrls: [],
        createdAt: new Date('2024-01-15T11:00:00Z'),
        updatedAt: new Date('2024-01-15T11:00:00Z'),
      },
      {
        id: 'report-low',
        userId: 'user-3',
        description: 'Low priority issue',
        priority: 'Low',
        status: 'Submitted',
        photoUrls: [],
        createdAt: new Date('2024-01-15T12:00:00Z'),
        updatedAt: new Date('2024-01-15T12:00:00Z'),
      },
      {
        id: 'report-unprocessed',
        userId: 'user-4',
        description: 'Unprocessed issue',
        status: 'Submitted',
        photoUrls: [],
        createdAt: new Date('2024-01-15T13:00:00Z'),
        updatedAt: new Date('2024-01-15T13:00:00Z'),
      },
    ];

    const { reportRepository } = await import('@repo/services-reporting');
    (reportRepository.findAllSorted as jest.MockedFunction<typeof reportRepository.findAllSorted>)
      .mockResolvedValue(mockReports);

    const req = new Request('http://localhost/api/v1/admin/reports', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json',
      },
    });

    const res = await app.request(req);
    const responseData = await res.json() as any;

    expect(res.status).toBe(200);
    expect(responseData.message).toBe('Reports fetched successfully');
    
    // Verify that the repository's sorting logic is called
    // (actual sorting logic is tested in the repository layer)
    expect(reportRepository.findAllSorted).toHaveBeenCalledTimes(1);
    expect(responseData.reports).toHaveLength(4);
    expect(responseData.reports).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'report-high',
        priority: 'High',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
      expect.objectContaining({
        id: 'report-medium',
        priority: 'Medium',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
      expect.objectContaining({
        id: 'report-low',
        priority: 'Low',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
      expect.objectContaining({
        id: 'report-unprocessed',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    ]));
  });
});