import { redirect } from 'next/navigation';

export default function DashboardRedirectPage() {
  // Redirect to business dashboard
  redirect('/business/dashboard');
}
