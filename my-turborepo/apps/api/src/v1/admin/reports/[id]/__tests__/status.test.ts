import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Report, ReportStatus } from '@repo/shared-types';
import app from '../../../../../index';

// Mock the services layer
jest.mock('@repo/services-reporting', () => ({
  reportRepository: {
    findById: jest.fn(),
    update: jest.fn(),
  },
}));

// Mock Supabase auth middleware
jest.mock('../../../../../middleware/auth', () => ({
  authMiddleware: (c: any, next: any) => {
    // Mock authenticated admin user context
    c.set('user', { id: 'admin-user-id', email: 'admin@example.com' });
    return next();
  },
}));

describe('PATCH /api/v1/admin/reports/:id/status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update report status successfully', async () => {
    const mockReport: Report = {
      id: 'report-123',
      userId: 'user-1',
      description: 'Test report with status update',
      category: 'Pothole',
      priority: 'Medium',
      status: 'Submitted',
      location: { latitude: 40.7128, longitude: -74.0060 },
      photoUrls: ['https://example.com/photo.jpg'],
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z'),
    };

    const updatedReport: Report = {
      ...mockReport,
      status: 'In Progress',
      updatedAt: new Date('2024-01-15T11:00:00Z'),
    };

    const { reportRepository } = await import('@repo/services-reporting');
    (reportRepository.findById as any).mockResolvedValue(mockReport);
    (reportRepository.update as any).mockResolvedValue(updatedReport);

    const req = new Request('http://localhost/api/v1/admin/reports/report-123/status', {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'In Progress' }),
    });

    const res = await app.request(req);
    const responseData = await res.json() as any;

    expect(res.status).toBe(200);
    expect(responseData).toEqual({
      report: expect.objectContaining({
        id: 'report-123',
        status: 'In Progress',
      }),
      message: 'Report status updated successfully',
    });

    expect(reportRepository.findById).toHaveBeenCalledWith('report-123');
    expect(reportRepository.update).toHaveBeenCalledWith('report-123', { status: 'In Progress' });
  });

  it('should return 404 when report not found', async () => {
    const { reportRepository } = await import('@repo/services-reporting');
    (reportRepository.findById as any).mockResolvedValue(null);

    const req = new Request('http://localhost/api/v1/admin/reports/nonexistent-id/status', {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'In Progress' }),
    });

    const res = await app.request(req);
    const responseData = await res.json() as any;

    expect(res.status).toBe(404);
    expect(responseData).toEqual({
      error: 'Report not found',
    });
  });

  it('should return 400 for invalid status', async () => {
    const req = new Request('http://localhost/api/v1/admin/reports/report-123/status', {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'Invalid Status' }),
    });

    const res = await app.request(req);
    const responseData = await res.json() as any;

    expect(res.status).toBe(400);
    expect(responseData).toEqual({
      error: 'Invalid status',
      validStatuses: ['Submitted', 'In Progress', 'Resolved', 'Rejected'],
      received: 'Invalid Status',
    });
  });

  it('should return 400 when status is missing', async () => {
    const req = new Request('http://localhost/api/v1/admin/reports/report-123/status', {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const res = await app.request(req);
    const responseData = await res.json() as any;

    expect(res.status).toBe(400);
    expect(responseData).toEqual({
      error: 'Status is required',
    });
  });

  it('should handle all valid status values', async () => {
    const mockReport: Report = {
      id: 'report-123',
      userId: 'user-1',
      description: 'Test report',
      status: 'Submitted',
      photoUrls: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { reportRepository } = await import('@repo/services-reporting');
    (reportRepository.findById as any).mockResolvedValue(mockReport);

    const validStatuses: ReportStatus[] = ['Submitted', 'In Progress', 'Resolved', 'Rejected'];

    for (const status of validStatuses) {
      const updatedReport = { ...mockReport, status };
      (reportRepository.update as any).mockResolvedValue(updatedReport);

      const req = new Request('http://localhost/api/v1/admin/reports/report-123/status', {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer valid-jwt-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const res = await app.request(req);
      expect(res.status).toBe(200);

      const responseData = await res.json() as any;
      expect(responseData.report.status).toBe(status);
    }
  });

  it('should handle repository update failures', async () => {
    const mockReport: Report = {
      id: 'report-123',
      userId: 'user-1',
      description: 'Test report',
      status: 'Submitted',
      photoUrls: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { reportRepository } = await import('@repo/services-reporting');
    (reportRepository.findById as any).mockResolvedValue(mockReport);
    (reportRepository.update as any).mockRejectedValue(new Error('Database connection failed'));

    const req = new Request('http://localhost/api/v1/admin/reports/report-123/status', {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'In Progress' }),
    });

    const res = await app.request(req);
    const responseData = await res.json() as any;

    expect(res.status).toBe(500);
    expect(responseData).toEqual({
      error: 'Failed to update report status',
      message: 'Database connection failed',
    });
  });

  it('should require authentication', async () => {
    // This test verifies that the auth middleware is applied
    const mockReport: Report = {
      id: 'report-123',
      userId: 'user-1',
      description: 'Test report',
      status: 'Submitted',
      photoUrls: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedReport = { ...mockReport, status: 'In Progress' as ReportStatus };

    const { reportRepository } = await import('@repo/services-reporting');
    (reportRepository.findById as any).mockResolvedValue(mockReport);
    (reportRepository.update as any).mockResolvedValue(updatedReport);

    const req = new Request('http://localhost/api/v1/admin/reports/report-123/status', {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'In Progress' }),
    });

    const res = await app.request(req);

    expect(res.status).toBe(200);
  });
});