import * as jose from 'jose';

/**
 * Session management for atproto authentication
 */

export interface SessionData {
  did: string;
  handle: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Create a JWT session token
 */
export async function createSessionToken(data: SessionData): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);
  
  const token = await new jose.SignJWT({ ...data })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  return token;
}

/**
 * Verify and decode a JWT session token
 */
export async function verifySessionToken(token: string): Promise<SessionData | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    
    return payload as unknown as SessionData;
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}

/**
 * Get session from request cookies
 */
export async function getSession(request: Request): Promise<SessionData | null> {
  const cookies = request.headers.get('cookie');
  if (!cookies) return null;

  const sessionCookie = cookies
    .split(';')
    .find(c => c.trim().startsWith('session='));

  if (!sessionCookie) return null;

  const token = sessionCookie.split('=')[1];
  return verifySessionToken(token);
}

/**
 * Create a session cookie
 */
export function createSessionCookie(token: string): string {
  return `session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(): string {
  return 'session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
}
