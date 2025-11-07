'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Paper,
  Avatar,
  Chip,
  Stack,
  CircularProgress,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  ReportProblem,
  Map,
  Help,
  AccountCircle,
  CheckCircle,
  Schedule,
  Warning,
  SmartToy,
  Chat,
} from '@mui/icons-material';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import FloatingChatButton from '@/app/components/FloatingChatButton';

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
}

export default function UserDashboard() {
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

  const pendingCount = (stats?.statusCounts.Submitted || 0) + (stats?.statusCounts['Under Review'] || 0);
  const inProgressCount = stats?.statusCounts['In Progress'] || 0;
  const resolvedCount = (stats?.statusCounts.Resolved || 0) + (stats?.statusCounts.Closed || 0);
  const recentReports = stats?.recentReports.slice(0, 5) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'success';
      case 'In Progress':
        return 'warning';
      case 'Submitted':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Paper elevation={0} sx={{ bgcolor: '#1976D2', color: 'white', py: 3, mb: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                🏙️ Civic Voice
              </Typography>
              <Typography variant="subtitle1">Welcome back, {user?.firstName || 'Citizen'}!</Typography>
            </Box>
            <UserButton afterSignOutUrl="/" />
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="lg">
        {/* Quick Actions - Report & Chat */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 2 }}>
              <Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  📢 Report a Civic Issue
                </Typography>
                <Typography variant="body1">
                  Tap & Speak to report potholes, garbage, broken streetlights, and more.
                </Typography>
              </Box>
              <Button
                component={Link}
                href="/user/report"
                variant="contained"
                size="large"
                startIcon={<ReportProblem />}
                sx={{
                  bgcolor: 'white',
                  color: '#667eea',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: '#f0f0f0',
                  },
                }}
              >
                Report Issue
              </Button>
            </Box>
          </Paper>

          <Paper
            elevation={3}
            sx={{
              p: 4,
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              color: 'white',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 2 }}>
              <Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  🤖 AI Voice Assistant
                </Typography>
                <Typography variant="body1">
                  Ask about traffic, garbage schedule, or any civic info in English, Hindi, or Chhattisgarhi!
                </Typography>
              </Box>
              <Button
                component={Link}
                href="/user/help"
                variant="contained"
                size="large"
                startIcon={<SmartToy />}
                sx={{
                  bgcolor: 'white',
                  color: '#11998e',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: '#f0f0f0',
                  },
                }}
              >
                Chat Now
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* NEW: Real-Time Voice Assistant */}
        <Paper
          elevation={3}
          sx={{
            mb: 4,
            p: 4,
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: 1, minWidth: '250px' }}>
              <Chip 
                label="🆕 NEW FEATURE" 
                size="small" 
                sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: 'white', mb: 1, fontWeight: 700 }}
              />
              <Typography variant="h5" fontWeight={700} gutterBottom>
                🎙️ Real-Time Voice Conversation
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Have a natural, hands-free conversation with AI! Powered by Pipecat - speak and get instant voice responses.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip 
                  label="🎤 Continuous Listening" 
                  size="small" 
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip 
                  label="🔊 Instant TTS" 
                  size="small" 
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip 
                  label="🗣️ Multilingual" 
                  size="small" 
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
            </Box>
            <Button
              component={Link}
              href="/user/voice-assistant"
              variant="contained"
              size="large"
              startIcon={<Chat />}
              sx={{
                bgcolor: 'white',
                color: '#f5576c',
                fontWeight: 700,
                px: 4,
                py: 2,
                fontSize: '1.1rem',
                '&:hover': {
                  bgcolor: '#f0f0f0',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s',
              }}
            >
              Try Voice Chat
            </Button>
          </Box>
        </Paper>

        {/* Stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight={700}>
                {stats?.totalReports || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Reports
              </Typography>
            </CardContent>
          </Card>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" fontWeight={700}>
                {pendingCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" fontWeight={700}>
                {inProgressCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Progress
              </Typography>
            </CardContent>
          </Card>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" fontWeight={700}>
                {resolvedCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Resolved
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Recent Reports */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              📋 Recent Reports
            </Typography>
            <Button component={Link} href="/user/my-reports" size="small">
              View All
            </Button>
          </Box>
          {recentReports.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No reports yet. Click "Report Issue" above to submit your first report!
              </Typography>
            </Box>
          ) : (
            recentReports.map((report) => (
              <Card key={report.id} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="primary" fontWeight={600}>
                        {report.unique_id || `#${report.id.substring(0, 8)}`}
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {report.description}
                      </Typography>
                    </Box>
                    <Chip label={report.status} color={getStatusColor(report.status)} size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                    <Typography variant="caption" color="text.secondary">
                      📅 {new Date(report.created_at).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      🏷️ {report.category}
                    </Typography>
                    {report.priority && (
                      <Typography variant="caption" color="text.secondary">
                        ⚡ {report.priority}
                      </Typography>
                    )}
                    {report.area && (
                      <Typography variant="caption" color="text.secondary">
                        📍 {report.area}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Paper>

        {/* Quick Links */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
          <Card
            component={Link}
            href="/user/my-reports"
            sx={{
              textDecoration: 'none',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' },
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar sx={{ bgcolor: '#1976D2', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                <Schedule />
              </Avatar>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                My Reports
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track all your submissions
              </Typography>
            </CardContent>
          </Card>
          <Card
            component={Link}
            href="/user/help"
            sx={{
              textDecoration: 'none',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' },
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar sx={{ bgcolor: '#388E3C', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                <Help />
              </Avatar>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                AI Assistant
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get city information
              </Typography>
            </CardContent>
          </Card>
          <Card
            component={Link}
            href="/user/profile"
            sx={{
              textDecoration: 'none',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' },
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar sx={{ bgcolor: '#F57C00', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                <AccountCircle />
              </Avatar>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Profile
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your account
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>

      {/* Floating Chatbot Button - Always Visible */}
      <FloatingChatButton />
    </Box>
  );
}
