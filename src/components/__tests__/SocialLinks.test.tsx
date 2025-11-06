/**
 * SocialLinks Component Tests
 */

import { render, screen } from '@testing-library/react';
import SocialLinks from '../SocialLinks';

describe('SocialLinks Component', () => {
  test('should return null when no links provided', () => {
    const { container } = render(<SocialLinks />);
    expect(container.firstChild).toBeNull();
  });

  test('should render website link', () => {
    render(<SocialLinks website="https://example.com" />);
    
    const link = screen.getByTitle('Website');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  test('should render social media links', () => {
    const socialLinks = [
      { platform: 'facebook', url: 'https://facebook.com/test' },
      { platform: 'instagram', url: 'https://instagram.com/test' },
    ];

    render(<SocialLinks socialLinks={socialLinks} />);
    
    expect(screen.getByTitle('Facebook')).toBeInTheDocument();
    expect(screen.getByTitle('Instagram')).toBeInTheDocument();
  });

  test('should render both website and social links', () => {
    const socialLinks = [
      { platform: 'twitter', url: 'https://twitter.com/test' },
    ];

    render(<SocialLinks website="https://example.com" socialLinks={socialLinks} />);
    
    expect(screen.getByTitle('Website')).toBeInTheDocument();
    expect(screen.getByTitle('Twitter')).toBeInTheDocument();
  });

  test('should have correct href attributes', () => {
    const socialLinks = [
      { platform: 'facebook', url: 'https://facebook.com/test' },
    ];

    render(<SocialLinks socialLinks={socialLinks} />);
    
    const link = screen.getByTitle('Facebook');
    expect(link).toHaveAttribute('href', 'https://facebook.com/test');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('should render all supported platforms', () => {
    const socialLinks = [
      { platform: 'facebook', url: 'https://facebook.com/test' },
      { platform: 'instagram', url: 'https://instagram.com/test' },
      { platform: 'twitter', url: 'https://twitter.com/test' },
      { platform: 'linkedin', url: 'https://linkedin.com/test' },
      { platform: 'youtube', url: 'https://youtube.com/test' },
      { platform: 'tiktok', url: 'https://tiktok.com/test' },
      { platform: 'pinterest', url: 'https://pinterest.com/test' },
    ];

    render(<SocialLinks socialLinks={socialLinks} />);
    
    expect(screen.getByTitle('Facebook')).toBeInTheDocument();
    expect(screen.getByTitle('Instagram')).toBeInTheDocument();
    expect(screen.getByTitle('Twitter')).toBeInTheDocument();
    expect(screen.getByTitle('Linkedin')).toBeInTheDocument();
    expect(screen.getByTitle('Youtube')).toBeInTheDocument();
    expect(screen.getByTitle('Tiktok')).toBeInTheDocument();
    expect(screen.getByTitle('Pinterest')).toBeInTheDocument();
  });

  test('should render fallback icon for unknown platform', () => {
    const socialLinks = [
      { platform: 'unknown', url: 'https://unknown.com/test' },
    ];

    const { container } = render(<SocialLinks socialLinks={socialLinks} />);
    
    const link = screen.getByTitle('Unknown');
    expect(link).toBeInTheDocument();
    
    // Should have a fallback SVG icon
    const svg = link.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  test('should have hover styles', () => {
    render(<SocialLinks website="https://example.com" />);
    
    const link = screen.getByTitle('Website');
    expect(link).toHaveClass('hover:bg-blue-100', 'hover:text-blue-600');
  });

  test('should capitalize platform name in title', () => {
    const socialLinks = [
      { platform: 'facebook', url: 'https://facebook.com/test' },
    ];

    render(<SocialLinks socialLinks={socialLinks} />);
    
    // Title should be capitalized
    expect(screen.getByTitle('Facebook')).toBeInTheDocument();
  });

  test('should handle empty socialLinks array', () => {
    render(<SocialLinks socialLinks={[]} website="https://example.com" />);
    
    // Should only render website link
    expect(screen.getByTitle('Website')).toBeInTheDocument();
  });

  test('should handle null socialLinks', () => {
    render(<SocialLinks socialLinks={null} website="https://example.com" />);
    
    expect(screen.getByTitle('Website')).toBeInTheDocument();
  });
});
