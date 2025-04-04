import type { User } from "~/layers/auth/types/user"; // Adjust path as needed
import { Role } from "~/layers/admin/types/role"; // Import local Role enum
import { useUserState } from "~/composables/useUserState";

// Define the expected success response shape explicitly
interface ProfileResponseSuccess {
  success: true;
  user: User;
}

// Define the expected failure response shape (adjust if needed based on API)
interface ProfileResponseError {
  success: false;
  error: string;
  user?: undefined; // Explicitly undefined on error
}

type ProfileResponse = ProfileResponseSuccess | ProfileResponseError;

export default defineNuxtPlugin(async (nuxtApp) => {
  const { initAuth, loading, loggedIn } = useAuth();
  const { user: userState } = useUserState(); // Use the new composable

  // 1. Initialize the core session status
  await initAuth(); // This now just calls fetchSession and sets loading

  // 2. If session is valid, fetch the full user profile HERE
  if (loggedIn.value) {
    try {
      // useFetch works correctly inside plugins
      const { data: profileDataRef, error: profileError } =
        await useFetch<ProfileResponse>("/api/user/profile", {
          key: "user-profile-" + Date.now(), // Avoid caching issues during dev/test
          headers: useRequestHeaders(["cookie"]), // Ensure cookie is forwarded server-side
        });

      const profileData = profileDataRef.value; // Get the actual value

      if (profileError.value) {
        console.error(
          "[Auth Plugin] Error fetching profile:",
          profileError.value
        );
        userState.value = null; // Clear state on error
      } else if (profileData && profileData.success === true) {
        userState.value = profileData.user; // Now safe to access .user
      } else {
        console.error(
          "[Auth Plugin] Profile fetch failed or invalid response:",
          profileData
        );
        userState.value = null;
      }
    } catch (error) {
      console.error("[Auth Plugin] Uncaught error fetching profile:", error);
      userState.value = null;
    }
  } else {
    userState.value = null; // Ensure user state is null if not logged in
  }
});
