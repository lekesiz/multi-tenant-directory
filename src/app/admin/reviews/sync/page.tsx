import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import GoogleReviewsSyncClient from './client';

export default async function GoogleReviewsSyncPage() {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and is admin
  if (!session || !session.user) {
    redirect('/admin/login');
  }

  // Check if user role is admin (case insensitive)
  const userRole = session.user.role?.toUpperCase();
  if (userRole !== 'ADMIN') {
    redirect('/admin/login');
  }

  // Fetch initial data server-side
  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      googlePlaceId: true,
      _count: {
        select: {
          reviews: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  const companiesData = companies.map((company) => ({
    id: company.id,
    name: company.name,
    googlePlaceId: company.googlePlaceId,
    reviewCount: company._count.reviews,
  }));

  // Check if API key is configured
  const apiKeyConfigured = !!process.env.GOOGLE_MAPS_API_KEY;

  return (
    <GoogleReviewsSyncClient
      initialCompanies={companiesData}
      apiKeyConfigured={apiKeyConfigured}
    />
  );
}
