import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/session';
import { AdminBackup } from '@/components/admin-backup';

export default async function AdminBackupPage() {
  const session = await getAdminSession();
  
  if (!session) {
    redirect('/');
  }

  return <AdminBackup />;
}
