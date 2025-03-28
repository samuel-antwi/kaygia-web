import type { User } from "../types/user";

export const useAuth = () => {
  // State
  const user = useState<User | null>("user", () => null);
  const loading = useState<boolean>("auth-loading", () => true);
  const error = useState<string | null>("auth-error", () => null);

  // Get nuxt-auth-utils session
  const {
    loggedIn,
    user: sessionUser,
    fetch: fetchSession,
    clear: clearSession,
  } = useUserSession();

  // Sign up with email and password
  const signUp = async (
    email: string,
    password: string,
    metadata: Record<string, any> = {}
  ) => {
    try {
      error.value = null;
      loading.value = true;

      // Register user using nuxt-auth-utils
      const registerResponse = await $fetch<{
        success: boolean;
        error?: string;
      }>("/api/auth/register", {
        method: "POST",
        body: {
          email,
          password,
          name: metadata.name,
          company: metadata.company,
        },
      });

      if (!registerResponse.success) {
        throw new Error(registerResponse.error || "Failed to sign up");
      }

      // After registration, sign in
      return await signIn(email, password);
    } catch (err: any) {
      error.value = err?.message || "Failed to sign up";
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      error.value = null;
      loading.value = true;

      // Sign in using nuxt-auth-utils
      const loginResponse = await $fetch<{ success: boolean; error?: string }>(
        "/api/auth/login",
        {
          method: "POST",
          body: {
            email,
            password,
          },
        }
      );

      if (!loginResponse.success) {
        throw new Error(loginResponse.error || "Failed to sign in");
      }

      // Get user data after login
      await initAuth();

      return { success: true };
    } catch (err: any) {
      error.value = err?.message || "Failed to sign in";
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      error.value = null;

      // Sign out using nuxt-auth-utils
      await $fetch("/api/auth/logout", {
        method: "POST",
      });

      await clearSession();
      user.value = null;

      return { success: true };
    } catch (err: any) {
      error.value = err?.message || "Failed to sign out";
      return { success: false, error: error.value };
    }
  };

  // Check if user is authenticated
  const isAuthenticated = computed(() => loggedIn.value);

  // Initialize auth state - would be called from a plugin
  const initAuth = async () => {
    try {
      loading.value = true;

      // Fetch the session from nuxt-auth-utils
      await fetchSession();

      if (loggedIn.value) {
        // Fetch the full user data from the database using the email
        const response = await $fetch<{
          success: boolean;
          user: User;
          error?: string;
        }>(`/api/user/profile`);

        if (response.success && response.user) {
          user.value = response.user;
        } else {
          console.error("Failed to get user profile:", response.error);
          user.value = null;
        }
      } else {
        user.value = null;
      }

      return { success: true };
    } catch (err: any) {
      error.value = err?.message || "Failed to initialize auth";
      user.value = null;
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };

  // Reset password (request reset)
  const resetPassword = async (email: string) => {
    try {
      error.value = null;
      loading.value = true;

      // Request password reset
      const resetResponse = await $fetch<{ success: boolean; error?: string }>(
        "/api/auth/reset-password",
        {
          method: "POST",
          body: { email },
        }
      );

      if (!resetResponse.success) {
        throw new Error(resetResponse.error || "Failed to reset password");
      }

      return { success: true };
    } catch (err: any) {
      error.value = err?.message || "Failed to reset password";
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };

  // Complete password reset with token
  const completePasswordReset = async (token: string, password: string) => {
    try {
      error.value = null;
      loading.value = true;

      // Complete the password reset
      const response = await $fetch<{
        success: boolean;
        error?: string;
        message?: string;
      }>("/api/auth/complete-reset", {
        method: "POST",
        body: { token, password },
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to set new password");
      }

      return { success: true, message: response.message };
    } catch (err: any) {
      error.value = err?.message || "Failed to set new password";
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    completePasswordReset,
    isAuthenticated,
    initAuth,
  };
};
