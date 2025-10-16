/**
 * ReviewCard Component Tests
 *
 * Tests for src/components/ReviewCard.tsx
 */

import { render, screen } from '@testing-library/react';
import ReviewCard from '@/components/ReviewCard';

describe('ReviewCard', () => {
  const defaultProps = {
    authorName: 'Marie Dupont',
    rating: 5,
    comment: 'Excellent service et produits de qualité!',
    reviewDate: new Date('2025-10-01'),
    source: 'local',
  };

  it('should render author name', () => {
    render(<ReviewCard {...defaultProps} />);

    expect(screen.getByText('Marie Dupont')).toBeInTheDocument();
  });

  it('should render comment', () => {
    render(<ReviewCard {...defaultProps} />);

    expect(
      screen.getByText('Excellent service et produits de qualité!')
    ).toBeInTheDocument();
  });

  it('should render formatted date in French', () => {
    render(<ReviewCard {...defaultProps} />);

    // French date format: "1 octobre 2025"
    expect(screen.getByText(/octobre/i)).toBeInTheDocument();
  });

  describe('Author photo', () => {
    it('should render author photo when provided', () => {
      render(
        <ReviewCard
          {...defaultProps}
          authorPhoto="https://example.com/photo.jpg"
        />
      );

      const image = screen.getByRole('img', { name: 'Marie Dupont' });
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src');
    });

    it('should render initial letter when no photo', () => {
      render(<ReviewCard {...defaultProps} />);

      // Should render "M" in a circle
      expect(screen.getByText('M')).toBeInTheDocument();
    });

    it('should handle author names starting with lowercase', () => {
      render(<ReviewCard {...defaultProps} authorName="jean martin" />);

      expect(screen.getByText('J')).toBeInTheDocument();
    });
  });

  describe('Star rating', () => {
    it('should render 5 filled stars for 5-star rating', () => {
      const { container } = render(<ReviewCard {...defaultProps} rating={5} />);

      const stars = container.querySelectorAll('svg.text-yellow-400');
      expect(stars).toHaveLength(5);
    });

    it('should render 3 filled stars for 3-star rating', () => {
      const { container } = render(<ReviewCard {...defaultProps} rating={3} />);

      const filledStars = container.querySelectorAll('svg.text-yellow-400');
      const emptyStars = container.querySelectorAll('svg.text-gray-300');

      expect(filledStars).toHaveLength(3);
      expect(emptyStars).toHaveLength(2);
    });

    it('should render 0 filled stars for 0-star rating', () => {
      const { container } = render(<ReviewCard {...defaultProps} rating={0} />);

      const filledStars = container.querySelectorAll('svg.text-yellow-400');
      expect(filledStars).toHaveLength(0);
    });

    it('should render 1 filled star for 1-star rating', () => {
      const { container } = render(<ReviewCard {...defaultProps} rating={1} />);

      const filledStars = container.querySelectorAll('svg.text-yellow-400');
      expect(filledStars).toHaveLength(1);
    });
  });

  describe('Source badge', () => {
    it('should render Google badge for Google reviews', () => {
      render(<ReviewCard {...defaultProps} source="google" />);

      expect(screen.getByText('Google')).toBeInTheDocument();
    });

    it('should not render badge for local reviews', () => {
      render(<ReviewCard {...defaultProps} source="local" />);

      expect(screen.queryByText('Google')).not.toBeInTheDocument();
    });
  });

  describe('Comment handling', () => {
    it('should render comment when provided', () => {
      render(
        <ReviewCard
          {...defaultProps}
          comment="This is a great place!"
        />
      );

      expect(screen.getByText('This is a great place!')).toBeInTheDocument();
    });

    it('should not render comment section when comment is null', () => {
      render(<ReviewCard {...defaultProps} comment={null} />);

      const card = screen.getByText('Marie Dupont').closest('div');
      expect(card).not.toHaveTextContent('Excellent service');
    });

    it('should not render comment section when comment is empty string', () => {
      render(<ReviewCard {...defaultProps} comment="" />);

      const card = screen.getByText('Marie Dupont').closest('div');
      expect(card).not.toHaveTextContent('Excellent service');
    });

    it('should handle long comments', () => {
      const longComment = 'A'.repeat(500);
      render(<ReviewCard {...defaultProps} comment={longComment} />);

      expect(screen.getByText(longComment)).toBeInTheDocument();
    });
  });

  describe('CSS classes', () => {
    it('should have proper container classes', () => {
      const { container } = render(<ReviewCard {...defaultProps} />);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow-sm');
    });

    it('should have hover effect classes', () => {
      const { container } = render(<ReviewCard {...defaultProps} />);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('hover:shadow-md', 'transition-shadow');
    });
  });

  describe('Accessibility', () => {
    it('should have proper alt text for author photo', () => {
      render(
        <ReviewCard
          {...defaultProps}
          authorPhoto="https://example.com/photo.jpg"
        />
      );

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', 'Marie Dupont');
    });

    it('should render semantic HTML', () => {
      const { container } = render(<ReviewCard {...defaultProps} />);

      // Should have proper heading for author name
      expect(container.querySelector('h4')).toBeInTheDocument();

      // Should have proper paragraph for comment
      expect(container.querySelector('p')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle special characters in author name', () => {
      render(
        <ReviewCard {...defaultProps} authorName="François L'Hôte" />
      );

      expect(screen.getByText("François L'Hôte")).toBeInTheDocument();
    });

    it('should handle special characters in comment', () => {
      render(
        <ReviewCard
          {...defaultProps}
          comment="C'est génial! L'ambiance était parfaite. 🎉"
        />
      );

      expect(
        screen.getByText("C'est génial! L'ambiance était parfaite. 🎉")
      ).toBeInTheDocument();
    });

    it('should handle very old dates', () => {
      render(
        <ReviewCard
          {...defaultProps}
          reviewDate={new Date('2020-01-01')}
        />
      );

      expect(screen.getByText(/2020/)).toBeInTheDocument();
    });

    it('should handle future dates', () => {
      render(
        <ReviewCard
          {...defaultProps}
          reviewDate={new Date('2030-12-31')}
        />
      );

      expect(screen.getByText(/2030/)).toBeInTheDocument();
    });
  });
});
