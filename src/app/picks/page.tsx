import { redirect } from 'next/navigation';
import { getUserSession } from '@/lib/session';
import { PicksInterface } from '@/components/picks-interface';

export default async function PicksPage() {
  const session = await getUserSession();
  
  if (!session) {
    redirect('/login');
  }

  return <PicksInterface user={session} />;
}
