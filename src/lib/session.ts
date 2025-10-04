import { cookies, headers } from 'next/headers';

export interface Session {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  isAdmin?: boolean;
}

const SESSION_COOKIE_NAME = 'nfl-pickems-session';
const ADMIN_COOKIE_NAME = 'nfl-pickems-admin';

/**
 * Determines if secure cookies should be used.
 * Returns true if:
 * - FORCE_SECURE_COOKIES env var is set to 'true', OR
 * - Request is coming through HTTPS (X-Forwarded-Proto header), OR
 * - Request is directly to HTTPS
 */
async function shouldUseSecureCookies(): Promise<boolean> {
  // Check environment variable override
  if (process.env.FORCE_SECURE_COOKIES === 'true') {
    return true;
  }
  if (process.env.FORCE_SECURE_COOKIES === 'false') {
    return false;
  }

  // Auto-detect based on request headers (for reverse proxy)
  try {
    const headersList = await headers();
    const proto = headersList.get('x-forwarded-proto');
    const host = headersList.get('host');
    
    // If behind reverse proxy with HTTPS
    if (proto === 'https') {
      return true;
    }
    
    // If accessed directly via HTTPS
    if (host?.includes('443') || proto === 'https') {
      return true;
    }
  } catch (error) {
    // Headers not available, fall back to env check
  }

  // Default to false for local/HTTP access
  return false;
}

export async function setUserSession(session: Session) {
  const cookieStore = await cookies();
  const useSecure = await shouldUseSecureCookies();
  
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: useSecure,
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
  const useSecure = await shouldUseSecureCookies();
  
  cookieStore.set(ADMIN_COOKIE_NAME, 'true', {
    httpOnly: true,
    secure: useSecure,
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
