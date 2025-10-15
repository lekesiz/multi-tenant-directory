import type { Metadata } from 'next';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata: Metadata = {
  title: 'Admin Panel - Multi-Tenant Directory',
  description: 'Yönetim paneli',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      {/* Main Content */}
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}