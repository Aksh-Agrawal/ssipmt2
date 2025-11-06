import { SignIn } from '@clerk/nextjs';
import { Box, Container, Typography } from '@mui/material';

export default function SignInPage() {
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
          Sign in to report civic issues and get city information
        </Typography>
        <SignIn 
          appearance={{
            elements: {
              rootBox: 'mx-auto',
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/user/dashboard"
          redirectUrl="/user/dashboard"
        />
      </Box>
    </Container>
  );
}
