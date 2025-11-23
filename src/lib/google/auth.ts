// Lightweight Google Auth using Fetch

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events.readonly'
];

interface GoogleConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export function generateAuthUrl(config: { clientId: string; redirectUri: string }) {
  const { clientId, redirectUri } = config;

  if (!clientId) throw new Error('Missing Google Client ID');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent'
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string, config: GoogleConfig) {
  const { clientId, clientSecret, redirectUri } = config;

  if (!clientId || !clientSecret) throw new Error('Missing Google Credentials');

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Google Token Exchange Error:', error);
    throw new Error('Failed to exchange code for tokens');
  }

  return response.json();
}

export async function refreshAccessToken(refreshToken: string, config: { clientId: string; clientSecret: string }) {
  const { clientId, clientSecret } = config;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token'
    })
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  return response.json();
}
