import { render, screen } from '@testing-library/react';
import App from './App';

test('renders hero headline', () => {
  render(<App />);
  const heading = screen.getByText(/Private AI At Your Fingertips/i);
  expect(heading).toBeInTheDocument();
});
