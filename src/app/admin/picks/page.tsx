import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/session';
import { AdminPicksManagement } from '@/components/admin-picks-management';

export default async function AdminPicksPage() {
  const isAdmin = await getAdminSession();
  
  if (!isAdmin) {
    redirect('/');
  }

  return <AdminPicksManagement />;
}
