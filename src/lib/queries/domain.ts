/**
 * Domain database queries
 * Centralized domain-related database operations
 */

import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

/**
 * Get domain from request headers
 * Handles Vercel deployment URLs by mapping to bas-rhin.pro
 */
export async function getCurrentDomain() {
  const headersList = await headers();
  let domain = headersList.get('x-tenant-domain') || headersList.get('host') || 'bas-rhin.pro';

  // Remove www prefix
  domain = domain.replace('www.', '');

  // Remove port for localhost
  domain = domain.split(':')[0];

  // Map Vercel deployment URLs to bas-rhin.pro
  if (domain.includes('.vercel.app')) {
    domain = 'bas-rhin.pro';
  }

  return domain;
}

/**
 * Get domain info with all relations
 * @param domainName - Domain name (e.g., 'haguenau.pro')
 */
export async function getDomainByName(domainName: string) {
  return prisma.domain.findUnique({
    where: { name: domainName },
    include: {
      content: true,
      legalPages: {
        where: {
          isActive: true,
        },
      },
    },
  });
}

/**
 * Get domain by ID
 * @param id - Domain ID
 */
export async function getDomainById(id: number) {
  return prisma.domain.findUnique({
    where: { id },
    include: {
      content: true,
      legalPages: true,
    },
  });
}

/**
 * Get all active domains
 */
export async function getActiveDomains() {
  return prisma.domain.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
}

/**
 * Get domain info with metadata for current request
 * Returns domain data, city name, and display name
 */
export async function getCurrentDomainInfo() {
  const domain = await getCurrentDomain();

  const domainData = await getDomainByName(domain);

  const cityName = domain.split('.')[0];
  const displayName = cityName.charAt(0).toUpperCase() + cityName.slice(1);

  return {
    domain,
    domainData,
    cityName,
    displayName,
  };
}
