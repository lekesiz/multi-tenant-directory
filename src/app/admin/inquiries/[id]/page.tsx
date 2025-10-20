import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import InquiryStatusForm from './status-form';
import DeleteInquiryButton from './delete-button';

export const metadata = {
  title: 'Détail du Message | Admin',
};

async function getInquiry(id: number) {
  return await prisma.contactInquiry.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          email: true,
          phone: true,
        },
      },
    },
  });
}

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inquiry = await getInquiry(parseInt(id));

  if (!inquiry) {
    notFound();
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/inquiries"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Retour aux messages
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Message de Contact #{inquiry.id}
        </h1>
        <p className="text-gray-600">
          Reçu le {format(new Date(inquiry.createdAt), 'PPPp', { locale: fr })}
        </p>
      </div>

      {/* Status and Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Statut</h2>
            <InquiryStatusForm inquiryId={inquiry.id} currentStatus={inquiry.status} />
          </div>
          <DeleteInquiryButton inquiryId={inquiry.id} />
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Informations de Contact
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Nom</div>
            <div className="text-base font-medium text-gray-900">{inquiry.name}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Email</div>
            <div className="text-base font-medium text-gray-900">
              <a
                href={`mailto:${inquiry.email}`}
                className="text-blue-600 hover:text-blue-800"
              >
                {inquiry.email}
              </a>
            </div>
          </div>
          {inquiry.phone && (
            <div>
              <div className="text-sm text-gray-600 mb-1">Téléphone</div>
              <div className="text-base font-medium text-gray-900">
                <a
                  href={`tel:${inquiry.phone}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {inquiry.phone}
                </a>
              </div>
            </div>
          )}
          <div>
            <div className="text-sm text-gray-600 mb-1">Date</div>
            <div className="text-base font-medium text-gray-900">
              {format(new Date(inquiry.createdAt), 'PPPp', { locale: fr })}
            </div>
          </div>
        </div>
      </div>

      {/* Company Info */}
      {inquiry.company && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Entreprise Concernée
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Nom</div>
              <div className="text-base font-medium text-gray-900">
                <Link
                  href={`/admin/companies/${inquiry.company.id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {inquiry.company.name}
                </Link>
              </div>
            </div>
            {inquiry.company.email && (
              <div>
                <div className="text-sm text-gray-600 mb-1">Email</div>
                <div className="text-base font-medium text-gray-900">
                  <a
                    href={`mailto:${inquiry.company.email}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {inquiry.company.email}
                  </a>
                </div>
              </div>
            )}
            {inquiry.company.phone && (
              <div>
                <div className="text-sm text-gray-600 mb-1">Téléphone</div>
                <div className="text-base font-medium text-gray-900">
                  <a
                    href={`tel:${inquiry.company.phone}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {inquiry.company.phone}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Message</h2>
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Sujet</div>
          <div className="text-base font-medium text-gray-900">{inquiry.subject}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-2">Contenu</div>
          <div className="text-base text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
            {inquiry.message}
          </div>
        </div>
      </div>

      {/* Technical Info */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Informations Techniques
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600 mb-1">ID</div>
            <div className="text-gray-900 font-mono">{inquiry.id}</div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">Adresse IP</div>
            <div className="text-gray-900 font-mono">{inquiry.ipAddress || '-'}</div>
          </div>
          <div className="md:col-span-2">
            <div className="text-gray-600 mb-1">User Agent</div>
            <div className="text-gray-900 font-mono text-xs break-all">
              {inquiry.userAgent || '-'}
            </div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">Créé le</div>
            <div className="text-gray-900">
              {format(new Date(inquiry.createdAt), 'PPPp', { locale: fr })}
            </div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">Mis à jour le</div>
            <div className="text-gray-900">
              {format(new Date(inquiry.updatedAt), 'PPPp', { locale: fr })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

