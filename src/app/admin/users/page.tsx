import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/session';
import { UserManagement } from '@/components/user-management';

export default async function AdminUsersPage() {
  const isAdmin = await getAdminSession();
  
  if (!isAdmin) {
    redirect('/');
  }

  return <UserManagement />;
}
