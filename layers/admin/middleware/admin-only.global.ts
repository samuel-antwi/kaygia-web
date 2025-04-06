// Define routes that are part of the admin section
const ADMIN_ROUTE_PREFIX = "/admin";

import { Role } from "../types/role"; // Import local Role enum
import { hasAdminAccess } from "../utils/adminAccess";

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only apply this middleware to routes starting with the admin prefix
  if (!to.path.startsWith(ADMIN_ROUTE_PREFIX)) {
    return; // Not an admin route, allow access
  }

  const { user, loading } = useAuth(); // Use the main auth composable

  // If auth is still loading its initial state, let navigation proceed.
  // The page component MUST handle the final check after loading finishes.
  if (loading.value) {
    return;
  }

  // If loading is finished, but there's no user object, they are not logged in.
  if (!user.value) {
    return navigateTo(
      "/auth/login?redirect=" + encodeURIComponent(to.fullPath)
    );
  }

  // Check if user has admin or super admin role
  if (!hasAdminAccess(user.value.role)) {
    return navigateTo("/dashboard?error=unauthorized");
  }

  return;
});
