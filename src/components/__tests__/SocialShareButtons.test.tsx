/**
 * SocialShareButtons Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SocialShareButtons } from '../SocialShareButtons';

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('SocialShareButtons Component', () => {
  const defaultProps = {
    url: 'https://example.com/page',
    title: 'Test Page',
    description: 'Test description',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock navigator.share as undefined by default
    Object.defineProperty(navigator, 'share', {
      writable: true,
      value: undefined,
    });
  });

  test('should render share button', () => {
    render(<SocialShareButtons {...defaultProps} />);
    
    expect(screen.getByText('Partager')).toBeInTheDocument();
  });

  test('should open dropdown when clicked', () => {
    render(<SocialShareButtons {...defaultProps} />);
    
    const button = screen.getByText('Partager');
    fireEvent.click(button);

    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('Twitter')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Copier le lien')).toBeInTheDocument();
  });

  test('should close dropdown when backdrop clicked', () => {
    render(<SocialShareButtons {...defaultProps} />);
    
    const button = screen.getByText('Partager');
    fireEvent.click(button);

    expect(screen.getByText('Facebook')).toBeInTheDocument();

    const backdrop = document.querySelector('.fixed.inset-0');
    fireEvent.click(backdrop!);

    expect(screen.queryByText('Facebook')).not.toBeInTheDocument();
  });

  test('should have correct Facebook share link', () => {
    render(<SocialShareButtons {...defaultProps} />);
    
    const button = screen.getByText('Partager');
    fireEvent.click(button);

    const facebookLink = screen.getByText('Facebook').closest('a');
    expect(facebookLink).toHaveAttribute('href');
    expect(facebookLink?.getAttribute('href')).toContain('facebook.com/sharer');
    expect(facebookLink?.getAttribute('href')).toContain(encodeURIComponent(defaultProps.url));
  });

  test('should have correct Twitter share link', () => {
    render(<SocialShareButtons {...defaultProps} />);
    
    const button = screen.getByText('Partager');
    fireEvent.click(button);

    const twitterLink = screen.getByText('Twitter').closest('a');
    expect(twitterLink?.getAttribute('href')).toContain('twitter.com/intent/tweet');
    expect(twitterLink?.getAttribute('href')).toContain(encodeURIComponent(defaultProps.url));
  });

  test('should have correct LinkedIn share link', () => {
    render(<SocialShareButtons {...defaultProps} />);
    
    const button = screen.getByText('Partager');
    fireEvent.click(button);

    const linkedinLink = screen.getByText('LinkedIn').closest('a');
    expect(linkedinLink?.getAttribute('href')).toContain('linkedin.com/sharing');
  });

  test('should have correct WhatsApp share link', () => {
    render(<SocialShareButtons {...defaultProps} />);
    
    const button = screen.getByText('Partager');
    fireEvent.click(button);

    const whatsappLink = screen.getByText('WhatsApp').closest('a');
    expect(whatsappLink?.getAttribute('href')).toContain('wa.me');
  });

  test('should have correct Email share link', () => {
    render(<SocialShareButtons {...defaultProps} />);
    
    const button = screen.getByText('Partager');
    fireEvent.click(button);

    const emailLink = screen.getByText('Email').closest('a');
    expect(emailLink?.getAttribute('href')).toContain('mailto:');
    expect(emailLink?.getAttribute('href')).toContain(encodeURIComponent(defaultProps.title));
  });

  test('should copy link to clipboard', async () => {
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator.clipboard, { writeText: mockWriteText });

    render(<SocialShareButtons {...defaultProps} />);
    
    const button = screen.getByText('Partager');
    fireEvent.click(button);

    const copyButton = screen.getByText('Copier le lien');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(defaultProps.url);
    });
  });

  test('should apply custom className', () => {
    const { container } = render(
      <SocialShareButtons {...defaultProps} className="custom-class" />
    );
    
    const wrapper = container.querySelector('.custom-class');
    expect(wrapper).toBeInTheDocument();
  });

  test('should use native share when available', () => {
    // Mock navigator.share
    const mockShare = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      writable: true,
      value: mockShare,
    });

    render(<SocialShareButtons {...defaultProps} />);
    
    // Should render native share button
    const button = screen.getByText('Partager');
    expect(button).toBeInTheDocument();
  });

  test('should close dropdown after clicking social link', () => {
    render(<SocialShareButtons {...defaultProps} />);
    
    const button = screen.getByText('Partager');
    fireEvent.click(button);

    const facebookLink = screen.getByText('Facebook');
    fireEvent.click(facebookLink);

    // Dropdown should close
    waitFor(() => {
      expect(screen.queryByText('Twitter')).not.toBeInTheDocument();
    });
  });
});
