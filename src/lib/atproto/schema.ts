/**
 * atproto Schema Definition for Availability
 * 
 * Collection: slot.calendar.alteran.social
 * 
 * This represents a user's available time slots that others can book.
 */

export interface TimeSlot {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday
  startTime: string; // "09:00" format
  endTime: string;   // "17:00" format
  timezone: string;  // IANA timezone string, e.g., "America/New_York"
}

export interface BookingRules {
  autoAccept: 'all' | 'follows' | 'manual';
}

export interface Availability {
  id: string;
  title: string;
  duration: number; // minutes
  description?: string;
  bookingRules: BookingRules;
  timeSlots: TimeSlot[];
  bufferBefore?: number; // minutes
  bufferAfter?: number;  // minutes
  createdAt: string; // ISO 8601 timestamp
}

/**
 * Lexicon definition for the availability record
 * This would be used to create the actual lexicon file for atproto
 */
export const availabilityLexicon = {
  lexicon: 1,
  id: 'slot.calendar.alteran.social',
  defs: {
    main: {
      type: 'record',
      description: 'A time slot availability record for scheduling',
      key: 'tid',
      record: {
        type: 'object',
        required: ['title', 'duration', 'bookingRules', 'timeSlots', 'createdAt'],
        properties: {
          title: {
            type: 'string',
            maxLength: 200,
          },
          duration: {
            type: 'integer',
            minimum: 1,
          },
          description: {
            type: 'string',
            maxLength: 2000,
          },
          bookingRules: {
            type: 'object',
            required: ['autoAccept'],
            properties: {
              autoAccept: {
                type: 'string',
                enum: ['all', 'follows', 'manual'],
              },
            },
          },
          timeSlots: {
            type: 'array',
            items: {
              type: 'object',
              required: ['dayOfWeek', 'startTime', 'endTime', 'timezone'],
              properties: {
                dayOfWeek: {
                  type: 'integer',
                  minimum: 0,
                  maximum: 6,
                },
                startTime: {
                  type: 'string',
                  format: 'time',
                },
                endTime: {
                  type: 'string',
                  format: 'time',
                },
                timezone: {
                  type: 'string',
                },
              },
            },
          },
          bufferBefore: {
            type: 'integer',
            minimum: 0,
          },
          bufferAfter: {
            type: 'integer',
            minimum: 0,
          },
          createdAt: {
            type: 'string',
            format: 'datetime',
          },
        },
      },
    },
  },
};
