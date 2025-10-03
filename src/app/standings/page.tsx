import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { StandingsInterface } from '@/components/standings-interface';

export default async function StandingsPage() {
  const cookieStore = cookies();
  const userCookie = cookieStore.get('user-session');

  if (!userCookie) {
    redirect('/');
  }

  let user;
  try {
    user = JSON.parse(userCookie.value);
  } catch {
    redirect('/');
  }

  return <StandingsInterface user={user} />;
}
