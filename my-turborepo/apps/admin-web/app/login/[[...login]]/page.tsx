import { SignIn } from '@clerk/nextjs';
import { Box, Container, Typography, Paper } from '@mui/material';

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        py: 4,
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={8} 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              mb: 2, 
              fontWeight: 700, 
              textAlign: 'center',
              color: '#ffffff'
            }}
          >
            🚨 Civic Voice Admin
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 4, 
              textAlign: 'center',
              color: '#b0b0b0'
            }}
          >
            Administrative portal for managing civic reports
          </Typography>
          <SignIn 
            appearance={{
              elements: {
                rootBox: 'mx-auto',
              },
            }}
            routing="path"
            path="/login"
            afterSignInUrl="/admin/dashboard"
            redirectUrl="/admin/dashboard"
          />
        </Paper>
      </Container>
    </Box>
  );
}
