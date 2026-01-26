import { format, formatDistanceToNow, formatRelative } from "date-fns";

/**
 * Date formatting utilities
 */

/**
 * Format a date to a readable string
 */
export function formatDate(
  date: Date | string | number,
  formatStr = "PPp"
): string {
  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  return format(dateObj, formatStr);
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Format a date as relative time with more context (e.g., "yesterday at 3:00 PM")
 */
export function formatRelativeDate(date: Date | string | number): string {
  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  return formatRelative(dateObj, new Date());
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string | number): boolean {
  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date | string | number): boolean {
  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  return dateObj < new Date();
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date | string | number): boolean {
  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  return dateObj > new Date();
}
