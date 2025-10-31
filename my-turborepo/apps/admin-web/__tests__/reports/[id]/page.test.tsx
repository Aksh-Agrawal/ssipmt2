/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useParams } from 'next/navigation';
import ReportDetailPage from '../../../app/dashboard/reports/[id]/page';
import type { Report } from '@repo/shared-types';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));

// Mock the Supabase client
jest.mock('../../../lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() => 
        Promise.resolve({ 
          data: { session: { access_token: 'mock-token' } }, 
          error: null 
        })
      ),
    },
  })),
}));

// Mock the API client
jest.mock('../../../lib/api', () => ({
  apiClient: {
    reports: {
      fetchById: jest.fn(),
      updateStatus: jest.fn(),
    },
  },
}));

// Import the mocked API client to get the jest mock functions
import { apiClient } from '../../../lib/api';

// Create safe references to the mocked functions
const mockFetchById = jest.mocked(apiClient.reports.fetchById);
const mockUpdateStatus = jest.mocked(apiClient.reports.updateStatus);

const mockReport: Report = {
  id: 'test-report-id',
  userId: 'user-123',
  description: 'Test report description',
  category: 'Pothole',
  priority: 'High',
  status: 'Submitted',
  location: { latitude: 40.7128, longitude: -74.0060 },
  photoUrls: ['https://example.com/photo.jpg'],
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date('2024-01-15T10:00:00Z'),
};

describe('ReportDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({ id: 'test-report-id' });
    mockFetchById.mockResolvedValue(mockReport);
  });

  it('renders loading state initially', () => {
    render(<ReportDetailPage />);
    
    expect(screen.getByText('Loading report details...')).toBeDefined();
  });

  it('renders report details when loaded successfully', async () => {
    render(<ReportDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test report description')).toBeDefined();
      expect(screen.getByText('High Priority')).toBeDefined();
      // Ensure the status appears both as a badge and as the selected value in the dropdown
      expect(screen.getByDisplayValue('Submitted')).toBeDefined();
      expect(screen.getAllByText('Submitted').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders status dropdown with current status selected', async () => {
    render(<ReportDetailPage />);
    
    await waitFor(() => {
      const statusSelect = screen.getByLabelText('Report Status') as HTMLSelectElement;
      expect(statusSelect.value).toBe('Submitted');
    });
  });

  it('updates status when dropdown selection changes', async () => {
    const updatedReport = { ...mockReport, status: 'In Progress' as const };
    mockUpdateStatus.mockResolvedValue(updatedReport);

    render(<ReportDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test report description')).toBeDefined();
    });

    const statusSelect = screen.getByLabelText('Report Status') as HTMLSelectElement;
    
    fireEvent.change(statusSelect, { target: { value: 'In Progress' } });

    await waitFor(() => {
      expect(mockUpdateStatus).toHaveBeenCalledWith('mock-token', 'test-report-id', 'In Progress');
    });
  });

  it('shows updating indicator while status is being changed', async () => {
    mockUpdateStatus.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<ReportDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test report description')).toBeDefined();
    });

    const statusSelect = screen.getByLabelText('Report Status') as HTMLSelectElement;
    
    fireEvent.change(statusSelect, { target: { value: 'In Progress' } });

    expect(screen.getByText('Updating status...')).toBeDefined();
  });

  it('handles status update errors gracefully', async () => {
    mockUpdateStatus.mockRejectedValue(new Error('Failed to update status'));
    
    // Mock console.error to avoid error output in tests
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<ReportDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test report description')).toBeDefined();
    });

    const statusSelect = screen.getByLabelText('Report Status') as HTMLSelectElement;
    
    fireEvent.change(statusSelect, { target: { value: 'In Progress' } });

    await waitFor(() => {
      expect(mockUpdateStatus).toHaveBeenCalled();
      // Status should revert to original value
      expect(statusSelect.value).toBe('Submitted');
    });

    consoleErrorSpy.mockRestore();
  });

  it('does not call API when status does not change', async () => {
    render(<ReportDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test report description')).toBeDefined();
    });

    const statusSelect = screen.getByLabelText('Report Status') as HTMLSelectElement;
    
    // Select the same status that's already selected
    fireEvent.change(statusSelect, { target: { value: 'Submitted' } });

    // Wait a bit to ensure no API call is made
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(mockUpdateStatus).not.toHaveBeenCalled();
  });

  it('displays all status options in dropdown', async () => {
    render(<ReportDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test report description')).toBeDefined();
    });

    const statusSelect = screen.getByLabelText('Report Status') as HTMLSelectElement;
    const options = Array.from(statusSelect.options).map(option => option.value);
    
    expect(options).toEqual(['Submitted', 'In Progress', 'Resolved', 'Rejected']);
  });

  it('has correct report ID from params', () => {
    render(<ReportDetailPage />);

    expect(useParams).toHaveBeenCalled();
    return waitFor(() => expect(mockFetchById).toHaveBeenCalledWith('mock-token', 'test-report-id'));
  });
});