'use client';

import { ReactNode } from 'react';
import { useLazyLoad } from '@/hooks/useIntersectionObserver';
import { cn } from '@/lib/utils';

interface LazySectionProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  skeleton?: ReactNode;
}

export function LazySection({
  children,
  className,
  threshold = 0.1,
  rootMargin = '50px',
  skeleton,
}: LazySectionProps) {
  const { ref, shouldLoad } = useLazyLoad({
    threshold,
    rootMargin,
  });

  return (
    <div ref={ref} className={cn('min-h-[100px]', className)}>
      {shouldLoad ? (
        children
      ) : skeleton ? (
        skeleton
      ) : (
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      )}
    </div>
  );
}

// Skeleton components for common UI elements
export function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}