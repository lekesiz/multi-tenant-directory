/**
 * OptimizedImage Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OptimizedImage from '../OptimizedImage';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} onLoad={() => props.onLoadingComplete?.()} />;
  },
}));

describe('OptimizedImage', () => {
  const defaultProps = {
    src: '/test-image.jpg',
    alt: 'Test Image',
    width: 800,
    height: 600,
  };

  describe('Rendering', () => {
    test('should render image with default props', () => {
      render(<OptimizedImage {...defaultProps} />);
      const image = screen.getByAltText('Test Image');
      expect(image).toBeInTheDocument();
    });

    test('should render with custom className', () => {
      const { container } = render(
        <OptimizedImage {...defaultProps} className="custom-class" />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });

    test('should use provided src', () => {
      render(<OptimizedImage {...defaultProps} />);
      const image = screen.getByAltText('Test Image');
      expect(image).toHaveAttribute('src', '/test-image.jpg');
    });

    test('should use fallback src when src is empty', () => {
      render(<OptimizedImage {...defaultProps} src="" />);
      const image = screen.getByAltText('Test Image');
      expect(image).toHaveAttribute('src', '/images/placeholder.png');
    });

    test('should render with fill prop', () => {
      render(<OptimizedImage {...defaultProps} fill={true} />);
      const image = screen.getByAltText('Test Image');
      expect(image).toHaveAttribute('fill');
    });

    test('should render with priority prop', () => {
      render(<OptimizedImage {...defaultProps} priority={true} />);
      const image = screen.getByAltText('Test Image');
      expect(image).toHaveAttribute('priority');
    });

    test('should render with custom quality', () => {
      render(<OptimizedImage {...defaultProps} quality={90} />);
      const image = screen.getByAltText('Test Image');
      expect(image).toHaveAttribute('quality', '90');
    });

    test('should render with sizes prop', () => {
      render(<OptimizedImage {...defaultProps} sizes="(max-width: 768px) 100vw, 50vw" />);
      const image = screen.getByAltText('Test Image');
      expect(image).toHaveAttribute('sizes', '(max-width: 768px) 100vw, 50vw');
    });
  });

  describe('Loading States', () => {
    test('should apply loading classes initially', () => {
      render(<OptimizedImage {...defaultProps} />);
      const image = screen.getByAltText('Test Image');
      expect(image).toHaveClass('scale-110');
      expect(image).toHaveClass('blur-2xl');
      expect(image).toHaveClass('grayscale');
    });

    test('should remove loading classes after load', () => {
      render(<OptimizedImage {...defaultProps} />);
      const image = screen.getByAltText('Test Image');
      
      // Trigger onLoadingComplete
      fireEvent.load(image);
      
      expect(image).toHaveClass('scale-100');
      expect(image).toHaveClass('blur-0');
      expect(image).toHaveClass('grayscale-0');
    });

    test('should have transition classes', () => {
      render(<OptimizedImage {...defaultProps} />);
      const image = screen.getByAltText('Test Image');
      expect(image).toHaveClass('duration-700');
      expect(image).toHaveClass('ease-in-out');
    });
  });

  describe('Error Handling', () => {
    test('should show fallback UI on error', () => {
      render(<OptimizedImage {...defaultProps} />);
      const image = screen.getByAltText('Test Image');
      
      // Trigger error
      fireEvent.error(image);
      
      // Image should be replaced with fallback
      expect(screen.queryByAltText('Test Image')).not.toBeInTheDocument();
      
      // Fallback SVG should be present
      const fallback = screen.getByRole('img', { hidden: true });
      expect(fallback).toBeInTheDocument();
    });

    test('should apply correct styles to error fallback', () => {
      const { container } = render(
        <OptimizedImage {...defaultProps} className="custom-error-class" />
      );
      const image = screen.getByAltText('Test Image');
      
      // Trigger error
      fireEvent.error(image);
      
      const fallback = container.querySelector('.bg-gray-200');
      expect(fallback).toBeInTheDocument();
      expect(fallback).toHaveClass('custom-error-class');
    });

    test('should apply width and height to error fallback', () => {
      const { container } = render(
        <OptimizedImage {...defaultProps} width={400} height={300} />
      );
      const image = screen.getByAltText('Test Image');
      
      // Trigger error
      fireEvent.error(image);
      
      const fallback = container.querySelector('.bg-gray-200') as HTMLElement;
      expect(fallback.style.width).toBe('400px');
      expect(fallback.style.height).toBe('300px');
    });
  });

  describe('Props Combinations', () => {
    test('should work with fill and no width/height', () => {
      render(<OptimizedImage src="/test.jpg" alt="Test" fill={true} />);
      const image = screen.getByAltText('Test');
      expect(image).toHaveAttribute('fill');
      expect(image).not.toHaveAttribute('width');
      expect(image).not.toHaveAttribute('height');
    });

    test('should work with width and height when not fill', () => {
      render(<OptimizedImage {...defaultProps} />);
      const image = screen.getByAltText('Test Image');
      expect(image).toHaveAttribute('width', '800');
      expect(image).toHaveAttribute('height', '600');
    });

    test('should use lazy loading when not priority', () => {
      render(<OptimizedImage {...defaultProps} priority={false} />);
      const image = screen.getByAltText('Test Image');
      expect(image).toHaveAttribute('loading', 'lazy');
    });

    test('should not use lazy loading when priority', () => {
      render(<OptimizedImage {...defaultProps} priority={true} />);
      const image = screen.getByAltText('Test Image');
      expect(image).not.toHaveAttribute('loading');
    });
  });

  describe('Blur Placeholder', () => {
    test('should have blur placeholder', () => {
      render(<OptimizedImage {...defaultProps} />);
      const image = screen.getByAltText('Test Image');
      expect(image).toHaveAttribute('placeholder', 'blur');
    });

    test('should have blurDataURL', () => {
      render(<OptimizedImage {...defaultProps} />);
      const image = screen.getByAltText('Test Image');
      expect(image).toHaveAttribute('blurDataURL');
      expect(image.getAttribute('blurDataURL')).toContain('data:image/png;base64');
    });
  });

  describe('Accessibility', () => {
    test('should have alt text', () => {
      render(<OptimizedImage {...defaultProps} />);
      expect(screen.getByAltText('Test Image')).toBeInTheDocument();
    });

    test('should use provided alt text', () => {
      render(<OptimizedImage {...defaultProps} alt="Custom Alt Text" />);
      expect(screen.getByAltText('Custom Alt Text')).toBeInTheDocument();
    });

    test('should have alt text even on error', () => {
      render(<OptimizedImage {...defaultProps} />);
      const image = screen.getByAltText('Test Image');
      
      // Trigger error
      fireEvent.error(image);
      
      // Fallback should still be accessible
      const fallback = screen.getByRole('img', { hidden: true });
      expect(fallback).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('should handle missing width and height with fill', () => {
      render(<OptimizedImage src="/test.jpg" alt="Test" fill={true} />);
      const image = screen.getByAltText('Test');
      expect(image).toBeInTheDocument();
    });

    test('should handle quality at minimum (1)', () => {
      render(<OptimizedImage {...defaultProps} quality={1} />);
      const image = screen.getByAltText('Test Image');
      expect(image).toHaveAttribute('quality', '1');
    });

    test('should handle quality at maximum (100)', () => {
      render(<OptimizedImage {...defaultProps} quality={100} />);
      const image = screen.getByAltText('Test Image');
      expect(image).toHaveAttribute('quality', '100');
    });

    test('should handle very long alt text', () => {
      const longAlt = 'A'.repeat(500);
      render(<OptimizedImage {...defaultProps} alt={longAlt} />);
      expect(screen.getByAltText(longAlt)).toBeInTheDocument();
    });

    test('should handle special characters in src', () => {
      render(<OptimizedImage {...defaultProps} src="/test image (1).jpg" />);
      const image = screen.getByAltText('Test Image');
      expect(image).toHaveAttribute('src', '/test image (1).jpg');
    });
  });
});
