import { Suspense } from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

async function CategoriesList() {
  // Fetch categories with parent-child relationship
  const categories = await prisma.category.findMany({
    where: {
      parentId: null, // Only get top-level categories
    },
    include: {
      children: {
        include: {
          _count: {
            select: {
              companyCategories: true,
            },
          },
        },
        orderBy: {
          order: 'asc',
        },
      },
      _count: {
        select: {
          companyCategories: true,
        },
      },
    },
    orderBy: {
      order: 'asc',
    },
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Slug
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nom Français
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Icône
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Entreprises
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {categories.map((category) => (
            <>
              {/* Parent Category */}
              <tr key={category.id} className="bg-white">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {category.slug}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                  {category.nameFr || category.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-2xl">
                  {category.icon || '🏪'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {category._count.companyCategories}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    href={`/admin/categories/${category.id}`}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Modifier
                  </Link>
                </td>
              </tr>

              {/* Subcategories */}
              {category.children.map((subcat) => (
                <tr key={subcat.id} className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 pl-12">
                    ↳ {subcat.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {subcat.nameFr || subcat.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xl">
                    {subcat.icon || '📁'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subcat._count.companyCategories}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/admin/categories/${subcat.id}`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Modifier
                    </Link>
                  </td>
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Catégories</h1>
        <Link
          href="/admin/categories/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Nouvelle Catégorie
        </Link>
      </div>

      <Suspense fallback={<div>Chargement...</div>}>
        <CategoriesList />
      </Suspense>
    </div>
  );
}

