import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ProfileInterface } from '@/components/profile-interface';

export default async function ProfilePage() {
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

  return <ProfileInterface user={user} />;
}
