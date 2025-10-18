import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CategoryEditForm from '@/components/CategoryEditForm';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CategoryEditPage({ params }: PageProps) {
  const { id } = await params;
  
  if (id === 'new') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Nouvelle Catégorie</h1>
        <CategoryEditForm />
      </div>
    );
  }

  const category = await prisma.businessCategory.findUnique({
    where: { id },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Modifier la Catégorie</h1>
      <CategoryEditForm category={category} />
    </div>
  );
}

