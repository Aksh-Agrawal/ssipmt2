/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { useParams } from 'next/navigation';
import ReportDetailPage from '../../../app/dashboard/reports/[id]/page';

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
          data: { session: null }, 
          error: new Error('No session') 
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
    },
  },
}));

describe('ReportDetailPage', () => {
  beforeEach(() => {
    (useParams as jest.Mock).mockReturnValue({ id: 'test-report-id' });
  });

  it('renders loading state initially', () => {
    render(<ReportDetailPage />);
    
    expect(screen.getByText('Loading report details...')).toBeDefined();
  });

  it('renders error state when authentication fails', async () => {
    render(<ReportDetailPage />);
    
    // Wait for the error state
    await screen.findByText(/Authentication error/);
    
    expect(screen.getByText('← Back to Reports')).toBeDefined();
  });

  it('has correct report ID from params', () => {
    render(<ReportDetailPage />);
    
    expect(useParams).toHaveBeenCalled();
  });
});