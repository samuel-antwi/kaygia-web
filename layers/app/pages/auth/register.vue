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
