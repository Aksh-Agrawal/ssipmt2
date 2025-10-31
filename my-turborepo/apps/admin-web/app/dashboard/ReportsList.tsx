'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase/client';
import { apiClient } from '../../lib/api';
import type { Report } from '@repo/shared-types';

// Priority color mapping for visual distinction
const priorityColors = {
  High: 'bg-red-100 text-red-800',
  Medium: 'bg-yellow-100 text-yellow-800', 
  Low: 'bg-green-100 text-green-800',
} as const;

// Status color mapping
const statusColors = {
  'Submitted': 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-purple-100 text-purple-800',
  'Resolved': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800',
} as const;

interface ReportsListProps {
  className?: string;
}

export default function ReportsList({ className = '' }: ReportsListProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        setError(null);

        // Get auth token from Supabase client
        const supabase = createClient();
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          throw new Error(`Authentication error: ${authError.message}`);
        }

        if (!session?.access_token) {
          throw new Error('No authentication token available');
        }

        // Fetch reports from API
        const reportsData = await apiClient.reports.fetchAll(session.access_token);
        setReports(reportsData);

      } catch (err) {
        console.error('Failed to fetch reports:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading reports...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading reports</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No reports</h3>
        <p className="mt-1 text-sm text-gray-500">No civic reports have been submitted yet.</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateDescription = (description: string, maxLength: number = 100) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  return (
    <div className={className}>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Civic Reports ({reports.length})
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Reports sorted by priority (High → Medium → Low → Unprocessed)
          </p>
        </div>
        
        <ul className="divide-y divide-gray-200">
          {reports.map((report) => (
            <li key={report.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {truncateDescription(report.description)}
                    </p>
                    
                    {/* Priority Badge */}
                    {report.priority && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[report.priority]}`}>
                        {report.priority} Priority
                      </span>
                    )}
                    
                    {/* Status Badge */}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[report.status]}`}>
                      {report.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {/* Category */}
                    {report.category && (
                      <span>📂 {report.category}</span>
                    )}
                    
                    {/* Location */}
                    {report.location && (
                      <span>📍 {report.location.latitude.toFixed(4)}, {report.location.longitude.toFixed(4)}</span>
                    )}
                    
                    {/* Photo indicator */}
                    {report.photoUrls && report.photoUrls.length > 0 && (
                      <span>📷 {report.photoUrls.length} photo{report.photoUrls.length > 1 ? 's' : ''}</span>
                    )}
                    
                    {/* Date */}
                    <span>🕒 {formatDate(report.createdAt.toString())}</span>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <a 
                    href={`/dashboard/reports/${report.id}`}
                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                  >
                    View Details
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}