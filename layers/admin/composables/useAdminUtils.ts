import { Role } from "../types/role";

export const useAdminUtils = () => {
  /**
   * Checks if a user has administrative privileges (ADMIN or SUPER_ADMIN role)
   * @param role The user's role
   * @returns boolean indicating whether the user has admin access
   */
  const hasAdminAccess = (role?: string | null) => {
    if (!role) return false;
    return role === Role.ADMIN || role === Role.SUPER_ADMIN;
  };

  return {
    hasAdminAccess,
  };
};
