import { createAtProtoClient } from '../atproto/client';
import { createSessionToken, type SessionData } from './session';

/**
 * OAuth configuration and flow for atproto authentication
 */

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

/**
 * Generate OAuth authorization URL for atproto
 * 
 * In production, this would implement the full OAuth flow:
 * 1. Resolve handle to DID
 * 2. Discover PDS endpoint from DID document
 * 3. Redirect to PDS OAuth authorization endpoint
 */
export async function getAuthorizationUrl(handle: string): Promise<string> {
  try {
    const client = createAtProtoClient();
    const did = await client.resolveHandle(handle);
    const pdsUrl = await client.getPdsUrl(did);

    // In production, construct proper OAuth URL
    // For now, return a placeholder
    const params = new URLSearchParams({
      client_id: process.env.OAUTH_CLIENT_ID || 'atproto-cal',
      redirect_uri: process.env.OAUTH_REDIRECT_URI || 'http://localhost:4321/auth/callback',
      response_type: 'code',
      scope: 'atproto transition:generic',
      state: generateState(),
      handle: handle,
      did: did,
    });

    return `${pdsUrl}/oauth/authorize?${params.toString()}`;
  } catch (error) {
    console.error('Failed to generate authorization URL:', error);
    throw new Error('Invalid handle or unable to resolve');
  }
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<SessionData> {
  // In production, this would:
  // 1. Exchange the code for an access token with the PDS
  // 2. Get user information (DID, handle)
  // 3. Store tokens securely

  // Placeholder implementation
  return {
    did: 'did:plc:example',
    handle: 'user.bsky.social',
    accessToken: code,
    expiresAt: Date.now() + 3600000, // 1 hour
  };
}

/**
 * Generate a random state parameter for CSRF protection
 */
function generateState(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verify OAuth state parameter
 */
export function verifyState(state: string, storedState: string): boolean {
  return state === storedState;
}

/**
 * Complete OAuth flow and create session
 */
export async function completeOAuthFlow(code: string, state: string): Promise<string> {
  // Verify state (in production, check against stored state)
  
  // Exchange code for token
  const sessionData = await exchangeCodeForToken(code);
  
  // Create session token
  const sessionToken = await createSessionToken(sessionData);
  
  return sessionToken;
}
