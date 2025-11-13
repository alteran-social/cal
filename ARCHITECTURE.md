# Architecture Overview

This document describes the architecture of atproto Cal, a decentralized scheduling platform built on the AT Protocol.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│                    (Astro SSR + Islands)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Cloudflare Workers                         │
│                    (Astro Adapter)                           │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Routes  │  │ API Routes   │  │ Public Pages │      │
│  │ /auth/*      │  │ /api/*       │  │ /book/*      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────┬────────────────┬────────────────┬──────────────────┘
         │                │                │
         ▼                ▼                ▼
┌────────────────┐ ┌──────────────┐ ┌──────────────────┐
│  Cloudflare    │ │ Cloudflare   │ │   User's PDS     │
│  KV (Sessions) │ │ D1 (Bookings)│ │ (Availability)   │
└────────────────┘ └──────────────┘ └──────────────────┘
```

## Data Storage Model

### Decentralized (AT Protocol)

**User's Personal Data Server (PDS)**
- Availability slots (collection: `social.schedule.availability`)
- User's public profile information
- Follows/social graph (for booking rules)

### Centralized (Cloudflare)

**D1 Database (SQLite)**
- Bookings (broker for multi-party coordination)
- Calendar connections (Google OAuth tokens)
- Busy time cache (from calendar sync)
- Notifications
- User settings/preferences

**KV Storage**
- Session tokens (JWT)
- OAuth state parameters (CSRF protection)

## Authentication Flow

```
1. User enters handle → 2. Resolve to DID → 3. Discover PDS
                                                     │
4. Redirect to PDS OAuth ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
         │
         ▼
5. User approves → 6. Callback with code → 7. Exchange for token
                                                     │
8. Create session ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘
         │
         ▼
9. Store in KV → 10. Set cookie → 11. Redirect to dashboard
```

## Booking Flow (Phase 3)

```
┌──────────┐                                    ┌──────────┐
│  Booker  │                                    │   Host   │
└────┬─────┘                                    └────┬─────┘
     │                                               │
     │ 1. View /book/[handle]                        │
     ├───────────────────────────────────────────────┤
     │                                               │
     │ 2. Fetch availability from Host's PDS         │
     │◄──────────────────────────────────────────────┤
     │                                               │
     │ 3. Check busy times (D1 cache)                │
     │◄──────────────────────────────────────────────┤
     │                                               │
     │ 4. Display available slots                    │
     │                                               │
     │ 5. Select slot & submit booking               │
     ├──────────────────────────────────────────────►│
     │                                               │
     │ 6. Create booking in D1 (broker)              │
     │                                               │
     │ 7. Send notification to Host                  │
     │                                               ├───►
     │                                               │
     │ 8. Host approves (if manual)                  │
     │◄──────────────────────────────────────────────┤
     │                                               │
     │ 9. Send ICS invite to both parties            │
     │◄──────────────────────────────────────────────┤
     │                                               │
```

## Key Components

### Frontend (Astro)

**Pages**
- `/` - Landing page
- `/auth/login` - Authentication entry point
- `/dashboard` - User's booking dashboard
- `/settings` - User preferences
- `/availability/new` - Create availability slots
- `/book/[handle]` - Public booking page

**Islands (Interactive Components)**
- Calendar picker
- Time slot selector
- Notification bell
- Availability form

### Backend (Cloudflare Workers)

**API Routes**
- `/api/auth/*` - Authentication endpoints
- `/api/availability/*` - Availability management
- `/api/bookings/*` - Booking management (Phase 3)
- `/api/calendar/*` - Calendar integration (Phase 2)

**Middleware**
- Session validation
- Route protection
- CSRF protection

### Database Schema

**Bookings Table**
```sql
CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  host_did TEXT NOT NULL,
  booker_did TEXT NOT NULL,
  availability_id TEXT NOT NULL,
  start_time INTEGER NOT NULL,
  end_time INTEGER NOT NULL,
  status TEXT NOT NULL,
  booker_email TEXT,
  booker_note TEXT,
  created_at INTEGER NOT NULL,
  confirmed_at INTEGER
);
```

**Calendar Connections Table** (Phase 2)
```sql
CREATE TABLE calendar_connections (
  id TEXT PRIMARY KEY,
  user_did TEXT NOT NULL,
  provider TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  calendar_ids TEXT,
  last_sync_at INTEGER,
  created_at INTEGER NOT NULL
);
```

## Security Considerations

### Authentication
- JWT tokens stored in HTTP-only cookies
- CSRF protection via state parameters
- Session expiration (7 days)
- Secure flag in production

### Data Privacy
- Calendar tokens encrypted before storage
- PDS data is user-controlled
- No sensitive data in logs
- GDPR-compliant data export

### Rate Limiting (Phase 4)
- Protect availability endpoints
- Limit booking creation
- Prevent brute force attacks

## Scalability

### Cloudflare Workers
- Automatically scales globally
- Low latency edge computing
- No cold starts

### D1 Database
- SQLite at the edge
- Suitable for medium-scale apps
- Consider sharding for very large scale

### PDS Federation
- Decentralized by design
- Each user's PDS scales independently
- No single point of failure

## Future Considerations

### Phase 2: Calendar Integration
- Google Calendar OAuth
- FreeBusy API polling
- Conflict detection algorithm
- Cron workers for sync

### Phase 3: Booking System
- ICS file generation
- Email notifications (SendGrid/Resend)
- Double-booking prevention
- Optimistic locking

### Phase 5: Discovery
- Optional directory in D1
- Social graph queries
- Full-text search
- Category tagging

## Development Workflow

```
Local Dev → Build → Deploy to Cloudflare Pages
   │          │              │
   │          │              ├─► Preview deployment (per PR)
   │          │              └─► Production deployment (main branch)
   │          │
   │          └─► Run CodeQL security checks
   │
   └─► Hot reload with Astro dev server
```

## Monitoring & Observability

### Metrics (Phase 4)
- Request counts
- Error rates
- Response times
- Geographic distribution

### Logging
- Cloudflare Workers logs
- Application errors
- Security events
- Booking events

## Technology Choices

### Why Astro?
- SSR for fast initial load
- Islands for selective hydration
- Great DX with component-based architecture
- Works well with Cloudflare

### Why Cloudflare?
- Global edge network
- D1 for database at the edge
- KV for fast session storage
- Cost-effective at scale

### Why AT Protocol?
- Decentralized identity
- User data sovereignty
- Interoperable with Bluesky ecosystem
- Future-proof architecture

## References

- [AT Protocol Documentation](https://atproto.com/)
- [Astro Documentation](https://docs.astro.build/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
