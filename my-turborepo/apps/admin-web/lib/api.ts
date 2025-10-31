/**
 * API client for admin dashboard
 * Handles authenticated requests to the backend API
 */

import type { Report, ReportStatus } from '@repo/shared-types';

// API base URL - should be configured via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiResponse<T> {
  reports: T;
  total: number;
  message: string;
}

export interface ApiSingleResponse<T> {
  report: T;
  message: string;
}

export interface ApiError {
  error: string;
  message?: string;
}

/**
 * Makes authenticated API request with Supabase JWT token
 */
async function makeAuthenticatedRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(errorData.message || errorData.error);
  }

  return response.json();
}

/**
 * Fetches all reports sorted by priority for admin dashboard
 */
export async function fetchReports(authToken: string): Promise<Report[]> {
  const response = await makeAuthenticatedRequest<ApiResponse<Report[]>>(
    '/api/v1/admin/reports',
    {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    }
  );

  return response.reports;
}

/**
 * Fetches a single report by ID for admin dashboard
 */
export async function fetchReport(authToken: string, reportId: string): Promise<Report> {
  const response = await makeAuthenticatedRequest<ApiSingleResponse<Report>>(
    `/api/v1/admin/reports/${reportId}`,
    {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    }
  );

  return response.report;
}

/**
 * Updates a report's status
 */
export async function updateReportStatus(authToken: string, reportId: string, status: ReportStatus): Promise<Report> {
  const response = await makeAuthenticatedRequest<ApiSingleResponse<Report>>(
    `/api/v1/admin/reports/${reportId}/status`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ status }),
    }
  );

  return response.report;
}

/**
 * API client instance
 */
export const apiClient = {
  reports: {
    fetchAll: fetchReports,
    fetchById: fetchReport,
    updateStatus: updateReportStatus,
  },
};