import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CompanyStatusToggle from '@/app/admin/companies/company-status-toggle';
import { toast } from 'sonner';

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

// Mock window.location.reload
delete (window as any).location;
window.location = { reload: jest.fn() } as any;

describe('CompanyStatusToggle', () => {
  const mockProps = {
    companyId: 1,
    isActive: true,
    companyName: 'Test Company',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render active status correctly', () => {
    render(<CompanyStatusToggle {...mockProps} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('✓ Actif');
    expect(button).toHaveClass('bg-green-100');
  });

  it('should render inactive status correctly', () => {
    render(<CompanyStatusToggle {...mockProps} isActive={false} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('🚫 Inactif');
    expect(button).toHaveClass('bg-red-100');
  });

  it('should toggle status on click', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<CompanyStatusToggle {...mockProps} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/companies/1/status',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ isActive: false }),
        })
      );
    });

    expect(toast.success).toHaveBeenCalledWith('Test Company désactivée');
  });

  it('should handle errors gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed' }),
    });

    render(<CompanyStatusToggle {...mockProps} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it('should disable button while loading', async () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );

    render(<CompanyStatusToggle {...mockProps} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });
});
