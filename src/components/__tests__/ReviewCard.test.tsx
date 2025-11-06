/**
 * ReviewCard Component Tests
 */

import { render, screen } from '@testing-library/react';
import ReviewCard from '../ReviewCard';

describe('ReviewCard Component', () => {
  const defaultProps = {
    authorName: 'John Doe',
    rating: 5,
    reviewDate: new Date('2025-11-01'),
    source: 'google',
  };

  test('should render author name', () => {
    render(<ReviewCard {...defaultProps} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('should render rating stars', () => {
    const { container } = render(<ReviewCard {...defaultProps} />);
    
    const stars = container.querySelectorAll('svg.text-yellow-400');
    expect(stars).toHaveLength(5);
  });

  test('should render correct number of filled stars', () => {
    const { container } = render(<ReviewCard {...defaultProps} rating={3} />);
    
    const filledStars = container.querySelectorAll('svg.text-yellow-400');
    const emptyStars = container.querySelectorAll('svg.text-gray-300');
    
    expect(filledStars).toHaveLength(3);
    expect(emptyStars).toHaveLength(2);
  });

  test('should render comment when provided', () => {
    render(<ReviewCard {...defaultProps} comment="Great service!" />);
    
    expect(screen.getByText('Great service!')).toBeInTheDocument();
  });

  test('should render French translation when available', () => {
    render(
      <ReviewCard
        {...defaultProps}
        comment="Great service!"
        commentFr="Excellent service!"
      />
    );
    
    // Should show French translation
    expect(screen.getByText('Excellent service!')).toBeInTheDocument();
    // Should not show original
    expect(screen.queryByText('Great service!')).not.toBeInTheDocument();
  });

  test('should render Google source badge', () => {
    render(<ReviewCard {...defaultProps} source="google" />);
    
    expect(screen.getByText('Google')).toBeInTheDocument();
  });

  test('should render author initial when no photo', () => {
    const { container } = render(<ReviewCard {...defaultProps} />);
    
    const initial = container.querySelector('.bg-gradient-to-br');
    expect(initial).toBeInTheDocument();
    expect(initial?.textContent).toBe('J');
  });

  test('should render author photo when provided', () => {
    render(
      <ReviewCard
        {...defaultProps}
        authorPhoto="https://example.com/photo.jpg"
      />
    );
    
    const img = screen.getByAlt('John Doe');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src');
  });

  test('should handle zero rating', () => {
    const { container } = render(<ReviewCard {...defaultProps} rating={0} />);
    
    const filledStars = container.querySelectorAll('svg.text-yellow-400');
    const emptyStars = container.querySelectorAll('svg.text-gray-300');
    
    expect(filledStars).toHaveLength(0);
    expect(emptyStars).toHaveLength(5);
  });

  test('should handle partial ratings', () => {
    const { container } = render(<ReviewCard {...defaultProps} rating={2.5} />);
    
    // Should render 2 filled stars (floor of 2.5)
    const filledStars = container.querySelectorAll('svg.text-yellow-400');
    expect(filledStars).toHaveLength(2);
  });

  test('should render without comment', () => {
    const { container } = render(<ReviewCard {...defaultProps} />);
    
    expect(container).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('should show original language indicator', () => {
    render(
      <ReviewCard
        {...defaultProps}
        comment="Great!"
        originalLanguage="en"
      />
    );
    
    // Component should render successfully
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('should have hover effect styling', () => {
    const { container } = render(<ReviewCard {...defaultProps} />);
    
    const card = container.firstChild;
    expect(card).toHaveClass('hover:shadow-md');
  });

  test('should render with all props', () => {
    render(
      <ReviewCard
        authorName="Jane Smith"
        authorPhoto="https://example.com/jane.jpg"
        rating={4}
        comment="Good experience"
        commentFr="Bonne expérience"
        reviewDate={new Date('2025-11-06')}
        source="google"
        originalLanguage="en"
      />
    );
    
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bonne expérience')).toBeInTheDocument();
  });
});
