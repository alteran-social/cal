export function generateIcs(event: {
  start: Date;
  end: Date;
  summary: string;
  description?: string;
  location?: string;
  organizer?: { name: string; email: string };
  attendee?: { name: string; email: string };
}): string {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const now = formatDate(new Date());
  const start = formatDate(event.start);
  const end = formatDate(event.end);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//atproto-cal//NONSGML v1.0//EN',
    'METHOD:REQUEST', // Important for email clients to treat it as an invite
    'BEGIN:VEVENT',
    `UID:${crypto.randomUUID()}`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.summary}`,
    event.description ? `DESCRIPTION:${event.description}` : '',
    event.location ? `LOCATION:${event.location}` : '',
    event.organizer ? `ORGANIZER;CN=${event.organizer.name}:mailto:${event.organizer.email}` : '',
    event.attendee ? `ATTENDEE;RSVP=TRUE;CN=${event.attendee.name}:mailto:${event.attendee.email}` : '',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  return lines.filter(l => l).join('\r\n');
}
