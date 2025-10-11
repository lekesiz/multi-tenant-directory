import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import AdminSidebar from '@/components/AdminSidebar';

export const metadata: Metadata = {
  title: 'Admin Panel - Multi-Tenant Directory',
  description: 'Yönetim paneli',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  // Login sayfası hariç, diğer admin sayfaları için auth kontrolü
  const isLoginPage = false; // Bu, her sayfa için ayrı kontrol edilecek

  return (
    <div className="min-h-screen bg-gray-50">
      {session ? (
        <>
          <AdminSidebar />
          <main className="ml-64 p-8">{children}</main>
        </>
      ) : (
        <main>{children}</main>
      )}
    </div>
  );
}

