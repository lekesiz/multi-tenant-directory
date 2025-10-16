'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ChartBarIcon,
  EyeIcon,
  PhoneIcon,
  GlobeAltIcon,
  MapPinIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

interface AnalyticsSummary {
  totalViews: number;
  totalPhoneClicks: number;
  totalWebsiteClicks: number;
  totalDirectionClicks: number;
  viewsTrend: number;
  averageRating: number;
  totalReviews: number;
}

interface DailyData {
  date: Date;
  views: number;
  phoneClicks: number;
  websiteClicks: number;
  directionClicks: number;
  searchAppearances: number;
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/business/login');
    } else if (status === 'authenticated') {
      fetchAnalytics();
    }
  }, [status, router]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/business/analytics');

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();

      if (data.success) {
        setSummary(data.summary);
        setDailyData(data.daily);
      }
    } catch (error) {
      console.error('Fetch analytics error:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Aucune donnée disponible
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Les statistiques apparaîtront ici une fois que votre fiche sera consultée.
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Vues totales',
      value: summary.totalViews,
      icon: EyeIcon,
      change: summary.viewsTrend,
      changeType: summary.viewsTrend >= 0 ? 'increase' : 'decrease',
      color: 'blue',
    },
    {
      name: 'Clics téléphone',
      value: summary.totalPhoneClicks,
      icon: PhoneIcon,
      color: 'green',
    },
    {
      name: 'Clics site web',
      value: summary.totalWebsiteClicks,
      icon: GlobeAltIcon,
      color: 'purple',
    },
    {
      name: 'Clics itinéraire',
      value: summary.totalDirectionClicks,
      icon: MapPinIcon,
      color: 'orange',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
        <p className="mt-2 text-sm text-gray-600">
          Suivez les performances de votre fiche entreprise
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-500 text-blue-100',
            green: 'bg-green-500 text-green-100',
            purple: 'bg-purple-500 text-purple-100',
            orange: 'bg-orange-500 text-orange-100',
          };

          return (
            <div
              key={stat.name}
              className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div
                    className={`flex-shrink-0 rounded-md p-3 ${
                      colorClasses[stat.color as keyof typeof colorClasses]
                    }`}
                  >
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value.toLocaleString()}
                        </div>
                        {stat.change !== undefined && (
                          <div
                            className={`ml-2 flex items-baseline text-sm font-semibold ${
                              stat.changeType === 'increase'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {stat.changeType === 'increase' ? (
                              <TrendingUpIcon
                                className="self-center flex-shrink-0 h-5 w-5 text-green-500"
                                aria-hidden="true"
                              />
                            ) : (
                              <TrendingDownIcon
                                className="self-center flex-shrink-0 h-5 w-5 text-red-500"
                                aria-hidden="true"
                              />
                            )}
                            <span className="ml-1">{Math.abs(stat.change)}%</span>
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rating Summary */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Avis clients</h3>
          <div className="flex items-center">
            <div className="flex items-center">
              <StarIcon className="h-8 w-8 text-yellow-400 fill-current" />
              <span className="ml-2 text-3xl font-bold text-gray-900">
                {summary.averageRating.toFixed(1)}
              </span>
              <span className="ml-2 text-gray-500">/ 5</span>
            </div>
            <div className="ml-6 text-sm text-gray-600">
              {summary.totalReviews} avis au total
            </div>
          </div>
        </div>
      </div>

      {/* Daily Chart */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Évolution sur 30 jours
          </h3>
          {dailyData.length > 0 ? (
            <div className="space-y-4">
              {/* Simple bar chart */}
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  <div className="flex items-end space-x-1 h-48">
                    {dailyData
                      .slice()
                      .reverse()
                      .map((day, idx) => {
                        const maxViews = Math.max(
                          ...dailyData.map((d) => d.views)
                        );
                        const height = maxViews > 0 ? (day.views / maxViews) * 100 : 0;

                        return (
                          <div
                            key={idx}
                            className="flex-1 flex flex-col items-center group relative"
                          >
                            <div
                              className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                              style={{ height: `${height}%` }}
                            >
                              {/* Tooltip on hover */}
                              <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                                <div>
                                  {new Date(day.date).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                  })}
                                </div>
                                <div className="font-bold">{day.views} vues</div>
                                <div>{day.phoneClicks} tél</div>
                                <div>{day.websiteClicks} web</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  {/* X-axis labels */}
                  <div className="flex space-x-1 mt-2">
                    {dailyData
                      .slice()
                      .reverse()
                      .map((day, idx) => (
                        <div key={idx} className="flex-1 text-center">
                          {idx % 5 === 0 && (
                            <span className="text-xs text-gray-500">
                              {new Date(day.date).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                  <span>Vues</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucune donnée disponible pour le graphique
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
