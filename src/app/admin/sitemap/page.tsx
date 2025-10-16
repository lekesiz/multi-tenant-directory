'use client';

import { useState, useEffect } from 'react';
// API routes will be used instead of direct imports

interface SitemapStats {
  domain: string;
  totalUrls: number;
  companies: number;
  categories: number;
  legalPages: number;
  staticPages: number;
  lastGenerated: string;
}

interface GenerationResult {
  domain: string;
  success: boolean;
  urlCount?: number;
  error?: string;
  stats?: SitemapStats;
}

export default function SitemapAdminPage() {
  const [stats, setStats] = useState<SitemapStats[]>([]);
  const [generationResults, setGenerationResults] = useState<GenerationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSitemapStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats from API
      const response = await fetch('/api/admin/sitemap/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch sitemap stats');
      }

      const statsData = await response.json();
      setStats(statsData);

    } catch (error) {
      console.error('Error loading sitemap stats:', error);
      setError('Failed to load sitemap statistics');
    } finally {
      setLoading(false);
    }
  };

  const generateAllSitemapsHandler = async () => {
    try {
      setLoading(true);
      setError(null);

      // Generate sitemaps via API
      const response = await fetch('/api/admin/sitemap/generate', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate sitemaps');
      }

      const results = await response.json();
      setGenerationResults(results);

      // Reload stats after generation
      await loadSitemapStats();

    } catch (error) {
      console.error('Error generating sitemaps:', error);
      setError('Failed to generate sitemaps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSitemapStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sitemap Management</h1>
        <p className="mt-2 text-gray-600">
          Monitor and manage XML sitemaps for all domains
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex gap-4">
        <button
          onClick={loadSitemapStats}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh Stats'}
        </button>
        
        <button
          onClick={generateAllSitemapsHandler}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate All Sitemaps'}
        </button>
      </div>

      {/* Sitemap Statistics */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Sitemap Statistics
          </h3>
          
          {stats.length === 0 ? (
            <p className="text-gray-500">No sitemap data available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Domain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total URLs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Companies
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categories
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Legal Pages
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.map((stat) => (
                    <tr key={stat.domain}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {stat.domain}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.totalUrls}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.companies}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.categories}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.legalPages}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <a
                          href={`https://${stat.domain}/sitemap.xml`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Sitemap
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Generation Results */}
      {generationResults.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Generation Results
            </h3>
            
            <div className="space-y-4">
              {generationResults.map((result) => (
                <div
                  key={result.domain}
                  className={`p-4 rounded-md ${
                    result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                      {result.success ? (
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <h4 className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                        {result.domain}
                      </h4>
                      <div className={`mt-1 text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                        {result.success ? (
                          <span>Successfully generated {result.urlCount} URLs</span>
                        ) : (
                          <span>Error: {result.error}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SEO Tips */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">SEO Tips</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Submit sitemaps to Google Search Console for better indexing</li>
                <li>Sitemaps are automatically cached for 1 hour for better performance</li>
                <li>Company priority affects sitemap URL priority (high priority = 0.8, normal = 0.6)</li>
                <li>Legal pages have lowest priority (0.3) as they change infrequently</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}