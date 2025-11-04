import { headers } from 'next/headers';
import Link from 'next/link';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

// Force dynamic rendering because this page uses headers() for domain detection
export const dynamic = 'force-dynamic';

async function getDomainInfo() {
  const headersList = await headers();
  let domain = headersList.get('x-tenant-domain') || 'bas-rhin.pro';
  
  domain = domain.replace('www.', '');
  
  const cityName = domain.split('.')[0];
  const displayName = cityName.charAt(0).toUpperCase() + cityName.slice(1);
  
  const domainData = await prisma.domain.findUnique({
    where: { name: domain },
  });
  
  return { domain, cityName, displayName, domainData };
}

export async function generateMetadata(): Promise<Metadata> {
  const { displayName } = await getDomainInfo();
  
  return {
    title: `Créer un Profil Professionnel - ${displayName}.PRO`,
    description: `Rejoignez ${displayName}.PRO et augmentez votre visibilité locale. Inscription gratuite pour les professionnels.`,
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RejoindrePageRedirect() {
  // Redirect to admin login
  redirect('/admin/login');
}

