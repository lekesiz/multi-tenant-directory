'use client';

import { useState } from 'react';
import {
  PhoneIcon,
  MapPinIcon,
  GlobeAltIcon,
  ShareIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

interface MobileActionsProps {
  company: {
    name: string;
    phone?: string | null;
    website?: string | null;
    email?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    address?: string | null;
    slug: string;
  };
}

/**
 * Mobile-First Action Buttons
 * Click-to-call, directions, share, etc.
 */
export default function MobileActions({ company }: MobileActionsProps) {
  const [shareStatus, setShareStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Track click event
  const trackAction = (action: string) => {
    // Send analytics event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'company_action', {
        company_id: company.slug,
        action_type: action,
      });
    }
  };

  // Click to call
  const handlePhoneClick = () => {
    if (!company.phone) return;
    trackAction('phone_click');
    window.location.href = `tel:${company.phone}`;
  };

  // Get directions
  const handleDirectionsClick = () => {
    trackAction('directions_click');

    if (company.latitude && company.longitude) {
      // Use Google Maps with coordinates
      const url = `https://www.google.com/maps/dir/?api=1&destination=${company.latitude},${company.longitude}`;
      window.open(url, '_blank');
    } else if (company.address) {
      // Use Google Maps with address
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        company.address
      )}`;
      window.open(url, '_blank');
    }
  };

  // Open website
  const handleWebsiteClick = () => {
    if (!company.website) return;
    trackAction('website_click');

    // Ensure URL has protocol
    let url = company.website;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Send email
  const handleEmailClick = () => {
    if (!company.email) return;
    trackAction('email_click');
    window.location.href = `mailto:${company.email}?subject=Contact depuis Haguenau.pro`;
  };

  // Share company
  const handleShareClick = async () => {
    trackAction('share_click');

    const shareData = {
      title: company.name,
      text: `Découvrez ${company.name} sur Haguenau.pro`,
      url: `${window.location.origin}/companies/${company.slug}`,
    };

    try {
      // Use native share if available
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus('success');
        setTimeout(() => setShareStatus('idle'), 2000);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        setShareStatus('success');
        setTimeout(() => setShareStatus('idle'), 2000);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        setShareStatus('error');
        setTimeout(() => setShareStatus('idle'), 2000);
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Phone */}
      {company.phone && (
        <button
          onClick={handlePhoneClick}
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-blue-600 px-6 py-4 text-white shadow-lg transition-all hover:bg-blue-700 active:scale-95"
        >
          <PhoneIcon className="h-6 w-6" />
          <span className="font-semibold">Appeler maintenant</span>
        </button>
      )}

      {/* Directions */}
      {(company.latitude || company.address) && (
        <button
          onClick={handleDirectionsClick}
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-green-600 px-6 py-4 text-white shadow-lg transition-all hover:bg-green-700 active:scale-95"
        >
          <MapPinIcon className="h-6 w-6" />
          <span className="font-semibold">Itinéraire</span>
        </button>
      )}

      <div className="grid grid-cols-3 gap-3">
        {/* Website */}
        {company.website && (
          <button
            onClick={handleWebsiteClick}
            className="flex flex-col items-center gap-2 rounded-lg border-2 border-gray-200 bg-white p-4 transition-all hover:border-blue-600 hover:bg-blue-50 active:scale-95"
          >
            <GlobeAltIcon className="h-6 w-6 text-gray-700" />
            <span className="text-xs font-medium text-gray-700">Site web</span>
          </button>
        )}

        {/* Email */}
        {company.email && (
          <button
            onClick={handleEmailClick}
            className="flex flex-col items-center gap-2 rounded-lg border-2 border-gray-200 bg-white p-4 transition-all hover:border-blue-600 hover:bg-blue-50 active:scale-95"
          >
            <EnvelopeIcon className="h-6 w-6 text-gray-700" />
            <span className="text-xs font-medium text-gray-700">Email</span>
          </button>
        )}

        {/* Share */}
        <button
          onClick={handleShareClick}
          className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all active:scale-95 ${
            shareStatus === 'success'
              ? 'border-green-600 bg-green-50'
              : shareStatus === 'error'
                ? 'border-red-600 bg-red-50'
                : 'border-gray-200 bg-white hover:border-blue-600 hover:bg-blue-50'
          }`}
        >
          <ShareIcon className="h-6 w-6 text-gray-700" />
          <span className="text-xs font-medium text-gray-700">
            {shareStatus === 'success'
              ? 'Copié!'
              : shareStatus === 'error'
                ? 'Erreur'
                : 'Partager'}
          </span>
        </button>
      </div>

      {/* Share status message */}
      {shareStatus === 'success' && (
        <p className="text-center text-sm text-green-600">
          {('share' in navigator) ? 'Partagé avec succès!' : 'Lien copié dans le presse-papiers!'}
        </p>
      )}
    </div>
  );
}
