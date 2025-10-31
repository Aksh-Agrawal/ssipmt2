import app from '../index.js';
import { analyzeReportContent } from '@repo/services-reporting';

// Mock the reporting service
jest.mock('@repo/services-reporting', () => ({
  analyzeReportContent: jest.fn(),
}));

const mockedAnalyzeReportContent = analyzeReportContent as jest.MockedFunction<typeof analyzeReportContent>;

describe('POST /api/v1/internal/analyze-report', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully analyze a report', async () => {
    // Mock successful analysis
    mockedAnalyzeReportContent.mockResolvedValue({
      category: 'Pothole',
      priority: 'High',
      confidence: 0.9,
    });

    const request = new Request('http://localhost/api/v1/internal/analyze-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reportId: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Dangerous pothole on Main Street causing accidents',
      }),
    });

    const response = await app.request(request);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toEqual({
      reportId: '123e4567-e89b-12d3-a456-426614174000',
      category: 'Pothole',
      priority: 'High',
      message: 'Report analyzed successfully',
    });

    expect(mockedAnalyzeReportContent).toHaveBeenCalledWith({
      reportId: '123e4567-e89b-12d3-a456-426614174000',
      description: 'Dangerous pothole on Main Street causing accidents',
    });
  });

  it('should validate request payload - missing reportId', async () => {
    const request = new Request('http://localhost/api/v1/internal/analyze-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Missing reportId
        description: 'Test description',
      }),
    });

    const response = await app.request(request);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('should validate reportId format', async () => {
    const request = new Request('http://localhost/api/v1/internal/analyze-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reportId: 'invalid-uuid',
        description: 'Test description',
      }),
    });

    const response = await app.request(request);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('should handle analysis service errors gracefully', async () => {
    // Mock service error
    mockedAnalyzeReportContent.mockRejectedValue(new Error('Report not found'));

    const request = new Request('http://localhost/api/v1/internal/analyze-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reportId: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Test description',
      }),
    });

    const response = await app.request(request);
    expect(response.status).toBe(500);
    
    const data = await response.json();
    expect(data).toEqual({
      error: 'Failed to analyze report',
      message: 'Report not found',
    });
  });

  it('should require description field', async () => {
    const request = new Request('http://localhost/api/v1/internal/analyze-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reportId: '123e4567-e89b-12d3-a456-426614174000',
        // Missing description
      }),
    });

    const response = await app.request(request);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('should reject empty description', async () => {
    const request = new Request('http://localhost/api/v1/internal/analyze-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reportId: '123e4567-e89b-12d3-a456-426614174000',
        description: '',
      }),
    });

    const response = await app.request(request);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });
});