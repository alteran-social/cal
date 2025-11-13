# Deployment Guide

This guide explains how to deploy atproto Cal to Cloudflare Pages.

## Prerequisites

- A Cloudflare account
- Wrangler CLI installed: `npm install -g wrangler`
- Git repository connected to GitHub

## Setup Steps

### 1. Create Cloudflare D1 Database

```bash
# Login to Cloudflare
wrangler login

# Create a D1 database
wrangler d1 create atproto-cal-db

# Note the database ID from the output
```

### 2. Create KV Namespace

```bash
# Create KV namespace for sessions
wrangler kv:namespace create SESSION

# Note the KV namespace ID from the output
```

### 3. Configure wrangler.toml

Copy `wrangler.toml.example` to `wrangler.toml` and update with your IDs:

```toml
[[d1_databases]]
binding = "DB"
database_name = "atproto-cal-db"
database_id = "your-database-id-here"

[[kv_namespaces]]
binding = "SESSION"
id = "your-kv-id-here"
```

### 4. Initialize Database Schema

```bash
# Generate migrations
npm run db:generate

# Apply migrations to D1
wrangler d1 execute atproto-cal-db --file=./drizzle/0000_initial.sql
```

### 5. Set Environment Variables

In the Cloudflare dashboard, navigate to your Pages project and set these environment variables:

**Required:**
- `JWT_SECRET` - A secure random string for session tokens
- `OAUTH_CLIENT_ID` - Your AT Protocol OAuth client ID
- `OAUTH_CLIENT_SECRET` - Your AT Protocol OAuth client secret
- `OAUTH_REDIRECT_URI` - Your callback URL (e.g., `https://yourapp.pages.dev/api/auth/callback`)

**Optional (for Phase 2):**
- `GOOGLE_CLIENT_ID` - Google Calendar API client ID
- `GOOGLE_CLIENT_SECRET` - Google Calendar API client secret

### 6. Deploy to Cloudflare Pages

**Option A: Automatic Deployment (Recommended)**

1. Connect your GitHub repository to Cloudflare Pages
2. Configure build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
3. Cloudflare will automatically deploy on every push

**Option B: Manual Deployment**

```bash
# Build the project
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist
```

### 7. Configure Custom Domain (Optional)

1. Go to your Pages project in Cloudflare dashboard
2. Navigate to "Custom domains"
3. Add your custom domain
4. Update DNS records as instructed

### 8. Update OAuth Redirect URI

After deployment, update your AT Protocol OAuth application settings to include your production callback URL:

```
https://yourdomain.com/api/auth/callback
```

## Troubleshooting

### Build Fails

- Check that all dependencies are installed
- Verify Node.js version (requires Node 20+)
- Review build logs for specific errors

### Database Errors

- Ensure D1 binding is correctly configured in wrangler.toml
- Verify database migrations have been applied
- Check database ID matches your D1 database

### Session Issues

- Verify KV namespace is correctly bound
- Check JWT_SECRET is set in environment variables
- Ensure cookies are being set with Secure flag in production

### OAuth Not Working

- Verify OAuth credentials are correct
- Check redirect URI matches exactly
- Ensure your domain is authorized in OAuth app settings

## Monitoring

Enable Cloudflare Analytics and Workers metrics to monitor:
- Request counts
- Error rates
- Response times
- Geographic distribution

## Scaling

Cloudflare Workers automatically scale. Consider:
- D1 database size limits
- KV storage limits
- Rate limiting for API endpoints

## Security Checklist

- ✅ JWT_SECRET is a strong random string
- ✅ OAuth credentials are not exposed in client-side code
- ✅ All secrets are in environment variables, not committed to git
- ✅ HTTPS is enforced (automatic with Cloudflare)
- ✅ Session cookies have HttpOnly, Secure, and SameSite flags

## Support

For deployment issues, check:
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Astro Cloudflare Adapter Documentation](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
