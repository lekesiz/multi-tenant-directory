import { CheckBadgeIcon } from '@heroicons/react/24/solid';

interface ReviewVerifiedBadgeProps {
  isVerified: boolean;
  className?: string;
}

export function ReviewVerifiedBadge({ isVerified, className = '' }: ReviewVerifiedBadgeProps) {
  if (!isVerified) return null;

  return (
    <div className={`flex items-center gap-1 text-green-600 ${className}`} title="Achat vérifié">
      <CheckBadgeIcon className="w-4 h-4" />
      <span className="text-sm font-medium">Achat vérifié</span>
    </div>
  );
}