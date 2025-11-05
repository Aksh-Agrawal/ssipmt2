import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../app/page';

describe('Home Page', () => {
  it('renders the welcome message and chat interface', async () => {
    render(<Home />);

    // Check for the heading
    const heading = screen.getByText(/Civic Voice Assistant/i);
    expect(heading).toBeInTheDocument();

    // Check for the description
    expect(
      screen.getByText(/Get real-time information about civic services, traffic, and city updates/i)
    ).toBeInTheDocument();

    // Wait for the chat interface to load (it's dynamically imported)
    await waitFor(() => {
      expect(screen.getByTestId('messages-area')).toBeInTheDocument();
    });

    expect(screen.getByTestId('message-input')).toBeInTheDocument();
    expect(screen.getByTestId('send-button')).toBeInTheDocument();
  });
});
