import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CategoryEditForm from '@/components/CategoryEditForm';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CategoryEditPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch all categories for parent selection
  const categories = await prisma.category.findMany({
    orderBy: {
      order: 'asc',
    },
  });

  if (id === 'new') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Nouvelle Catégorie</h1>
        <CategoryEditForm categories={categories} />
      </div>
    );
  }

  const categoryId = parseInt(id, 10);

  if (isNaN(categoryId)) {
    notFound();
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      parent: true,
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Modifier la Catégorie</h1>
      <CategoryEditForm category={category} categories={categories} />
    </div>
  );
}

