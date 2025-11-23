// Helper to get env vars safely across Dev (import.meta.env/process.env) and Prod (Cloudflare locals.runtime.env)
export function getGoogleConfig(env: any) {
    const clientId = env?.GOOGLE_CLIENT_ID || import.meta.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = env?.GOOGLE_CLIENT_SECRET || import.meta.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;

    let redirectUri = env?.OAUTH_REDIRECT_URI || import.meta.env.OAUTH_REDIRECT_URI || process.env.OAUTH_REDIRECT_URI || 'http://localhost:4321/api/auth/callback';

    // Adjust for Google Callback specific route
    redirectUri = redirectUri.replace('/api/auth/callback', '/api/auth/google/callback');

    return { clientId, clientSecret, redirectUri };
}
