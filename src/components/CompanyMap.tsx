'use client';

import { useEffect, useRef } from 'react';

interface CompanyMapProps {
  latitude: number;
  longitude: number;
  companyName: string;
  address: string;
}

export default function CompanyMap({ latitude, longitude, companyName, address }: CompanyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Google Maps API key kontrolü
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      // API key yoksa statik harita göster
      return;
    }

    // Google Maps script yükle
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;

    (window as any).initMap = () => {
      if (!mapRef.current) return;

      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      new (window as any).google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: companyName,
      });
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [latitude, longitude, companyName]);

  // API key yoksa statik harita göster
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Localisation</h2>
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">📍</div>
          <p className="text-gray-700 font-medium mb-2">{companyName}</p>
          <p className="text-gray-600 text-sm">{address}</p>
          <p className="text-gray-500 text-xs mt-4">
            Coordonnées: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ouvrir dans Google Maps
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Localisation</h2>
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg"
        style={{ minHeight: '384px' }}
      />
      <div className="mt-4 text-sm text-gray-600">
        <p className="font-medium">{address}</p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline mt-2 inline-block"
        >
          Ouvrir dans Google Maps →
        </a>
      </div>
    </div>
  );
}

