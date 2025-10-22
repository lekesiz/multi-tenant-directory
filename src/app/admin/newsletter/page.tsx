import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

async function getNewsletterStats() {
  try {
    // Total subscribers
    const totalSubscribers = await prisma.newsletterSubscriber.count();

    // Active subscribers
    const activeSubscribers = await prisma.newsletterSubscriber.count({
      where: { status: 'active' },
    });

    // Unsubscribed
    const unsubscribed = await prisma.newsletterSubscriber.count({
      where: { status: 'unsubscribed' },
    });

    // Bounced
    const bounced = await prisma.newsletterSubscriber.count({
      where: { status: 'bounced' },
    });

    // New this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const newThisWeek = await prisma.newsletterSubscriber.count({
      where: {
        createdAt: { gte: oneWeekAgo },
        status: 'active',
      },
    });

    // By domain
    const byDomain = await prisma.newsletterSubscriber.groupBy({
      by: ['domainId'],
      where: { status: 'active' },
      _count: true,
    });

    const domainStats = await Promise.all(
      byDomain.map(async (item) => {
        if (!item.domainId) return null;
        const domain = await prisma.domain.findUnique({
          where: { id: item.domainId },
          select: { name: true },
        });
        return {
          domainName: domain?.name || 'Unknown',
          count: item._count,
        };
      })
    );

    // Recent subscribers
    const recentSubscribers = await prisma.newsletterSubscriber.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        domain: {
          select: { name: true },
        },
      },
    });

    // Email campaigns
    const totalCampaigns = await prisma.emailCampaign.count();
    const sentCampaigns = await prisma.emailCampaign.count({
      where: { status: 'sent' },
    });

    // Email logs
    const totalEmailsSent = await prisma.emailLog.count({
      where: { status: 'sent' },
    });

    const emailsOpenedCount = await prisma.emailLog.count({
      where: { status: 'opened' },
    });

    const openRate = totalEmailsSent > 0 
      ? ((emailsOpenedCount / totalEmailsSent) * 100).toFixed(1)
      : '0';

    return {
      totalSubscribers,
      activeSubscribers,
      unsubscribed,
      bounced,
      newThisWeek,
      domainStats: domainStats.filter(Boolean),
      recentSubscribers,
      totalCampaigns,
      sentCampaigns,
      totalEmailsSent,
      openRate,
    };
  } catch (error) {
    console.error('Error fetching newsletter stats:', error);
    return {
      totalSubscribers: 0,
      activeSubscribers: 0,
      unsubscribed: 0,
      bounced: 0,
      newThisWeek: 0,
      domainStats: [],
      recentSubscribers: [],
      totalCampaigns: 0,
      sentCampaigns: 0,
      totalEmailsSent: 0,
      openRate: '0',
    };
  }
}

export default async function NewsletterPage() {
  const session = await getServerSession();

  if (!session?.user || session.user.role?.toLowerCase() !== 'admin') {
    redirect('/auth/login');
  }

  const stats = await getNewsletterStats();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                📧 Newsletter Management
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Gérez vos abonnés et campagnes email
              </p>
            </div>
            <Link
              href="/admin/newsletter/campaigns/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Nouvelle Campagne
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Subscribers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Abonnés
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.totalSubscribers}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              +{stats.newThisWeek} cette semaine
            </p>
          </div>

          {/* Active Subscribers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Actifs
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {stats.activeSubscribers}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {((stats.activeSubscribers / stats.totalSubscribers) * 100 || 0).toFixed(1)}% du total
            </p>
          </div>

          {/* Unsubscribed */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Désabonnés
                </p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                  {stats.unsubscribed}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {((stats.unsubscribed / stats.totalSubscribers) * 100 || 0).toFixed(1)}% du total
            </p>
          </div>

          {/* Open Rate */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Taux d'ouverture
                </p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                  {stats.openRate}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {stats.totalEmailsSent} emails envoyés
            </p>
          </div>
        </div>

        {/* Campaigns & Subscribers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Subscribers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Abonnés Récents
              </h2>
            </div>
            <div className="p-6">
              {stats.recentSubscribers.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentSubscribers.map((subscriber) => (
                    <div key={subscriber.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {subscriber.firstName ? `${subscriber.firstName} ${subscriber.lastName || ''}`.trim() : subscriber.email}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {subscriber.email}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {subscriber.domain?.name || 'No domain'} • {new Date(subscriber.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        subscriber.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {subscriber.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  Aucun abonné pour le moment
                </p>
              )}
            </div>
          </div>

          {/* Domain Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Abonnés par Domaine
              </h2>
            </div>
            <div className="p-6">
              {stats.domainStats.length > 0 ? (
                <div className="space-y-4">
                  {stats.domainStats.map((domain: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        {domain.domainName}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(domain.count / stats.activeSubscribers) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                          {domain.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  Aucune donnée disponible
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/newsletter/subscribers"
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              👥 Tous les Abonnés
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Voir et gérer tous les abonnés
            </p>
          </Link>

          <Link
            href="/admin/newsletter/campaigns"
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              📨 Campagnes
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gérer les campagnes email
            </p>
          </Link>

          <Link
            href="/admin/newsletter/analytics"
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              📊 Analytics
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Statistiques détaillées
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

