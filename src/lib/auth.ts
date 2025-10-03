import bcrypt from 'bcryptjs';

export async function hashCredential(credential: string): Promise<string> {
  return bcrypt.hash(credential, 10);
}

export async function verifyCredential(credential: string, hash: string): Promise<boolean> {
  return bcrypt.compare(credential, hash);
}

export function isValidPin(pin: string): boolean {
  return /^\d{4}$|^\d{6}$/.test(pin);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

export const DEFAULT_PASSWORD = 'nflofficepickems';
