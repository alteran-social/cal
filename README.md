# atproto Cal

A decentralized scheduling platform built on the AT Protocol where availability is public data stored on Personal Data Servers (PDS), while private calendar sync remains client-side.

## Features

- **Decentralized Identity**: Sign in with your AT Protocol handle (no traditional email/password)
- **Public Availability**: Store your available time slots on your PDS
- **Calendar Integration**: Sync with Google Calendar (read-only) to block out busy times
- **Smart Booking**: Platform manages bookings while respecting your availability
- **ICS Invites**: Receive calendar invites via email

## Tech Stack

- **Frontend**: Astro (SSR + Islands for interactivity)
- **Runtime**: Bun (fallback to Node.js)
- **Hosting**: Cloudflare Pages + Workers
- **Database**: Drizzle ORM + D1
- **Identity**: AT Protocol OAuth
- **Calendar**: Google Calendar API (read-only)

## Project Structure

```
/
├── src/
│   ├── pages/           # Astro pages and routes
│   │   ├── index.astro  # Landing page
│   │   ├── dashboard.astro
│   │   ├── settings.astro
│   │   ├── auth/        # Authentication pages
│   │   ├── availability/# Availability management
│   │   ├── book/        # Public booking pages
│   │   └── api/         # API endpoints
│   ├── layouts/         # Page layouts
│   ├── components/      # Reusable components
│   ├── lib/             # Core library code
│   │   ├── atproto/     # AT Protocol integration
│   │   ├── auth/        # Authentication & sessions
│   │   └── db/          # Database schema
│   └── middleware/      # Astro middleware
├── public/              # Static assets
└── drizzle/             # Database migrations
```

## Documentation

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Local development setup and workflow
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design decisions
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide for Cloudflare
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Guidelines for contributors

## Getting Started

### Prerequisites

- Node.js 20+ or Bun 1.0+
- Cloudflare account (for deployment)

### Installation

```bash
# Install dependencies
npm install
# or
bun install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

```env
# AT Protocol OAuth
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret
OAUTH_REDIRECT_URI=http://localhost:4321/api/auth/callback

# Session Secret
JWT_SECRET=your-secret-key

# Cloudflare D1 (for local development)
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_DATABASE_ID=your-database-id
CLOUDFLARE_D1_TOKEN=your-token

# Google Calendar (optional, for Phase 2)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Development

```bash
# Start development server
npm run dev
# or
bun run dev

# Build for production
npm run build
# or
bun run build

# Generate database migrations
npm run db:generate
# or
bun run db:generate
```

Visit `http://localhost:4321` to see the app.

## Implementation Phases

### Phase 1: Identity & Public Availability ✅
- AT Protocol OAuth integration
- Session management
- Create/edit/delete availability slots
- Public profile view
- Basic availability UI

### Phase 1.5: Settings & Account Management ✅
- Settings dashboard
- Profile customization
- Connected accounts management
- Notification preferences
- Data export & account deletion

### Phase 2: Google Calendar Integration (In Progress)
- Google Calendar OAuth
- Encrypted token storage
- FreeBusy API integration
- Periodic sync worker
- Conflict detection

### Phase 3: Booking Flow & Notifications (Planned)
- Booking creation & management
- Host approval flow
- ICS file generation
- Email notifications
- In-app notifications

### Phase 3.5: Cancellation & Rescheduling (Planned)
- Cancel bookings
- Reschedule requests
- Updated ICS files

### Phase 4+: Advanced Features (Future)
- Recurring availability
- Team scheduling
- Discovery features
- Analytics

## Database Schema

The application uses Cloudflare D1 (SQLite) with the following tables:

- `calendar_connections`: Google Calendar OAuth tokens
- `busy_cache`: Cached busy times from calendar sync
- `bookings`: Booking records (broker storage)
- `notifications`: User notifications
- `user_settings`: User preferences

## AT Protocol Schema

Availability is stored on users' PDS using the collection:

```
social.schedule.availability
```

See `src/lib/atproto/schema.ts` for the full lexicon definition.

## Deployment

### Cloudflare Pages

```bash
# Deploy to Cloudflare Pages
wrangler pages deploy dist

# Set up D1 database
wrangler d1 create atproto-cal
wrangler d1 execute atproto-cal --file=./drizzle/schema.sql
```

## Security

- Sessions are managed via JWT tokens stored in HTTP-only cookies
- OAuth tokens are encrypted before storage
- All API endpoints validate authentication
- CSRF protection via state parameters

## Contributing

Contributions are welcome! This is an open-source project building on the AT Protocol.

## License

MIT License - see LICENSE file for details

## Acknowledgments

Built on the [AT Protocol](https://atproto.com/) - a decentralized social networking protocol.

## Support

For issues and questions, please open an issue on GitHub.
