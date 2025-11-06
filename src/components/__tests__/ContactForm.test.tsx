/**
 * ContactForm Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactForm from '../ContactForm';

// Mock fetch
global.fetch = jest.fn();

describe('ContactForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render all form fields', () => {
    render(<ContactForm domainColor="#000000" />);
    
    expect(screen.getByLabelText(/Nom complet/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Téléphone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sujet/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
  });

  test('should update form data on input change', () => {
    render(<ContactForm domainColor="#000000" />);
    
    const nameInput = screen.getByLabelText(/Nom complet/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    
    expect(nameInput.value).toBe('John Doe');
  });

  test('should submit form with correct data', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    render(<ContactForm domainColor="#000000" />);
    
    fireEvent.change(screen.getByLabelText(/Nom complet/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Message/i), {
      target: { value: 'Test message' },
    });

    const form = screen.getByRole('form') || screen.getByLabelText(/Nom complet/i).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/contact',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('John Doe'),
        })
      );
    });
  });

  test('should show success message on successful submission', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    render(<ContactForm domainColor="#000000" />);
    
    fireEvent.change(screen.getByLabelText(/Nom complet/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'john@example.com' },
    });

    const form = screen.getByLabelText(/Nom complet/i).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Message envoyé/i)).toBeInTheDocument();
    });
  });

  test('should show error message on failed submission', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Server error' }),
    });

    render(<ContactForm domainColor="#000000" />);
    
    fireEvent.change(screen.getByLabelText(/Nom complet/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'john@example.com' },
    });

    const form = screen.getByLabelText(/Nom complet/i).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Server error/i)).toBeInTheDocument();
    });
  });

  test('should clear form after successful submission', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    render(<ContactForm domainColor="#000000" />);
    
    const nameInput = screen.getByLabelText(/Nom complet/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

    const form = nameInput.closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(nameInput.value).toBe('');
      expect(emailInput.value).toBe('');
    });
  });

  test('should handle network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<ContactForm domainColor="#000000" />);
    
    fireEvent.change(screen.getByLabelText(/Nom complet/i), {
      target: { value: 'John Doe' },
    });

    const form = screen.getByLabelText(/Nom complet/i).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Impossible de contacter le serveur/i)).toBeInTheDocument();
    });
  });

  test('should disable submit button while loading', async () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100))
    );

    render(<ContactForm domainColor="#000000" />);
    
    fireEvent.change(screen.getByLabelText(/Nom complet/i), {
      target: { value: 'John Doe' },
    });

    const form = screen.getByLabelText(/Nom complet/i).closest('form')!;
    fireEvent.submit(form);

    const submitButton = screen.getByRole('button', { name: /Envoyer/i });
    expect(submitButton).toBeDisabled();
  });

  test('should have required fields', () => {
    render(<ContactForm domainColor="#000000" />);
    
    const nameInput = screen.getByLabelText(/Nom complet/i);
    const emailInput = screen.getByLabelText(/Email/i);
    
    expect(nameInput).toBeRequired();
    expect(emailInput).toBeRequired();
  });

  test('should accept domain color prop', () => {
    render(<ContactForm domainColor="#FF0000" />);
    
    // Component should render without errors
    expect(screen.getByLabelText(/Nom complet/i)).toBeInTheDocument();
  });
});
