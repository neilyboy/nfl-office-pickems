import { redirect } from 'next/navigation';
import { getUserSession } from '@/lib/session';
import { LiveScores } from '@/components/live-scores';

export default async function ScoresPage() {
  const session = await getUserSession();
  
  if (!session) {
    redirect('/login');
  }

  return <LiveScores user={session} />;
}
