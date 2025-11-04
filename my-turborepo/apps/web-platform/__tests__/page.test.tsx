import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../app/page';

describe('Home Page', () => {
  it('renders the welcome message and chat interface', () => {
    render(<Home />);
    
    // Check for the heading
    const heading = screen.getByText(/Civic Voice Assistant/i);
    expect(heading).toBeInTheDocument();
    
    // Check for the description
    expect(screen.getByText(/Ask questions about civic information and services/i)).toBeInTheDocument();
    
    // Check for the chat interface components
    expect(screen.getByTestId('messages-area')).toBeInTheDocument();
    expect(screen.getByTestId('message-input')).toBeInTheDocument();
    expect(screen.getByTestId('send-button')).toBeInTheDocument();
  });
});
