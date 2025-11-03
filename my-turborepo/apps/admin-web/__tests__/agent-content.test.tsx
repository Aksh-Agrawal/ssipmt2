/**
 * Integration tests for Agent Content page
 */

import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import KnowledgeArticlesList from '../app/dashboard/agent-content/KnowledgeArticlesList';

// Mock Supabase client
jest.mock('../lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            access_token: 'mock-token-123',
          },
        },
        error: null,
      }),
    },
  })),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('KnowledgeArticlesList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display loading state initially', () => {
    // Mock fetch to never resolve
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<KnowledgeArticlesList />);

    expect(screen.getByText('Loading knowledge articles...')).toBeInTheDocument();
  });

  it('should display empty state when no articles exist', async () => {
    // Mock successful fetch with empty articles
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        articles: [],
        total: 0,
        message: 'Knowledge articles fetched successfully',
      }),
    });

    render(<KnowledgeArticlesList />);

    await waitFor(() => {
      expect(screen.getByText('No knowledge articles')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Get started by creating a new article for the AI assistant.')).toBeInTheDocument();
    expect(screen.getByText('Create New Article')).toBeInTheDocument();
  });

  it('should display articles when they exist', async () => {
    const mockArticles = [
      {
        id: '1',
        title: 'Traffic Guidelines',
        content: 'Information about traffic rules',
        tags: ['traffic', 'safety'],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-15T00:00:00Z',
      },
      {
        id: '2',
        title: 'Parking Information',
        content: 'Information about parking zones',
        tags: ['parking', 'zones'],
        createdAt: '2025-01-02T00:00:00Z',
        updatedAt: '2025-01-16T00:00:00Z',
      },
    ];

    // Mock successful fetch with articles
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        articles: mockArticles,
        total: 2,
        message: 'Knowledge articles fetched successfully',
      }),
    });

    render(<KnowledgeArticlesList />);

    await waitFor(() => {
      expect(screen.getByText('Traffic Guidelines')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Parking Information')).toBeInTheDocument();
    expect(screen.getByText('traffic, safety')).toBeInTheDocument();
    expect(screen.getByText('parking, zones')).toBeInTheDocument();
  });

  it('should display error state when fetch fails', async () => {
    // Mock failed fetch
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<KnowledgeArticlesList />);

    await waitFor(() => {
      expect(screen.getByText('Error loading knowledge articles')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('should call API with correct authorization header', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        articles: [],
        total: 0,
        message: 'Success',
      }),
    });

    render(<KnowledgeArticlesList />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/admin/knowledge',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token-123',
          }),
        })
      );
    });
  });
});
