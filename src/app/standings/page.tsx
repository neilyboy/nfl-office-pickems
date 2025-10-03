import { redirect } from 'next/navigation';
import { getUserSession } from '@/lib/session';
import { StandingsInterface } from '@/components/standings-interface';

export default async function StandingsPage() {
  const session = await getUserSession();
  
  if (!session) {
    redirect('/login');
  }

  return <StandingsInterface user={session} />;
}
