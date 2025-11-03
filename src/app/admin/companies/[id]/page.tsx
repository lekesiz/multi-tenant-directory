import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import CompanyEditForm from '@/components/CompanyEditForm';

// Force dynamic rendering to avoid build-time database queries
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const companyId = parseInt(id);

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      city: true,
      postalCode: true,
      phone: true,
      email: true,
      website: true,
      categories: true, // Include categories array
      logoUrl: true,
      coverImageUrl: true,
      latitude: true,
      longitude: true,
      rating: true,
      reviewCount: true,
      googlePlaceId: true,
      ratingDistribution: true,
      lastSyncedAt: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      siren: true,
      siret: true,
      legalForm: true,
      content: {
        include: {
          domain: true,
        },
      },
      reviews: {
        orderBy: {
          reviewDate: 'desc',
        },
        take: 10,
      },
    },
  });

  if (!company) {
    redirect('/admin/companies');
  }

  const domains = await prisma.domain.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div>
      <CompanyEditForm company={company} domains={domains} />
    </div>
  );
}

