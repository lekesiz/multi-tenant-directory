import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function DebugCategoriesPage() {
  const headersList = await headers();
  let domain = headersList.get('x-tenant-domain') || 'bas-rhin.pro';
  domain = domain.replace('www.', '');
  
  const domainData = await prisma.domain.findUnique({
    where: { name: domain },
  });

  if (!domainData) {
    return <div>Domain not found</div>;
  }

  // Test 1: Get companies with content
  const companiesWithContent = await prisma.company.findMany({
    where: {
      isActive: true,
      content: {
        some: {
          domainId: domainData.id,
          isVisible: true,
        },
      },
    },
    select: {
      id: true,
      name: true,
      companyCategories: {
        select: {
          categoryId: true,
        },
      },
    },
    take: 10,
  });

  // Test 2: Get all company content for this domain
  const allContent = await prisma.companyContent.findMany({
    where: {
      domainId: domainData.id,
      isVisible: true,
    },
    select: {
      companyId: true,
      company: {
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      },
    },
    take: 10,
  });

  // Test 3: Get company categories count
  const categoryRelations = await prisma.companyCategory.findMany({
    select: {
      categoryId: true,
      companyId: true,
    },
    take: 20,
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Debug Categories Page</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Domain Info</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify({ id: domainData.id, name: domainData.name }, null, 2)}
        </pre>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Test 1: Companies with Content (Prisma Query)</h2>
        <p className="mb-2">Count: {companiesWithContent.length}</p>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(companiesWithContent, null, 2)}
        </pre>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Test 2: All Company Content for Domain</h2>
        <p className="mb-2">Count: {allContent.length}</p>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(allContent, null, 2)}
        </pre>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Test 3: Company Category Relations</h2>
        <p className="mb-2">Count: {categoryRelations.length}</p>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(categoryRelations, null, 2)}
        </pre>
      </div>
    </div>
  );
}
