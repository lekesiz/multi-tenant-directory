'use client';

import { useAutoTrackProfileView, useAnalytics } from '@/hooks/useAnalytics';

interface CompanyAnalyticsWrapperProps {
  companyId: number;
  children: React.ReactNode;
}

export default function CompanyAnalyticsWrapper({ 
  companyId, 
  children 
}: CompanyAnalyticsWrapperProps) {
  // Auto-track profile view on mount
  useAutoTrackProfileView(companyId);

  return <>{children}</>;
}

interface TrackableLinkProps {
  companyId: number;
  type: 'phone' | 'website' | 'email' | 'directions';
  href: string;
  lat?: number;
  lng?: number;
  children: React.ReactNode;
  className?: string;
}

export function TrackableLink({
  companyId,
  type,
  href,
  lat,
  lng,
  children,
  className,
}: TrackableLinkProps) {
  const { trackPhoneClick, trackWebsiteClick, trackEmailClick, trackDirectionsClick } = useAnalytics();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    switch (type) {
      case 'phone':
        trackPhoneClick(companyId, href);
        break;
      case 'website':
        trackWebsiteClick(companyId, href);
        break;
      case 'email':
        trackEmailClick(companyId, href);
        break;
      case 'directions':
        if (lat && lng) {
          trackDirectionsClick(companyId, lat, lng);
        }
        break;
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}