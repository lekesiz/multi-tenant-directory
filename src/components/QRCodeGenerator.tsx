'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  url: string;
  size?: number;
  className?: string;
  title?: string;
  downloadable?: boolean;
}

export default function QRCodeGenerator({
  url,
  size = 200,
  className = '',
  title = 'QR Code',
  downloadable = true,
}: QRCodeGeneratorProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const dataUrl = await QRCode.toDataURL(url, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'M',
        });
        
        setQrCodeDataUrl(dataUrl);
      } catch (err) {
        console.error('QR Code generation failed:', err);
        setError('Erreur lors de la génération du QR code');
      } finally {
        setIsLoading(false);
      }
    };

    if (url) {
      generateQRCode();
    }
  }, [url, size]);

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `qr-code-${Date.now()}.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center space-y-4 ${className}`}>
        <div 
          className="bg-gray-200 animate-pulse rounded-lg"
          style={{ width: size, height: size }}
        />
        <p className="text-sm text-gray-600">Génération du QR code...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center space-y-4 ${className}`}>
        <div 
          className="bg-red-100 border border-red-300 rounded-lg flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <svg 
            className="w-8 h-8 text-red-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 text-center">
          {title}
        </h3>
      )}
      
      <div className="relative group">
        <img
          src={qrCodeDataUrl}
          alt="QR Code"
          className="rounded-lg shadow-md border border-gray-200"
          style={{ width: size, height: size }}
        />
        
        {/* Hover overlay with actions */}
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center space-x-2">
          {downloadable && (
            <button
              onClick={downloadQRCode}
              className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Télécharger le QR code"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          )}
          
          <button
            onClick={copyToClipboard}
            className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Copier le lien"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-xs sm:text-sm text-gray-600 mb-2">
          Scannez pour accéder à cette page
        </p>
        <p className="text-xs text-gray-500 break-all max-w-xs mx-auto">
          {url}
        </p>
      </div>
      
      {downloadable && (
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            onClick={downloadQRCode}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs sm:text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1 sm:space-x-2"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Télécharger</span>
          </button>
          
          <button
            onClick={copyToClipboard}
            className="bg-gray-600 text-white px-3 py-2 rounded-lg text-xs sm:text-sm hover:bg-gray-700 transition-colors flex items-center justify-center space-x-1 sm:space-x-2"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Copier</span>
          </button>
        </div>
      )}
    </div>
  );
}