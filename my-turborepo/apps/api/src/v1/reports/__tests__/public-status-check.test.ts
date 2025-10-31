import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import app from '../../../index';

// Mock the reportRepository
jest.mock('@repo/services-reporting', () => ({
  submitReport: jest.fn(),
  reportRepository: {
    findByIdPublic: jest.fn(),
  },
}));

describe('GET /api/v1/reports/:id (Public Status Check)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return report status for valid tracking ID', async () => {
    const mockReport = {
      id: 'test-123',
      status: 'In Progress',
      updatedAt: new Date('2024-01-15T10:30:00Z'),
    };

    const { reportRepository } = await import('@repo/services-reporting');
    (reportRepository.findByIdPublic as jest.MockedFunction<typeof reportRepository.findByIdPublic>)
      .mockResolvedValue(mockReport);

    const req = new Request('http://localhost/api/v1/reports/test-123', {
      method: 'GET',
    });

    const response = await app.request(req);
    expect(response.status).toBe(200);
    
    const responseData = await response.json() as any;
    expect(responseData).toEqual({
      success: true,
      data: {
        id: 'test-123',
        status: 'In Progress',
        updatedAt: '2024-01-15T10:30:00.000Z', // JSON serializes Date as string
      },
    });

    expect(reportRepository.findByIdPublic).toHaveBeenCalledWith('test-123');
  });

  it('should return 404 for non-existent tracking ID', async () => {
    const { reportRepository } = await import('@repo/services-reporting');
    (reportRepository.findByIdPublic as jest.MockedFunction<typeof reportRepository.findByIdPublic>)
      .mockResolvedValue(null);

    const req = new Request('http://localhost/api/v1/reports/invalid-123', {
      method: 'GET',
    });

    const response = await app.request(req);
    expect(response.status).toBe(404);
    
    const responseData = await response.json() as any;
    expect(responseData).toEqual({
      success: false,
      error: 'Report not found',
    });

    expect(reportRepository.findByIdPublic).toHaveBeenCalledWith('invalid-123');
  });

  it('should handle database errors gracefully', async () => {
    const { reportRepository } = await import('@repo/services-reporting');
    (reportRepository.findByIdPublic as jest.MockedFunction<typeof reportRepository.findByIdPublic>)
      .mockRejectedValue(new Error('Database connection failed'));

    const req = new Request('http://localhost/api/v1/reports/test-123', {
      method: 'GET',
    });

    const response = await app.request(req);
    expect(response.status).toBe(500);
    
    const responseData = await response.json() as any;
    expect(responseData).toEqual({
      success: false,
      error: 'Internal server error',
    });

    expect(reportRepository.findByIdPublic).toHaveBeenCalledWith('test-123');
  });

  it('should accept UUIDs and other ID formats', async () => {
    const mockReport = {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      status: 'Resolved',
      updatedAt: new Date('2024-01-15T10:30:00Z'),
    };

    const { reportRepository } = await import('@repo/services-reporting');
    (reportRepository.findByIdPublic as jest.MockedFunction<typeof reportRepository.findByIdPublic>)
      .mockResolvedValue(mockReport);

    const req = new Request('http://localhost/api/v1/reports/f47ac10b-58cc-4372-a567-0e02b2c3d479', {
      method: 'GET',
    });

    const response = await app.request(req);
    expect(response.status).toBe(200);
    
    const responseData = await response.json() as any;
    expect(responseData.success).toBe(true);
    expect(responseData.data.id).toBe('f47ac10b-58cc-4372-a567-0e02b2c3d479');
    expect(responseData.data.status).toBe('Resolved');

    expect(reportRepository.findByIdPublic).toHaveBeenCalledWith('f47ac10b-58cc-4372-a567-0e02b2c3d479');
  });

  it('should only expose safe fields (id, status, updatedAt)', async () => {
    const mockReport = {
      id: 'test-123',
      status: 'Submitted',
      updatedAt: new Date('2024-01-15T10:30:00Z'),
    };

    const { reportRepository } = await import('@repo/services-reporting');
    (reportRepository.findByIdPublic as jest.MockedFunction<typeof reportRepository.findByIdPublic>)
      .mockResolvedValue(mockReport);

    const req = new Request('http://localhost/api/v1/reports/test-123', {
      method: 'GET',
    });

    const response = await app.request(req);
    expect(response.status).toBe(200);
    
    const responseData = await response.json() as any;
    
    // Should only contain the safe fields
    expect(Object.keys(responseData.data)).toEqual(['id', 'status', 'updatedAt']);
    
    // Should not contain sensitive fields like description, location, photos, etc.
    expect(responseData.data).not.toHaveProperty('description');
    expect(responseData.data).not.toHaveProperty('location');
    expect(responseData.data).not.toHaveProperty('photoUrl');
    expect(responseData.data).not.toHaveProperty('createdAt');
    expect(responseData.data).not.toHaveProperty('updatedBy');
  });

  it('should handle different status values correctly', async () => {
    const statuses = ['Submitted', 'In Progress', 'Resolved', 'Closed'];
    
    for (const status of statuses) {
      const mockReport = {
        id: `test-${status.toLowerCase().replace(' ', '-')}`,
        status,
        updatedAt: new Date(),
      };

      const { reportRepository } = await import('@repo/services-reporting');
      (reportRepository.findByIdPublic as jest.MockedFunction<typeof reportRepository.findByIdPublic>)
        .mockResolvedValue(mockReport);

      const req = new Request(`http://localhost/api/v1/reports/${mockReport.id}`, {
        method: 'GET',
      });

      const response = await app.request(req);
      expect(response.status).toBe(200);
      
      const responseData = await response.json() as any;
      expect(responseData.data.status).toBe(status);
    }
  });
});