export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, loading, user } = useAuth();

  console.log(
    `[Auth Middleware] Running for path: ${to.path}. Loading: ${loading.value}, IsAuth: ${loggedIn.value}`
  );

  // Wait for auth to initialize
  if (loading.value) {
    console.log("[Auth Middleware] Auth loading, exiting middleware.");
    // Could show a loading state here
    return;
  }

  // If user is not authenticated and trying to access a protected route
  if (!loggedIn.value && to.path.startsWith("/dashboard")) {
    console.log(
      "[Auth Middleware] Not authenticated and accessing /dashboard, redirecting to login."
    );
    // Redirect to login page
    return navigateTo("/auth/login");
  }

  console.log("[Auth Middleware] Conditions not met, allowing navigation.");
});
