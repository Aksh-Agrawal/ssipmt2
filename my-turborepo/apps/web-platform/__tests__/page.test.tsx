import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../app/page';

describe('Home Page', () => {
  it('renders the welcome message', () => {
    render(<Home />);
    const heading = screen.getByText(/Welcome to Civic Voice Assistant/i);
    expect(heading).toBeInTheDocument();
  });
});
