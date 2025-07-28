import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DebugStatus from '../pages/DebugStatus.tsx';
jest.mock('../hooks/useErrorLog', () => ({
  useErrorLog: () => ['Boom test error'],
}));

jest.mock('../components/ConnectionBanner', () => ({
  default: () => <div data-testid="banner">Mock Banner</div>,
}));

describe('DebugStatus page', () => {
  test('renders error logs from hook', () => {
    render(<DebugStatus />);
    expect(screen.getByText(/Boom test error/i)).toBeInTheDocument();
  });
});
