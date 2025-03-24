<script setup lang="ts">
import { Mail, Lock, User, AlertCircle } from "lucide-vue-next";

// Form state
const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const error = ref("");

// Handle registration form submission
const handleRegister = async () => {
  try {
    loading.value = true;
    error.value = "";

    // Basic validation
    if (!name.value || !email.value || !password.value) {
      error.value = "Please fill in all required fields";
      return;
    }

    if (password.value !== confirmPassword.value) {
      error.value = "Passwords do not match";
      return;
    }

    if (password.value.length < 8) {
      error.value = "Password must be at least 8 characters";
      return;
    }

    // TODO: Implement Supabase auth registration
    // Will implement actual Supabase auth registration once we set up the Supabase client

    // Simulate loading for now
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Navigate to dashboard on success
    navigateTo("/dashboard");
  } catch (err: any) {
    error.value = err?.message || "Registration failed. Please try again.";
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
        <h1 class="text-4xl font-bold mb-6">Join Our Platform</h1>
        <p class="text-lg mb-8">
          Create an account to get started with our services and manage your web
          development projects.
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
            <span>Free access to project dashboard</span>
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
            <span>Easy project request submissions</span>
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
            <span>Secure and private communication</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right side with form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold mb-2">Create your account</h2>
          <p class="text-muted-foreground">
            Already have an account?
            <NuxtLink
              to="/auth/login"
              class="text-primary font-medium hover:underline"
            >
              Sign in
            </NuxtLink>
          </p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-5">
          <!-- Error alert -->
          <Alert v-if="error" variant="destructive" class="mb-6">
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {{ error }}
            </AlertDescription>
          </Alert>

          <!-- Name field -->
          <div class="space-y-2">
            <Label for="name" class="text-sm font-medium">Full Name</Label>
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none"
              >
                <User class="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                id="name"
                v-model="name"
                type="text"
                placeholder="John Doe"
                class="pl-12 h-12 text-base"
                required
              />
            </div>
          </div>

          <!-- Email field -->
          <div class="space-y-2">
            <Label for="email" class="text-sm font-medium">Email Address</Label>
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
            <Label for="password" class="text-sm font-medium">Password</Label>
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
            <p class="text-xs text-muted-foreground mt-1">
              Must be at least 8 characters long
            </p>
          </div>

          <!-- Confirm Password field -->
          <div class="space-y-2">
            <Label for="confirmPassword" class="text-sm font-medium"
              >Confirm Password</Label
            >
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none"
              >
                <Lock class="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                placeholder="••••••••"
                class="pl-12 h-12 text-base"
                required
              />
            </div>
          </div>

          <!-- Register button -->
          <Button
            type="submit"
            class="w-full h-12 text-base font-medium mt-6"
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
              Creating account...
            </span>
            <span v-else>Create Account</span>
          </Button>

          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <span class="w-full border-t"></span>
            </div>
            <div class="relative flex justify-center text-xs uppercase">
              <span class="bg-background px-3 text-muted-foreground"
                >Or continue with</span
              >
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <Button variant="outline" type="button" class="h-12">
              <svg class="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
            <Button variant="outline" type="button" class="h-12">
              <svg class="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                />
              </svg>
              Facebook
            </Button>
          </div>

          <p class="text-xs text-center text-muted-foreground mt-6">
            By creating an account, you agree to our
            <NuxtLink to="/terms" class="text-primary hover:underline"
              >Terms of Service</NuxtLink
            >
            and
            <NuxtLink to="/privacy" class="text-primary hover:underline"
              >Privacy Policy</NuxtLink
            >
          </p>
        </form>
      </div>
    </div>
  </div>
</template>
