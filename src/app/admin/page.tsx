import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/session';
import { AdminDashboard } from '@/components/admin-dashboard';

export default async function AdminPage() {
  const isAdmin = await getAdminSession();
  
  if (!isAdmin) {
    redirect('/');
  }

  return <AdminDashboard />;
}
