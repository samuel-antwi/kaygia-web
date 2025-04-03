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

  // --- ADDED DETAILED LOGGING ---
  console.log(
    `[Admin Middleware] Check - Path: ${to.path}, Loading: ${loading.value}, User Exists: ${!!user.value}`
  );

  // If auth is still loading its initial state, let navigation proceed.
  // The page component MUST handle the final check after loading finishes.
  if (loading.value) {
    console.log("[Admin Middleware] Decision: ALLOW (Auth loading)");
    return;
  }

  // If loading is finished, but there's no user object, they are not logged in.
  if (!user.value) {
    // Log right before redirecting
    console.error(
      `[Admin Middleware] Decision: REDIRECT TO LOGIN (Auth loaded but user is null!)`
    );
    return navigateTo(
      "/auth/login?redirect=" + encodeURIComponent(to.fullPath)
    );
  }

  // At this point, loading is false and user.value exists.
  // We STILL defer the ROLE check to the page component.
  console.log(
    `[Admin Middleware] Decision: ALLOW (Auth loaded, user exists) - User: ${user.value.email}`
  );
  return;
});
