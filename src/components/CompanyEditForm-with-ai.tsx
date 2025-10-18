'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BusinessHoursForm from './BusinessHoursForm';
import { toast } from 'sonner';

interface Company {
  id: number;
  name: string;
  slug: string;
  googlePlaceId: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  categories: string[];
  logoUrl: string | null;
  coverImageUrl: string | null;
  content: Array<{
    id: number;
    domainId: number;
    isVisible: boolean;
    customDescription: string | null;
    customImages: any;
    promotions: string | null;
    priority: number;
    featuredUntil: Date | null;
    domain: {
      id: number;
      name: string;
    };
  }>;
  reviews: Array<{
    id: number;
    authorName: string;
    authorPhoto: string | null;
    rating: number;
    comment: string | null;
    source: string;
    reviewDate: Date;
    isApproved: boolean;
  }>;
}

interface Domain {
  id: number;
  name: string;
  isActive: boolean;
}

export default function CompanyEditForm({
  company,
  domains,
}: {
  company: Company;
  domains: Domain[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'info' | 'hours' | 'domains' | 'reviews'>(
    'info'
  );
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: company.name,
    slug: company.slug,
    address: company.address || '',
    city: company.city || '',
    postalCode: company.postalCode || '',
    phone: company.phone || '',
    email: company.email || '',
    website: company.website || '',
    latitude: company.latitude?.toString() || '',
    longitude: company.longitude?.toString() || '',
    categories: company.categories,
    logoUrl: company.logoUrl || '',
    coverImageUrl: company.coverImageUrl || '',
  });

  const [domainSettings, setDomainSettings] = useState<
    Record<
      number,
      {
        isVisible: boolean;
        customDescription: string;
        promotions: string;
        priority: number;
        featuredUntil: string;
      }
    >
  >(
    domains.reduce((acc, domain) => {
      const content = company.content.find((c) => c.domainId === domain.id);
      acc[domain.id] = {
        isVisible: content?.isVisible || false,
        customDescription: content?.customDescription || '',
        promotions: content?.promotions || '',
        priority: content?.priority || 0,
        featuredUntil: content?.featuredUntil ? new Date(content.featuredUntil).toISOString().split('T')[0] : '',
      };
      return acc;
    }, {} as any)
  );

  const handleGenerateDescription = async (domainId: number) => {
    setGeneratingAI(domainId);
    try {
      const response = await fetch('/api/admin/companies/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: company.id,
          name: company.name,
          category: company.categories[0] || 'Business',
          description: domainSettings[domainId].customDescription,
          location: `${company.city || ''}, ${company.address || ''}`.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate description');
      }

      const data = await response.json();
      
      // Update customDescription with generated content
      setDomainSettings({
        ...domainSettings,
        [domainId]: {
          ...domainSettings[domainId],
          customDescription: data.content,
        },
      });

      toast.success('Description générée avec succès!');
    } catch (error) {
      console.error('Error generating description:', error);
      toast.error('Erreur lors de la génération de la description');
    } finally {
      setGeneratingAI(null);
    }
  };

  // ... rest of the component (keep all existing handlers and JSX)
  // This is just a partial implementation to show the AI button addition
  
  return (
    <div>
      {/* Add AI button next to textarea in the domains tab */}
      {/* The full implementation would include all existing JSX with the AI button added */}
    </div>
  );
}

