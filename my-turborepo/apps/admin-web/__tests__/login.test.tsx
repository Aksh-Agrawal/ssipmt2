import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import LoginPage from '../app/login/page'
import { createClient } from '../lib/supabase/client'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock Supabase client
jest.mock('../lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

const mockPush = jest.fn()
const mockRefresh = jest.fn()
const mockSignInWithPassword = jest.fn()

beforeEach(() => {
  ;(useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
    refresh: mockRefresh,
  })
  ;(createClient as jest.Mock).mockReturnValue({
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  })
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('LoginPage', () => {
  it('renders login form correctly', () => {
    render(<LoginPage />)
    
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Sign in to access the admin panel')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('handles user input correctly', () => {
    render(<LoginPage />)
    
    const emailInput = screen.getByPlaceholderText('Email address')
    const passwordInput = screen.getByPlaceholderText('Password')
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('validates empty email field', async () => {
    render(<LoginPage />)
    
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign in' })
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Email address is required')).toBeInTheDocument()
    })
    
    expect(mockSignInWithPassword).not.toHaveBeenCalled()
  })

  it('validates empty password field', async () => {
    render(<LoginPage />)
    
    const emailInput = screen.getByPlaceholderText('Email address')
    const submitButton = screen.getByRole('button', { name: 'Sign in' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
    
    expect(mockSignInWithPassword).not.toHaveBeenCalled()
  })

  it('validates invalid email format', async () => {
    render(<LoginPage />)
    
    const emailInput = screen.getByPlaceholderText('Email address')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign in' })
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })
    
    expect(mockSignInWithPassword).not.toHaveBeenCalled()
  })

  it('calls signInWithPassword on form submission with valid data', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null })
    
    render(<LoginPage />)
    
    const emailInput = screen.getByPlaceholderText('Email address')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign in' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('redirects to dashboard on successful login', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null })
    
    render(<LoginPage />)
    
    const emailInput = screen.getByPlaceholderText('Email address')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign in' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('displays user-friendly error message for invalid credentials', async () => {
    mockSignInWithPassword.mockResolvedValue({ 
      error: { message: 'Invalid login credentials' } 
    })
    
    render(<LoginPage />)
    
    const emailInput = screen.getByPlaceholderText('Email address')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign in' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password. Please check your credentials and try again.')).toBeInTheDocument()
    })
  })

  it('disables form inputs during loading', async () => {
    mockSignInWithPassword.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    render(<LoginPage />)
    
    const emailInput = screen.getByPlaceholderText('Email address')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign in' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Signing in...')).toBeInTheDocument()
    })
    
    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })
})