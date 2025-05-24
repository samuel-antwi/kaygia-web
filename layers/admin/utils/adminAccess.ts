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

/**
 * Checks if a user has super admin privileges
 * @param role The user's role
 * @returns boolean indicating whether the user is a super admin
 */
export function isSuperAdmin(role?: string | null): boolean {
  if (!role) return false;
  return role === Role.SUPER_ADMIN;
}

/**
 * Checks if a user can edit other users (SUPER_ADMIN only)
 * @param role The user's role
 * @returns boolean indicating whether the user can edit other users
 */
export function canEditUsers(role?: string | null): boolean {
  return isSuperAdmin(role);
}

/**
 * Checks if a user can delete users (SUPER_ADMIN only)
 * @param role The user's role
 * @returns boolean indicating whether the user can delete users
 */
export function canDeleteUsers(role?: string | null): boolean {
  return isSuperAdmin(role);
}

/**
 * Checks if a user can manage projects (ADMIN or SUPER_ADMIN)
 * @param role The user's role
 * @returns boolean indicating whether the user can manage projects
 */
export function canManageProjects(role?: string | null): boolean {
  return hasAdminAccess(role);
}

/**
 * Checks if a user can view admin dashboard (ADMIN or SUPER_ADMIN)
 * @param role The user's role
 * @returns boolean indicating whether the user can view admin dashboard
 */
export function canViewAdminDashboard(role?: string | null): boolean {
  return hasAdminAccess(role);
}

/**
 * Checks if a user can manage system settings (SUPER_ADMIN only)
 * @param role The user's role
 * @returns boolean indicating whether the user can manage system settings
 */
export function canManageSystemSettings(role?: string | null): boolean {
  return isSuperAdmin(role);
}
