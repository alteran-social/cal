import { getBusyTimes } from '../google/calendar';
import type { TimeSlot, Availability } from '../atproto/schema';

// Helper to check if a date string is valid
function isValidDate(d: any) {
  return d instanceof Date && !isNaN(d.getTime());
}

interface DateRange {
  start: Date;
  end: Date;
}

// 1. Fetch Rules (Mocked for now)
export async function getAvailabilityRules(did: string): Promise<Availability[]> {
  // In a real app, we fetch from ATProto
  // For now, return a default rule: Mon-Fri, 9am - 5pm
  return [{
    id: 'default',
    title: 'General Availability',
    duration: 30, // 30 min slots
    bookingRules: { autoAccept: 'all' },
    timeSlots: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', timezone: 'UTC' }, // Mon
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', timezone: 'UTC' }, // Tue
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', timezone: 'UTC' }, // Wed
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', timezone: 'UTC' }, // Thu
      { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', timezone: 'UTC' }, // Fri
    ],
    createdAt: new Date().toISOString()
  }];
}

// 2. Generate Potential Slots from Rules
function generatePotentialSlots(rules: Availability[], start: Date, end: Date): DateRange[] {
  const potentialSlots: DateRange[] = [];
  const current = new Date(start);

  // Normalize start/end to loop day by day
  // We'll iterate day by day until we reach end

  while (current < end) {
    const dayOfWeek = current.getDay(); // 0=Sun, 1=Mon...

    // Find rules that match this day
    for (const rule of rules) {
      const matchingSlots = rule.timeSlots.filter(s => s.dayOfWeek === dayOfWeek);

      for (const slot of matchingSlots) {
        // Parse "HH:MM"
        const [startHour, startMinute] = slot.startTime.split(':').map(Number);
        const [endHour, endMinute] = slot.endTime.split(':').map(Number);

        // Construct slot start/end for this specific date
        // Note: Timezone handling is tricky. For MVP, we assume UTC or Server Local.
        // If the rule says UTC, and we are running in UTC, it's fine.
        // "slot.timezone" should ideally be respected.

        const slotStart = new Date(current);
        slotStart.setUTCHours(startHour, startMinute, 0, 0);

        const slotEnd = new Date(current);
        slotEnd.setUTCHours(endHour, endMinute, 0, 0);

        // Break into duration chunks
        const durationMs = rule.duration * 60 * 1000;
        let chunkStart = slotStart.getTime();

        while (chunkStart + durationMs <= slotEnd.getTime()) {
           const chunkEnd = chunkStart + durationMs;

           // Check if this chunk is within the requested window
           if (chunkStart >= start.getTime() && chunkEnd <= end.getTime()) {
             potentialSlots.push({
               start: new Date(chunkStart),
               end: new Date(chunkEnd)
             });
           }

           chunkStart += durationMs;
        }
      }
    }

    // Next day
    current.setDate(current.getDate() + 1);
    current.setHours(0,0,0,0); // reset to start of day
  }

  return potentialSlots;
}

// 3. Subtract Busy Times
function filterBusySlots(slots: DateRange[], busyTimes: { start: Date, end: Date }[]): DateRange[] {
  return slots.filter(slot => {
    // Check if slot overlaps with ANY busy time
    const isBusy = busyTimes.some(busy => {
      return (slot.start < busy.end && slot.end > busy.start);
    });
    return !isBusy;
  });
}

// Main Engine Function
export async function getComputableAvailability(
  userDid: string,
  refreshToken: string | null, // Google Calendar Token
  startTime: Date,
  endTime: Date,
  config?: { clientId: string; clientSecret: string }
) {
  // 1. Get Rules
  const rules = await getAvailabilityRules(userDid);

  // 2. Generate Potential Slots
  let slots = generatePotentialSlots(rules, startTime, endTime);

  // 3. Fetch Busy Times (if connected and config provided)
  if (refreshToken && config) {
    const busy = await getBusyTimes(refreshToken, startTime.toISOString(), endTime.toISOString(), config);
    slots = filterBusySlots(slots, busy);
  }

  return slots;
}
