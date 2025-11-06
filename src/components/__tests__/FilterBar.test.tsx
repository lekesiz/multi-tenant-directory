/**
 * FilterBar Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import FilterBar from '../FilterBar';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe('FilterBar Component', () => {
  const mockPush = jest.fn();
  const mockSearchParams = {
    get: jest.fn(),
    toString: jest.fn(() => ''),
  };

  const defaultProps = {
    categories: ['IT', 'Restaurant', 'Shop'],
    cities: ['Paris', 'Lyon', 'Marseille'],
    totalResults: 42,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    mockSearchParams.get.mockReturnValue('');
  });

  test('should render filter bar', () => {
    render(<FilterBar {...defaultProps} />);
    
    expect(screen.getByPlaceholderText(/Rechercher/i)).toBeInTheDocument();
  });

  test('should render total results', () => {
    render(<FilterBar {...defaultProps} />);
    
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  test('should render category options', () => {
    render(<FilterBar {...defaultProps} />);
    
    const categorySelect = screen.getByLabelText(/Catégorie/i);
    expect(categorySelect).toBeInTheDocument();
  });

  test('should render city options', () => {
    render(<FilterBar {...defaultProps} />);
    
    const citySelect = screen.getByLabelText(/Ville/i);
    expect(citySelect).toBeInTheDocument();
  });

  test('should render sort options', () => {
    render(<FilterBar {...defaultProps} />);
    
    const sortSelect = screen.getByLabelText(/Trier/i);
    expect(sortSelect).toBeInTheDocument();
  });

  test('should update URL on category change', () => {
    render(<FilterBar {...defaultProps} />);
    
    const categorySelect = screen.getByLabelText(/Catégorie/i);
    fireEvent.change(categorySelect, { target: { value: 'IT' } });

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('category=IT'));
  });

  test('should update URL on city change', () => {
    render(<FilterBar {...defaultProps} />);
    
    const citySelect = screen.getByLabelText(/Ville/i);
    fireEvent.change(citySelect, { target: { value: 'Paris' } });

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('city=Paris'));
  });

  test('should update URL on sort change', () => {
    render(<FilterBar {...defaultProps} />);
    
    const sortSelect = screen.getByLabelText(/Trier/i);
    fireEvent.change(sortSelect, { target: { value: 'rating-desc' } });

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('sort=rating-desc'));
  });

  test('should submit search on form submit', () => {
    render(<FilterBar {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText(/Rechercher/i);
    const form = searchInput.closest('form')!;
    
    fireEvent.change(searchInput, { target: { value: 'test' } });
    fireEvent.submit(form);

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('q=test'));
  });

  test('should clear all filters', () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === 'category') return 'IT';
      if (key === 'city') return 'Paris';
      return '';
    });

    render(<FilterBar {...defaultProps} />);
    
    const clearButton = screen.getByText(/Effacer/i);
    fireEvent.click(clearButton);

    expect(mockPush).toHaveBeenCalledWith('/annuaire');
  });

  test('should initialize with URL params', () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === 'category') return 'IT';
      if (key === 'city') return 'Paris';
      if (key === 'sort') return 'rating-desc';
      if (key === 'q') return 'test query';
      return '';
    });

    render(<FilterBar {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText(/Rechercher/i) as HTMLInputElement;
    expect(searchInput.value).toBe('test query');
  });

  test('should show clear button when filters are active', () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === 'category') return 'IT';
      return '';
    });

    render(<FilterBar {...defaultProps} />);
    
    expect(screen.getByText(/Effacer/i)).toBeInTheDocument();
  });

  test('should preserve other filters when changing one', () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === 'category') return 'IT';
      if (key === 'city') return 'Paris';
      return '';
    });
    mockSearchParams.toString.mockReturnValue('category=IT&city=Paris');

    render(<FilterBar {...defaultProps} />);
    
    const sortSelect = screen.getByLabelText(/Trier/i);
    fireEvent.change(sortSelect, { target: { value: 'rating-desc' } });

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('category=IT')
    );
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('city=Paris')
    );
  });

  test('should handle empty categories array', () => {
    render(<FilterBar {...defaultProps} categories={[]} />);
    
    const categorySelect = screen.getByLabelText(/Catégorie/i);
    expect(categorySelect).toBeInTheDocument();
  });

  test('should handle empty cities array', () => {
    render(<FilterBar {...defaultProps} cities={[]} />);
    
    const citySelect = screen.getByLabelText(/Ville/i);
    expect(citySelect).toBeInTheDocument();
  });

  test('should display zero results', () => {
    render(<FilterBar {...defaultProps} totalResults={0} />);
    
    expect(screen.getByText(/0/)).toBeInTheDocument();
  });
});
