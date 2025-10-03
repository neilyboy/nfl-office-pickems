import { redirect } from 'next/navigation';
import { getUserSession } from '@/lib/session';
import { StatsInterface } from '@/components/stats-interface';

export default async function StatsPage() {
  const session = await getUserSession();
  
  if (!session) {
    redirect('/login');
  }

  return <StatsInterface user={session} />;
}
