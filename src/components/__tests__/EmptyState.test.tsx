/**
 * EmptyState Components Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState, NoPhotosEmptyState, NoReviewsEmptyState, NoDataEmptyState } from '../EmptyState';

// Mock icon component
const MockIcon = ({ className }: { className?: string }) => (
  <div className={className} data-testid="mock-icon">Icon</div>
);

describe('EmptyState Components', () => {
  describe('EmptyState', () => {
    test('should render title and description', () => {
      render(
        <EmptyState
          icon={MockIcon}
          title="Test Title"
          description="Test Description"
        />
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    test('should render icon', () => {
      render(
        <EmptyState
          icon={MockIcon}
          title="Test"
          description="Test"
        />
      );

      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    });

    test('should render action button when provided', () => {
      const onAction = jest.fn();
      render(
        <EmptyState
          icon={MockIcon}
          title="Test"
          description="Test"
          actionLabel="Click Me"
          onAction={onAction}
        />
      );

      const button = screen.getByText('Click Me');
      expect(button).toBeInTheDocument();
    });

    test('should call onAction when button clicked', () => {
      const onAction = jest.fn();
      render(
        <EmptyState
          icon={MockIcon}
          title="Test"
          description="Test"
          actionLabel="Click Me"
          onAction={onAction}
        />
      );

      const button = screen.getByText('Click Me');
      fireEvent.click(button);
      expect(onAction).toHaveBeenCalledTimes(1);
    });

    test('should not render button when actionLabel is missing', () => {
      const onAction = jest.fn();
      render(
        <EmptyState
          icon={MockIcon}
          title="Test"
          description="Test"
          onAction={onAction}
        />
      );

      const button = screen.queryByRole('button');
      expect(button).not.toBeInTheDocument();
    });

    test('should not render button when onAction is missing', () => {
      render(
        <EmptyState
          icon={MockIcon}
          title="Test"
          description="Test"
          actionLabel="Click Me"
        />
      );

      const button = screen.queryByRole('button');
      expect(button).not.toBeInTheDocument();
    });

    test('should apply custom className', () => {
      const { container } = render(
        <EmptyState
          icon={MockIcon}
          title="Test"
          description="Test"
          className="custom-class"
        />
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
    });
  });

  describe('NoPhotosEmptyState', () => {
    test('should render photos empty state', () => {
      render(<NoPhotosEmptyState />);
      expect(screen.getByText('Aucune photo')).toBeInTheDocument();
    });

    test('should render upload button when onUpload provided', () => {
      const onUpload = jest.fn();
      render(<NoPhotosEmptyState onUpload={onUpload} />);
      expect(screen.getByText('Télécharger des photos')).toBeInTheDocument();
    });

    test('should call onUpload when button clicked', () => {
      const onUpload = jest.fn();
      render(<NoPhotosEmptyState onUpload={onUpload} />);
      const button = screen.getByText('Télécharger des photos');
      fireEvent.click(button);
      expect(onUpload).toHaveBeenCalledTimes(1);
    });

    test('should not render button when onUpload is not provided', () => {
      render(<NoPhotosEmptyState />);
      const button = screen.queryByRole('button');
      expect(button).not.toBeInTheDocument();
    });
  });

  describe('NoReviewsEmptyState', () => {
    test('should render reviews empty state', () => {
      render(<NoReviewsEmptyState />);
      expect(screen.getByText('Aucun avis')).toBeInTheDocument();
    });

    test('should render description', () => {
      render(<NoReviewsEmptyState />);
      expect(screen.getByText(/Vous n'avez pas encore reçu d'avis/)).toBeInTheDocument();
    });
  });

  describe('NoDataEmptyState', () => {
    test('should render custom title and description', () => {
      render(
        <NoDataEmptyState
          title="Custom Title"
          description="Custom Description"
        />
      );

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom Description')).toBeInTheDocument();
    });
  });
});
