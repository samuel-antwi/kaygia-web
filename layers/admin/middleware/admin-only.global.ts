// Middleware should check session directly, not rely on potentially unloaded user state
// import { Role } from '@prisma/client'; // Role check moved to page

// Define routes that are part of the admin section
const ADMIN_ROUTE_PREFIX = "/admin";

// Remove Prisma client - middleware shouldn't access DB directly
// const prisma = new PrismaClient();

import { Role } from "@prisma/client"; // Role might not be needed here anymore

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

  return;
});
