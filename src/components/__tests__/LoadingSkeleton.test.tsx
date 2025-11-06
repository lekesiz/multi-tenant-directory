/**
 * Loading Skeleton Components Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Skeleton,
  CardSkeleton,
  StatsCardSkeleton,
  PhotoGridSkeleton,
  FormSkeleton,
  TableSkeleton,
  DashboardSkeleton,
  CompanyCardSkeleton,
} from '../LoadingSkeleton';

describe('LoadingSkeleton Components', () => {
  describe('Skeleton', () => {
    test('should render without crashing', () => {
      render(<Skeleton />);
      const skeleton = screen.getByLabelText('Loading...');
      expect(skeleton).toBeInTheDocument();
    });

    test('should apply custom className', () => {
      render(<Skeleton className="custom-class" />);
      const skeleton = screen.getByLabelText('Loading...');
      expect(skeleton).toHaveClass('custom-class');
    });

    test('should have default classes', () => {
      render(<Skeleton />);
      const skeleton = screen.getByLabelText('Loading...');
      expect(skeleton).toHaveClass('animate-pulse');
      expect(skeleton).toHaveClass('bg-gray-200');
      expect(skeleton).toHaveClass('rounded');
    });

    test('should have aria-label for accessibility', () => {
      render(<Skeleton />);
      expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
    });
  });

  describe('CardSkeleton', () => {
    test('should render without crashing', () => {
      const { container } = render(<CardSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    test('should render multiple skeleton elements', () => {
      render(<CardSkeleton />);
      const skeletons = screen.getAllByLabelText('Loading...');
      expect(skeletons.length).toBeGreaterThan(1);
    });

    test('should have card styling', () => {
      const { container } = render(<CardSkeleton />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('rounded-lg');
      expect(card).toHaveClass('shadow-sm');
    });
  });

  describe('StatsCardSkeleton', () => {
    test('should render without crashing', () => {
      const { container } = render(<StatsCardSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    test('should render skeleton elements', () => {
      render(<StatsCardSkeleton />);
      const skeletons = screen.getAllByLabelText('Loading...');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    test('should have stats card styling', () => {
      const { container } = render(<StatsCardSkeleton />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('rounded-lg');
    });
  });

  describe('PhotoGridSkeleton', () => {
    test('should render default number of skeletons', () => {
      render(<PhotoGridSkeleton />);
      const skeletons = screen.getAllByLabelText('Loading...');
      expect(skeletons).toHaveLength(8);
    });

    test('should render custom number of skeletons', () => {
      render(<PhotoGridSkeleton count={4} />);
      const skeletons = screen.getAllByLabelText('Loading...');
      expect(skeletons).toHaveLength(4);
    });

    test('should render grid layout', () => {
      const { container } = render(<PhotoGridSkeleton />);
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid');
    });

    test('should render zero skeletons when count is 0', () => {
      render(<PhotoGridSkeleton count={0} />);
      const skeletons = screen.queryAllByLabelText('Loading...');
      expect(skeletons).toHaveLength(0);
    });

    test('should render many skeletons', () => {
      render(<PhotoGridSkeleton count={20} />);
      const skeletons = screen.getAllByLabelText('Loading...');
      expect(skeletons).toHaveLength(20);
    });
  });

  describe('FormSkeleton', () => {
    test('should render without crashing', () => {
      const { container } = render(<FormSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    test('should render multiple skeleton elements', () => {
      render(<FormSkeleton />);
      const skeletons = screen.getAllByLabelText('Loading...');
      expect(skeletons.length).toBeGreaterThan(3);
    });

    test('should have form styling', () => {
      const { container } = render(<FormSkeleton />);
      const form = container.firstChild as HTMLElement;
      expect(form).toHaveClass('bg-white');
      expect(form).toHaveClass('rounded-lg');
    });
  });

  describe('TableSkeleton', () => {
    test('should render default number of rows', () => {
      const { container } = render(<TableSkeleton />);
      const rows = container.querySelectorAll('.divide-y > div');
      expect(rows).toHaveLength(5);
    });

    test('should render custom number of rows', () => {
      const { container } = render(<TableSkeleton rows={3} />);
      const rows = container.querySelectorAll('.divide-y > div');
      expect(rows).toHaveLength(3);
    });

    test('should have table styling', () => {
      const { container } = render(<TableSkeleton />);
      const table = container.firstChild as HTMLElement;
      expect(table).toHaveClass('bg-white');
      expect(table).toHaveClass('rounded-lg');
    });

    test('should render zero rows when rows is 0', () => {
      const { container } = render(<TableSkeleton rows={0} />);
      const rows = container.querySelectorAll('.divide-y > div');
      expect(rows).toHaveLength(0);
    });

    test('should render many rows', () => {
      const { container } = render(<TableSkeleton rows={15} />);
      const rows = container.querySelectorAll('.divide-y > div');
      expect(rows).toHaveLength(15);
    });
  });

  describe('DashboardSkeleton', () => {
    test('should render without crashing', () => {
      const { container } = render(<DashboardSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    test('should render stats cards', () => {
      render(<DashboardSkeleton />);
      const skeletons = screen.getAllByLabelText('Loading...');
      expect(skeletons.length).toBeGreaterThan(4);
    });

    test('should have dashboard layout', () => {
      const { container } = render(<DashboardSkeleton />);
      const dashboard = container.firstChild as HTMLElement;
      expect(dashboard).toHaveClass('max-w-7xl');
      expect(dashboard).toHaveClass('mx-auto');
    });
  });

  describe('CompanyCardSkeleton', () => {
    test('should render without crashing', () => {
      const { container } = render(<CompanyCardSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    test('should render skeleton elements', () => {
      render(<CompanyCardSkeleton />);
      const skeletons = screen.getAllByLabelText('Loading...');
      expect(skeletons.length).toBeGreaterThan(3);
    });

    test('should have company card styling', () => {
      const { container } = render(<CompanyCardSkeleton />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('rounded-lg');
      expect(card).toHaveClass('overflow-hidden');
    });
  });

  describe('Integration Tests', () => {
    test('all skeleton components should use base Skeleton', () => {
      const { container: card } = render(<CardSkeleton />);
      const { container: stats } = render(<StatsCardSkeleton />);
      const { container: form } = render(<FormSkeleton />);
      
      // All should contain skeleton elements with animate-pulse
      expect(card.querySelector('.animate-pulse')).toBeInTheDocument();
      expect(stats.querySelector('.animate-pulse')).toBeInTheDocument();
      expect(form.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    test('should render multiple skeleton types together', () => {
      render(
        <div>
          <CardSkeleton />
          <StatsCardSkeleton />
          <FormSkeleton />
        </div>
      );
      
      const skeletons = screen.getAllByLabelText('Loading...');
      expect(skeletons.length).toBeGreaterThan(5);
    });
  });
});
