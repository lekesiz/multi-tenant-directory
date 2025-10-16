'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

interface CompanyQRCodeProps {
  url: string;
  companyName: string;
  size?: number;
}

export default function CompanyQRCode({ 
  url, 
  companyName, 
  size = 200 
}: CompanyQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateQRCode = async () => {
      if (!canvasRef.current) return;

      try {
        setIsGenerating(true);
        setError(null);

        await QRCode.toCanvas(canvasRef.current, url, {
          width: size,
          margin: 2,
          color: {
            dark: '#1f2937', // gray-800
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M',
        });

        setIsGenerating(false);
      } catch (err) {
        console.error('Error generating QR code:', err);
        setError('Erreur lors de la génération du QR code');
        setIsGenerating(false);
      }
    };

    generateQRCode();
  }, [url, size]);

  const handleDownload = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `qr-code-${companyName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: companyName,
          text: `Découvrez ${companyName}`,
          url: url,
        });
      } catch (err) {
        // User cancelled or share failed
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Fallback: copy URL to clipboard
      try {
        await navigator.clipboard.writeText(url);
        alert('Lien copié dans le presse-papiers !');
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          QR Code
        </h3>
        
        <div className="flex justify-center mb-4">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className={`rounded-lg border-2 border-gray-200 ${
                isGenerating ? 'opacity-50' : 'opacity-100'
              }`}
            />
            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Scannez ce code pour accéder à cette page
        </p>

        <div className="flex gap-2 justify-center">
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Télécharger
          </button>

          <button
            onClick={handleShare}
            disabled={isGenerating}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Partager
          </button>
        </div>
      </div>
    </div>
  );
}

