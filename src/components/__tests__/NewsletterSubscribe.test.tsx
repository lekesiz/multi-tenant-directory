/**
 * NewsletterSubscribe Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewsletterSubscribe from '../NewsletterSubscribe';

// Mock fetch
global.fetch = jest.fn();

describe('NewsletterSubscribe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  describe('Inline Variant (Default)', () => {
    test('should render inline variant by default', () => {
      render(<NewsletterSubscribe />);
      expect(screen.getByText('Abonnez-vous à notre newsletter')).toBeInTheDocument();
    });

    test('should render email input', () => {
      render(<NewsletterSubscribe />);
      const emailInput = screen.getByPlaceholderText('Votre email');
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
    });

    test('should render subscribe button', () => {
      render(<NewsletterSubscribe />);
      expect(screen.getByText('S\'abonner')).toBeInTheDocument();
    });

    test('should not render firstName input in inline variant', () => {
      render(<NewsletterSubscribe />);
      expect(screen.queryByPlaceholderText('Jean')).not.toBeInTheDocument();
    });
  });

  describe('Footer Variant', () => {
    test('should render footer variant', () => {
      render(<NewsletterSubscribe variant="footer" />);
      expect(screen.getByText('Newsletter')).toBeInTheDocument();
    });

    test('should render email input in footer', () => {
      render(<NewsletterSubscribe variant="footer" />);
      expect(screen.getByPlaceholderText('Votre email')).toBeInTheDocument();
    });

    test('should render subscribe button in footer', () => {
      render(<NewsletterSubscribe variant="footer" />);
      expect(screen.getByText('S\'abonner')).toBeInTheDocument();
    });
  });

  describe('Modal Variant', () => {
    test('should render modal variant', () => {
      render(<NewsletterSubscribe variant="modal" />);
      expect(screen.getByText('Restez informé')).toBeInTheDocument();
    });

    test('should render firstName input in modal', () => {
      render(<NewsletterSubscribe variant="modal" />);
      expect(screen.getByPlaceholderText('Jean')).toBeInTheDocument();
    });

    test('should render email input in modal', () => {
      render(<NewsletterSubscribe variant="modal" />);
      expect(screen.getByPlaceholderText('jean@example.com')).toBeInTheDocument();
    });

    test('should not show preferences by default', () => {
      render(<NewsletterSubscribe variant="modal" />);
      expect(screen.queryByText('Préférences')).not.toBeInTheDocument();
    });

    test('should show preferences when showPreferences is true', () => {
      render(<NewsletterSubscribe variant="modal" showPreferences={true} />);
      expect(screen.getByText('Préférences')).toBeInTheDocument();
      expect(screen.getByText('Résumé hebdomadaire')).toBeInTheDocument();
      expect(screen.getByText('Nouvelles entreprises')).toBeInTheDocument();
      expect(screen.getByText('Offres spéciales')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    test('should submit email successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<NewsletterSubscribe />);
      
      const emailInput = screen.getByPlaceholderText('Votre email');
      const submitButton = screen.getByText('S\'abonner');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            firstName: undefined,
            preferences: undefined,
          }),
        });
      });
    });

    test('should show loading state during submission', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<NewsletterSubscribe />);
      
      const emailInput = screen.getByPlaceholderText('Votre email');
      const submitButton = screen.getByText('S\'abonner');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      expect(screen.getByText('...')).toBeInTheDocument();
    });

    test('should show success state after submission', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<NewsletterSubscribe />);
      
      const emailInput = screen.getByPlaceholderText('Votre email');
      const submitButton = screen.getByText('S\'abonner');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('✓')).toBeInTheDocument();
      });
    });

    test('should clear email after successful submission', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<NewsletterSubscribe />);
      
      const emailInput = screen.getByPlaceholderText('Votre email') as HTMLInputElement;
      const submitButton = screen.getByText('S\'abonner');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(emailInput.value).toBe('');
      });
    });

    test('should show error message on failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Email déjà inscrit' }),
      });

      render(<NewsletterSubscribe />);
      
      const emailInput = screen.getByPlaceholderText('Votre email');
      const submitButton = screen.getByText('S\'abonner');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email déjà inscrit')).toBeInTheDocument();
      });
    });

    test('should handle network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<NewsletterSubscribe />);
      
      const emailInput = screen.getByPlaceholderText('Votre email');
      const submitButton = screen.getByText('S\'abonner');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
  });

  describe('Modal Variant with Preferences', () => {
    test('should submit with firstName and preferences', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<NewsletterSubscribe variant="modal" showPreferences={true} />);
      
      const firstNameInput = screen.getByPlaceholderText('Jean');
      const emailInput = screen.getByPlaceholderText('jean@example.com');
      const submitButton = screen.getByText('S\'abonner à la newsletter');

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'john@example.com',
            firstName: 'John',
            preferences: {
              weeklyDigest: true,
              newBusinesses: true,
              specialOffers: false,
            },
          }),
        });
      });
    });

    test('should toggle preferences checkboxes', () => {
      render(<NewsletterSubscribe variant="modal" showPreferences={true} />);
      
      const weeklyDigest = screen.getByText('Résumé hebdomadaire').previousSibling as HTMLInputElement;
      const specialOffers = screen.getByText('Offres spéciales').previousSibling as HTMLInputElement;

      expect(weeklyDigest.checked).toBe(true);
      expect(specialOffers.checked).toBe(false);

      fireEvent.click(weeklyDigest);
      fireEvent.click(specialOffers);

      expect(weeklyDigest.checked).toBe(false);
      expect(specialOffers.checked).toBe(true);
    });

    test('should show success message in modal', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<NewsletterSubscribe variant="modal" />);
      
      const emailInput = screen.getByPlaceholderText('jean@example.com');
      const submitButton = screen.getByText('S\'abonner à la newsletter');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('✓ Inscription réussie ! Vérifiez votre email.')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('should have required attribute on email input', () => {
      render(<NewsletterSubscribe />);
      const emailInput = screen.getByPlaceholderText('Votre email');
      expect(emailInput).toHaveAttribute('required');
    });

    test('should disable inputs during submission', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<NewsletterSubscribe />);
      
      const emailInput = screen.getByPlaceholderText('Votre email');
      const submitButton = screen.getByText('S\'abonner');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      expect(emailInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });

    test('should have proper labels in modal variant', () => {
      render(<NewsletterSubscribe variant="modal" />);
      expect(screen.getByLabelText('Prénom (optionnel)')).toBeInTheDocument();
      expect(screen.getByLabelText('Email *')).toBeInTheDocument();
    });
  });
});
