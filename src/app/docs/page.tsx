'use client';

/**
 * API Documentation Page
 * 
 * Interactive Swagger UI for exploring and testing API endpoints
 */

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
            <h1 className="text-2xl font-bold text-white">
              📚 API Documentation
            </h1>
            <p className="mt-1 text-sm text-blue-100">
              Interactive API documentation powered by Swagger UI
            </p>
          </div>
          
          <div className="p-6">
            <SwaggerUI url="/api/swagger" />
          </div>
        </div>
      </div>
    </div>
  );
}

