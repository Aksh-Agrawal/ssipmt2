'use client'

'use client'

import { useState } from 'react'
import { createClient } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material'

/**
 * Login page component for admin authentication.
 * Provides email/password authentication using Supabase Auth.
 */
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  /**
   * Validates form inputs before submission.
   */
  const validateForm = () => {
    if (!email.trim()) {
      setError('Email address is required')
      return false
    }
    if (!password.trim()) {
      setError('Password is required')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address')
      return false
    }
    return true
  }

  /**
   * Handles login form submission.
   * Validates inputs, authenticates with Supabase, and handles navigation.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        // Provide user-friendly error messages
        switch (error.message) {
          case 'Invalid login credentials':
            setError('Invalid email or password. Please check your credentials and try again.')
            break
          case 'Email not confirmed':
            setError('Please check your email and click the confirmation link before signing in.')
            break
          case 'Too many requests':
            setError('Too many login attempts. Please wait a moment and try again.')
            break
          default:
            setError(error.message)
        }
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: 3,
      }}
    >
      <Box
        sx={{
          maxWidth: 400,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          padding: 4,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: 'white',
        }}
      >
        <Box>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            Sign in to access the admin panel
          </Typography>
        </Box>
        <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Email address"
            type="email"
            autoComplete="email"
            required
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            error={!!error && email.trim() !== ''}
            helperText={error && email.trim() !== '' ? error : ''}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            error={!!error && password.trim() !== ''}
            helperText={error && password.trim() !== '' ? error : ''}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign in'}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}