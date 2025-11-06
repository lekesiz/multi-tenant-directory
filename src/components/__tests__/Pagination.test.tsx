/**
 * Pagination Component Tests
 */

import { render, screen } from '@testing-library/react';
import Pagination from '../Pagination';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    toString: jest.fn(() => ''),
  })),
}));

describe('Pagination Component', () => {
  test('should not render when totalPages is 1', () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={1}
        totalResults={10}
        resultsPerPage={10}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test('should render pagination when totalPages > 1', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        totalResults={50}
        resultsPerPage={10}
      />
    );

    expect(screen.getByText(/Affichage de/)).toBeInTheDocument();
  });

  test('should display correct results range', () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        totalResults={50}
        resultsPerPage={10}
      />
    );

    expect(screen.getByText('11')).toBeInTheDocument(); // Start result
    expect(screen.getByText('20')).toBeInTheDocument(); // End result
    expect(screen.getByText('50')).toBeInTheDocument(); // Total results
  });

  test('should display correct range for last page', () => {
    render(
      <Pagination
        currentPage={5}
        totalPages={5}
        totalResults={47}
        resultsPerPage={10}
      />
    );

    expect(screen.getByText('41')).toBeInTheDocument(); // Start result
    expect(screen.getByText('47')).toBeInTheDocument(); // End result (not 50)
  });

  test('should display correct range for first page', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        totalResults={50}
        resultsPerPage={10}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument(); // Start result
    expect(screen.getByText('10')).toBeInTheDocument(); // End result
  });
});
