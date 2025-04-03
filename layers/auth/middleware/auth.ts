export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, loading, user } = useAuth();

  // Wait for auth to initialize
  if (loading.value) {
    // Could show a loading state here
    return;
  }

  // If user is not authenticated and trying to access a protected route
  if (!loggedIn.value && to.path.startsWith("/dashboard")) {
    // Redirect to login page
    return navigateTo("/auth/login");
  }
});
