import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const metadata = {
  title: 'Messages de Contact | Admin',
};

async function getInquiries() {
  return await prisma.contactInquiry.findMany({
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export default async function InquiriesPage() {
  const inquiries = await getInquiries();

  const stats = {
    total: inquiries.length,
    new: inquiries.filter(i => i.status === 'new').length,
    read: inquiries.filter(i => i.status === 'read').length,
    replied: inquiries.filter(i => i.status === 'replied').length,
    closed: inquiries.filter(i => i.status === 'closed').length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Messages de Contact
        </h1>
        <p className="text-gray-600">
          Gérez tous les messages reçus via les formulaires de contact
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-6">
          <div className="text-sm text-blue-600 mb-1">Nouveaux</div>
          <div className="text-3xl font-bold text-blue-600">{stats.new}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-6">
          <div className="text-sm text-yellow-600 mb-1">Lus</div>
          <div className="text-3xl font-bold text-yellow-600">{stats.read}</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-6">
          <div className="text-sm text-green-600 mb-1">Répondus</div>
          <div className="text-3xl font-bold text-green-600">{stats.replied}</div>
        </div>
        <div className="bg-gray-50 rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Fermés</div>
          <div className="text-3xl font-bold text-gray-600">{stats.closed}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entreprise
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sujet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inquiries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Aucun message pour le moment
                </td>
              </tr>
            ) : (
              inquiries.map((inquiry) => (
                <tr key={inquiry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDistanceToNow(new Date(inquiry.createdAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {inquiry.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      <a href={`mailto:${inquiry.email}`} className="hover:text-blue-600">
                        {inquiry.email}
                      </a>
                    </div>
                    {inquiry.phone && (
                      <div className="text-sm text-gray-500">
                        <a href={`tel:${inquiry.phone}`} className="hover:text-blue-600">
                          {inquiry.phone}
                        </a>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {inquiry.company ? (
                      <Link
                        href={`/admin/companies/${inquiry.company.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {inquiry.company.name}
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {inquiry.subject}
                    </div>
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {inquiry.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        inquiry.status === 'new'
                          ? 'bg-blue-100 text-blue-800'
                          : inquiry.status === 'read'
                          ? 'bg-yellow-100 text-yellow-800'
                          : inquiry.status === 'replied'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {inquiry.status === 'new'
                        ? 'Nouveau'
                        : inquiry.status === 'read'
                        ? 'Lu'
                        : inquiry.status === 'replied'
                        ? 'Répondu'
                        : 'Fermé'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/admin/inquiries/${inquiry.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Voir
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

