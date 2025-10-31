import { render, screen, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import ReportsList from '../app/dashboard/ReportsList';
import type { Report } from '@repo/shared-types';

// Mock the config module to avoid environment variable requirements
jest.mock('../lib/config', () => ({
  config: {
    supabase: {
      url: 'https://mock-supabase-url.supabase.co',
      anonKey: 'mock-anon-key',
    },
  },
}));

// Mock the Supabase client
const mockGetSession = jest.fn();
jest.mock('../lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
    },
  }),
}));

// Mock the API client
const mockFetchAll = jest.fn();
jest.mock('../lib/api', () => ({
  apiClient: {
    reports: {
      fetchAll: mockFetchAll,
    },
  },
}));

describe('ReportsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    // Mock auth session
    (mockGetSession as any).mockResolvedValue({
      data: { session: { access_token: 'mock-token' } },
      error: null,
    });

    // Mock API call to never resolve (staying in loading state)
    (mockFetchAll as any).mockImplementation(() => new Promise(() => {}));

    render(<ReportsList />);

    expect(screen.getByText('Loading reports...')).toBeDefined();
  });

  it('displays reports when loaded successfully', async () => {
    const mockReports: Report[] = [
      {
        id: 'report-1',
        userId: 'user-1',
        description: 'High priority traffic issue on Main Street',
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
        description: 'Medium priority pothole needs repair',
        category: 'Pothole',
        priority: 'Medium',
        status: 'In Progress',
        photoUrls: [],
        createdAt: new Date('2024-01-15T09:00:00Z'),
        updatedAt: new Date('2024-01-15T11:00:00Z'),
      },
    ];

    // Mock auth session
    (mockGetSession as any).mockResolvedValue({
      data: { session: { access_token: 'mock-token' } },
      error: null,
    });

    // Mock API response
    (mockFetchAll as any).mockResolvedValue(mockReports);

    render(<ReportsList />);

    await waitFor(() => {
      expect(screen.getByText('Civic Reports (2)')).toBeDefined();
    });

    // Check that reports are displayed
    expect(screen.getByText('High priority traffic issue on Main Street')).toBeDefined();
    expect(screen.getByText('Medium priority pothole needs repair')).toBeDefined();
    expect(screen.getByText('High Priority')).toBeDefined();
    expect(screen.getByText('Medium Priority')).toBeDefined();
    expect(screen.getByText('Submitted')).toBeDefined();
    expect(screen.getByText('In Progress')).toBeDefined();
  });

  it('shows error state when API call fails', async () => {
    // Mock auth session
    (mockGetSession as any).mockResolvedValue({
      data: { session: { access_token: 'mock-token' } },
      error: null,
    });

    // Mock API error
    (mockFetchAll as any).mockRejectedValue(new Error('Network error'));

    render(<ReportsList />);

    await waitFor(() => {
      expect(screen.getByText('Error loading reports')).toBeDefined();
    });

    expect(screen.getByText('Network error')).toBeDefined();
  });

  it('shows empty state when no reports exist', async () => {
    // Mock auth session
    (mockGetSession as any).mockResolvedValue({
      data: { session: { access_token: 'mock-token' } },
      error: null,
    });

    // Mock empty API response
    (mockFetchAll as any).mockResolvedValue([]);

    render(<ReportsList />);

    await waitFor(() => {
      expect(screen.getByText('No reports')).toBeDefined();
    });

    expect(screen.getByText('No civic reports have been submitted yet.')).toBeDefined();
  });
});