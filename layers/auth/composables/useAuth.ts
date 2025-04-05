import type { User } from "../types/user";

export const useAuth = () => {
  // State
  const user = useState<User | null>("user", () => null);
  const loading = useState<boolean>("auth-loading", () => true);
  const error = useState<string | null>("auth-error", () => null);

  // Get nuxt-auth-utils session
  const {
    loggedIn,
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

      return { success: true };
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
      const loginResponse = await $fetch<{
        success: boolean;
        error?: string;
        needsVerification?: boolean;
        email?: string;
      }>("/api/auth/login", {
        method: "POST",
        body: {
          email,
          password,
        },
      });

      if (!loginResponse.success) {
        // Pass along any verification info
        if (loginResponse.needsVerification) {
          error.value = loginResponse.error || "Email not verified";
          return {
            success: false,
            error: error.value,
            needsVerification: true,
            email: loginResponse.email,
          };
        }

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

  // Initialize auth state - SIMPLIFIED
  // This function now primarily focuses on loading the core session status.
  // Fetching the full user profile is moved to the plugin.
  const initAuth = async () => {
    // Reset state only if loading is currently false (prevent flicker on HMR?)
    // if (!loading.value) {
    //    user.value = null;
    // }
    loading.value = true;
    try {
      await fetchSession(); // Check/load session cookie status

      // No profile fetch here
      // No explicit success/error return needed as plugin handles profile fetch
    } catch (err: any) {
      console.error("[initAuth - Simplified] Error during fetchSession:", err);
      user.value = null; // Clear user if session check fails
      error.value = err.message || "Failed to initialize session";
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

  // Resend verification email
  const resendVerificationEmail = async (email: string) => {
    try {
      error.value = null;
      loading.value = true;

      // Request verification email resend
      const response = await $fetch<{
        success: boolean;
        error?: string;
        message?: string;
      }>("/api/auth/resend-verification", {
        method: "POST",
        body: { email },
      });

      if (!response.success) {
        throw new Error(
          response.error || "Failed to resend verification email"
        );
      }

      return { success: true, message: response.message };
    } catch (err: any) {
      error.value = err?.message || "Failed to resend verification email";
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };

  return {
    user,
    loading,
    error,
    loggedIn,
    signUp,
    signIn,
    signOut,
    resetPassword,
    completePasswordReset,
    resendVerificationEmail,
    initAuth,
  };
};
