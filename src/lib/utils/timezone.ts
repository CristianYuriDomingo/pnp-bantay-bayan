//lib/utils/timezone.ts
import { 
  startOfDay, 
  addDays, 
  differenceInHours,
  differenceInDays,
  format,
  parseISO
} from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

/**
 * Get the start of the current week (Monday 00:00) in user's timezone
 * @param timezone - User's timezone (default: 'Asia/Manila')
 * @returns Date object representing Monday 00:00 in UTC
 * 
 * @example
 * const weekStart = getWeekStart('Asia/Manila');
 * // Returns: 2024-11-11T00:00:00.000Z (if today is Nov 15, 2024)
 */
export function getWeekStart(timezone: string = 'Asia/Manila'): Date {
  const now = new Date();
  const zonedNow = toZonedTime(now, timezone);
  
  const dayOfWeek = zonedNow.getDay();
  // Sunday = 0, Monday = 1, Tuesday = 2, ..., Saturday = 6
  // Calculate days to subtract to get to Monday
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = addDays(zonedNow, daysToMonday);
  const mondayStart = startOfDay(monday);
  
  // Convert back to UTC for storage
  return fromZonedTime(mondayStart, timezone);
}

/**
 * Get current day of week in user's timezone
 * @param timezone - User's timezone (default: 'Asia/Manila')
 * @returns Day name in lowercase: "monday", "tuesday", etc.
 * 
 * @example
 * const day = getCurrentDayOfWeek('Asia/Manila');
 * // Returns: "friday" (if today is Friday)
 */
export function getCurrentDayOfWeek(timezone: string = 'Asia/Manila'): string {
  const now = new Date();
  const zonedNow = toZonedTime(now, timezone);
  const dayIndex = zonedNow.getDay();
  
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[dayIndex];
}

/**
 * Check if two dates are in the same week
 * @param date1 - First date to compare
 * @param date2 - Second date to compare
 * @param timezone - User's timezone (default: 'Asia/Manila')
 * @returns true if both dates are in the same week (Monday-Sunday)
 * 
 * @example
 * const date1 = new Date('2024-11-11'); // Monday
 * const date2 = new Date('2024-11-15'); // Friday
 * const same = isSameWeek(date1, date2); // Returns: true
 */
export function isSameWeek(date1: Date, date2: Date, timezone: string = 'Asia/Manila'): boolean {
  const week1Start = getWeekStartForDate(date1, timezone);
  const week2Start = getWeekStartForDate(date2, timezone);
  
  return week1Start.getTime() === week2Start.getTime();
}

/**
 * Get week start (Monday 00:00) for a specific date
 * @param date - Date to find week start for
 * @param timezone - User's timezone (default: 'Asia/Manila')
 * @returns Date object representing Monday 00:00 in UTC
 * 
 * @example
 * const someDate = new Date('2024-11-15'); // Friday
 * const weekStart = getWeekStartForDate(someDate);
 * // Returns: 2024-11-11T00:00:00.000Z (Monday of that week)
 */
export function getWeekStartForDate(date: Date, timezone: string = 'Asia/Manila'): Date {
  const zonedDate = toZonedTime(date, timezone);
  const dayOfWeek = zonedDate.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = addDays(zonedDate, daysToMonday);
  const mondayStart = startOfDay(monday);
  
  return fromZonedTime(mondayStart, timezone);
}

/**
 * Check if it's currently Sunday in user's timezone
 * @param timezone - User's timezone (default: 'Asia/Manila')
 * @returns true if current day is Sunday
 * 
 * @example
 * const isItSunday = isSunday('Asia/Manila');
 * // Returns: true (if today is Sunday in Manila timezone)
 */
export function isSunday(timezone: string = 'Asia/Manila'): boolean {
  const now = new Date();
  const zonedNow = toZonedTime(now, timezone);
  return zonedNow.getDay() === 0;
}

/**
 * Check if it's currently Saturday in user's timezone
 * @param timezone - User's timezone (default: 'Asia/Manila')
 * @returns true if current day is Saturday
 */
export function isSaturday(timezone: string = 'Asia/Manila'): boolean {
  const now = new Date();
  const zonedNow = toZonedTime(now, timezone);
  return zonedNow.getDay() === 6;
}

/**
 * Check if it's currently weekend (Saturday or Sunday)
 * @param timezone - User's timezone (default: 'Asia/Manila')
 * @returns true if current day is Saturday or Sunday
 */
export function isWeekend(timezone: string = 'Asia/Manila'): boolean {
  return isSaturday(timezone) || isSunday(timezone);
}

/**
 * Calculate hours between two dates
 * @param date1 - Start date
 * @param date2 - End date
 * @returns Number of hours between dates
 * 
 * @example
 * const hours = getHoursBetween(new Date('2024-11-15T10:00'), new Date('2024-11-15T14:00'));
 * // Returns: 4
 */
export function getHoursBetween(date1: Date, date2: Date): number {
  return differenceInHours(date2, date1);
}

/**
 * Calculate days between two dates
 * @param date1 - Start date
 * @param date2 - End date
 * @returns Number of days between dates
 * 
 * @example
 * const days = getDaysBetween(new Date('2024-11-11'), new Date('2024-11-15'));
 * // Returns: 4
 */
export function getDaysBetween(date1: Date, date2: Date): number {
  return differenceInDays(date2, date1);
}

/**
 * Get array of available quest days based on current day
 * UPDATED: Only returns current day for weekdays, empty for weekends
 * - Monday: ["monday"]
 * - Tuesday: ["tuesday"]
 * - Wednesday: ["wednesday"]
 * - Thursday: ["thursday"]
 * - Friday: ["friday"]
 * - Saturday/Sunday: [] (no quests naturally available - must use duty pass)
 * 
 * @param timezone - User's timezone (default: 'Asia/Manila')
 * @returns Array of available quest day names
 * 
 * @example
 * // If today is Wednesday
 * const available = getAvailableQuestDays();
 * // Returns: ["wednesday"]
 * 
 * // If today is Sunday
 * const available = getAvailableQuestDays();
 * // Returns: []
 */
export function getAvailableQuestDays(timezone: string = 'Asia/Manila'): string[] {
  const currentDay = getCurrentDayOfWeek(timezone);
  const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  
  // Weekend: NO quests naturally available (must use duty pass for any incomplete quest)
  if (currentDay === 'saturday' || currentDay === 'sunday') {
    return [];
  }
  
  const currentIndex = allDays.indexOf(currentDay);
  
  // Weekday: return only current day
  return currentIndex >= 0 ? [allDays[currentIndex]] : [];
}

/**
 * Check if a specific quest day is available now
 * @param questDay - Quest day to check ("monday", "tuesday", etc.)
 * @param timezone - User's timezone (default: 'Asia/Manila')
 * @returns true if the quest day is available
 * 
 * @example
 * // If today is Wednesday
 * isQuestDayAvailable('monday'); // Returns: false
 * isQuestDayAvailable('wednesday'); // Returns: true
 * isQuestDayAvailable('friday'); // Returns: false
 * 
 * // If today is Sunday
 * isQuestDayAvailable('monday'); // Returns: false (must use duty pass)
 */
export function isQuestDayAvailable(questDay: string, timezone: string = 'Asia/Manila'): boolean {
  const availableDays = getAvailableQuestDays(timezone);
  return availableDays.includes(questDay.toLowerCase());
}

/**
 * Format date for display in user's timezone
 * @param date - Date to format
 * @param timezone - User's timezone (default: 'Asia/Manila')
 * @param formatStr - Format string (default: 'PPP' = Nov 15, 2024)
 * @returns Formatted date string
 * 
 * @example
 * const formatted = formatInTimezone(new Date(), 'Asia/Manila', 'PPP');
 * // Returns: "November 15, 2024"
 * 
 * const withTime = formatInTimezone(new Date(), 'Asia/Manila', 'PPP p');
 * // Returns: "November 15, 2024 2:30 PM"
 */
export function formatInTimezone(
  date: Date, 
  timezone: string = 'Asia/Manila', 
  formatStr: string = 'PPP'
): string {
  const zonedDate = toZonedTime(date, timezone);
  return format(zonedDate, formatStr);
}

/**
 * Get quest day from date
 * @param date - Date to check
 * @param timezone - User's timezone (default: 'Asia/Manila')
 * @returns Quest day name or null if weekend
 * 
 * @example
 * const questDay = getQuestDayFromDate(new Date('2024-11-11')); // Monday
 * // Returns: "monday"
 */
export function getQuestDayFromDate(date: Date, timezone: string = 'Asia/Manila'): string | null {
  const zonedDate = toZonedTime(date, timezone);
  const dayIndex = zonedDate.getDay();
  
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = days[dayIndex];
  
  // Return null for weekends
  if (dayName === 'saturday' || dayName === 'sunday') {
    return null;
  }
  
  return dayName;
}

/**
 * Check if a new week has started since last activity
 * @param lastActivityDate - Last time user completed a quest
 * @param timezone - User's timezone (default: 'Asia/Manila')
 * @returns true if we're in a new week
 * 
 * @example
 * const lastActivity = new Date('2024-11-08'); // Last Friday
 * const hasNewWeek = hasNewWeekStarted(lastActivity);
 * // Returns: true (if today is Nov 11+ - new week started)
 */
export function hasNewWeekStarted(lastActivityDate: Date | null, timezone: string = 'Asia/Manila'): boolean {
  if (!lastActivityDate) return true;
  
  const now = new Date();
  return !isSameWeek(lastActivityDate, now, timezone);
}

/**
 * Get days until next Monday
 * @param timezone - User's timezone (default: 'Asia/Manila')
 * @returns Number of days until next Monday
 * 
 * @example
 * // If today is Friday
 * const daysLeft = getDaysUntilNextMonday();
 * // Returns: 3 (Sat, Sun, Mon)
 */
export function getDaysUntilNextMonday(timezone: string = 'Asia/Manila'): number {
  const now = new Date();
  const zonedNow = toZonedTime(now, timezone);
  const dayOfWeek = zonedNow.getDay();
  
  // Calculate days until Monday
  // Sunday = 0 -> 1 day
  // Monday = 1 -> 7 days
  // Tuesday = 2 -> 6 days
  // ...
  // Saturday = 6 -> 2 days
  
  if (dayOfWeek === 0) return 1; // Sunday -> Monday
  return 8 - dayOfWeek; // Mon=7, Tue=6, Wed=5, Thu=4, Fri=3, Sat=2
}