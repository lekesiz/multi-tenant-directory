import React from 'react';

export function LegalPageLayout({ 
  title, 
  children,
  lastUpdated = new Date().toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}: { 
  title: string; 
  children: React.ReactNode;
  lastUpdated?: string;
}) {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          {title}
        </h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 prose prose-gray max-w-none">
          {children}
        </div>
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Dernière mise à jour : {lastUpdated}</p>
        </div>
      </div>
    </div>
  );
}