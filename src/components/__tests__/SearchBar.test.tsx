/**
 * SearchBar Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchBar from '../SearchBar';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('SearchBar Component', () => {
  const mockPush = jest.fn();
  const mockSearchParams = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    mockSearchParams.get.mockReturnValue('');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ suggestions: [] }),
    });
  });

  test('should render search input', () => {
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText(/Rechercher/i);
    expect(input).toBeInTheDocument();
  });

  test('should update query on input change', () => {
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText(/Rechercher/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test' } });
    
    expect(input.value).toBe('test');
  });

  test('should fetch suggestions when query length >= 2', async () => {
    const mockSuggestions = [
      {
        id: 1,
        name: 'Test Company',
        slug: 'test-company',
        city: 'Paris',
        category: 'IT',
        rating: 4.5,
        reviewCount: 10,
        label: 'Test Company',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ suggestions: mockSuggestions }),
    });

    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText(/Rechercher/i);
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/search/suggestions?q=test')
      );
    }, { timeout: 500 });
  });

  test('should not fetch suggestions when query length < 2', async () => {
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText(/Rechercher/i);
    fireEvent.change(input, { target: { value: 'a' } });

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    }, { timeout: 500 });
  });

  test('should navigate to search results on form submit', () => {
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText(/Rechercher/i);
    const form = input.closest('form')!;
    
    fireEvent.change(input, { target: { value: 'test query' } });
    fireEvent.submit(form);

    expect(mockPush).toHaveBeenCalledWith('/annuaire?search=test%20query');
  });

  test('should not navigate on empty query submit', () => {
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText(/Rechercher/i);
    const form = input.closest('form')!;
    
    fireEvent.submit(form);

    expect(mockPush).not.toHaveBeenCalled();
  });

  test('should initialize with query from URL params', () => {
    mockSearchParams.get.mockReturnValue('initial query');
    
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText(/Rechercher/i) as HTMLInputElement;
    expect(input.value).toBe('initial query');
  });

  test('should handle fetch error gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText(/Rechercher/i);
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    }, { timeout: 500 });

    // Should not crash
    expect(input).toBeInTheDocument();
  });

  test('should debounce search queries', async () => {
    jest.useFakeTimers();
    
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText(/Rechercher/i);
    
    fireEvent.change(input, { target: { value: 't' } });
    fireEvent.change(input, { target: { value: 'te' } });
    fireEvent.change(input, { target: { value: 'tes' } });
    fireEvent.change(input, { target: { value: 'test' } });

    // Should not call fetch immediately
    expect(global.fetch).not.toHaveBeenCalled();

    // Fast forward 300ms
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      // Should only call fetch once after debounce
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    jest.useRealTimers();
  });

  test('should have search button', () => {
    render(<SearchBar />);
    
    const button = screen.getByRole('button', { name: /rechercher/i });
    expect(button).toBeInTheDocument();
  });

  test('should trim whitespace from query', () => {
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText(/Rechercher/i);
    const form = input.closest('form')!;
    
    fireEvent.change(input, { target: { value: '  test query  ' } });
    fireEvent.submit(form);

    expect(mockPush).toHaveBeenCalledWith('/annuaire?search=test%20query');
  });
});
