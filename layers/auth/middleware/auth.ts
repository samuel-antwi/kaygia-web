export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated, loading, user } = useAuth();

  // Wait for auth to initialize
  if (loading.value) {
    // Could show a loading state here
    return;
  }

  // If user is not authenticated and trying to access a protected route
  if (!isAuthenticated.value && to.path.startsWith("/dashboard")) {
    // Redirect to login page
    return navigateTo("/auth/login");
  }

  // If user is authenticated but email not verified
  if (
    isAuthenticated.value &&
    user.value &&
    !user.value.emailVerified &&
    to.path.startsWith("/dashboard")
  ) {
    // Redirect to email verification page
    return navigateTo("/resend-verification");
  }
});
