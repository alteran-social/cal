# Development Guide

This guide will help you set up and run atproto Cal locally for development.

## Prerequisites

- Node.js 20+ or Bun 1.0+
- Git
- A code editor (VS Code recommended)

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/alteran-dev/cal.git
cd cal
```

### 2. Install Dependencies

```bash
npm install
# or
bun install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Required for authentication
JWT_SECRET=your-secret-key-here

# AT Protocol OAuth (get from your OAuth app)
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret
OAUTH_REDIRECT_URI=http://localhost:4321/api/auth/callback

# Optional: For local D1 development
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_DATABASE_ID=your-database-id
CLOUDFLARE_D1_TOKEN=your-token

# Optional: For Phase 2 (Google Calendar)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 4. Set Up Local Database (Optional)

For local development with D1:

```bash
# Generate migrations
npm run db:generate

# Create local D1 database
npx wrangler d1 create atproto-cal-dev

# Apply migrations
npx wrangler d1 execute atproto-cal-dev --file=./drizzle/0000_initial.sql
```

## Running the Development Server

### Start the Dev Server

```bash
npm run dev
# or
bun run dev
```

The application will be available at `http://localhost:4321`

### What You'll See

1. **Landing Page** (`/`) - Introduction to the app
2. **Sign In** (`/auth/login`) - Authentication page
3. **Dashboard** (`/dashboard`) - User's booking dashboard (requires auth)
4. **Settings** (`/settings`) - User preferences (requires auth)
5. **Availability** (`/availability/new`) - Create availability slots (requires auth)
6. **Booking Page** (`/book/[handle]`) - Public booking page for any user

## Development Workflow

### Making Changes

1. **Edit files** in `src/` directory
2. **Save** - Astro will hot reload automatically
3. **View changes** in browser at `http://localhost:4321`

### File Structure

```
src/
├── pages/              # Routes and API endpoints
│   ├── index.astro     # Landing page
│   ├── dashboard.astro # User dashboard
│   ├── auth/           # Auth pages
│   ├── api/            # API routes
│   └── book/           # Public booking pages
├── layouts/            # Page layouts
├── components/         # Reusable components (future)
├── lib/                # Core logic
│   ├── atproto/        # AT Protocol integration
│   ├── auth/           # Authentication
│   ├── db/             # Database schema
│   └── utils/          # Utilities
└── middleware/         # Request middleware
```

### Testing Changes

1. **Manual testing**: Navigate through the app
2. **Check console**: Look for errors in browser console
3. **Check terminal**: Look for server errors

## Common Development Tasks

### Adding a New Page

1. Create a new `.astro` file in `src/pages/`
2. Add your content using Astro syntax
3. Access at the corresponding URL

Example:
```astro
---
// src/pages/about.astro
import Layout from '../layouts/Layout.astro';
---

<Layout title="About">
  <h1>About Us</h1>
  <p>Content here...</p>
</Layout>
```

### Adding a New API Endpoint

1. Create a new `.ts` file in `src/pages/api/`
2. Export HTTP method handlers (GET, POST, etc.)

Example:
```typescript
// src/pages/api/hello.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ message: 'Hello' }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
```

### Modifying Database Schema

1. Edit `src/lib/db/schema.ts`
2. Generate migration: `npm run db:generate`
3. Apply migration: `npx wrangler d1 execute atproto-cal-dev --file=./drizzle/XXXX_new_migration.sql`

### Working with AT Protocol

The main client is in `src/lib/atproto/client.ts`:

```typescript
import { createAtProtoClient } from './lib/atproto/client';

const client = createAtProtoClient();
const did = await client.resolveHandle('user.bsky.social');
```

## Building for Production

### Build the Project

```bash
npm run build
```

This will:
1. Check TypeScript types (if @astrojs/check is installed)
2. Build for Cloudflare Workers
3. Output to `dist/` directory

### Preview Production Build

```bash
npm run preview
```

## Debugging

### Enable Debug Logging

Add console.log statements in your code:

```typescript
console.log('Debug info:', someVariable);
```

Check the terminal where the dev server is running.

### Browser DevTools

1. Open DevTools (F12)
2. Check Console for errors
3. Check Network tab for API calls
4. Use Sources tab for debugging

### Common Issues

**Issue**: Session not persisting
- **Solution**: Check JWT_SECRET is set in .env

**Issue**: OAuth redirect fails
- **Solution**: Verify OAUTH_REDIRECT_URI matches exactly

**Issue**: Database errors
- **Solution**: Ensure D1 database is created and migrations applied

**Issue**: Build fails
- **Solution**: Run `npm install` to ensure dependencies are up to date

## Code Style

### TypeScript

- Use strict mode (enabled in tsconfig.json)
- Define types for all function parameters
- Avoid `any` type when possible

### Astro Components

- Use `---` frontmatter for server-side code
- Keep logic minimal in components
- Extract complex logic to `lib/` modules

### API Routes

- Return proper HTTP status codes
- Use JSON for responses
- Validate inputs
- Handle errors gracefully

## Git Workflow

### Making Changes

```bash
# Create a feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "Add my feature"

# Push to GitHub
git push origin feature/my-feature
```

### Before Committing

- Test your changes
- Ensure build succeeds: `npm run build`
- Check for TypeScript errors: `npx tsc --noEmit`
- Update documentation if needed

## Testing (Future)

Testing infrastructure will be added in future phases:
- Unit tests with Vitest
- Integration tests with Playwright
- E2E tests for critical flows

## Resources

- [Astro Documentation](https://docs.astro.build/)
- [AT Protocol Docs](https://atproto.com/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)

## Getting Help

If you encounter issues:

1. Check existing [GitHub Issues](https://github.com/alteran-dev/cal/issues)
2. Read the [ARCHITECTURE.md](./ARCHITECTURE.md) for system overview
3. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
4. Open a new issue with details about your problem

## Next Steps

Once you have the dev environment running:

1. Explore the codebase
2. Try making small changes
3. Read [CONTRIBUTING.md](./CONTRIBUTING.md)
4. Pick an issue to work on
5. Submit a Pull Request

Happy coding! 🚀
