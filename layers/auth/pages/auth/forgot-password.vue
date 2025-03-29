<script setup lang="ts">
import { Mail, AlertCircle, ArrowLeft } from "lucide-vue-next";

// Define page meta to use auth layout
definePageMeta({
  layout: "auth",
});

// Form state
const email = ref("");
const loading = ref(false);
const error = ref("");
const success = ref(false);

// Get auth composable
const { resetPassword } = useAuth();

// Handle reset password submission
const handleResetPassword = async () => {
  try {
    loading.value = true;
    error.value = "";
    success.value = false;

    // Basic validation
    if (!email.value) {
      error.value = "Please enter your email address";
      return;
    }

    // Call our password reset API
    const result = await resetPassword(email.value);

    if (!result.success) {
      error.value = result.error || "Password reset failed. Please try again.";
      return;
    }

    // Show success message
    success.value = true;
  } catch (err: any) {
    error.value = err?.message || "Password reset failed. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="flex min-h-screen bg-background">
    <!-- Left side with background image and glass effect -->
    <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      <div
        class="absolute inset-0 bg-gradient-to-br from-primary to-primary-foreground/90"
      ></div>
      <div
        class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064')] bg-cover bg-center opacity-20 mix-blend-overlay dark:opacity-10"
      ></div>
      <div class="absolute inset-0 backdrop-blur-sm"></div>

      <div
        class="relative z-10 flex flex-col justify-center px-12 w-full max-w-2xl mx-auto"
      >
        <div class="mb-8">
          <div
            class="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-6 w-6 text-white"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <h1 class="text-5xl font-bold mb-4 text-white">
            Forgot Your Password?
          </h1>
          <p class="text-xl text-white/80 leading-relaxed">
            Don't worry, it happens to the best of us. We'll help you get back
            into your account quickly and securely.
          </p>
        </div>

        <div class="space-y-8 mt-8">
          <div class="flex items-start space-x-4">
            <div
              class="rounded-full bg-white/10 backdrop-blur-md p-2 mt-1 flex-shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-white"
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
            <div>
              <h3 class="text-white font-medium text-lg">Enter Your Email</h3>
              <p class="text-white/70">
                Provide the email address you used to register
              </p>
            </div>
          </div>

          <div class="flex items-start space-x-4">
            <div
              class="rounded-full bg-white/10 backdrop-blur-md p-2 mt-1 flex-shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-white"
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
            <div>
              <h3 class="text-white font-medium text-lg">Check Your Inbox</h3>
              <p class="text-white/70">
                Check your email for the password reset link
              </p>
            </div>
          </div>

          <div class="flex items-start space-x-4">
            <div
              class="rounded-full bg-white/10 backdrop-blur-md p-2 mt-1 flex-shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-white"
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
            <div>
              <h3 class="text-white font-medium text-lg">
                Create New Password
              </h3>
              <p class="text-white/70">
                Set a new secure password for your account
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right side with form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
      <div class="w-full max-w-md">
        <div class="mb-10 text-center sm:text-left">
          <NuxtLink
            to="/auth/login"
            class="inline-flex items-center text-sm font-medium text-primary hover:underline transition-colors mb-6"
          >
            <ArrowLeft class="mr-2 h-4 w-4" />
            Back to login
          </NuxtLink>

          <h2 class="text-3xl font-bold mb-3 text-foreground">
            Reset your password
          </h2>
          <p class="text-muted-foreground">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        <form
          @submit.prevent="handleResetPassword"
          class="space-y-6"
          v-if="!success"
        >
          <!-- Error alert -->
          <Alert v-if="error" variant="destructive" class="mb-6">
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {{ error }}
            </AlertDescription>
          </Alert>

          <!-- Email field -->
          <div class="space-y-2">
            <Label for="email" class="text-sm font-medium">Email address</Label>
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none"
              >
                <Mail class="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                id="email"
                v-model="email"
                type="email"
                placeholder="name@example.com"
                class="pl-12 h-12 text-base"
                required
              />
            </div>
          </div>

          <!-- Submit button -->
          <Button
            type="submit"
            class="w-full h-12 text-base font-medium shadow-sm hover:shadow-md transition-all duration-200"
            :disabled="loading"
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
              Sending reset link...
            </span>
            <span v-else>Send reset link</span>
          </Button>
        </form>

        <!-- Success message -->
        <Alert
          v-if="success"
          variant="default"
          class="bg-success/10 border-success/50 text-success-foreground p-6"
        >
          <div class="flex items-center mb-4">
            <div class="rounded-full bg-success p-2 mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-white"
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
            <AlertTitle class="text-xl font-bold">Check your email</AlertTitle>
          </div>
          <AlertDescription class="text-base">
            We've sent a password reset link to
            <span class="font-medium">{{ email }}</span
            >.
            <p class="mt-2">
              Please check your inbox and click the link to reset your password.
              The link will expire in 10 minutes.
            </p>
          </AlertDescription>
          <div class="mt-6">
            <NuxtLink
              to="/auth/login"
              class="text-sm font-medium text-primary hover:underline flex items-center transition-colors"
            >
              <ArrowLeft class="mr-2 h-4 w-4" />
              Back to login
            </NuxtLink>
          </div>
        </Alert>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-appear {
  animation: fadeIn 0.5s ease-out forwards;
}
</style>
