<script setup lang="ts">
import { Mail, Lock, AlertCircle } from "lucide-vue-next";

// Form state
const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const loading = ref(false);
const error = ref("");

// Handle login form submission
const handleLogin = async () => {
  try {
    loading.value = true;
    error.value = "";

    // Basic validation
    if (!email.value || !password.value) {
      error.value = "Please enter both email and password";
      return;
    }

    // TODO: Implement Supabase auth login
    // Will implement actual Supabase auth login once we set up the Supabase client

    // Simulate loading for now
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Navigate to dashboard on success
    navigateTo("/dashboard");
  } catch (err: any) {
    error.value = err?.message || "Login failed. Please try again.";
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
        <h1 class="text-4xl font-bold mb-6">Welcome Back</h1>
        <p class="text-lg mb-8">
          Log in to your account to continue managing your projects and client
          communications.
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
            <span>Track project progress in real-time</span>
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
            <span>Communicate directly with your team</span>
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
            <span>Request changes and updates easily</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right side with form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
      <div class="w-full max-w-md">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-bold mb-2">Sign in to your account</h2>
          <p class="text-muted-foreground">
            Don't have an account?
            <NuxtLink
              to="/auth/register"
              class="text-primary font-medium hover:underline"
            >
              Create a free account
            </NuxtLink>
          </p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
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

          <!-- Password field -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label for="password" class="text-sm font-medium">Password</Label>
              <NuxtLink
                to="/auth/forgot-password"
                class="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </NuxtLink>
            </div>
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none"
              >
                <Lock class="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                id="password"
                v-model="password"
                type="password"
                placeholder="••••••••"
                class="pl-12 h-12 text-base"
                required
                autocomplete="new-password"
              />
            </div>
          </div>

          <!-- Remember me checkbox -->
          <div class="flex items-center space-x-2">
            <Checkbox id="remember" v-model:checked="rememberMe" />
            <Label
              for="remember"
              class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember me for 30 days
            </Label>
          </div>

          <!-- Login button -->
          <Button
            type="submit"
            class="w-full h-12 text-base font-medium"
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
              Signing in...
            </span>
            <span v-else>Sign in</span>
          </Button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component styles */
</style>
