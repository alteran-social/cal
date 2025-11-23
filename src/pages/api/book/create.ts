import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';
import { bookings } from '../../../lib/db/schema';
import { getComputableAvailability } from '../../../lib/availability/engine';
import { calendarConnections } from '../../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateIcs } from '../../../lib/email/ics';
import { sendEmail } from '../../../lib/email/sender';
import { getGoogleConfig } from '../../../lib/config';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const data = await request.json();
    const { hostDid, startTime, endTime, bookerEmail, bookerNote } = data;

    if (!hostDid || !startTime || !endTime || !bookerEmail) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // 1. Verify Availability Again (Double Check)
    // We fetch the latest busy times to ensure no race condition
    let refreshToken = null;
    if (locals.runtime?.env?.DB) {
       const db = getDb(locals.runtime.env);
       const connection = await db.select().from(calendarConnections)
         .where(eq(calendarConnections.userDid, hostDid))
         .get();
       if (connection) refreshToken = connection.refreshToken;
    }

    const config = getGoogleConfig(locals.runtime?.env);

    // Check availability only for this specific slot duration
    const slots = await getComputableAvailability(
        hostDid,
        refreshToken,
        start,
        end,
        (config.clientId && config.clientSecret) ? { clientId: config.clientId, clientSecret: config.clientSecret } : undefined
    );

    // Simplistic check: if any slot in the response matches our exact requested time
    // But since getComputableAvailability returns *all* chunks, we just need to see if our chunk is there.
    // Actually, getComputableAvailability slices by rules.
    // If the returned slots array contains a slot that covers our requested time, we are good.
    const isAvailable = slots.some(s => s.start.getTime() === start.getTime() && s.end.getTime() === end.getTime());

    if (!isAvailable) {
        return new Response(JSON.stringify({ error: 'Slot no longer available' }), { status: 409 });
    }

    // 2. Create Booking in DB
    const bookingId = crypto.randomUUID();

    if (locals.runtime?.env?.DB) {
        const db = getDb(locals.runtime.env);
        await db.insert(bookings).values({
            id: bookingId,
            hostDid,
            bookerDid: 'guest', // For now, we allow guest bookings without auth
            availabilityId: 'default', // Placeholder
            startTime: start.getTime(),
            endTime: end.getTime(),
            status: 'confirmed', // Auto-confirm for now
            bookerEmail,
            bookerNote
        }).run();
    }

    // 3. Generate ICS
    const ics = generateIcs({
        start,
        end,
        summary: 'Meeting with ' + hostDid,
        description: bookerNote,
        organizer: { name: 'Host', email: 'noreply@atproto-cal.com' }, // We don't have host email easily yet
        attendee: { name: 'Guest', email: bookerEmail }
    });

    // 4. Send Email
    await sendEmail(
        bookerEmail,
        'Booking Confirmed',
        `Your meeting is confirmed for ${start.toLocaleString()}.\n\nNotes: ${bookerNote || 'None'}`,
        ics
    );

    return new Response(JSON.stringify({ success: true, bookingId }), { status: 201 });

  } catch (error) {
    console.error('Booking Creation Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
