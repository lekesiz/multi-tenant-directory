/**
 * Reusable Loading Spinner Component
 * Can be used in any component for loading states
 */

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const iconSizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
  xl: 'w-10 h-10',
};

export default function LoadingSpinner({ 
  size = 'md', 
  text,
  fullScreen = false 
}: LoadingSpinnerProps) {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Spinner */}
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer Ring */}
        <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-ping"></div>
        
        {/* Middle Ring */}
        <div className="absolute inset-1 border-4 border-purple-300 rounded-full animate-spin"></div>
        
        {/* Inner Circle */}
        <div className="absolute inset-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
          <svg 
            className={`${iconSizeClasses[size]} text-white animate-pulse`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
            />
          </svg>
        </div>
      </div>

      {/* Loading Text */}
      {text && (
        <p className="text-gray-600 text-sm font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}

/**
 * Inline Loading Spinner (for buttons, cards, etc.)
 */
export function InlineSpinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const spinnerSize = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  
  return (
    <div className={`${spinnerSize} border-2 border-white border-t-transparent rounded-full animate-spin`}></div>
  );
}

/**
 * Card Loading Skeleton
 */
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6 mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
    </div>
  );
}

/**
 * Table Loading Skeleton
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          <div className="h-12 bg-gray-200 rounded flex-1"></div>
          <div className="h-12 bg-gray-200 rounded w-32"></div>
          <div className="h-12 bg-gray-200 rounded w-24"></div>
        </div>
      ))}
    </div>
  );
}

