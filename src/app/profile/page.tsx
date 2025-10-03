import { redirect } from 'next/navigation';
import { getUserSession } from '@/lib/session';
import { ProfileInterface } from '@/components/profile-interface';

export default async function ProfilePage() {
  const session = await getUserSession();
  
  if (!session) {
    redirect('/login');
  }

  return <ProfileInterface user={session} />;
}
