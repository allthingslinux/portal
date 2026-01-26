/**
 * String manipulation utilities
 */

const WHITESPACE_REGEX = /\s+/;

/**
 * Truncate a string to a maximum length with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return `${str.slice(0, maxLength - 3)}...`;
}

/**
 * Convert a string to a URL-friendly slug
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert a string to title case
 */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}

/**
 * Remove HTML tags from a string
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Check if a string is empty or whitespace
 */
export function isEmpty(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string, maxInitials = 2): string {
  const words = name.trim().split(WHITESPACE_REGEX);
  if (words.length === 0) {
    return "";
  }

  if (words.length === 1) {
    const firstWord = words[0];
    if (!firstWord) {
      return "";
    }
    return firstWord.slice(0, maxInitials).toUpperCase();
  }

  return words
    .slice(0, maxInitials)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}
