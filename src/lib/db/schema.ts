import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

// Calendar connections (Google Calendar OAuth)
export const calendarConnections = sqliteTable('calendar_connections', {
  id: text('id').primaryKey(),
  userDid: text('user_did').notNull(),
  provider: text('provider').notNull(), // 'google'
  refreshToken: text('refresh_token').notNull(), // encrypted
  calendarIds: text('calendar_ids'), // JSON array
  lastSyncAt: integer('last_sync_at'),
  createdAt: integer('created_at').notNull().default(sql`(cast(unixepoch() as int))`),
}, (table) => ({
  userDidIdx: index('idx_calendar_user_did').on(table.userDid),
}));

// Busy time cache from calendar sync
export const busyCache = sqliteTable('busy_cache', {
  id: text('id').primaryKey(),
  userDid: text('user_did').notNull(),
  startTime: integer('start_time').notNull(),
  endTime: integer('end_time').notNull(),
  syncedAt: integer('synced_at').notNull().default(sql`(cast(unixepoch() as int))`),
}, (table) => ({
  userTimeIdx: index('idx_user_time').on(table.userDid, table.startTime, table.endTime),
}));

// Bookings (stored in D1 as broker)
export const bookings = sqliteTable('bookings', {
  id: text('id').primaryKey(),
  hostDid: text('host_did').notNull(),
  bookerDid: text('booker_did').notNull(),
  availabilityId: text('availability_id').notNull(), // from atproto
  startTime: integer('start_time').notNull(),
  endTime: integer('end_time').notNull(),
  status: text('status').notNull(), // pending/confirmed/cancelled/rescheduled
  bookerEmail: text('booker_email'),
  bookerNote: text('booker_note'),
  createdAt: integer('created_at').notNull().default(sql`(cast(unixepoch() as int))`),
  confirmedAt: integer('confirmed_at'),
}, (table) => ({
  hostIdx: index('idx_host').on(table.hostDid, table.startTime),
  bookerIdx: index('idx_booker').on(table.bookerDid, table.createdAt),
}));

// Notifications
export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userDid: text('user_did').notNull(),
  type: text('type').notNull(), // 'booking_request' | 'booking_confirmed' | 'booking_cancelled'
  bookingId: text('booking_id'),
  read: integer('read', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at').notNull().default(sql`(cast(unixepoch() as int))`),
}, (table) => ({
  userUnreadIdx: index('idx_user_unread').on(table.userDid, table.read, table.createdAt),
}));

// User preferences and settings
export const userSettings = sqliteTable('user_settings', {
  userDid: text('user_did').primaryKey(),
  displayName: text('display_name'),
  bio: text('bio'),
  notificationPreferences: text('notification_preferences'), // JSON
  createdAt: integer('created_at').notNull().default(sql`(cast(unixepoch() as int))`),
  updatedAt: integer('updated_at').notNull().default(sql`(cast(unixepoch() as int))`),
});

export type CalendarConnection = typeof calendarConnections.$inferSelect;
export type NewCalendarConnection = typeof calendarConnections.$inferInsert;

export type BusyCache = typeof busyCache.$inferSelect;
export type NewBusyCache = typeof busyCache.$inferInsert;

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;
