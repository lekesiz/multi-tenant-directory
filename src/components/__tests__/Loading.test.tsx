/**
 * Loading Components Tests
 */

import { render, screen } from '@testing-library/react';
import Loading, { LoadingButton, LoadingSkeleton, CompanyCardSkeleton } from '../Loading';

describe('Loading Components', () => {
  describe('Loading', () => {
    test('should render loading spinner', () => {
      const { container } = render(<Loading />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    test('should have centered layout', () => {
      const { container } = render(<Loading />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center');
    });
  });

  describe('LoadingButton', () => {
    test('should render button loading spinner', () => {
      const { container } = render(<LoadingButton />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    test('should have white border', () => {
      const { container } = render(<LoadingButton />);
      const spinner = container.querySelector('.border-white');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('LoadingSkeleton', () => {
    test('should render skeleton with animation', () => {
      const { container } = render(<LoadingSkeleton />);
      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    test('should render multiple skeleton lines', () => {
      const { container } = render(<LoadingSkeleton />);
      const lines = container.querySelectorAll('.bg-gray-200');
      expect(lines.length).toBeGreaterThan(0);
    });
  });

  describe('CompanyCardSkeleton', () => {
    test('should render company card skeleton', () => {
      const { container } = render(<CompanyCardSkeleton />);
      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    test('should have card styling', () => {
      const { container } = render(<CompanyCardSkeleton />);
      const card = container.querySelector('.bg-white');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('rounded-lg', 'shadow-md');
    });

    test('should render image placeholder', () => {
      const { container } = render(<CompanyCardSkeleton />);
      const imagePlaceholder = container.querySelector('.w-16.h-16');
      expect(imagePlaceholder).toBeInTheDocument();
    });
  });
});
