import type { APIRoute } from 'astro';
import { getSession } from '../../../lib/auth/session';
import { createAtProtoClient } from '../../../lib/atproto/client';
import type { TimeSlot } from '../../../lib/atproto/schema';

export const POST: APIRoute = async ({ request, redirect }) => {
  const session = await getSession(request);

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const formData = await request.formData();

    // Extract form data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const duration = parseInt(formData.get('duration') as string);
    const autoAccept = formData.get('autoAccept') as 'all' | 'follows' | 'manual';
    const bufferBefore = parseInt(formData.get('bufferBefore') as string) || 0;
    const bufferAfter = parseInt(formData.get('bufferAfter') as string) || 0;

    // Extract time slots
    const daysOfWeek = formData.getAll('dayOfWeek[]');
    const startTimes = formData.getAll('startTime[]');
    const endTimes = formData.getAll('endTime[]');
    const timezones = formData.getAll('timezone[]');

    const timeSlots: TimeSlot[] = daysOfWeek.map((day, index) => ({
      dayOfWeek: parseInt(day as string) as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      startTime: startTimes[index] as string,
      endTime: endTimes[index] as string,
      timezone: timezones[index] as string,
    }));

    // Create availability on user's PDS
    const client = createAtProtoClient();
    
    const availability = await client.createAvailability(session.did, {
      title,
      description,
      duration,
      bookingRules: {
        autoAccept,
      },
      timeSlots,
      bufferBefore,
      bufferAfter,
    });

    console.log('Created availability:', availability);

    return redirect('/dashboard', 302);
  } catch (error) {
    console.error('Error creating availability:', error);
    return new Response('Failed to create availability', { status: 500 });
  }
};
