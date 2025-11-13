/**
 * Utility functions for date and time operations
 */

/**
 * Format a date to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format time to HH:MM
 */
export function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

/**
 * Parse time string (HH:MM) to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Get the day of week name
 */
export function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
}

/**
 * Generate time slots for a given day
 * @param startTime Start time in HH:MM format
 * @param endTime End time in HH:MM format
 * @param duration Duration in minutes
 * @param bufferBefore Buffer before each slot in minutes
 * @param bufferAfter Buffer after each slot in minutes
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  duration: number,
  bufferBefore: number = 0,
  bufferAfter: number = 0
): string[] {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const slotDuration = duration + bufferBefore + bufferAfter;
  
  const slots: string[] = [];
  let currentMinutes = startMinutes + bufferBefore;
  
  while (currentMinutes + duration <= endMinutes) {
    slots.push(minutesToTime(currentMinutes));
    currentMinutes += slotDuration;
  }
  
  return slots;
}

/**
 * Check if two time ranges overlap
 */
export function timeRangesOverlap(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * Get the start of day timestamp
 */
export function getStartOfDay(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Get the end of day timestamp
 */
export function getEndOfDay(date: Date): number {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

/**
 * Generate a random ID
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}
