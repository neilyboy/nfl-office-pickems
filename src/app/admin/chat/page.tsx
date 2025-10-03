import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/session';
import { AdminChat } from '@/components/admin-chat';

export default async function AdminChatPage() {
  const session = await getAdminSession();
  
  if (!session) {
    redirect('/');
  }

  return <AdminChat />;
}
