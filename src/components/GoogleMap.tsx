'use client';

import { useEffect, useRef, useState } from 'react';

interface GoogleMapProps {
  latitude: number;
  longitude: number;
  companyName: string;
  address?: string;
}

declare global {
  interface Window {
    google: any;
    initMap?: () => void;
  }
}

export default function GoogleMap({ latitude, longitude, companyName, address }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    // Check if Google Maps script is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    // Initialize map
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: latitude, lng: longitude },
      zoom: 16,
      mapTypeControl: false,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi.business',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    mapInstanceRef.current = map;

    // Add marker
    const marker = new window.google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map: map,
      title: companyName,
      animation: window.google.maps.Animation.DROP,
    });

    markerRef.current = marker;

    // Add info window
    const infoContent = `
      <div style="padding: 10px; max-width: 250px;">
        <h3 style="margin: 0 0 8px 0; font-weight: 600; font-size: 16px;">${companyName}</h3>
        ${address ? `<p style="margin: 0; color: #666; font-size: 14px;">${address}</p>` : ''}
        <a href="https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}" 
           target="_blank" 
           rel="noopener noreferrer"
           style="display: inline-block; margin-top: 10px; color: #1a73e8; text-decoration: none; font-size: 14px;">
          📍 Obtenir l'itinéraire
        </a>
      </div>
    `;

    const infoWindow = new window.google.maps.InfoWindow({
      content: infoContent,
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });

    // Open info window by default
    infoWindow.open(map, marker);

  }, [isLoaded, latitude, longitude, companyName, address]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-2">🗺️ Carte non disponible</p>
          <p className="text-sm text-gray-400">API Key manquante</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full aspect-video rounded-lg shadow-md"
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Chargement de la carte...</p>
          </div>
        </div>
      )}
    </div>
  );
}