import 'server-only';

import { revalidatePath } from 'next/cache';

/**
 * Revalidation helpers for account-related paths.
 * Centralizes common revalidation patterns to reduce duplication.
 */

/**
 * Revalidate the account settings page
 */
export function revalidateAccountSettings() {
  revalidatePath('/home/settings', 'page');
}

/**
 * Revalidate the team account settings page
 */
export function revalidateTeamAccountSettings() {
  revalidatePath('/home/[account]/settings', 'page');
}

/**
 * Revalidate the account members page
 */
export function revalidateAccountMembers() {
  revalidatePath('/home/[account]/members', 'page');
}

/**
 * Revalidate all account-related pages (layout-level)
 */
export function revalidateAccountLayout() {
  revalidatePath('/home/[account]', 'layout');
}

/**
 * Revalidate the user home layout
 */
export function revalidateUserHomeLayout() {
  revalidatePath('/home', 'layout');
}

