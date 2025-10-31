'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiClient } from '../../../../lib/api'
import { createClient } from '../../../../lib/supabase/client'
import type { Report, ReportStatus } from '@repo/shared-types'

// Simple components for this page
const Button = ({ children, variant = 'default', className = '', ...props }: { 
  children: React.ReactNode; 
  variant?: 'default' | 'outline';
  className?: string;
  [key: string]: any;
}) => {
  const baseClasses = 'px-4 py-2 rounded-md font-medium text-sm transition-colors'
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
  }
  
  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`bg-white shadow rounded-lg border ${className}`}>
      {children}
    </div>
  )
}

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'destructive' | 'secondary' | 'outline' }) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    destructive: 'bg-red-100 text-red-800',
    secondary: 'bg-green-100 text-green-800',
    outline: 'bg-gray-100 text-gray-800'
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}

export default function ReportDetailPage() {
  const params = useParams()
  const reportId = params.id as string
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusUpdating, setStatusUpdating] = useState(false)

  useEffect(() => {
    async function loadReport() {
      if (!reportId) return

      try {
        setLoading(true)
        
        // Get auth token from Supabase client
        const supabase = createClient()
        const { data: { session }, error: authError } = await supabase.auth.getSession()
        
        if (authError) {
          throw new Error(`Authentication error: ${authError.message}`)
        }

        if (!session?.access_token) {
          throw new Error('No authentication token available')
        }

        const reportData = await apiClient.reports.fetchById(session.access_token, reportId)
        setReport(reportData)
      } catch (err) {
        console.error('Failed to fetch report:', err)
        setError(err instanceof Error ? err.message : 'Failed to load report details')
      } finally {
        setLoading(false)
      }
    }

    loadReport()
  }, [reportId])

  const handleStatusChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value as ReportStatus
    
    if (!report || newStatus === report.status) {
      return // No change needed
    }

    try {
      setStatusUpdating(true)
      
      // Get auth token from Supabase client
      const supabase = createClient()
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      
      if (authError) {
        throw new Error(`Authentication error: ${authError.message}`)
      }

      if (!session?.access_token) {
        throw new Error('No authentication token available')
      }

      // Update status via API
      const updatedReport = await apiClient.reports.updateStatus(session.access_token, reportId, newStatus)
      
      // Update local state immediately for responsive UI
      setReport(updatedReport)
      
    } catch (err) {
      console.error('Failed to update report status:', err)
      // Revert the dropdown to original value on error
      event.target.value = report.status
      setError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setStatusUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report details...</p>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Report not found'}</p>
          <Link href="/dashboard/reports">
            <Button variant="outline">
              ← Back to Reports
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const getPriorityColor = (priority?: string) => {
    if (priority === 'High') return 'destructive'
    if (priority === 'Medium') return 'default'
    return 'secondary'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'default'
      case 'In Progress':
        return 'outline'
      case 'Resolved':
        return 'secondary'
      case 'Rejected':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/reports">
          <Button variant="outline" className="mb-4">
            ← Back to Reports
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Report Details</h1>
        <p className="text-gray-600">Report ID: {report.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Summary */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">{report.description}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>👤 Report ID: {report.id}</span>
                  <span>📅 {formatDate(report.createdAt)}</span>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                {report.priority && (
                  <Badge variant={getPriorityColor(report.priority)}>
                    {report.priority} Priority
                  </Badge>
                )}
                <Badge variant={getStatusColor(report.status)}>
                  {report.status}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-4">
              {report.category && (
                <div>
                  <h4 className="font-semibold mb-2">Category</h4>
                  <Badge variant="outline">{report.category}</Badge>
                </div>
              )}

              {report.location && (
                <div>
                  <h4 className="font-semibold mb-2">Location</h4>
                  <p className="text-gray-700 flex items-center">
                    📍 {report.location.latitude.toFixed(6)}, {report.location.longitude.toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Photos */}
          {report.photoUrls && report.photoUrls.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                📷 Photos ({report.photoUrls.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.photoUrls.map((photoUrl: string, index: number) => (
                  <div key={index} className="relative">
                    <img
                      src={photoUrl}
                      alt={`Report photo ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Location Map Placeholder */}
          {report.location && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                🗺️ Location Map
              </h3>
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border">
                <div className="text-center">
                  <p className="text-gray-600 mb-2">📍 Map View</p>
                  <p className="text-sm text-gray-500">
                    Lat: {report.location.latitude.toFixed(6)}<br/>
                    Lng: {report.location.longitude.toFixed(6)}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Interactive map coming soon
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Update Status</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Report Status
                </label>
                <select
                  id="status-select"
                  value={report.status}
                  onChange={handleStatusChange}
                  disabled={statusUpdating}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              {statusUpdating && (
                <div className="flex items-center text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Updating status...
                </div>
              )}
            </div>
          </Card>

          {/* Other Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Other Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full">
                Add Note
              </Button>
              <Button variant="outline" className="w-full">
                Assign to Team
              </Button>
            </div>
          </Card>

          {/* Report Metadata */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Report Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Created</p>
                <p className="text-sm">{formatDate(report.createdAt)}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p className="text-sm">{formatDate(report.updatedAt)}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">User ID</p>
                <p className="text-sm font-mono text-xs">{report.userId}</p>
              </div>

              {report.photoUrls && report.photoUrls.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Photos</p>
                  <p className="text-sm">{report.photoUrls.length} attached</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}