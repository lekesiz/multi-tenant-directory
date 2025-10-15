import { Sidebar } from '@/components/business/Sidebar';
import { Topbar } from '@/components/business/Topbar';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function BusinessDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login?callbackUrl=/business/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <Topbar />

      <div className="flex pt-16">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
