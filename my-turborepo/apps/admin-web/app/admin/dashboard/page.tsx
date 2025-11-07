'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Paper,
  Avatar,
  Chip,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ReportProblem,
  Traffic,
  Event,
  People,
  Assessment,
  Settings,
  TrendingUp,
  Warning,
} from '@mui/icons-material';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DashboardStats {
  totalReports: number;
  statusCounts: {
    Submitted: number;
    'Under Review': number;
    'In Progress': number;
    Resolved: number;
    Closed: number;
  };
  categoryCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  recentReports: any[];
  totalUsers?: number;
  pendingReports?: number;
  overdueReports?: number;
  resolutionRate?: number;
}

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/stats/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const result = await response.json();
        setStats(result.data);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) {
      fetchDashboardData();
    }
  }, [isLoaded]);

  if (!isLoaded || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography color="error">Error loading dashboard: {error}</Typography>
      </Box>
    );
  }

  const openIssues = stats?.pendingReports || 0;
  const inProgress = stats?.statusCounts['In Progress'] || 0;
  const resolved = stats?.statusCounts.Resolved || 0;
  const recentIncidents = stats?.recentReports.slice(0, 5) || [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Paper elevation={0} sx={{ bgcolor: '#667eea', color: 'white', py: 3, mb: 4 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                🚨 Civic Voice - Admin Portal
              </Typography>
              <Typography variant="subtitle1">Welcome, {user?.firstName || 'Administrator'}!</Typography>
            </Box>
            <UserButton afterSignOutUrl="/login" />
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="xl">
        {/* AI Assistant Quick Access Card */}
        <Link href="/admin/assistant" style={{ textDecoration: 'none' }}>
          <Card 
            elevation={4}
            sx={{ 
              mb: 4, 
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: 6,
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography sx={{ fontSize: '48px' }}>🤖</Typography>
                  <Box>
                    <Typography variant="h5" fontWeight={700} color="white" gutterBottom>
                      AI Traffic & Operations Assistant
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      Get instant insights on traffic, reports, and SLA compliance
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                  <Chip 
                    label="🚨 MVP Feature" 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      fontWeight: 600,
                    }} 
                  />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Click to start chatting →
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                <Chip label="📊 Real-time Analytics" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                <Chip label="🚦 Traffic Intelligence" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                <Chip label="⏰ SLA Tracking" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                <Chip label="🎯 Resource Allocation" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              </Box>
            </CardContent>
          </Card>
        </Link>

        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#D32F2F', mr: 2 }}>
                  <Warning />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {openIssues}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Issues
                  </Typography>
                </Box>
              </Box>
              {stats?.overdueReports ? (
                <Typography variant="caption" color="error.main">
                  ⚠️ {stats.overdueReports} overdue
                </Typography>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  All on track
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#F57C00', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {inProgress}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    In Progress
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Being worked on
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#388E3C', mr: 2 }}>
                  <DashboardIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {resolved}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Resolved
                  </Typography>
                </Box>
              </Box>
              {stats?.resolutionRate ? (
                <Typography variant="caption" color="success.main">
                  {stats.resolutionRate}% resolution rate
                </Typography>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  All time
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#1976D2', mr: 2 }}>
                  <People />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {stats?.totalUsers || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Registered citizens
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Recent Incidents */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>
              🚨 Recent Incidents
            </Typography>
            <Button component={Link} href="/admin/incidents" variant="outlined" size="small">
              View All
            </Button>
          </Box>
          {recentIncidents.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No reports yet. Waiting for citizen submissions...
              </Typography>
            </Box>
          ) : (
            recentIncidents.map((incident) => (
              <Card key={incident.id} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="primary" fontWeight={600} display="block">
                        {incident.unique_id || `#${incident.id.substring(0, 8)}`}
                      </Typography>
                      <Typography variant="body1" fontWeight={600} gutterBottom>
                        {incident.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip label={incident.priority} color={getPriorityColor(incident.priority)} size="small" />
                        <Chip label={incident.status} variant="outlined" size="small" />
                        <Chip label={incident.category} size="small" />
                        {incident.area && <Chip label={`📍 ${incident.area}`} size="small" />}
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        Created: {new Date(incident.created_at).toLocaleString()}
                      </Typography>
                    </Box>
                    <Button 
                      component={Link}
                      href={`/admin/incidents?id=${incident.id}`}
                      variant="contained" 
                      size="small"
                    >
                      Manage
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Paper>

        {/* Quick Actions */}
        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
          ⚡ Quick Actions
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
          <Card
            component={Link}
            href="/admin/incidents"
            sx={{
              textDecoration: 'none',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' },
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar sx={{ bgcolor: '#1976D2', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                <ReportProblem />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                Incidents
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage reports
              </Typography>
            </CardContent>
          </Card>

          <Card
            component={Link}
            href="/admin/traffic-map"
            sx={{
              textDecoration: 'none',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' },
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar sx={{ bgcolor: '#F57C00', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                <Traffic />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                Traffic Map
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Live traffic view
              </Typography>
            </CardContent>
          </Card>

          <Card
            component={Link}
            href="/admin/simulate"
            sx={{
              textDecoration: 'none',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' },
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar sx={{ bgcolor: '#388E3C', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                <Assessment />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                Simulator
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Traffic analysis
              </Typography>
            </CardContent>
          </Card>

          <Card
            component={Link}
            href="/admin/settings"
            sx={{
              textDecoration: 'none',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' },
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar sx={{ bgcolor: '#757575', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                <Settings />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                Settings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                System config
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}
