import { SignUp } from '@clerk/nextjs';
import { Box, Container, Typography } from '@mui/material';

export default function SignUpPage() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>
          Civic Voice
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          Join us to make your city better
        </Typography>
        <SignUp 
          appearance={{
            elements: {
              rootBox: 'mx-auto',
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/user/dashboard"
          redirectUrl="/user/dashboard"
        />
      </Box>
    </Container>
  );
}
