<script setup lang="ts">
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
} from "lucide-vue-next";

// Define page meta to use auth layout
definePageMeta({
  layout: "auth",
});

// Get the token from the route
const route = useRoute();
const token = route.params.token as string;

// Form state
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const loading = ref(false);
const error = ref("");
const success = ref(false);

// Password validation rules
const passwordRules = [
  { test: (p: string) => p.length >= 8, message: "At least 8 characters" },
  {
    test: (p: string) => /[A-Z]/.test(p),
    message: "At least one uppercase letter",
  },
  {
    test: (p: string) => /[a-z]/.test(p),
    message: "At least one lowercase letter",
  },
  { test: (p: string) => /[0-9]/.test(p), message: "At least one number" },
];

// Password validation status
const validations = computed(() => {
  return passwordRules.map((rule) => ({
    valid: rule.test(password.value),
    message: rule.message,
  }));
});

// Check if password is valid
const isPasswordValid = computed(() => {
  return validations.value.every((v) => v.valid);
});

// Check if passwords match
const passwordsMatch = computed(() => {
  return password.value === confirmPassword.value && password.value !== "";
});

// Get auth composable
const { completePasswordReset } = useAuth();

// Toggle password visibility
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

// Handle reset password submission
const handleResetPassword = async () => {
  try {
    // Reset state
    loading.value = true;
    error.value = "";

    // Validate passwords
    if (!isPasswordValid.value) {
      error.value = "Please ensure your password meets all requirements";
      return;
    }

    if (!passwordsMatch.value) {
      error.value = "Passwords do not match";
      return;
    }

    // Call auth composable to complete password reset
    const result = await completePasswordReset(token, password.value);

    if (!result.success) {
      error.value =
        result.error || "Failed to reset password. Please try again.";
      return;
    }

    // Show success message
    success.value = true;
  } catch (err: any) {
    error.value = err?.message || "Failed to reset password. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Left side with background image or gradient -->
    <div
      class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/80 to-primary-foreground/90 items-center justify-center p-12"
    >
      <div class="max-w-lg text-white">
        <h1 class="text-4xl font-bold mb-6">Create a New Password</h1>
        <p class="text-lg mb-8">
          Choose a strong password that you don't use on other websites to keep
          your account secure.
        </p>
        <div class="flex flex-col space-y-4">
          <div class="flex items-center">
            <div class="rounded-full bg-white/20 p-2 mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span>Use at least 8 characters</span>
          </div>
          <div class="flex items-center">
            <div class="rounded-full bg-white/20 p-2 mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span>Include uppercase and lowercase letters</span>
          </div>
          <div class="flex items-center">
            <div class="rounded-full bg-white/20 p-2 mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span>Include at least one number</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right side with form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
      <div class="w-full max-w-md">
        <div class="mb-10">
          <NuxtLink
            to="/auth/login"
            class="inline-flex items-center text-sm font-medium text-primary hover:underline mb-6"
          >
            <ArrowLeft class="mr-2 h-4 w-4" />
            Back to login
          </NuxtLink>

          <h2 class="text-3xl font-bold mb-2">Create a new password</h2>
          <p class="text-muted-foreground">
            Enter a new password for your account.
          </p>
        </div>

        <!-- Success state -->
        <div v-if="success" class="space-y-6">
          <div
            class="rounded-lg bg-green-50 dark:bg-green-900/20 p-6 border border-green-200 dark:border-green-800"
          >
            <div class="flex items-start">
              <CheckCircle
                class="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-3"
              />
              <div>
                <h3 class="font-medium text-green-800 dark:text-green-300">
                  Password Reset Successful
                </h3>
                <p class="text-green-700 dark:text-green-400 text-sm mt-1">
                  Your password has been reset successfully. You can now log in
                  with your new password.
                </p>
              </div>
            </div>
          </div>
          <Button as-child class="w-full">
            <NuxtLink to="/auth/login" class="w-full flex justify-center">
              Log in with your new password
            </NuxtLink>
          </Button>
        </div>

        <!-- Reset password form -->
        <form @submit.prevent="handleResetPassword" class="space-y-6" v-else>
          <!-- Error alert -->
          <Alert v-if="error" variant="destructive" class="mb-6">
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {{ error }}
            </AlertDescription>
          </Alert>

          <!-- Password field -->
          <div class="space-y-2">
            <Label for="password" class="text-sm font-medium"
              >New password</Label
            >
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none"
              >
                <Lock class="h-5 w-5 text-muted-foreground" />
              </div>
              <div class="absolute inset-y-0 right-0 flex items-center pr-4">
                <button
                  type="button"
                  @click="togglePasswordVisibility"
                  class="text-muted-foreground hover:text-foreground"
                >
                  <Eye v-if="!showPassword" class="h-5 w-5" />
                  <EyeOff v-else class="h-5 w-5" />
                </button>
              </div>
              <Input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="pl-12 pr-12 h-12 text-base"
                required
              />
            </div>

            <!-- Password validation -->
            <div class="mt-2 space-y-1">
              <div
                v-for="(validation, index) in validations"
                :key="index"
                class="flex items-center text-xs"
                :class="
                  validation.valid
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-muted-foreground'
                "
              >
                <CheckCircle v-if="validation.valid" class="h-3 w-3 mr-1.5" />
                <div
                  v-else
                  class="h-3 w-3 rounded-full border border-muted-foreground mr-1.5"
                ></div>
                {{ validation.message }}
              </div>
            </div>
          </div>

          <!-- Confirm password field -->
          <div class="space-y-2">
            <Label for="confirmPassword" class="text-sm font-medium"
              >Confirm password</Label
            >
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none"
              >
                <Lock class="h-5 w-5 text-muted-foreground" />
              </div>
              <div class="absolute inset-y-0 right-0 flex items-center pr-4">
                <button
                  type="button"
                  @click="togglePasswordVisibility"
                  class="text-muted-foreground hover:text-foreground"
                >
                  <Eye v-if="!showPassword" class="h-5 w-5" />
                  <EyeOff v-else class="h-5 w-5" />
                </button>
              </div>
              <Input
                id="confirmPassword"
                v-model="confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                class="pl-12 pr-12 h-12 text-base"
                required
              />
            </div>
            <!-- Passwords match indicator -->
            <div class="flex items-center text-xs mt-1" v-if="confirmPassword">
              <CheckCircle
                v-if="passwordsMatch"
                class="h-3 w-3 mr-1.5 text-green-600 dark:text-green-400"
              />
              <AlertCircle
                v-else
                class="h-3 w-3 mr-1.5 text-red-600 dark:text-red-400"
              />
              <span
                :class="
                  passwordsMatch
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                "
              >
                {{
                  passwordsMatch ? "Passwords match" : "Passwords do not match"
                }}
              </span>
            </div>
          </div>

          <!-- Submit button -->
          <Button
            type="submit"
            class="w-full h-12 text-base font-medium"
            :disabled="loading || !isPasswordValid || !passwordsMatch"
          >
            <span v-if="loading" class="flex items-center justify-center">
              <svg
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Resetting Password...
            </span>
            <span v-else>Reset Password</span>
          </Button>
        </form>
      </div>
    </div>
  </div>
</template>
