import { cookies } from 'next/headers';

export interface Session {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  isAdmin?: boolean;
}

const SESSION_COOKIE_NAME = 'nfl-pickems-session';
const ADMIN_COOKIE_NAME = 'nfl-pickems-admin';

export async function setUserSession(session: Session) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: false, // Set to true when using HTTPS
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getUserSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  
  if (!sessionCookie) return null;
  
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

export async function clearUserSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function setAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, 'true', {
    httpOnly: true,
    secure: false, // Set to true when using HTTPS
    sameSite: 'lax',
    maxAge: 60 * 60 * 2, // 2 hours
  });
}

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return !!cookieStore.get(ADMIN_COOKIE_NAME);
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
