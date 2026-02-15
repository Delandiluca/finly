/**
 * Authentication helpers using Clerk
 *
 * Provides utilities for:
 * - Getting current user
 * - Getting organization context
 * - Session management
 */

import { auth as clerkAuth, currentUser } from '@clerk/nextjs/server';

/**
 * Get current authenticated user and organization
 * @throws Error if not authenticated
 */
export async function getAuthContext() {
  const { userId, orgId } = await clerkAuth();

  if (!userId) {
    throw new Error('Unauthorized: No user logged in');
  }

  if (!orgId) {
    throw new Error('No organization selected');
  }

  return {
    userId,
    orgId,
  };
}

/**
 * Get current user details
 */
export async function getCurrentUser() {
  const user = await currentUser();

  if (!user) {
    throw new Error('Unauthorized: No user logged in');
  }

  return user;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { userId } = await clerkAuth();
  return !!userId;
}

/**
 * Get organization ID (may be null if no org selected)
 */
export async function getOrganizationId(): Promise<string | null> {
  const { orgId } = await clerkAuth();
  return orgId;
}
