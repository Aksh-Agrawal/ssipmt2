/**
 * Integration tests for Knowledge Article Form
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import KnowledgeArticleForm from '../app/dashboard/agent-content/new/KnowledgeArticleForm';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

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

describe('KnowledgeArticleForm', () => {
  const mockPush = jest.fn();
  const mockSearchParams = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
  });

  describe('Create Mode', () => {
    beforeEach(() => {
      mockSearchParams.get.mockReturnValue(null);
    });

    it('should render create form with empty fields', () => {
      render(<KnowledgeArticleForm />);

      expect(screen.getByText('Create New Knowledge Article')).toBeInTheDocument();
      expect(screen.getByLabelText(/Title/i)).toHaveValue('');
      expect(screen.getByLabelText(/Content/i)).toHaveValue('');
      expect(screen.getByPlaceholderText('Type tag and press Enter or click Add')).toHaveValue('');
    });

    it('should allow adding tags', async () => {
      render(<KnowledgeArticleForm />);

      const tagInput = screen.getByPlaceholderText('Type tag and press Enter or click Add');
      const addButton = screen.getByText('Add Tag');

      // Add first tag
      fireEvent.change(tagInput, { target: { value: 'traffic' } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('traffic')).toBeInTheDocument();
      });

      // Add second tag
      fireEvent.change(tagInput, { target: { value: 'safety' } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('safety')).toBeInTheDocument();
      });
    });

    it('should allow removing tags', async () => {
      render(<KnowledgeArticleForm />);

      const tagInput = screen.getByPlaceholderText('Type tag and press Enter or click Add');
      const addButton = screen.getByText('Add Tag');

      // Add tag
      fireEvent.change(tagInput, { target: { value: 'traffic' } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('traffic')).toBeInTheDocument();
      });

      // Remove tag
      const removeButton = screen.getByRole('button', { name: /Remove traffic/i });
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText('traffic')).not.toBeInTheDocument();
      });
    });

    it('should submit form and create article', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          article: {
            id: 'new-id-123',
            title: 'Test Article',
            content: 'Test content',
            tags: ['test'],
          },
          message: 'Article created successfully',
        }),
      });

      render(<KnowledgeArticleForm />);

      // Fill form
      fireEvent.change(screen.getByLabelText(/Title/i), {
        target: { value: 'Test Article' },
      });
      fireEvent.change(screen.getByLabelText(/Content/i), {
        target: { value: 'Test content' },
      });

      // Add tag
      const tagInput = screen.getByPlaceholderText('Type tag and press Enter or click Add');
      fireEvent.change(tagInput, { target: { value: 'test' } });
      fireEvent.click(screen.getByText('Add Tag'));

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Create Article/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/v1/admin/knowledge',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              'Authorization': 'Bearer mock-token-123',
            }),
            body: JSON.stringify({
              title: 'Test Article',
              content: 'Test content',
              tags: ['test'],
            }),
          })
        );
      });

      await waitFor(() => {
        expect(screen.getByText(/Article saved successfully/i)).toBeInTheDocument();
      });
    });

    it('should show error on submit failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<KnowledgeArticleForm />);

      // Fill form
      fireEvent.change(screen.getByLabelText(/Title/i), {
        target: { value: 'Test Article' },
      });
      fireEvent.change(screen.getByLabelText(/Content/i), {
        target: { value: 'Test content' },
      });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Create Article/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      mockSearchParams.get.mockReturnValue('test-id-123');
    });

    it('should fetch and populate article data in edit mode', async () => {
      const mockArticle = {
        id: 'test-id-123',
        title: 'Existing Article',
        content: 'Existing content',
        tags: ['traffic', 'safety'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ article: mockArticle }),
      });

      render(<KnowledgeArticleForm />);

      // Should show loading initially
      expect(screen.getByText('Loading article...')).toBeInTheDocument();

      // Should populate form after fetch
      await waitFor(() => {
        expect(screen.getByText('Edit Knowledge Article')).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/Title/i)).toHaveValue('Existing Article');
      expect(screen.getByLabelText(/Content/i)).toHaveValue('Existing content');
      expect(screen.getByText('traffic')).toBeInTheDocument();
      expect(screen.getByText('safety')).toBeInTheDocument();
    });

    it('should submit form and update article', async () => {
      const mockArticle = {
        id: 'test-id-123',
        title: 'Existing Article',
        content: 'Existing content',
        tags: ['traffic'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock fetch for initial load
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ article: mockArticle }),
      });

      render(<KnowledgeArticleForm />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Title/i)).toHaveValue('Existing Article');
      });

      // Mock fetch for update
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          article: {
            ...mockArticle,
            title: 'Updated Article',
          },
          message: 'Article updated successfully',
        }),
      });

      // Update title
      fireEvent.change(screen.getByLabelText(/Title/i), {
        target: { value: 'Updated Article' },
      });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Update Article/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenLastCalledWith(
          '/api/v1/admin/knowledge/test-id-123',
          expect.objectContaining({
            method: 'PATCH',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              'Authorization': 'Bearer mock-token-123',
            }),
            body: JSON.stringify({
              title: 'Updated Article',
              content: 'Existing content',
              tags: ['traffic'],
            }),
          })
        );
      });
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      mockSearchParams.get.mockReturnValue(null);
    });

    it('should not allow duplicate tags', async () => {
      render(<KnowledgeArticleForm />);

      const tagInput = screen.getByPlaceholderText('Type tag and press Enter or click Add');
      const addButton = screen.getByText('Add Tag');

      // Add first tag
      fireEvent.change(tagInput, { target: { value: 'traffic' } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('traffic')).toBeInTheDocument();
      });

      // Try to add duplicate
      fireEvent.change(tagInput, { target: { value: 'traffic' } });
      fireEvent.click(addButton);

      // Should still only have one tag
      const tagElements = screen.getAllByText('traffic');
      expect(tagElements).toHaveLength(1);
    });

    it('should allow adding tag with Enter key', async () => {
      render(<KnowledgeArticleForm />);

      const tagInput = screen.getByPlaceholderText('Type tag and press Enter or click Add');

      // Add tag with Enter key
      fireEvent.change(tagInput, { target: { value: 'traffic' } });
      fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('traffic')).toBeInTheDocument();
      });
    });
  });
});
