import { Box, Container, Typography, Button, Paper, Card, CardContent } from '@mui/material';
import { ReportProblem, Chat, Map, AdminPanelSettings, Person } from '@mui/icons-material';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  // Check if user is already authenticated
  const { userId } = await auth();
  
  // If authenticated, redirect to user dashboard
  if (userId) {
    redirect('/user/dashboard');
  }
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" fontWeight={700} gutterBottom>
            🏙️ Civic Voice
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            AI-Powered Civic Issue Reporting & Information Platform for Raipur
          </Typography>
          <Typography variant="body1" sx={{ mb: 5, fontSize: '1.1rem', maxWidth: 700, mx: 'auto' }}>
            Report civic issues with voice, get real-time city information, and help make your city better
          </Typography>

          {/* Login Options */}
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Choose How You Want to Login:
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap', mb: 2 }}>
            {/* User Login Card */}
            <Card
              sx={{
                minWidth: 280,
                cursor: 'pointer',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: '#1976D2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <Person sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h5" fontWeight={700} gutterBottom color="primary">
                  Citizen Login
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Report issues, track complaints, get city information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    component={Link}
                    href="/sign-in"
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{ fontWeight: 600 }}
                  >
                    Sign In
                  </Button>
                  <Button component={Link} href="/sign-up" variant="outlined" fullWidth size="large">
                    Sign Up
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Admin Login Card */}
            <Card
              sx={{
                minWidth: 280,
                cursor: 'pointer',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: '#667eea',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <AdminPanelSettings sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: '#667eea' }}>
                  Admin Login
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Manage reports, analyze traffic, handle incidents
                </Typography>
                <Button
                  component="a"
                  href="http://localhost:3002/login"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{
                    bgcolor: '#667eea',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: '#5568d3',
                    },
                  }}
                >
                  Admin Login
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom sx={{ mb: 5 }}>
          🌟 Key Features
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: '#1976D2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <ReportProblem sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                🎤 Voice-First Reporting
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tap & Speak to report potholes, garbage, broken streetlights in multiple languages (English, Hindi,
                Chhattisgarhi)
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: '#388E3C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Chat sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                🤖 AI Chatbot
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get real-time answers about traffic, garbage collection, road closures, and city services with our
                multilingual AI assistant
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: '#F57C00',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Map sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                📍 Geo-Tagged Reports
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Automatic location tracking with photos prevents fake reports. Track your submissions with unique IDs
                and status updates
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>

      {/* How It Works */}
      <Box sx={{ bgcolor: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom sx={{ mb: 5 }}>
            📋 How It Works
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h2" color="primary" fontWeight={700}>
                1
              </Typography>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Sign Up / Sign In
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your account in seconds using email or Google
              </Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h2" color="primary" fontWeight={700}>
                2
              </Typography>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Report or Ask
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tap & Speak to report issues or chat with our AI assistant
              </Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h2" color="primary" fontWeight={700}>
                3
              </Typography>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Track Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get real-time updates and see when issues are resolved
              </Typography>
            </Paper>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ bgcolor: '#1976D2', color: 'white', py: 8, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Ready to Make Your City Better?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem' }}>
            Join thousands of citizens reporting issues and staying informed
          </Typography>
          <Button
            component={Link}
            href="/sign-up"
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'white',
              color: '#1976D2',
              px: 5,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 700,
              '&:hover': {
                bgcolor: '#f0f0f0',
              },
            }}
          >
            Get Started Now
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#333', color: 'white', py: 4, textAlign: 'center' }}>
        <Container maxWidth="lg">
          <Typography variant="body2">
            © 2025 Civic Voice - Smart City Platform for Raipur, India
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
            Powered by AI | Made with ❤️ for Citizens
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
