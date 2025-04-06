import { Role } from "../types/role";

/**
 * Checks if a user has administrative privileges (ADMIN or SUPER_ADMIN role)
 * @param role The user's role
 * @returns boolean indicating whether the user has admin access
 */
export function hasAdminAccess(role?: string | null): boolean {
  if (!role) return false;
  return role === Role.ADMIN || role === Role.SUPER_ADMIN;
}
