export default defineNuxtPlugin(async () => {
  const { initAuth } = useAuth();

  // Initialize auth state when the app starts
  await initAuth();
});
