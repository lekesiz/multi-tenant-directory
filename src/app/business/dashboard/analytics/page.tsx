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
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from '@/components/charts/LazyCharts';

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
  date: string;
  views: number;
  phoneClicks: number;
  websiteClicks: number;
  directionClicks: number;
  searchAppearances: number;
}

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

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

  // Prepare pie chart data
  const pieData = [
    { name: 'Téléphone', value: summary.totalPhoneClicks },
    { name: 'Site web', value: summary.totalWebsiteClicks },
    { name: 'Itinéraire', value: summary.totalDirectionClicks },
  ].filter((item) => item.value > 0);

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
                              <ArrowTrendingUpIcon
                                className="self-center flex-shrink-0 h-5 w-5 text-green-500"
                                aria-hidden="true"
                              />
                            ) : (
                              <ArrowTrendingDownIcon
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Time Series Chart */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Évolution sur 30 jours
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1 rounded ${
                  chartType === 'line'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Ligne
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1 rounded ${
                  chartType === 'bar'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Barres
              </button>
            </div>
          </div>

          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              {chartType === 'line' ? (
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                      })
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString('fr-FR')
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#3B82F6"
                    name="Vues"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="phoneClicks"
                    stroke="#10B981"
                    name="Téléphone"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="websiteClicks"
                    stroke="#8B5CF6"
                    name="Site web"
                    strokeWidth={2}
                  />
                </LineChart>
              ) : (
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                      })
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString('fr-FR')
                    }
                  />
                  <Legend />
                  <Bar dataKey="views" fill="#3B82F6" name="Vues" />
                  <Bar dataKey="phoneClicks" fill="#10B981" name="Téléphone" />
                  <Bar dataKey="websiteClicks" fill="#8B5CF6" name="Site web" />
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucune donnée disponible
            </div>
          )}
        </div>

        {/* Pie Chart - Interactions */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Répartition des interactions
          </h3>

          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) =>
                    `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucune interaction enregistrée
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          💡 Insights & Recommandations
        </h3>
        <div className="space-y-3 text-sm text-gray-700">
          {summary.viewsTrend > 0 && (
            <div className="flex items-start gap-2">
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p>
                Excellente nouvelle ! Vos vues ont augmenté de{' '}
                <strong>{summary.viewsTrend}%</strong> ce mois-ci.
              </p>
            </div>
          )}
          {summary.totalReviews < 10 && (
            <div className="flex items-start gap-2">
              <StarIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p>
                Encouragez vos clients à laisser des avis pour améliorer votre
                visibilité.
              </p>
            </div>
          )}
          {summary.totalPhoneClicks > summary.totalWebsiteClicks && (
            <div className="flex items-start gap-2">
              <PhoneIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p>
                Vos clients préfèrent vous contacter par téléphone. Assurez-vous
                que votre numéro est toujours à jour.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

